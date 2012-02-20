# jquery-blend

Blending modes for jquery

### Examples

    // Overlay with a solid color
    $('img').blend({mode: 'overlay', adjustment: 'rgb(114, 25, 219)'});
    
    // Overlay with an image
    $('img').blend({mode: 'difference', adjustment: '/path/to/mask.jpg'});

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