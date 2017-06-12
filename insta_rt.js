
var canvas_lib = require('./canvas');
var canvas = window.cc = canvas_lib('canvas');
var rgb = canvas_lib.rgb;

// canvas.setPixel(0, 0, rgb(0, 0, 128));
// canvas.setPixel(canvas.minX, canvas.minY, rgb(256, 0, 0));
// canvas.setPixel(canvas.maxX, canvas.maxY, rgb(256, 0, 0));

var n = 0;
for (var pix of canvas.allPixels()) {
  n++;
  if (Math.random() < 0.1) canvas.setPixel(pix, rgb(10, 10, 255));
}
console.log("n", n);
