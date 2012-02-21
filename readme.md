# jquery-blend

Blending modes for jquery

### Examples

#### Basic pattern

    // Overlay with a solid color
    $('img').blend({mode: 'overlay', adjustment: 'rgb(114, 25, 219)'});
    
    // Overlay with an image
    $('img').blend({mode: 'difference', adjustment: '/path/to/mask.jpg'});

#### Usage idea

    $(function() {
      $('.display img').each(function() {
        $(this).blend({mode: $(this).attr('data-blend-mode'), adjustment: $(this).attr('data-blend-adjustment')});
      });
    });

    <div class="display">
      <img src="/photo1.jpg" data-blend-mode='overlay' data-blend-adjustment='rgb(18,187,93)' />
    </div>

### Modes
    
- normal

- darken
- multiply
- colorburn
- linearburn

- lighten
- screen
- colordodge
- lineardodge

- overlay
- softlight
- hardlight

- difference
- exclusion
- subtract