
var { Vec, Mat, Transforms } = require('../la.js');

var chai = require("chai");
var assert = chai.assert;
var equal = assert.deepStrictEqual;
var dse = assert.deepStrictEqual;
var closeTo = assert.closeTo;


const ROOT2 = Math.sqrt(2);
const ROOT3 = Math.sqrt(3);

// TODO: write my own fucking expect function, with hookers and blackjack, that doesn't suck.
// It should
//  * compare floats loosely, say require them to be within 0.01% of each other by default
//  * recursively compare the keys and values of compound types
//      * only enumerable keys?  or all keys?
//  * objects should have the same prototype as each other
//  * otherwise test strict equality
//
// Seems simple.  Probably 30x harder than it seems.  But still.



describe("Vec", function() {

  var v, v2d, v5d;
  beforeEach(function() {
    v = Vec(2, 3, 5, 7);
    v2d = Vec(5, 7);
    v5d = Vec(2, 3, 5, 7, 11);
  });

  describe("construction", function() {
    it("sets correct length and dimension", function() {
      equal(v.dim, 4);
      equal(v.length, 4);
      equal(v2d.dim, 2);
      equal(v5d.dim, 5);
    });

    it("creates suitable numeric indices and values", function() {
      equal(v[0], 2);
      equal(v[1], 3);
      equal(v[2], 5);
      equal(v[3], 7);
      equal(v2d[3], undefined);
      equal(v5d[4], 11);
    });

    it("creates suitable lettered indices and values", function() {
      equal(v.x, 2);
      equal(v.y, 3);
      equal(v.z, 5);
      equal(v.w, 7);
      equal(v2d.x, 5);
      equal(v2d.y, 7);
      equal(v2d.z, undefined);
    });

    it("has working getters and setters", function() {
      v.x = 99;
      equal(v.x, 99);
      equal(v[0], 99);
    });
  });

  describe("inheritance", function(){
    it("inherits from Array", function() {
      assert(v instanceof Array);
    });
    it("has toArray", function() {
      dse(v.toArray(), [2, 3, 5, 7]);
      dse(v.toArray(), v.map(x=>x));
      dse(v.map(x=>x), [2, 3, 5, 7]);
    });
  });


  describe("arithmetic operations", function() {
    it("norm (magnitude getter)", function() {
      equal(v.norm(), Math.sqrt(2*2 + 3*3 + 5*5 + 7*7));
      equal(v.magnitude, Math.sqrt(2*2 + 3*3 + 5*5 + 7*7));
      equal(v.norm(4), Math.sqrt(Math.sqrt(2**4 + 3**4 + 5**4 + 7**4)));
    });
    it("scale", function() {
      var after = v.scale(2.5);
      equal(after.x, v.x * 2.5);
      equal(after.y, v.y * 2.5);
      equal(after.z, v.z * 2.5);
      equal(after.w, v.w * 2.5);
      var v2 = Vec(1,2,3,4,5,6);
      var after2 = v2.scale(0.1);
      equal(after2[5], v2[5] * 0.1);
    });
    it("normalize (to arbitrary magnitude)", function() {
      var v345 = Vec(3, 4);
      equal(v345.magnitude, 5);
      var after1 = v345.normalize();
      var after2 = v345.normalize(1);
      equal(after1.magnitude, 1);
      closeTo(after1.x, 3 / 5, 0.0001);
      closeTo(after1.y, 4 / 5, 0.0001);
      equal(after2.magnitude, 1);
      closeTo(after2.x, 3 / 5, 0.0001);
      closeTo(after2.y, 4 / 5, 0.0001);

      v345.magnitude = 2;
      equal(v345.magnitude, 2);
      closeTo(v345.x, 3 / 5 * 2, 0.000001)
      closeTo(v345.y, 4 / 5 * 2, 0.000001)
    });
    it("plus", function() {
      var sum = Vec(1, 2, 3).plus(Vec(3, 5, 7));
      dse(sum, Vec(1 + 3, 2 + 5, 3 + 7));
    });
    it("minus", function() {
      var diff = Vec(1, 2, 3).minus(Vec(3, 5, 7));
      dse(diff, Vec(1 - 3, 2 - 5, 3 - 7));
      dse(diff, Vec(1, 2, 3).plus(Vec(3, 5, 7).scale(-1)));
    });
    it("dot-product", function() {
      var afterDot = Vec(2, 3, 4).dot(Vec(5, 7, 9));
      equal(afterDot, 2*5 + 3*7 + 4*9);
    });
  });

  describe("tricks", function() {
    describe("projectOnto (vector)", function() {
      it("2d vectors, unit length", function() {
        var v2a = Vec(1 / ROOT2, 1 / ROOT2);
        var v2b = Vec(1, 0);
        var v2c = Vec(0, 1);
        var out;

        out = v2a.projectOnto(v2b);
        closeTo(out.x, 1 / ROOT2, 0.0001);
        closeTo(out.y, 0, 0.0001);


        out = v2a.projectOnto(v2c);
        closeTo(out.x, 0, 0.0001);
        closeTo(out.y, 1 / ROOT2, 0.0001);

        out = v2c.projectOnto(v2a);
        closeTo(out.x, 0.5, 0.00001);
        closeTo(out.y, 0.5, 0.00001);

        dse(v2b.projectOnto(v2c), Vec(0, 0));
        dse(v2b.projectOnto(v2b), v2b);
      });
      it("2d vectors, non-unit", function() {
        var v2a = Vec(ROOT3, 1);
        var v2b = Vec(ROOT3, - 1);
        var out;
 
        out = v2a.projectOnto(v2b);
        closeTo(v2a.magnitude, 2, 0.0001);
        closeTo(out.magnitude, 1, 0.0001);
        closeTo(out.x, ROOT3 / 2, 0.00001);
        closeTo(out.y, -0.5, 0.00001);
      });
    });
    describe("reflectAround (normal vector)", function() {
      it("2d simple", function() {
        var v2a = Vec(1, -1);
        var normal = Vec(0, 1);
        var ref2a = v2a.reflectAround(normal);
        closeTo(ref2a.x, ref2a.y, 0.00001);
        equal(Math.sign(ref2a.x), 1);
      });
      it("3d simple", function() {
        var v3a = Vec(-1, -ROOT3, 0);
        var normal = Vec(1, 1, 0);
        var ref3a = v3a.reflectAround(normal);
        closeTo(ref3a.x, -v3a.y, 0.0001);
        closeTo(ref3a.y, -v3a.x, 0.0001);
      });
    });
  });

})


