vec_create_count = 0;   // deliberately global, for profiling
mat_create_count = 0;   // deliberately global, for profiling

// =======================
//      Vector class
// =======================

function Vec() {
  vec_create_count++;   // deliberately global, for profiling
  if (arguments.length === 1 && arguments[0] instanceof Vec) {
    throw "cloning not implemented";
  }
  for (var i = 0; i < arguments.length ; i++){
    if (typeof arguments[i] != 'number') {
      throw "all elements of a Vec must be Numbers";
    }
  }
  var _this = Object.create(vec_proto, {
    dim: { value: arguments.length },
    length: { value: arguments.length },
    x: { get: () => _this[0], set: (val) => { _this[0] = val; } },
    y: { get: () => _this[1], set: (val) => { _this[1] = val; } },
    z: { get: () => _this[2], set: (val) => { _this[2] = val; } },
    w: { get: () => _this[3], set: (val) => { _this[3] = val; } },
    magnitude: { 
      get: () => _this.norm(), 
      set: (val) => { _this = _this.normalize(val)}
    },
  });
  for (var i = 0; i < arguments.length; i++){ _this[i] = arguments[i]; }

  Object.seal(_this);  // good idea?  bad idea?
  return _this;
}

var vec_proto = Vec.prototype = Object.create(Array.prototype, { });

Vec.prototype.toArray = function() { 
  ans = [];
  for (var i = 0; i < this.dim; i++) {
    ans.push(this[i]);
  }
  return ans;
};

Vec.prototype.toString = function() {
  return "Vec(" + this.toArray().join(", ") + ")";
};

Vec.prototype.inspect = Vec.prototype.toString;

Vec.prototype.norm = function(pow) {
  pow = pow || 2;
  return Math.pow(
      this
      .map(x => Math.pow(x, pow))
      .reduce((existing, next) => existing + next, 0),
      1 / pow);
}

Vec.prototype.scale = function(scalar) {
  return Vec(...this.map(item => item * scalar));
}

Vec.prototype.normalize = function(target) {
  target = target || 1;
  return this.scale(target / this.magnitude);
}

Vec.prototype.dot = function(v2) {
  return this
    .map((item, i) => item * v2[i])
    .reduce((sum, itm) => sum + itm, 0);
}

Vec.prototype.plus = function(v2) {
  return Vec(...this.map((item, i) => item + v2[i]));
}

Vec.prototype.minus = function(v2) {
  return Vec(...this.map((item, i) => item - v2[i]));
}

Vec.prototype.projectOnto = function(v2) {
  return v2.scale(this.dot(v2) / this.magnitude / v2.magnitude);
}

Vec.prototype.reflectAround = function(normal) {
  // lovely little trick from http://paulbourke.net/geometry/reflected/
  normal = normal.normalize();
  var myself = this.normalize(-1);
  var projected = myself.projectOnto(normal);
  var delta = projected.minus(myself);
  var ans = projected.plus(delta);
  var ans2 = ans.normalize(this.magnitude);
  // console.log("in", this);
  // console.log("myself", myself);
  // console.log("normal", normal);
  // console.log("projected", projected);
  // console.log("delta", delta);
  // console.log("ans", ans);
  // console.log("norm ans", ans2);
  return ans2;
}





// =======================
//      Matrix class
// =======================


function Mat(input) {
  mat_create_count++; // deliberately global, for profiling
  if (!(input instanceof Array)){
    throw "invalid argument to Mat - must be a square Array-of-Arrays of Numbers";
  }
  if (input.length > 0) {
    if (!(input[0] instanceof Array)) {
      throw "invalid argument to Mat - must be a square Array-of-Arrays of Numbers";
    }
    var len_1 = input[0].length;
    for (var i = 0; i < input.length; i++) {
      if (!(input[i] instanceof Array) || (input[i].length != len_1)) {
        throw "invalid argument to Mat - must be a square Array-of-Arrays of Numbers";
      }
      var non_numbers = input[i].filter((elt) => (typeof elt != 'number'));
      if (non_numbers.length > 0) {
        throw "invalid argument to Mat - must be a square Array-of-Arrays of Numbers";
      }
    }
  }

  var _this = Object.create(mat_proto, {
    dim: { value: [input.length, len_1] },
    length: { value: input.length },
  });
  for (var i = 0; i < input.length; i++){ _this[i] = Vec(...input[i]); }

  Object.seal(_this);
  return _this;
}

Mat.initialize = function(height, width, value) {
  if (value === undefined) value = 0;
  var arr = [];
  for (var i = 0; i < height; i++) {
    arr[i] = Array(width);
    for (var j = 0; j < width; j++) {
      arr[i][j] = value;
    }
  }
  return Mat(arr);
}

Mat.identity = function(dim, value) {
  if (value === undefined) value = 1;
  var ans = Mat.initialize(dim, dim, 0);
  for (var i = 0; i < dim; i++) {
    ans[i][i] = value;
  }
  return ans;
}

var mat_proto = Mat.prototype = Object.create(Array.prototype, {
  row: { value: function(i) { return this[i]; }},
  col: { value: function(i) { return Vec(...this.map(r => r[i])); }},
});

Mat.prototype.toString = function() {
  return "Mat([\n" + this.map(row => "  [" + row.join(", ") + "]").join(",\n") + "\n])";
};


Mat.prototype.inspect = Mat.prototype.toString;

Mat.prototype.scale = function(scalar) {
  return this.product(Mat.identity(this.dim[1], scalar));
}

Mat.prototype.product = function(other) {
  if (other instanceof Vec) {
    return this.product(Mat(other.map(x=>[x]))).col(0);
  }
  if (this.dim[1] !== other.dim[0]) {
    throw `dimension mismatch: ${this.dim} vs ${other.dim}`;
  }
  var ans = Mat.initialize(this.dim[0], other.dim[1]);
  for (var i = 0; i < this.dim[0]; i++) {
    for (var j = 0; j < other.dim[1]; j++) {
      for (var k = 0; k < this.dim[1]; k++) {
        ans[i][j] += this[i][k] * other[k][j];
      }
    }
  }
  return ans;
}

Mat.prototype._determinant_helper = function(bad_i, bad_j) {
  var ans = Mat.initialize(this.dim[0] - 1, this.dim[1] - 1);
  for (var i = 0; i < this.dim[0]; i++) {
    if (i === bad_i) continue;
    var dest_i = i >= bad_i ? i - 1 : i;
    for (var j = 0; j < this.dim[1]; j++) {
      if (j === bad_j) continue;
      var dest_j = j >= bad_j ? j - 1 : j;
      // console.log(`i ${i}, j ${j}, d_i ${dest_i}, d_j ${dest_j}`);
      ans[dest_i][dest_j] = this[i][j];
    }
  }
  return ans;
}

Mat.prototype.determinant = function() {
  // TODO: working here
}

Mat.prototype.invert = function() {
  assert.equal(this.dim[0], this.dim[1], "only square matrices are invertible");
  throw "invert not implemented";
}

Mat.prototype.transpose = function() {
  var ans = Mat.initialize(this.dim[1], this.dim[0]);
  for (var i = 0; i < this.dim[1]; i++) {
    for (var j = 0; j < this.dim[0]; j++) {
      ans[i][j] = this[j][i];
    }
  }
  return ans;
}



// =======================
//   Transform builders
// =======================

var Transforms = (dim) => ({

  scale: (scalar) => Mat.identity(dim, scalar),


})








module.exports = {
  Vec,
  Mat,
  Transforms,
  tricks: {

  }
}
