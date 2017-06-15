var canvas_lib = module.exports = function (canvas_selector) {
  var canvas = document.getElementById(canvas_selector);
  var ctx = canvas.getContext('2d');

  var middleX = Math.floor(canvas.width / 2.0);
  var middleY = Math.floor(canvas.height / 2.0);
  // TODO: add event listener on resize to recalculate these

  function _setPixel(x, y, color) {
    ctx.fillStyle = color;
    var _x = Math.floor(x) + middleX;
    var _y = middleY - Math.floor(y) - 1;
    // console.log(`fill ${x}(${_x}), ${y}(${_y}), ${color}`);
    ctx.fillRect(_x, _y, 1, 1);
  }

  return {
    get width() { return canvas.width; },
    get height() { return canvas.height; },
    get maxX() { return canvas.width - middleX - 1; },
    get minX() { return 0 - middleX; },
    get maxY() { return canvas.height - middleY - 1; },
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
      for (var i = 0; i < canvas.height; i++) {
        for (var j = 0; j < canvas.width; j++) {
          yield {x: j - middleX, y: i - middleY};
        }
      }
    }

  }
}

canvas_lib.rgb = function(r, g, b) {
  return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
}

