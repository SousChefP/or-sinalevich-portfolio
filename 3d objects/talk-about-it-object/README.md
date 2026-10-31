# talk about it object

The talk about it project object for the orsi portfolio hero: the melted "talk about it" letters in warm, translucent gold-yellow resin with a glossy clear coat. It uses the same material as the third project object, and it's as thick as the REACH and small spaces objects.

## Files

| File | What it is | Use it for |
|---|---|---|
| `talk-about-it-object.js` | Builds the object in code with three.js. This is the source of truth. | The website (Claude Code) |
| `talk-about-it.glb` | The same object as a 3D file | Other 3D tools, or loading with `GLTFLoader` |
| `talk-about-it.png` | Angled render with a transparent background, 1666×1042 | Mockups in Figma |

## Using it in the site

Requires `three` (built and tested with 0.160).

```js
import { createTalkAboutIt } from './talk-about-it-object.js';

const obj = createTalkAboutIt();   // THREE.Group, centred at the origin, about 490 units wide
obj.scale.setScalar(0.5);          // size it for the scene
scene.add(obj);
```

The scene needs an environment map for the reflections, for example `RoomEnvironment` through `PMREMGenerator`. The see-through effect only shows when something is behind the object, such as the "orsi" wall in the hero.

## Options

```js
createTalkAboutIt({
  color: '#ffcf8f',   // resin tint
  deep: '#ff6a00',    // colour the resin deepens to in thick parts
});
```

## Where to change things in `talk-about-it-object.js`

- `GEO`: thickness (`depth`) and how deep and round the edge is (`bevelThickness`, `bevelSize`).
- The material in `createTalkAboutIt`:
  - `transmission`: how see-through it is.
  - `roughness`: how blurry the view through it is.
  - `attenuationDistance`: how quickly the colour deepens. It's set to 140, double the third object's 70, because this object is twice as thick. That keeps the two the same colour on screen.

## Notes

- In Figma the PNG is opaque. Transparency only shows in the live site.
