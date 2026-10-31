# euka tea object

The euka tea project object for the orsi portfolio hero: the melted "euka tea" letters as a tea pad. It has cream filter paper with a honeycomb net, a flat ribbed rim around the edge, and the tea inside showing through the net as a grey mass. The tea mass only shifts while the object is being moved, then stays where it landed.

## Files

| File | What it is | Use it for |
|---|---|---|
| `euka-tea-object.js` | Builds the object in code with three.js, including the moving tea. This is the source of truth. | The website (Claude Code) |
| `euka-tea.glb` | The same object as a 3D file. The tea is frozen in its resting position and the custom tea shader isn't included, so it shows plain paper. | Other 3D tools |
| `euka-tea.png` | Angled render with a transparent background, 1502×1190 | Mockups in Figma |

## Using it in the site

Requires `three` (built and tested with 0.160).

```js
import { createEukaTea } from './euka-tea-object.js';

const bag = createEukaTea();       // THREE.Group, centred at the origin, about 375 units wide
bag.scale.setScalar(0.55);
scene.add(bag);

// in the render loop, after moving the object and before rendering:
bag.userData.tick(deltaSeconds);
```

`tick` reads how the object moved since the last frame. Turning it, throwing it or shaking it wakes the tea, while gentle floating doesn't. The tea then slides toward the new "down" and settles about a second after the movement stops.

## Options

```js
createEukaTea({
  fill: 1.5,   // how much tea (higher = more of the letters filled)
  seed: 3,     // changes the starting layout and the specks
});
```

## Where to change things in `euka-tea-object.js`

- `PAPER`, `RIM_COL`, `TEA`: the three colours.
- `RIM`: width of the flat ribbed rim.
- `GEO`: thickness and how round the edge is.
- `paperTextures()`: the honeycomb net (`cell` sets the cell size) and the rim ribs (`setLineDash`).
- The shader in `createEukaTea` (`onBeforeCompile`): how the grey tea shows through the net. The `smoothstep` values control how soft the edge of the tea mass is.
- `tick()`: the line that sets `target` decides how much movement wakes the tea.

## Notes

- The tea is simulated as invisible grains. Each grain paints a soft blob into a texture, and the shader turns the sum into the grey mass. That's why it looks like a solid mass and not separate particles.
- The weight in the hero sketch is 0.5, the lightest object.
