// REACH — climbing-hold object for the orsi portfolio hero.
// Builds the exact object from the viewer: melted outline extruded with a deep rounded edge,
// matte sandy red surface (procedural, no image files), and four screw holes with metal washers.
//
// Usage (Vite / any bundler with three installed):
//   import { createReach } from './reach-object.js';
//   const reach = createReach();          // THREE.Group, centred at the origin, ~380 units wide
//   reach.scale.setScalar(0.6);           // size it for your scene
//   scene.add(reach);
//
// Options: createReach({ color: '#d63c26', grain: 2.6, bolts: true })

import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

/** Outline of the melted REACH letters (SVG path, units ≈ px at 380 wide). */
export const REACH_PATH = {"w": 379.0, "h": 107.3, "d": "M250.2 106.8C244.2 106.0 239.7 104.9 235.2 103.0C227.9 100.0 226.8 99.6 225.2 99.4C223.0 99.2 220.3 100.0 217.2 101.7C213.4 103.8 210.2 104.7 206.8 104.7C198.5 104.7 194.6 101.7 189.9 91.8C186.9 85.7 184.8 83.3 181.0 81.9C177.1 80.4 171.3 80.6 167.7 82.4C164.1 84.1 162.8 85.8 159.1 93.0C155.3 100.5 152.5 103.0 146.4 104.6C142.9 105.5 64.0 105.5 60.5 104.6C54.2 103.0 50.7 99.7 45.8 91.0C39.7 79.9 37.2 77.0 33.8 77.0C32.7 77.0 32.1 77.2 31.2 78.0C29.2 79.8 28.7 81.4 27.8 90.1C27.1 97.4 25.1 101.1 20.8 103.2C18.2 104.5 18.2 104.5 14.2 104.5C10.5 104.5 10.0 104.4 8.3 103.6C4.3 101.7 2.1 98.8 1.1 93.8C0.3 89.7 0.3 18.2 1.1 13.9C2.4 7.5 4.9 4.6 10.8 3.0C13.3 2.3 14.3 2.2 26.5 2.1C45.4 1.9 50.7 2.4 58.4 5.0C65.7 7.5 67.7 7.5 73.9 5.0C81.1 2.2 84.2 1.9 109.3 2.1L128.5 2.3L131.3 3.1C137.3 4.9 140.3 8.9 140.3 15.2C140.3 21.7 137.1 25.5 129.7 27.9C128.7 28.2 125.4 28.5 120.0 28.7C109.4 29.1 107.6 29.4 105.7 31.4C104.5 32.8 104.4 34.4 105.6 35.7C107.4 37.7 109.9 38.2 119.7 38.7C129.1 39.0 130.9 39.6 137.2 43.7C141.3 46.3 143.1 46.3 145.8 43.5C148.2 41.0 149.1 39.1 156.6 19.2C160.7 8.1 164.2 4.3 171.7 2.8C174.5 2.3 174.9 2.3 177.7 2.8C185.9 4.3 188.6 7.4 194.0 21.3C199.1 34.5 202.5 38.7 206.1 36.4C207.4 35.5 208.7 33.5 211.8 27.6C215.9 19.8 219.4 15.1 223.6 11.5C234.1 2.9 244.1 -0.2 259.0 0.7C266.5 1.1 270.9 2.3 279.0 6.2C286.8 9.8 288.7 9.9 293.4 7.2C300.1 3.2 303.4 2.3 308.4 3.0C311.8 3.5 313.4 4.3 315.5 6.5C318.4 9.5 319.1 12.2 319.6 23.3C320.1 32.8 321.3 35.6 326.0 37.8L328.2 38.8L335.2 38.8C343.5 38.8 344.9 38.5 347.7 35.6C350.2 33.0 350.7 30.9 351.2 20.3C351.5 12.4 352.5 9.2 355.3 6.3C358.2 3.5 362.4 2.3 367.3 3.0C373.4 3.9 376.6 7.2 377.9 13.8C378.7 18.2 378.7 89.6 377.9 93.8C376.9 98.8 374.7 101.7 370.7 103.6C369.0 104.4 368.5 104.5 364.8 104.5L360.8 104.5L358.1 103.2C352.9 100.5 351.5 96.8 351.1 84.8C350.8 73.7 350.3 71.3 347.3 68.5C345.1 66.4 342.4 65.6 336.9 65.4C326.1 65.0 321.3 67.8 320.1 75.2C319.9 76.3 319.6 80.4 319.5 84.3C319.2 95.0 318.5 97.8 315.5 101.0C313.0 103.6 310.7 104.5 306.0 104.5C301.5 104.5 299.4 104.0 296.2 101.9C289.9 97.9 287.7 97.5 282.7 99.5C281.1 100.1 279.1 101.0 278.2 101.4C271.3 105.0 264.6 106.6 256.2 106.8C253.4 106.9 250.7 106.9 250.2 106.8ZM124.5 79.0C129.6 78.3 132.4 76.6 133.9 73.5C135.9 69.2 133.8 66.3 128.2 65.6C124.9 65.3 115.4 65.3 112.0 65.7C105.3 66.4 102.3 68.5 102.3 72.5C102.3 76.0 105.2 78.3 110.2 79.0C113.5 79.4 121.5 79.4 124.5 79.0ZM260.5 77.9C263.8 76.9 266.4 74.9 270.3 70.6C274.5 65.8 276.0 64.8 280.4 63.2C288.5 60.2 290.8 57.8 290.5 53.0C290.2 49.6 288.1 47.1 283.7 45.3C276.5 42.3 275.8 41.9 270.5 36.6C266.9 33.1 264.9 31.5 263.5 30.7C254.2 26.1 244.0 29.6 239.1 39.3C235.0 47.2 235.1 60.5 239.2 68.3C243.5 76.7 252.4 80.6 260.5 77.9ZM42.2 41.7C49.2 38.2 46.0 29.5 37.7 29.5C33.3 29.5 30.6 31.7 30.4 35.5C30.2 38.9 32.1 41.5 35.4 42.4C37.2 42.8 40.7 42.5 42.2 41.7Z"};

