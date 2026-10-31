// EUKA TEA — project object for the orsi portfolio hero.
// The melted "euka tea" letters as a tea pad: off-white filter paper with a honeycomb net, a flat crimped
// rim around the edge, and the tea inside seen through the net as a grey mass. The mass only shifts while
// the object is being moved, then stays where it landed.
//
// Usage:
//   import { createEukaTea } from './euka-tea-object.js';
//   const bag = createEukaTea();        // THREE.Group, centred, ~375 units wide
//   scene.add(bag);
//   // every frame, after moving it and before rendering:
//   bag.userData.tick(deltaSeconds);    // moves the tea inside
//
// Options: createEukaTea({ fill: 1.5, seed: 3 })

import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

/** Outline of the melted "euka tea" letters (SVG path). */
export const EUKA_TEA_PATH = {"w": 374.3, "h": 267.0, "d": "M106.5 265.9C104.5 265.8 102.7 265.5 102.5 265.3C102.4 265.2 101.8 265.0 101.3 265.0C100.8 265.0 100.3 264.9 100.2 264.7C100.1 264.6 99.4 264.3 98.6 264.2C97.8 264.1 95.8 263.5 94.2 262.9C84.6 259.6 80.3 254.1 77.7 241.8C77.3 240.0 76.8 238.0 76.7 237.3C75.8 233.6 75.7 230.9 75.7 208.8C75.7 183.9 75.7 183.1 74.3 180.2C73.3 177.9 72.8 177.3 69.5 175.3C64.9 172.5 63.5 170.5 62.1 164.8C62.0 164.3 61.9 163.7 61.9 163.5C62.0 163.3 61.6 162.4 61.1 161.5C59.5 158.6 57.2 157.4 51.8 156.7C45.9 155.9 44.5 155.6 44.0 155.5C43.7 155.4 42.3 155.1 40.8 154.8C31.8 153.1 28.2 151.9 24.2 148.7C22.3 147.3 11.3 136.5 9.8 134.7C6.9 131.0 4.3 126.0 3.0 121.5C2.3 119.1 1.6 116.4 1.2 114.8C0.8 112.6 0.5 82.3 1.0 81.9C1.2 81.7 1.3 81.0 1.3 80.4C1.3 79.7 1.5 78.8 1.6 78.2C5.0 67.2 6.4 64.3 11.5 58.1C12.4 57.0 14.0 55.0 15.0 53.7C16.7 51.6 17.4 51.0 20.6 48.6C22.1 47.4 25.3 45.3 25.5 45.3C25.6 45.3 26.6 44.7 27.8 44.0C29.0 43.3 30.1 42.7 30.3 42.7C30.4 42.7 31.4 42.3 32.5 41.9C35.1 40.8 39.9 39.4 42.3 38.9C44.9 38.4 56.3 38.2 57.2 38.6C57.5 38.8 58.4 39.0 59.2 39.1C60.4 39.3 61.7 39.5 66.8 40.8C74.0 42.5 77.9 44.7 84.8 51.0C91.7 57.3 94.6 57.3 97.0 51.0C99.5 44.2 101.0 42.5 105.3 41.5C107.3 41.1 116.1 41.0 117.7 41.3C120.9 42.1 121.8 42.4 123.1 43.4C124.6 44.6 125.9 46.8 126.4 49.1C126.7 50.0 126.9 61.1 127.0 79.8C127.1 96.8 127.4 110.2 127.6 111.7C128.9 121.2 133.7 126.9 141.4 128.0C152.2 129.6 162.3 122.0 163.7 111.3C163.8 109.9 164.0 96.6 164.0 80.4C164.0 63.7 164.1 51.5 164.3 50.9C164.5 50.3 164.8 49.2 165.0 48.5C165.5 46.5 167.2 44.1 168.8 43.0C171.8 41.2 173.6 41.0 189.2 41.4L192.3 41.5L193.6 40.2C196.0 37.9 196.1 37.5 196.3 23.0C196.6 9.1 196.7 8.0 198.5 5.3C198.9 4.6 199.9 3.6 200.6 3.1C201.8 2.2 202.6 1.9 206.0 1.0C207.4 0.6 215.9 0.8 217.8 1.2C221.4 2.1 223.5 3.8 225.0 7.2L225.8 8.8L226.0 35.0C226.3 64.6 226.4 65.7 228.6 67.9C229.9 69.2 231.3 69.4 233.4 68.3C235.7 67.1 237.6 65.4 248.3 54.8C261.8 41.5 262.1 41.4 272.5 41.1C282.5 40.9 285.0 41.6 288.9 45.8C291.4 48.5 292.7 49.3 294.3 49.3C294.7 49.3 298.5 47.7 302.6 45.7C311.3 41.5 318.3 39.0 321.3 39.0C321.8 39.0 322.4 38.8 322.5 38.7C323.0 38.2 334.8 38.4 337.3 38.9C348.0 41.1 352.0 42.5 356.4 45.2C363.4 49.7 370.9 58.7 372.2 64.2C372.3 64.7 372.5 65.3 372.7 65.5C373.3 66.3 373.4 71.1 373.5 106.2C373.6 145.9 373.6 144.8 372.0 148.6C371.0 151.0 368.7 152.6 365.2 153.5C361.9 154.4 353.6 153.7 349.3 152.3C346.4 151.3 342.3 151.3 339.3 152.3C336.7 153.1 333.2 154.1 328.7 155.2C326.8 155.6 321.1 156.4 320.0 156.4C318.5 156.4 312.2 155.6 311.6 155.4C311.1 155.2 309.9 155.0 308.8 154.8C307.7 154.7 306.7 154.5 306.5 154.3C306.3 154.1 304.4 154.0 302.4 153.9C298.9 153.8 298.7 153.9 297.8 154.7C296.3 156.1 296.6 156.8 302.0 165.8C304.9 170.6 305.7 172.4 306.3 175.7C306.5 176.7 306.8 178.1 307.0 178.8C307.2 179.6 307.5 181.4 307.8 182.8C308.1 184.3 308.6 186.2 308.8 187.2C309.2 189.1 309.3 253.4 308.9 255.3C307.9 259.9 305.5 262.2 300.8 263.4C299.3 263.8 289.3 263.9 287.8 263.5C286.6 263.2 282.9 262.1 280.2 261.3C276.7 260.2 273.4 260.6 266.0 263.2C258.1 266.0 251.2 266.6 245.8 265.0C245.1 264.8 243.4 264.4 242.0 264.2C232.8 262.5 229.0 260.5 222.2 253.6C218.1 249.5 217.1 248.9 214.3 248.9C211.7 248.9 210.3 249.5 207.3 252.2C203.1 255.9 202.1 256.6 198.2 258.8C193.2 261.7 189.1 263.2 183.5 264.2C180.0 264.8 179.0 265.0 178.2 265.3C175.9 266.4 167.6 266.3 163.8 265.3C160.6 264.4 160.1 264.3 158.2 264.0C157.1 263.9 155.6 263.6 155.0 263.4C154.4 263.2 152.9 262.8 151.8 262.5C147.6 261.3 140.9 257.3 135.1 252.5C134.0 251.6 132.6 250.5 131.8 250.2C131.1 249.9 130.2 249.4 129.9 249.3C127.7 248.2 126.3 249.6 124.5 254.5C122.3 260.7 121.6 261.7 117.8 263.9C114.2 266.0 112.3 266.4 106.5 265.9ZM119.9 238.3C122.0 237.1 122.3 234.8 121.3 230.0C121.1 229.0 120.9 227.8 120.8 227.3C120.8 226.9 120.5 225.9 120.3 225.2C118.9 220.1 118.9 219.9 118.9 207.5C118.9 195.0 118.8 195.4 120.3 189.7C120.6 188.8 120.8 187.9 120.9 187.5C120.9 187.1 121.1 186.0 121.3 185.0C122.1 181.2 122.1 179.9 121.5 178.5C120.4 176.3 119.5 175.9 115.7 175.9C109.2 176.0 106.5 178.6 105.8 185.3C105.5 188.5 105.5 225.2 105.8 228.4C106.5 235.5 109.9 238.9 116.3 239.0C118.3 239.0 119.1 238.8 119.9 238.3ZM173.7 238.1C180.1 237.3 185.5 234.1 190.3 228.3C195.4 222.2 194.6 219.9 187.1 218.9C184.2 218.5 162.7 218.4 158.6 218.7C156.5 218.9 153.8 220.2 152.9 221.4C149.7 225.8 155.9 234.0 164.8 237.2C167.0 237.9 170.6 238.6 171.5 238.5C171.9 238.4 172.8 238.2 173.7 238.1ZM263.5 237.1C269.0 235.3 273.2 232.3 274.8 228.8C278.1 222.0 274.9 218.6 265.3 218.5C256.7 218.5 251.5 220.0 247.9 223.3C242.6 228.2 244.6 235.0 252.0 237.5C255.3 238.5 259.4 238.4 263.5 237.1ZM229.3 199.1C231.4 197.8 232.9 195.8 232.5 195.1C231.3 193.2 228.3 192.5 226.0 193.5C224.3 194.1 223.7 195.0 223.5 196.8C223.3 198.2 223.3 198.4 224.3 199.4C225.6 200.6 226.9 200.6 229.3 199.1ZM178.9 193.5C183.2 193.0 184.7 192.3 185.7 190.3C187.7 186.4 184.0 180.4 177.8 177.4C175.2 176.2 175.1 176.2 171.2 176.2C166.6 176.2 165.7 176.4 160.9 178.9C153.6 182.7 151.1 189.0 155.7 192.4C157.6 193.8 171.4 194.5 178.9 193.5ZM264.6 193.5C269.2 193.1 269.9 192.9 272.1 191.8C275.1 190.3 275.0 190.4 276.1 188.3C277.0 186.8 277.0 186.5 276.7 185.2C275.9 181.8 272.7 179.0 267.8 177.0C264.9 175.8 259.1 175.8 256.2 177.1C249.7 179.9 243.8 187.8 245.7 191.4C246.3 192.5 248.3 193.1 252.8 193.5C258.7 194.1 258.8 194.1 264.6 193.5ZM218.6 172.5C219.8 171.9 221.3 170.2 223.1 167.5C226.8 161.9 228.0 160.5 230.7 158.5C233.0 156.8 238.7 153.9 243.6 152.0C250.9 149.1 253.3 147.1 253.3 143.8C253.3 142.4 251.6 138.4 250.8 138.1C250.6 138.0 250.3 137.7 250.3 137.5C250.3 137.3 249.4 135.9 248.2 134.6C247.1 133.2 245.4 131.0 244.5 129.8C243.6 128.6 242.3 126.9 241.7 126.1C238.0 121.3 232.3 116.3 230.5 116.3C229.8 116.3 227.3 118.8 227.3 119.5C227.3 119.9 227.2 120.3 227.0 120.5C226.5 121.0 226.3 124.1 226.0 135.5C225.8 145.4 225.7 146.3 225.0 148.0C223.5 151.8 220.2 153.8 214.5 154.2C207.7 154.7 204.7 155.9 204.7 158.3C204.7 160.9 211.5 171.0 214.3 172.5C215.4 173.1 217.5 173.1 218.6 172.5ZM130.3 164.8C132.2 163.9 133.5 161.1 132.7 159.7C132.2 158.7 130.2 157.9 129.0 158.2C127.4 158.5 126.3 160.1 126.3 162.0C126.3 164.8 128.0 166.0 130.3 164.8ZM326.5 128.7C326.6 128.6 327.4 128.3 328.3 128.2C331.3 127.9 337.5 124.5 339.5 122.3C341.9 119.6 343.6 115.5 343.2 113.6C342.5 110.0 339.0 108.5 331.5 108.5C322.0 108.6 315.6 111.0 312.6 115.9C311.5 117.7 311.6 121.4 312.8 123.2C314.7 126.2 317.8 128.3 320.4 128.3C320.9 128.3 321.4 128.5 321.5 128.7C321.8 129.1 326.2 129.1 326.5 128.7ZM58.3 127.7C64.5 125.5 68.7 121.9 72.9 115.1C73.9 113.4 73.8 111.5 72.6 110.6C70.4 109.0 66.2 108.5 52.8 108.5C37.8 108.5 35.6 108.9 33.8 111.7C31.2 115.5 34.3 121.3 40.7 125.0C45.9 128.0 47.4 128.4 52.7 128.2C55.1 128.1 57.7 127.9 58.3 127.7ZM277.9 118.6C279.0 117.4 279.9 115.4 281.6 110.0C284.2 102.2 284.7 101.5 293.2 93.2C299.3 87.1 300.2 85.9 299.4 84.7C298.9 83.8 297.1 82.8 294.6 82.0C289.3 80.3 288.0 79.4 286.1 75.7C285.3 73.9 285.2 73.6 285.1 68.5C285.0 63.3 285.0 63.2 284.1 62.4C283.1 61.5 282.2 61.6 279.5 63.3C273.8 66.7 255.0 85.6 254.2 88.8C254.1 89.2 253.8 90.1 253.6 90.8C253.3 91.7 253.3 92.3 253.6 93.1C253.8 93.7 254.0 94.5 254.0 94.7C254.0 95.5 257.4 100.4 259.8 103.3C260.9 104.6 262.5 106.5 263.3 107.7C270.1 116.9 272.7 119.3 275.5 119.3C276.9 119.3 277.4 119.2 277.9 118.6ZM60.2 83.7C60.4 83.5 61.2 83.3 62.0 83.2C64.8 82.9 65.8 82.4 67.0 80.5C69.0 77.2 65.2 71.4 58.8 68.1L56.2 66.8L51.5 66.8C46.9 66.8 46.5 66.9 43.3 68.2C37.1 70.9 34.3 74.0 34.3 78.4C34.3 80.3 34.4 80.5 35.7 81.7C36.7 82.7 37.3 83.0 38.6 83.2C39.5 83.3 40.5 83.5 41.0 83.6C42.1 84.0 59.8 84.1 60.2 83.7ZM335.5 83.7C335.6 83.5 336.3 83.3 337.0 83.3C339.5 83.3 341.9 81.9 343.2 79.7C346.0 75.2 340.0 67.9 332.5 66.4C326.9 65.4 321.2 67.1 317.1 71.2C314.8 73.6 312.0 78.1 312.0 79.7C312.0 81.6 314.5 83.3 317.4 83.3C318.2 83.3 319.1 83.5 319.3 83.7C320.0 84.1 335.2 84.1 335.5 83.7Z"};

