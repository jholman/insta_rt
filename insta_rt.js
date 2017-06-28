
var scene = require('./scene');
var canvas_lib = require('./canvas');
var canvas = window.cc = canvas_lib('canvas');
var rgb = canvas_lib.rgb;

var max_fov_rads = Math.PI / 2;
var pixel_scale = Math.tan(max_fov_rads / 2) / 
          (Math.max(canvas.width, canvas.height) / 2);


for (var pix of canvas.allPixels()) {
  var ray = pix2ray(pix);
  var color = projectRay(ray, scene);
  if (color) {
    canvas.setPixel(pix, color);
  } else {
    canvas.setPixel(pix, 
      rgb(  225,
            Math.floor(pix.y / 2 + 150),
            Math.floor(pix.x / 2 + 150),
    ));
  }
}

function length(vec) {
  return Math.sqrt(vec.x ** 2 + vec.y ** 2 + vec.z ** 2);
}

function pix2ray(pix){
  return {x: pix.x * pixel_scale, y: pix.y * pixel_scale, z: -1};
}


function raySphereCollision(ray, sphere) {
  /* We will do line-sphere implicit surface intersection.
   * The ray gives us three equations:
   *    x == n * r.x
   *    y == n * r.y
   *    z == n * r.z
   * The sphere gives us one equation:
   *    (x - s.x)**2 + (y - s.y)**2 + (z - s.z)**2 == s.r ** 2
   * That's 4 equations in 4 unknowns (x, y, z, and n).
   * We expect there to be zero or one or two x/y/z/n combinations.
   * First sub the values from the first three, into the fourth.
   *    (n*r.x - s.x)**2 + (n*r.y - s.y)**2 + (n*r.z - s.z)**2 - s.r**2 == 0
   * Now expand the squares
   *    n**2*r.x**2 - n*2*r.x*s.x + s.x**2 + 
   *    n**2*r.y**2 - n*2*r.y*s.y + s.y**2 + 
   *    n**2*r.z**2 - n*2*r.z*s.z + s.z**2 + 
   *    (-s.r**2)
   *    === 0
   * Now group terms by powers of n
   *    n**2 * (r.x**2 + r.y**2 + r.z**2) +
   *    n    * -2 * (r.x*s.x + r.y*s.y + r.z*s.z) +
   *    1    * (s.x**2 + s.y**2 + s.z**2 - s.r**2
   *    === 0
   * Now use the quadratic formula to solve for s.
   *  if a**2 * x + b * x + c == 0, then we can find 2 values of x by solving
   *      -b Â sqrt(b**2 -4ac)  /   2a
   */
  var a = ray.x ** 2 + ray.y ** 2 + ray.z ** 2;
  var b = -2 * (ray.x * sphere.x + 
                ray.y * sphere.y + 
                ray.z * sphere.z);
  var c = (sphere.x ** 2 + sphere.y ** 2 + sphere.z ** 2) - (sphere.r ** 2);
  var discriminant = (b * b) - (4 * a * c);
  var solutions;
  if (discriminant < 0) {
    solutions = [];
  } else {
    var first =  (-b - Math.sqrt(discriminant)) / (2 * a);
    var second = (-b + Math.sqrt(discriminant)) / (2 * a);
    if (discriminant < 0.000001 ) {     // todo: maybe vary tolerance by 
      solutions = [first];
    } else {
      solutions = [Math.min(first, second), Math.max(first, second)];
    }
  }
  solutions = solutions.map(ray_scale => ({
    ray_scale,
    point: {x: ray.x * ray_scale, y: ray.y * ray_scale, z: ray.z * ray_scale},
  }));
  solutions = solutions.map(({ray_scale, point}) => ({
    ray_scale,
    point,
    normal: vecMinusVec(point, sphere)
  }))
  return solutions;
}

function vecMinusVec(v0, v1) {
  return {
    x: v0.x - v1.x,
    y: v0.y - v1.y,
    z: v0.z - v1.z,
  };
}

function rayCollisionFunctions(mode){
  return  {
    sphere: raySphereCollision,
  }[mode];
}


function projectRay(ray, scene) {
  var best_dist = Infinity;
  var best_coll = undefined;
  var best_obj = undefined;
  for (var obj of scene) {
    var solns = rayCollisionFunctions(obj.mode)(ray, obj.params);
    if (solns.length === 0) continue;
    if (solns[0].ray_scale < 1) continue;
    if (solns[0].ray_scale < best_dist) {
      best_dist = solns[0].ray_scale;
      best_coll = solns[0];
      best_obj = obj;
    }
  }
  if (best_coll) {
    for (var mat_type in best_obj.material) {
      var mat_data = best_obj.material[mat_type];
      return rgb(mat_data.r, mat_data.g, mat_data.b);
    }
  } else {
    return undefined;
  }
}


