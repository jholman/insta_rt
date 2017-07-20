
var BLOCK_RAD = 0;
var BLOCK_DIAM = BLOCK_RAD * 2 + 1;

var canvas_lib = module.exports = function (canvas_selector) {
  var canvas = document.getElementById(canvas_selector);
  var ctx = canvas.getContext('2d');

  var middleX = Math.floor(canvas.width / BLOCK_DIAM / 2.0);
  var middleY = Math.floor(canvas.height / BLOCK_DIAM / 2.0);
  // TODO: add event listener on resize to recalculate these

  function _setPixel(x, y, color) {
    ctx.fillStyle = color;
    var _x = BLOCK_DIAM * (Math.floor(x) + middleX);
    var _y = BLOCK_DIAM * (middleY - Math.floor(y) - 1);
    // console.log(`fill ${x}(${_x}), ${y}(${_y}), ${color}`);
    ctx.fillRect(_x, _y, BLOCK_DIAM, BLOCK_DIAM);
  }

  return {
    get width() { return Math.floor(canvas.width / BLOCK_DIAM); },
    get height() { return Math.floor(canvas.height / BLOCK_DIAM); },
    get maxX() { return this.width - middleX - 1; },
    get minX() { return 0 - middleX; },
    get maxY() { return this.height - middleY - 1; },
    get minY() { return 0 - middleY; },

    setPixel() {
      if (arguments.length === 3) {     // x y color
        return _setPixel(...arguments);
      } else if (arguments.length === 2) {
        var arg0 = arguments[0];
        if (arg0 instanceof Array && arg0.length === 2) {  // [x, y], color
          return _setPixel(arg0[0], arg0[1], arguments[1]);
        } else if (arg0 instanceof Object && arg0.hasOwnProperty('x') && arg0.hasOwnProperty('y')) {  // {x:x, y:y}, color
          return _setPixel(arg0.x, arg0.y, arguments[1]);
        }
      }
      throw new Error("shitty arguments to setPixel, you dunce");
    },

    allPixels: function* () {
      for (var i = 0; i < this.height; i++) {
        for (var j = 0; j < this.width; j++) {
          yield {x: j - middleX, y: i - middleY};
        }
      }
    }

  }
}

canvas_lib.rgb = function(r, g, b) {
  return `rgb(${r}, ${g}, ${b})`;
}