// a pillowy pad: rounded but softer than the other objects
const GEO = { depth: 18, bevelThickness: 13, bevelSize: 5, bevelSegments: 8 };
const RIM = 6.5;                 // width of the flat crimped rim, inside the outline (units)
const M = 14;                    // texture margin around the outline (units), covers the bevel
const PAPER = '#efe9dc', RIM_COL = '#ebe2cf', TEA = '#4a4641';

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

// where the tea may go: the letters, pulled in a little so the tea stays clear of the paper
function insideMask(w, h, inset) {
  const W = Math.ceil(w), H = Math.ceil(h);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const p = new Path2D(EUKA_TEA_PATH.d);
  g.fillStyle = '#fff'; g.fill(p, 'evenodd');
  g.strokeStyle = '#000'; g.lineWidth = inset * 2; g.stroke(p);
  const data = g.getImageData(0, 0, W, H).data;
  const m = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) m[i] = data[i * 4] > 127 ? 1 : 0;
  return { m, W, H, at: (x, y) => { const xi = x | 0, yi = y | 0; return xi >= 0 && yi >= 0 && xi < W && yi < H && m[yi * W + xi] === 1; } };
}


// paper, net and rim, baked once.
//   colour map: paper with brighter net threads, cream rim with ribs, a few tea specks
//   net map:    R = height for bump (net threads / rim ribs), G = rim mask (no tea shows there)
function paperTextures(seed) {
  const S = 4, W = EUKA_TEA_PATH.w + 2 * M, H = EUKA_TEA_PATH.h + 2 * M;
  const cw = Math.ceil(W * S), ch = Math.ceil(H * S);
  const mk = () => { const c = document.createElement('canvas'); c.width = cw; c.height = ch; return c; };
  const path = new Path2D(EUKA_TEA_PATH.d);
  const draw = (c, fn) => { const g = c.getContext('2d'); g.setTransform(S, 0, 0, S, M * S, M * S); fn(g); return g.getImageData(0, 0, cw, ch).data; };
  const rimC = mk(), ribC = mk();
  const rimD = draw(rimC, g => { g.strokeStyle = '#fff'; g.lineWidth = RIM * 2; g.lineJoin = 'round'; g.stroke(path); });
  const ribD = draw(ribC, g => { g.strokeStyle = '#fff'; g.lineWidth = RIM * 2; g.setLineDash([0.7, 0.7]); g.stroke(path); });
  let s = seed * 7919 + 1; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const colC = mk(), netC = mk();
  const cg = colC.getContext('2d'), ng = netC.getContext('2d');
  const cI = cg.createImageData(cw, ch), nI = ng.createImageData(cw, ch);
  const paper = new THREE.Color(PAPER), rim = new THREE.Color(RIM_COL);
  // honeycomb: three cosine waves 60° apart; low values are the cell walls. A soft warp keeps it hand-made.
  const cell = 3.4, k = 2 * Math.PI / (cell * 0.866);
  const dirs = [[1, 0], [0.5, 0.866], [-0.5, 0.866]];
  for (let py = 0; py < ch; py++) for (let px = 0; px < cw; px++) {
    const x = px / S, y = py / S;
    const wx = x + 0.45 * Math.sin(y * 0.21 + Math.sin(x * 0.13)), wy = y + 0.45 * Math.sin(x * 0.19 + Math.cos(y * 0.11));
    let f = 0; for (const [dx, dy] of dirs) f += Math.cos(k * (wx * dx + wy * dy));
    const net = Math.pow(Math.min(1, Math.max(0, (0.1 - f) / 1.6)), 1.4);
    const i = (py * cw + px) * 4;
    const r = rimD[i + 3] / 255, rib = ribD[i + 3] / 255;
    const base = paper.clone().lerp(rim, r);
    const shade = r > 0.5 ? 0.98 - rib * 0.03 : 0.95 + net * 0.06;
    cI.data[i] = base.r * 255 * shade; cI.data[i + 1] = base.g * 255 * shade; cI.data[i + 2] = base.b * 255 * shade; cI.data[i + 3] = 255;
    nI.data[i] = (r > 0.5 ? 0.45 + rib * 0.2 : net * 0.9) * 255; nI.data[i + 1] = r * 255; nI.data[i + 2] = 0; nI.data[i + 3] = 255;
  }
  cg.putImageData(cI, 0, 0); ng.putImageData(nI, 0, 0);
  // a few tea specks scattered on the paper and rim
  cg.setTransform(S, 0, 0, S, M * S, M * S);
  cg.fillStyle = 'rgba(70,58,44,0.85)';
  for (let n = 0; n < 60; n++) {
    const x = rnd() * EUKA_TEA_PATH.w, y = rnd() * EUKA_TEA_PATH.h;
    if (cg.isPointInPath(path, x * S + M * S, y * S + M * S)) { cg.beginPath(); cg.arc(x, y, 0.3 + rnd() * 0.5, 0, Math.PI * 2); cg.fill(); }
  }
  const tex = (c, srgb) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  return { color: tex(colC, true), net: tex(netC), W, H };
}

