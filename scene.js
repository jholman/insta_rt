
var { Vec, Mat, Transforms } = require('./la');



module.exports = {

  objects: [
    {
      id: 'mirr_01',
      mode: 'sphere',
      params: {center: Vec(20, 0, -100), r: 13},
      material: {
        mirror: {weight: 1},
      },
    },
    {
      id: 'mirr_02',
      mode: 'sphere',
      params: {center: Vec(-20, 0, -100), r: 13},
      material: {
        mirror: {weight: 1},
      },
    },
    {
      id: 'red',
      mode: 'sphere',
      params: {center: Vec(0, 20, -100), r: 13},
      material: {
        inherent: {r: 255, g: 55, b: 55, weight: 1}
      },
    },
    {
      id: 'blue',
      mode: 'sphere',
      params: {center: Vec(0, -20, -100), r: 13},
      material: {
        inherent: {r: 55, g: 55, b: 255, weight: 1}
      },
    },

  ],
  /* 
  objects: [
    {
      id: 'big_mirror',
      mode: 'sphere',
      params: {center: Vec(10, 0, -120), r: 10},
      material: {
        mirror: {weight: 1},
      },
    },
    {
      id: 'little_red',
      mode: 'sphere',
      params: {center: Vec(-3, 1, -105), r: 3},
      material: {
        mirror: {weight: 1},
        inherent: {r: 255, g: 55, b: 55, weight: 1}
      }
    },
    {
      id: 'big_blue',
      mode: 'sphere',
      params: {center: Vec(-10, 0, -120), r: 9},
      material: {
        inherent: {r: 55, g: 55, b: 255, weight: 1}
      }
    },
//    {
//      id: 'yellow_disc',
//      mode: 'disc',
//      params: {
//        plane_vec: Vec(0, 0, 1),
//        plane_const: -10,
//        center: Vec(0, 0, -10),
//        r: .1,
//      },
//      material: {
//        inherent: {r: 255, g: 255, b: 5, weight: 1}
//      }
//    },
    {
      id: 'little_green',
      mode: 'sphere',
      params: {
        plane_vec: Vec(0, 0, 1),
        plane_const: -103,
        center: Vec(8, -8, -103),
        r: 2,
      },
      material: {
        inherent: {r: 5, g: 155, b: 5, weight: 1}
      }
    },
    {
      id: 'crap_black',
      mode: 'sphere',
      params: {center: Vec(0.1, 0, 10), r: 9},
      material: {
        inherent: {r: 0, g: 0, b: 0, weight: 1}
      }
    },
  ],
  */
  lights: [
  ],
  background: function(ray) {
    var raylen = ray.magnitude;
    var rayscale = -100 / raylen;
    var red   = Math.floor((ray.z || 0 ) * rayscale) + 155;
    var green = Math.floor((ray.x || 0 ) * rayscale) + 155;
    var blue  = Math.floor((ray.y || 0 ) *  rayscale) + 155;
    return `rgb(${red}, ${green}, ${blue}`;
  }
}