describe("Mat", function() {

  var m1, m2;
  beforeEach(function() {
    m1 = Mat([ [ 3, 4, 5 ],
               [ 6, 7, 8 ] ]);
    m2 = Mat([[ 1, 2 ],
              [ 3, 4 ] ]);
  });

  describe("after construction", function() {
    it("has correct dimensions", function() {
      dse(m1.dim, [2, 3]);
    });

    it("has suitable numeric indices and values", function() {
      equal(m1[0][0], 3);
      equal(m1[1][1], 7);
      equal(m1[0][2], 5);
    });
    
    it("decomposes into row vectors and column vectors", function() {
      dse(m1.row(0), Vec(3, 4, 5));
      dse(m1.col(2), Vec(5, 8));
    });

    it("has mutable cells", function() {
      m1[1][2] = 99;
      dse(m1.row(1), Vec(6, 7, 99));
    });

    it("equals something equal", function() {
      var other = Mat([ [1, 2], [3, 4] ]);
      dse(m2, other);
    });
  });

  describe("static methods", function() {
    it("initializer factory", function() {
      dse(Mat.initialize(1, 1, 999), Mat( [ [ 999 ] ] ));
      dse(Mat.initialize(3, 2, 5), Mat( [ [5, 5], [5, 5], [5, 5] ] ));
    });
    it("identity factory", function() {
      dse(Mat.identity(4), Mat([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
      ]));
    });
  });

  describe("arithmetic operations", function() {
    it("scale", function() {
      dse(m1.scale(2.5), Mat([
            [ 7.5, 10, 12.5 ],
            [ 15, 17.5, 20 ],
      ]));
      dse(m2.scale(-2), Mat([
            [ -2, -4 ],
            [ -6, -8 ]
      ]));
      dse(m1.scale(0), Mat.initialize(2, 3, 0));
    });
    it("product", function() {
      var mm1 = m2.product(m1);
      dse(mm1, Mat([
            [ 15, 18, 21 ],
            [ 33, 40, 47 ]
      ]));
    });
    it("product with a Vec as the argument", function() {
      var mm1 = m2.product(m1);
      var mm2 = mm1.product(Vec(2, 3, 4));
      dse(mm2, Vec(168, 374));
    });
    it("transpose", function() {
      dse(m1.transpose(), Mat([ [ 3, 6 ],
                                [ 4, 7 ],
                                [ 5, 8 ] ]));
    });
  });
});


describe("Transforms", function() {
  var t2 = Transforms(2);
  var t3 = Transforms(3);
  var t4 = Transforms(4);
  var t5 = Transforms(5);
  var v2, v3, v4, v5;

  beforeEach(function() {
    v2 = Vec(5, 7);
    v3 = Vec(9, 7, 5);
    v4 = Vec(11, 1, -11, -1);
    v5 = Vec(3, 0, 5, 0, 7);
  });

  describe("scale", function() {
    it("2d", function() {
      var s = t2.scale(2);
      dse(s.product(v2), Vec(10, 14));
    });
    it("3d", function() {
      var s = t3.scale(3);
      dse(s.product(v3), Vec(27, 21, 15));
    });
    it("4d", function() {
      var s = t4.scale(4);
      dse(s.product(v4), Vec(44, 4, -44, -4));
    });
    it("5d", function() {
      var s = t5.scale(5);
      dse(s.product(v5), Vec(15, 0, 25, 0, 35));
    });
  });
});


