/*
 * Blend Plugin for jQuery JavaScript Library
 * http://farski.github.com/jquery-blend
 *
 * Copyright (c) 2012 Chris Kalafarski
 * Dual licensed under the MIT and GPL licenses.
 *  - http://www.opensource.org/licenses/mit-license.php
 *  - http://www.gnu.org/copyleft/gpl.html
 *
 * Author: Chris Kalafarski
 * Version: 1.0/0
 * Date: 19 February 2012
 */

(function($) {
  function Pixel(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.subpixels = [this.r, this.g, this.b];

    this.blend = function(blender, adjustment) {
      return blender.process(this, adjustment);
    }
  }

  function Blender(algorithm, precision) {
    this.algorithm = algorithm;
    this.precision = precision;

    this.process = function(base, adjustment) {
      var self = this;
      if (this.precision == 'subpixel') {
        // do a different thing for each subpixel
      } else {
        var r = $.map(base.subpixels, function(color, i) { return self.algorithm(color, adjustment.subpixels[i]); });
        return new Pixel(r[0], r[1], r[2]);
      }
    }
  }

  var blenders = {
    normal: new Blender(function(base, adj) { return adj; }),
    // 
    darken: new Blender(function(base, adj) { return Math.min(base, adj); }),
    multiply: new Blender(function(base, adj) { return ((base * adj) / 255); }),
    colorburn: new Blender(function(base, adj) { return adj <= 0 ? 0 : Math.max(255 - ((255 - base) * 255 / adj), 0); }),
    linearburn: new Blender(function(base, adj) { return Math.max(0, (base + adj - 255)); }),
    // 
    lighten: new Blender(function(base, adj) { return Math.max(base, adj); }),
    screen: new Blender(function(base, adj) { return (255 - (((255 - base) * (255 - adj)) / 255)); }),
    colordodge: new Blender(function(base, adj) { return adj >= 255 ? 255 : Math.min(base * 255 / (255 - adj), 255); }),
    lineardodge: new Blender(function(base, adj) { return Math.min((base + adj), 255); }),
    // 
    overlay: new Blender(function(base, adj) { return (base < 128) ? ((2 * base * adj) / 255) : (255 - (2 * (255 - base) * (255 - adj) / 255)); }),
    softlight: new Blender(function(base, adj) { return (base < 128) ? (((adj>>1) + 64) * base * (2/255)) : (255 - (191 - (adj>>1)) * (255 - base) * (2 / 255)); }),
    hardlight: new Blender(function(base, adj) { return adj < 128 ? (2 * base * adj) / 255 : 255 - ((2 * (255 - base) * (255 - adj)) / 255); }),
    //
    difference: new Blender(function(base, adj) { return Math.abs(base - adj); }),
    exclusion: new Blender(function(base, adj) { return 255 - (((255 - base) * (255 - adj) / 255) + (base * adj / 255)); }),
    subtract: new Blender(function(base, adj) { return Math.max((base - adj), 0); })
  };


  $.fn.blend = function(options) {
    var defaults = {
      mode: 'normal',
      adjustment: 'rgb(128, 128, 128)',
      opacity: 1
    }
    options = $.extend(defaults, options);

    return this.each(function() {
      if ('getContext' in document.createElement('canvas')) {
        this.onload = function() {
          var self = this;

          var output = document.createElement('canvas');
          var outputContext = output.getContext('2d');
          output.width = this.width;
          output.height = this.height;
          outputContext.drawImage(this, 0, 0);
          var outputImageData = outputContext.getImageData(0, 0, output.width, output.height);
          var outputSubpixels = outputImageData.data;

          var blender = blenders[options.mode];

          if (options.adjustment.match(/^rgb/)) {
            var _rgb = options.adjustment.match(/rgb\(([0-9]+), ?([0-9]+), ?([0-9]+)/);
            var rgb = new Pixel(parseFloat(_rgb[1], 10), parseFloat(_rgb[2], 10), parseFloat(_rgb[3], 10));

            for(var i = 0; i < outputSubpixels.length; i += 4) {
              var pixel = new Pixel(outputSubpixels[i], outputSubpixels[i+2], outputSubpixels[i+2]);
              $.each(pixel.blend(blender, rgb).subpixels, function(j, subpixel) { outputSubpixels[i+j] = subpixel; });
            }

            outputContext.putImageData(outputImageData, 0, 0);
            $(self).replaceWith(output);
          } else {
            var maskImage = new Image;
            maskImage.src = options.adjustment;
            maskImage.onload = function() {
              var adjustment = document.createElement('canvas');
              var adjustmentContext = adjustment.getContext('2d');
              adjustment.width = self.width;
              adjustment.height = self.height;
              adjustmentContext.drawImage(maskImage, 0, 0);
              var adjustmentImageData = adjustmentContext.getImageData(0, 0, adjustment.width, adjustment.height);
              var adjustmentSubpixels = adjustmentImageData.data;

              for(var i = 0; i < outputSubpixels.length; i += 4) {
                var pixel = new Pixel(outputSubpixels[i], outputSubpixels[i+2], outputSubpixels[i+2]);
                var adjPixel = new Pixel(adjustmentSubpixels[i], adjustmentSubpixels[i+1], adjustmentSubpixels[i+2]);
                $.each(pixel.blend(blender, adjPixel).subpixels, function(j, subpixel) { outputSubpixels[i+j] = subpixel; });
              }

              outputContext.putImageData(outputImageData, 0, 0);
              $(self).replaceWith(output);
            };
          }
        }
      }
    });
  }
})(jQuery);