// climbing-hold surface for REACH: matte, sandy grain, slight speckle (procedural, no image files)
function grainTextures() {
  const N = 512;
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = N; return c; };
  const bump = mk(), col = mk();
  const gb = bump.getContext('2d'), gc = col.getContext('2d');
  const ib = gb.createImageData(N, N), ic = gc.createImageData(N, N);
  for (let i = 0; i < N * N; i++) {
    const r = Math.random();
    let b = 128 + (Math.random() - 0.5) * 110;         // sand
    if (r > 0.985) b = 230;                              // raised grains
    else if (r < 0.01) b = 40;                           // tiny pits
    ib.data.set([b, b, b, 255], i * 4);
    let v = 232 + (Math.random() - 0.5) * 40;           // colour speckle around near-white
    if (r > 0.99) v = 255; else if (r < 0.012) v = 150;
    ic.data.set([v, v, v, 255], i * 4);
  }
  gb.putImageData(ib, 0, 0); gc.putImageData(ic, 0, 0);
  const soft = src => { const c = mk(), g = c.getContext('2d'); g.filter = 'blur(0.6px)'; g.drawImage(src, 0, 0); return c; };
  const tex = (c, srgb) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1 / 520, 1 / 520);                     // one grain ≈ one unit of the object, visible on screen
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  return { bump: tex(soft(bump)), color: tex(soft(col), true) };
}
let grain = null;
const makeHoldMat = (color, bumpScale) => new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0, map: grain.color, bumpMap: grain.bump, bumpScale, envMapIntensity: 0.55 });
const washerMat = new THREE.MeshStandardMaterial({ color: '#cfd3d6', metalness: 1, roughness: 0.32 });
const boltHoleMat = new THREE.MeshBasicMaterial({ color: '#141414' });
const BOLTS = { 'REACH': [[71, 28, 1.08], [129, 89, 0.98], [289, 26, 0.82], [362, 72, 0.93]] };   // scattered at random, in outline units [x, y, size]   // scattered at random, in outline units [x, y, size]
// per-object volume: REACH gets a thicker body and a deeper, rounder edge
const GEO = { 'REACH': { depth: 24, bevelThickness: 17, bevelSize: 9.5, bevelSegments: 8 } };


function makeGeo(d, extra = {}) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}" fill="#000" fill-rule="evenodd"/></svg>`;
  const shapes = [];
  new SVGLoader().parse(svg).paths.forEach(p => shapes.push(...SVGLoader.createShapes(p)));
  let g = new THREE.ExtrudeGeometry(shapes, Object.assign({ depth: 6, bevelEnabled: true, bevelThickness: 12, bevelSize: 7.5, bevelSegments: 5, curveSegments: 3 }, extra));
  g = toCreasedNormals(g, Math.PI / 3);
  // keep the flat front/back faces perfectly flat (avoids streaks from the rounded edge bleeding in)
  const n = g.attributes.normal, p = g.attributes.position;
  const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3(), fn = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 3) {
    va.fromBufferAttribute(p, i); vb.fromBufferAttribute(p, i + 1); vc.fromBufferAttribute(p, i + 2);
    fn.subVectors(vc, vb).cross(va.clone().sub(vb)).normalize();
    if (Math.abs(fn.z) > 0.999) for (let j = 0; j < 3; j++) n.setXYZ(i + j, 0, 0, Math.sign(fn.z));
  }
  n.needsUpdate = true;
  g.computeBoundingBox();
  const c = g.boundingBox.getCenter(new THREE.Vector3());
  g.center();
  g.computeBoundingBox();
  g.userData.offset = c;
  g.userData.capZ = g.boundingBox.max.z;
  return g;
}



export function createReach({ color = '#d63c26', grain: bumpScale = 2.6, bolts = true } = {}) {
  if (!grain) grain = grainTextures();
  const mesh = new THREE.Mesh(makeGeo(REACH_PATH.d, GEO.REACH), makeHoldMat(color, bumpScale));
  mesh.scale.set(1, -1, 1);                       // SVG y points down; flip so the word reads upright
  mesh.castShadow = true;
  if (bolts) BOLTS.REACH.forEach(([bx, by, size]) => {
    const off = mesh.geometry.userData.offset, z = mesh.geometry.userData.capZ;
    const bolt = new THREE.Group();
    const washer = new THREE.Mesh(new THREE.TorusGeometry(6.2, 2.0, 12, 36), washerMat);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(4.8, 28), boltHoleMat);
    hole.position.z = 0.6;
    bolt.add(washer, hole);
    bolt.position.set(bx - off.x, by - off.y, z - 0.4);
    bolt.scale.setScalar(size);
    mesh.add(bolt);
  });
  const group = new THREE.Group();
  group.name = 'REACH';
  group.add(mesh);
  return group;
}
