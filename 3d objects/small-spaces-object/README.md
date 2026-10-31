# small spaces object

The small spaces project object for the orsi portfolio hero: the melted "small spaces" letters wrapped in IKEA-bag material. Woven polypropylene in the bag's bright blue, satin with light shimmering across it, and slightly crinkled edges. It is as thick as the REACH object.

## Files

| File | What it is | Use it for |
|---|---|---|
| `small-spaces-object.js` | Builds the object in code with three.js. This is the source of truth. | The website (Claude Code) |
| `small-spaces.glb` | The same object as a 3D file, with its textures baked in. | Other 3D tools, or loading with `GLTFLoader` |
| `small-spaces.png` | Angled render with a transparent background, 1937×1033 | Mockups in Figma |

## Using it in the site

Requires `three` (built and tested with 0.160).

```js
import { createSmallSpaces } from './small-spaces-object.js';

const obj = createSmallSpaces();   // THREE.Group, centred at the origin, about 585 units wide
obj.scale.setScalar(0.45);         // size it for the scene
scene.add(obj);
```

The scene needs an environment map for the shimmer to show, for example `RoomEnvironment` through `PMREMGenerator`.

## Options

```js
createSmallSpaces({
  color: '#1873d9',   // bag blue
  shimmer: 1,         // how much the light ripples across the surface (0 = flat)
  weave: 1,           // strength of the woven tapes (0 = smooth)
  wrap: 1.6,          // how much the edges crinkle (0 = clean edges)
});
```

## Where to change things in `small-spaces-object.js`

- `GEO`: thickness (`depth`) and how deep and round the edge is (`bevelThickness`, `bevelSize`). Keep `bevelSize` under about 9 so the small holes in the letters stay open.
- `fraktaTextures()`: the bag surface. `P` is the tape width in texture pixels, and `t.repeat` sets the overall scale.
- `crinkleGeometry()`: the edge crinkle. The flat front and back are left untouched on purpose, so the face shows no triangle seams.

## Behaviour notes from the sketch

- Weight 1.1: a little lighter than REACH.
- After a spin it eases back to its resting angle.
