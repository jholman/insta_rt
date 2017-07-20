var { Vec, Mat, Transforms } = require('./la');


function solveQuadratic(a, b, c) {
  var discriminant = (b * b) - (4 * a * c);
  var solutions;
  if (discriminant < 0) {
    solutions = [];
  } else {
    var first =  (-b - Math.sqrt(discriminant)) / (2 * a);
    var second = (-b + Math.sqrt(discriminant)) / (2 * a);
    if (discriminant < 0.000001 ) {     // TODO: maybe this should be a ratio of something?
      solutions = [first];
    } else {
      solutions = [Math.min(first, second), Math.max(first, second)];
    }
  }
  return solutions;
}



function raySphereCollision(origin, ray, sphere) {
  /* We will do line-sphere implicit surface intersection.
   * The ray gives us three equations:
   *    x == o.x + n * r.x
   *    y == o.y + n * r.y
   *    z == o.z + n * r.z
   * The sphere gives us one equation:
   *    (x - s.x)**2 + (y - s.y)**2 + (z - s.z)**2 == s.r ** 2
   * That's 4 equations in 4 unknowns (x, y, z, and n).
   * We expect there to be zero or one or two x/y/z/n combinations.
   * First sub the values from the first three, into the fourth.
   *    (o.x + n*r.x - s.x)**2 + (o.y + n*r.y - s.y)**2 + (o.z + n*r.z - s.z)**2 - s.r**2 == 0
   * Now expand the squares
   *                                n**2*r.x**2 - n*2*r.x*s.x + s.x**2 + 
   *    o.x**2 + 2*o.x*n*r.x - 2*o.x*s.x + n**2*r.x**2 - 2*n*r.x*s.x + s.x**2 +
   *    o.y**2 + 2*o.y*n*r.y - 2*o.y*s.y + n**2*r.y**2 - 2*n*r.y*s.y + s.y**2 +
   *    o.z**2 + 2*o.z*n*r.z - 2*o.z*s.z + n**2*r.z**2 - 2*n*r.z*s.z + s.z**2 +
   *    (-s.r**2)
   *    === 0
   * Now group terms by powers of n
   *    n**2 * r.dot(r)           +
   *    n    * 2 * r.dot(o)       +
   *    n    * -2 * r.dot(s)      +
   *    1    * o.dot(o)           +
   *    1    * -2 * o.dot(s)      +
   *    1    * s.dot(s)           +
   *    1    * -1 * s.r**2
   *    === 0
   * Now use the quadratic formula to solve for s.
   *  if a**2 * x + b * x + c == 0, then we can find 2 values of x by solving
   *      -b +- sqrt(b**2 -4ac)  /   2a
   */

  
  var a = ray.dot(ray);
  var b = 2 * ray.dot(origin) - 2 * ray.dot(sphere.center);
  var c =   origin.dot(origin) 
          - 2 * sphere.center.dot(origin) 
          + sphere.center.dot(sphere.center) 
          - sphere.r ** 2;
  solutions = solveQuadratic(a, b, c);
  
  //console.log(`raySphere?  origin:${origin.toString()} ray:${ray.toString()}` + 
  //    `sphere_c:${sphere.center.toString()} sphere_r:${sphere.r}`);
  //console.log(`quadratic?  a:${a} b:${b} c:${c}   solns: ${solutions}`);

  solutions = solutions.map(ray_scale => {
    var point = ray.scale(ray_scale).plus(origin);
    var normal = point.minus(sphere.center);
    return { ray_scale, point, normal };
  });

  return solutions;
}



function rayDiscCollision(origin, ray, disc) {
  /*
   * The ray gives us three equations:
   *    x == o.x + n * r.x
   *    y == o.y + n * r.y
   *    z == o.z + n * r.z
   * The plane gives us one equation:
   *    p.x * x + p.y * y + p.z * z = p.const
   * Let's substitute:
   *    p.x * o.x + n * p.x * r.x + 
   *    p.y * o.y + n * p.y * r.y + 
   *    p.z * o.z + n * p.z * r.z + 
   *    - p.const === 0
   * Group by n:
   *  n * p dot r + p dot o - const === 0
   *  n = (const - p dot o) / p dot r
   */
  var plane = disc.plane_vec;
  var plane_dot_ray = plane.dot(ray);
  var ray_scale = (disc.plane_const - plane.dot(origin)) / plane_dot_ray;
  var point = origin.plus(ray.scale(ray_scale));
  var distance = disc.center.minus(point).magnitude;
  if (distance < disc.r) {
    var normal = plane_dot_ray > 0 ? plane : plane.scale(-1);
    window.disc_hit += 1;
    return [{ ray_scale, point, normal }];
  } else {
    return [];
  }

}



module.exports = {
  raySphereCollision,
  rayDiscCollision,
};