// uv = position in the outline (plus margin), so the paper texture lines up with the letters
function outlineUV(g, W, H) {
  const p = g.attributes.position, off = g.userData.offset, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    uv[2 * i] = (p.getX(i) + off.x + M) / W;
    uv[2 * i + 1] = 1 - (p.getY(i) + off.y + M) / H;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

export function createEukaTea({ fill = 1.5, seed = 3 } = {}) {
  const tx = paperTextures(seed);

  // tea density: the grains are invisible; each one paints a soft blob, and the shader turns the sum
  // into a grey mass with a ragged edge (seen through the net)
  const T = 2;
  const teaC = document.createElement('canvas');
  teaC.width = Math.ceil(tx.W * T); teaC.height = Math.ceil(tx.H * T);
  const tg = teaC.getContext('2d');
  const teaTex = new THREE.CanvasTexture(teaC);

  const mat = new THREE.MeshStandardMaterial({
    color: '#ffffff', map: tx.color, bumpMap: tx.net, bumpScale: 1.2, roughness: 0.88, metalness: 0,
  });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.teaMap = { value: teaTex };
    sh.uniforms.netMap = { value: tx.net };
    sh.uniforms.teaCol = { value: new THREE.Color(TEA) };
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D teaMap;\nuniform sampler2D netMap;\nuniform vec3 teaCol;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        vec2 nr = texture2D(netMap, vMapUv).rg;
        float d = texture2D(teaMap, vMapUv).r;
        float t = smoothstep(0.22 + nr.r * 0.1, 0.36 + nr.r * 0.1, d) * (1.0 - nr.g);
        // net threads stay pale over the tea, like the references
        diffuseColor.rgb = mix(diffuseColor.rgb, teaCol, t * (0.97 - nr.r * 0.5));`);
  };

  const geo = makeGeo(EUKA_TEA_PATH.d, GEO);
  outlineUV(geo, tx.W, tx.H);
  const shell = new THREE.Mesh(geo, mat);
  shell.castShadow = true;

  // ---------- tea grains (simulation only) ----------
  const mask = insideMask(EUKA_TEA_PATH.w, EUKA_TEA_PATH.h, RIM + 1);
  let s = seed * 104729 + 3; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  let area = 0; for (let i = 0; i < mask.m.length; i++) area += mask.m[i];
  const R = 4.2, minD = R * 2.2, minD2 = minD * minD;
  const count = Math.min(3000, Math.round(area * fill / (minD * minD * 0.87)));
  const px = new Float32Array(count), py = new Float32Array(count), vx = new Float32Array(count), vy = new Float32Array(count);
  for (let i = 0; i < count; i++) { let x, y; do { x = rnd() * mask.W; y = rnd() * mask.H; } while (!mask.at(x, y)); px[i] = x; py[i] = y; }

  // one soft blob sprite
  const BR = minD * 1.05 * T;
  const blob = document.createElement('canvas'); blob.width = blob.height = Math.ceil(BR * 2);
  { const g = blob.getContext('2d'), gr = g.createRadialGradient(BR, BR, 0, BR, BR, BR);
    gr.addColorStop(0, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, BR * 2, BR * 2); }
  function paintTea() {
    tg.globalCompositeOperation = 'source-over'; tg.fillStyle = '#000'; tg.fillRect(0, 0, teaC.width, teaC.height);
    tg.globalCompositeOperation = 'lighter';
    for (let i = 0; i < count; i++) tg.drawImage(blob, (px[i] + M) * T - BR, (py[i] + M) * T - BR);
    teaTex.needsUpdate = true;
  }

  const G = 1300;
  const CELL = minD, gw = Math.ceil(mask.W / CELL) + 1, gh = Math.ceil(mask.H / CELL) + 1;
  const head = new Int32Array(gw * gh), next = new Int32Array(count);
  function step(dt, gx, gy, damp) {
    for (let i = 0; i < count; i++) {
      vx[i] = (vx[i] + gx * dt) * damp; vy[i] = (vy[i] + gy * dt) * damp;
      const nx = px[i] + vx[i] * dt, ny = py[i] + vy[i] * dt;
      if (mask.at(nx, ny)) { px[i] = nx; py[i] = ny; }
      else if (mask.at(nx, py[i])) { px[i] = nx; vy[i] *= -0.3; }
      else if (mask.at(px[i], ny)) { py[i] = ny; vx[i] *= -0.3; }
      else { vx[i] *= -0.4; vy[i] *= -0.4; }
    }
    head.fill(-1);
    for (let i = 0; i < count; i++) { const c = ((py[i] / CELL) | 0) * gw + ((px[i] / CELL) | 0); next[i] = head[c]; head[c] = i; }
    for (let i = 0; i < count; i++) {
      const cx = (px[i] / CELL) | 0, cy = (py[i] / CELL) | 0;
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        const X = cx + ox, Y = cy + oy; if (X < 0 || Y < 0 || X >= gw || Y >= gh) continue;
        for (let j = head[Y * gw + X]; j !== -1; j = next[j]) {
          if (j <= i) continue;
          const dx = px[j] - px[i], dy = py[j] - py[i], d2 = dx * dx + dy * dy;
          if (d2 < minD2 && d2 > 1e-6) {
            const d = Math.sqrt(d2), push = (minD - d) * 0.5 / d;
            const ax = px[i] - dx * push, ay = py[i] - dy * push, bx = px[j] + dx * push, by = py[j] + dy * push;
            if (mask.at(ax, ay)) { px[i] = ax; py[i] = ay; }
            if (mask.at(bx, by)) { px[j] = bx; py[j] = by; }
          }
        }
      }
    }
  }
  // settle once, downwards, so it starts like a resting pad (empty paper at the top of each letter)
  for (let k = 0; k < 240; k++) step(1 / 120, 0, G, 0.97);
  paintTea();

  const inv = new THREE.Matrix4(), m3 = new THREE.Matrix3(), down = new THREE.Vector3();
  const lastPos = new THREE.Vector3(), lastVel = new THREE.Vector3(), curPos = new THREE.Vector3(), acc = new THREE.Vector3();
  const lastQ = new THREE.Quaternion(), curQ = new THREE.Quaternion();
  let started = false, energy = 0;
  function tick(dt) {
    dt = Math.min(Math.max(dt, 0), 1 / 20);
    if (!dt) return;
    shell.updateWorldMatrix(true, false);
    inv.copy(shell.matrixWorld).invert(); m3.setFromMatrix4(inv);
    curPos.setFromMatrixPosition(shell.matrixWorld);
    shell.getWorldQuaternion(curQ);
    let ang = 0, ax = 0, ay = 0, accL = 0;
    if (started) {
      ang = 2 * Math.acos(Math.min(1, Math.abs(curQ.dot(lastQ)))) / dt;
      const v = curPos.clone().sub(lastPos).divideScalar(dt);
      acc.copy(v).sub(lastVel).divideScalar(dt).clampLength(0, 60000);
      lastVel.copy(v);
      acc.applyMatrix3(m3); ax = acc.x; ay = acc.y; accL = Math.hypot(ax, ay);
    }
    lastPos.copy(curPos); lastQ.copy(curQ); started = true;
    // only real handling wakes the tea; the gentle float doesn't
    const target = Math.min(1, Math.max(0, (ang - 0.25) * 2.5) + Math.max(0, (accL - 500) / 1500));
    energy = target > energy ? target : energy * Math.pow(0.04, dt);
    if (energy < 0.02) return;
    down.set(0, -1, 0).applyMatrix3(m3);
    const len = Math.hypot(down.x, down.y) || 1, planar = Math.min(1, len / down.length());
    const gx = (down.x / len * G * planar - ax * 0.6) * energy, gy = (down.y / len * G * planar - ay * 0.6) * energy;
    const damp = 0.985 - (1 - energy) * 0.12;
    for (let k = 0; k < 3; k++) step(dt / 3, gx, gy, damp);
    paintTea();
  }

  const group = new THREE.Group();
  group.name = 'euka tea';
  shell.scale.set(1, -1, 1);
  group.add(shell);
  group.userData.tick = tick;
  return group;
}
