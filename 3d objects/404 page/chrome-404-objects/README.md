# 404 chrome words

Five words for the orsi portfolio 404 page: **OhNo, Hmm, Nada, Ope, Whoops**. They're melted letters in polished chrome, with the same shape language as the project objects: the same outline treatment, thickness and rounded edge as REACH and the others.

## Files

| File | What it is | Use it for |
|---|---|---|
| `chrome-404-objects.js` | Builds any of the five words in code with three.js. This is the source of truth. | The website (Claude Code) |
| `ohno.glb` … `whoops.glb` | Each word as a 3D file. The chrome reflections depend on the scene's environment, so they look different outside the site. | Other 3D tools |
| `ohno.png` … `whoops.png` | Angled renders with a transparent background | Mockups in Figma |

## Using it in the site

Requires `three` (built and tested with 0.160).

```js
import { createChromeWord, CHROME_WORDS } from './chrome-404-objects.js';

const word = createChromeWord('whoops', { renderer });   // THREE.Group, centred at the origin
word.scale.setScalar(0.5);
scene.add(word);

// all five
Object.keys(CHROME_WORDS).forEach(name => scene.add(createChromeWord(name, { renderer })));
```

Names: `ohno`, `hmm`, `nada`, `ope`, `whoops`.

**Pass the renderer.** Chrome is pure reflection: without something to reflect it looks flat grey. With the renderer, each word gets its own studio to reflect, built once and shared: a graded sky, a sharp horizon, light and dark panels around it, and a few soft-box strips. This only affects the chrome words, not the rest of the scene. Without the renderer, they fall back to `scene.environment`.

Chrome comes alive when it moves: as the words turn, the reflections slide across the rounded edges and the faces. Even a slow float or a small tilt toward the cursor shows this off.

## Options

```js
createChromeWord(name, {
  renderer,           // recommended, see above
  tint: '#e9ebee',    // chrome tint (try a warm '#f1e6d6' for a softer silver)
  roughness: 0.08,    // 0 = mirror, higher = brushed / satin
});
```

## Where to change things in `chrome-404-objects.js`

- `GEO.REACH`: thickness and the rounded edge. It's the same values as the REACH object, so all the objects match.
- `chromeStudio()`: what the chrome reflects. The sky gradient, the horizon line, the panel pattern (`panel`) and the light strips (`light(...)`) are all there. More contrast in the studio means a more "chrome" look.
