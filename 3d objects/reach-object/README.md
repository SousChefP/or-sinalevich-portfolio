# REACH object

The REACH project object for the orsi portfolio hero: the melted REACH letters as a climbing hold. Extruded with a deep rounded edge, a matte sandy red surface, and four screw holes with metal washers.

## Files

| File | What it is | Use it for |
|---|---|---|
| `reach-object.js` | Builds the object in code with three.js. This is the source of truth. | The website (Claude Code) |
| `reach.glb` | The same object as a 3D file. The sandy surface is baked into a normal map. | Other 3D tools, or loading with `GLTFLoader` |
| `reach.png` | Angled render with a transparent background, 1932×971 | Mockups in Figma |

## Using it in the site

Requires `three` (built and tested with 0.160).

```js
import { createReach } from './reach-object.js';

const reach = createReach();     // THREE.Group, centred at the origin, about 380 units wide
reach.scale.setScalar(0.6);      // size it for the scene
scene.add(reach);
```

The scene needs an environment map for the washers to look like metal, for example `RoomEnvironment` through `PMREMGenerator`.

## Options

```js
createReach({
  color: '#d63c26',   // hold colour
  grain: 2.6,         // strength of the sandy texture (0 = smooth)
  bolts: true,        // screw holes with washers
});
```

## Where to change things in `reach-object.js`

- `GEO.REACH`: thickness (`depth`), how deep and round the edge is (`bevelThickness`, `bevelSize`), and edge smoothness (`bevelSegments`).
- `BOLTS.REACH`: screw-hole positions `[x, y, size]`, in the outline's units (0–380 across, 0–107 down).
- `grainTextures()`: the sandy surface. `t.repeat` sets the grain size.
- `makeHoldMat`: matte finish (`roughness`) and how much the environment reflects (`envMapIntensity`).

## Behaviour notes from the sketch

- Weight 1.6: heavier than the other objects, so it spins slowly and settles quickly.
- After a spin it eases back to its resting angle.
- The lighting is real, not painted on, so the object can rotate freely and still look right.
