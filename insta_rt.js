
var scene = require('./scene');
var canvas_lib = require('./canvas');
var canvas = window.cc = canvas_lib('canvas');
var rgb = canvas_lib.rgb;
var { Vec, Mat, Transforms } = require('./la');
var {raySphereCollision, rayDiscCollision} = require('./solver');

// PI/8 is 45deg, so a radius-10 sphere, 100 units away, should take up 
var MAX_FOV_RADS = Math.PI / 8;
var PIXEL_SCALE = (Math.tan(MAX_FOV_RADS / 2) / (Math.max(canvas.width, canvas.height) / 2));




function renderFrame(scene) {
  var origin = Vec(0, 0, 0);
  for (var pix of canvas.allPixels()) {
    var ray = pix2ray(pix);
    var color = projectRay(origin, ray, scene);
    canvas.setPixel(pix, color);
  }
}

// var ___ugh_speed_hack = Vec(0, 0, -1);
function pix2ray(pix){
  return Vec(pix.x * PIXEL_SCALE, pix.y * PIXEL_SCALE, -1);
  // ___ugh_speed_hack.x = pix.x * PIXEL_SCALE;
  // ___ugh_speed_hack.y = pix.y * PIXEL_SCALE;
  // return ___ugh_speed_hack;
}


function rayCollisionFunctions(mode){
  return  {
    sphere: raySphereCollision,
    disc: rayDiscCollision,
  }[mode];
}

function projectRay(origin, ray, scene) {
  // console.log(`shoot: ${origin} + N * ${ray}`);
  var best_dist = Infinity;
  var best_coll = undefined;
  var best_obj = undefined;
  var solns;
  for (var obj of scene.objects) {
    solns = rayCollisionFunctions(obj.mode)(origin, ray, obj.params);
    if (solns.length === 0) continue;
    if (solns[0].ray_scale < 0.000001) continue;
    if (solns[0].ray_scale < best_dist) {
      best_dist = solns[0].ray_scale;
      best_coll = solns[0];
      best_obj = obj;
    }
  }
  if (best_coll) {
    if (best_obj.material.mirror) {
      // console.log("reflecting off of " + best_obj.id + " at " + best_coll.point.toString());
      var new_ray = ray.reflectAround(best_coll.normal);
      var new_origin = best_coll.point;
      return projectRay(new_origin, new_ray, scene);
    } else if (best_obj.material.inherent) {
      var {r, g, b} = best_obj.material.inherent;
      return rgb(r, g, b);
    } else {
      return scene.background(ray);
    }
//    for (var mat_type in best_obj.material) {
//      var mat_data = best_obj.material[mat_type];
//      return rgb(mat_data.r, mat_data.g, mat_data.b);
//    }
  } else {
    return scene.background(ray);
  }
}

function time_and_log(cb) {
  var before = Date.now();
  cb.call(null, ...([].slice.call(arguments, 1)));
  var after = Date.now();
  console.log("elapsed milliseconds: ", after-before);
  console.log("vectors allocated: ", window.vec_create_count);
}

time_and_log(renderFrame, scene);
