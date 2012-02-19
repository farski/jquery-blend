(function($) {
  $.fn.blend = function(options) {
    var defaults = {
      mode: 'overlay',
      input: 'rgb(128, 128, 128)',
      opacity: 1
    }

    options = $.extend(defaults, options);
    var blenders = {
      normal: function(base, adj) { return adj; },
      // 
      darken: function(base, adj) { return (base > adj) ? adj : base; },
      multiply: function(base, adj) { return ((base * adj) / 255); },
      colorburn: function(base, adj) { return (base === 0) ? base : Math.max(0, (255 - ((255 - adj) << 8 ) / base)); },
      linearburn: function(base, adj) { return ((base + adj) < 255) ? 0 : (base + adj - 255); },
      // 
      lighten: function(base, adj) { return (base < adj) ? adj : base; },
      screen: function(base, adj) { return (255 - ( 255 - base ) * ( 255 - adj ) / 255); },
      colordodge: function(base, adj) { return (base === 255) ? base : Math.min(255, ((adj << 8 ) / (255 - base))); },
      lineardodge: function(base, adj) { return Math.min(base + adj, 255); },
      // 
      overlay: function(base, adj) { return (adj < 128) ? (2 * base * adj / 255):(255 - 2 * (255 - base) * (255 - adj) / 255); },
      softlight: function(base, adj) {
        if (base > 127.5){
           return adj + (255 - adj) * ((base - 127.5) / 127.5) * (0.5 - Math.abs(adj - 127.5) / 255);
        } else {
           return adj - adj * ((127.5 - base) / 127.5) * (0.5 - Math.abs(adj - 127.5) / 255);
        }
      },
      hardlight: function(base, adj) {
        if (base > 127.5){
         return adj + (255 - adj) * ((base - 127.5) / 127.5);
        } else{
         return adj * base / 127.5;
        }
      }
      
    };

    return this.each(function() {
      var $t = $(this);

      if ('getContext' in document.createElement('canvas')) {
        var plate = new Image;
        plate.src = $t.attr('src');
        
        if (options.input.match(/^rgb/)) {
          plate.onload = applyRGBAValue;
        } else {
          plate.onload = applyImage;
        }
      }

      function applyRGBAValue() {
        var rgb = options.input.match(/rgb\(([0-9]+), ?([0-9]+), ?([0-9]+)/);
        var r = rgb[1];
        var g = rgb[2];
        var b = rgb[3];

        var canvas = document.createElement('canvas');
        var image = canvas.getContext('2d');

        canvas.width = plate.width;
        canvas.height = plate.height;
        image.drawImage(plate, 0, 0);

        data = image.getImageData(0, 0, canvas.width, canvas.height);
        subpixels = data.data;

        var mode = options.mode;
        var alpha = options.opacity;
        var zed = 1 - alpha;
        for(var i = 0, l = subpixels.length; i < l; i += 4) {
          subpixels[i+0] = blenders[mode](subpixels[i+0], r);
          subpixels[i+1] = blenders[mode](subpixels[i+1], g);
          subpixels[i+2] = blenders[mode](subpixels[i+2], b);
        }

        image.putImageData(data, 0, 0);
        $t.replaceWith(canvas);
      }

      function applyImage() {
        var canvas = document.createElement('canvas');
        var image = canvas.getContext('2d');

        canvas.width = plate.width;
        canvas.height = plate.height;
        image.drawImage(plate, 0, 0);

        data = image.getImageData(0, 0, canvas.width, canvas.height);
        subpixels = data.data;

        var adj_canvas = document.createElement('canvas');
        var adj_image = adj_canvas.getContext('2d');
        adj_image_src = new Image;
        adj_image_src.src = options.input;
        adj_image.drawImage(adj_image_src, 0, 0);
        adj_data = adj_image.getImageData(0, 0, canvas.width, canvas.height);
        adj_subpixels = adj_data.data;

        var m = options.mode;
        var a = options.opacity;
        var z = 1 - a;
        for(var i = 0, l = subpixels.length; i < l; i += 4) {
          subpixels[i+0] = blenders[m](subpixels[i+0], adj_subpixels[i+0]);
          subpixels[i+1] = blenders[m](subpixels[i+1], adj_subpixels[i+1]);
          subpixels[i+2] = blenders[m](subpixels[i+2], adj_subpixels[i+2]);
        }

        image.putImageData(data, 0, 0);
        $t.replaceWith(canvas);
      }
    });
  }
})(jQuery);