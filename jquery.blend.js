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
 * Version: 1.0.0
 * Date: 19 February 2012
 */

(function($) {
  $.fn.blend = function(options) {
    var defaults = {
      mode: 'overlay',
      adjustment: 'rgb(128, 128, 128)',
      opacity: 1
    }

    options = $.extend(defaults, options);
    var blenders = {
      normal: function(base, adj) { return adj; },
      // 
      darken: function(base, adj) { return Math.min(base, adj); },
      multiply: function(base, adj) { return ((base * adj) / 255); },
      colorburn: function(base, adj) { return adj <= 0 ? 0 : Math.max(255 - ((255 - base) * 255 / adj), 0); },
      linearburn: function(base, adj) { return Math.max(0, (base + adj - 255)); },
      // 
      lighten: function(base, adj) { return Math.max(base, adj); },
      screen: function(base, adj) { return (255 - (((255 - base) * (255 - adj)) / 255)); },
      colordodge: function(base, adj) { return adj >= 255 ? 255 : Math.min(base * 255 / (255 - adj), 255); },
      lineardodge: function(base, adj) { return Math.min((base + adj), 255); },
      // 
      overlay: function(base, adj) { return (base < 128) ? ((2 * base * adj) / 255) : (255 - (2 * (255 - base) * (255 - adj) / 255)); },
      softlight: function(base, adj) { return (base < 128) ? (((adj>>1) + 64) * base * (2/255)) : (255 - (191 - (adj>>1)) * (255 - base) * (2 / 255)); },
      hardlight: function(base, adj) { return adj < 128 ? (2 * base * adj) / 255 : 255 - ((2 * (255 - base) * (255 - adj)) / 255); },
      //
      difference: function(base, adj) { return Math.abs(base - adj); },
      exclusion: function(base, adj) { return 255 - (((255 - base) * (255 - adj) / 255) + (base * adj / 255)); }
    };

    return this.each(function() {
      var $t = $(this);

      if ('getContext' in document.createElement('canvas')) {
        var input = new Image;
        input.src = $t.attr('src');
        
        if (options.adjustment.match(/^rgb/)) {
          input.onload = applyRGBAValue;
        } else {
          input.onload = applyImage;
        }
      }

      function applyRGBAValue() {
        var rgb = options.adjustment.match(/rgb\(([0-9]+), ?([0-9]+), ?([0-9]+)/);
        var r = parseInt(rgb[1], 10);
        var g = parseInt(rgb[2], 10);
        var b = parseInt(rgb[3], 10);

        var output = document.createElement('canvas');
        var outputContext = output.getContext('2d');

        output.width = input.width;
        output.height = input.height;
        outputContext.drawImage(input, 0, 0);

        var outputImageData = outputContext.getImageData(0, 0, output.width, output.height);
        var outputSubpixels = outputImageData.data;

        var mode = options.mode;
        var alpha = options.opacity;
        for(var i = 0, l = outputSubpixels.length; i < l; i += 4) {
          outputSubpixels[i+0] = blenders[mode](outputSubpixels[i+0], r);
          outputSubpixels[i+1] = blenders[mode](outputSubpixels[i+1], g);
          outputSubpixels[i+2] = blenders[mode](outputSubpixels[i+2], b);
        }

        outputContext.putImageData(outputImageData, 0, 0);
        $t.replaceWith(output);
      }

      function applyImage() {
        // Setup the output canvas, and prefil it with the input
        // image. This is what will get blended.
        var output = document.createElement('canvas');
        var outputContext = output.getContext('2d');
        output.width = input.width;
        output.height = input.height;
        outputContext.drawImage(input, 0, 0);
        var outputImageData = outputContext.getImageData(0, 0, output.width, output.height);

        var outputSubpixels = outputImageData.data;

        // Load the adjustment mask image
        var maskImage = new Image;
        maskImage.src = options.adjustment;
        maskImage.onload = function() {
          // Bring the adjustment mask into canvas so we can access it's data
          var adjustment = document.createElement('canvas');
          var adjustmentContext = output.getContext('2d');
          adjustment.width = input.width;
          adjustment.height = input.height;
          adjustmentContext.drawImage(maskImage, 0, 0);
          var adjustmentImageData = adjustmentContext.getImageData(0, 0, adjustment.width, adjustment.height);

          var adjustmentSubpixels = adjustmentImageData.data;

          // Do the blending
          var mode = options.mode;
          var alpha = options.opacity;
          for(var i = 0; i < outputSubpixels.length; i += 4) {
            outputSubpixels[i+0] = blenders[mode](outputSubpixels[i+0], adjustmentSubpixels[i+0]);
            outputSubpixels[i+1] = blenders[mode](outputSubpixels[i+1], adjustmentSubpixels[i+1]);
            outputSubpixels[i+2] = blenders[mode](outputSubpixels[i+2], adjustmentSubpixels[i+2]);
          }

          outputContext.putImageData(outputImageData, 0, 0);
          $t.replaceWith(output);
        }
      }
    });
  }
})(jQuery);
