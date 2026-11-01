// ==========================================
// האובייקט התלת-ממדי בעמוד פרויקט.
// מרחף בשקט במקום, נוטה קצת לכיוון העכבר ומתקרב כשהעכבר עליו.
// הוא בתוך קישור (project-object ב-HTML), אז לחיצה עליו מחזירה להירו.
// איזה אובייקט: לפי data-object בקישור (reach, talk-about-it, small-spaces, euka-tea)
// ==========================================

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { createReach } from './3d objects/reach-object/reach-object.js';
import { createTalkAboutIt } from './3d objects/talk-about-it-object/talk-about-it-object.js';
import { createSmallSpaces } from './3d objects/small-spaces-object/small-spaces-object.js';
import { createEukaTea } from './3d objects/euka-tea-object/euka-tea-object.js';

// כל אובייקט וזווית המנוחה שלו (אותה זווית כמו ב-hero.js)
const OBJECTS = {
  'reach': { create: createReach, tilt: [0.25, -0.4, 0.12] },
  'talk-about-it': { create: createTalkAboutIt, tilt: [-0.22, 0.45, -0.14] },
  'small-spaces': { create: createSmallSpaces, tilt: [-0.35, -0.2, 0.06] },
  'euka-tea': { create: createEukaTea, tilt: [0.12, 0.6, -0.22] },
};

// --- התנועה: כמו ב-Classic View של ההירו ---
const IDLE = {
  floatHeight: 5,        // כמה פיקסלים האובייקט עולה ויורד
  floatSpeed: 0.4,       // כמה ריחופים בשנייה, בערך
  floatTurn: 0.03,       // כמה הוא מתנדנד
  floatSway: 0.08,       // כמה הוא מסתובב הלוך ושוב
  mouseTilt: 0.12,       // כמה הוא נוטה לכיוון העכבר
  hoverLift: 25,         // כמה הוא "מתקרב" למסך כשהעכבר עליו
};

// הציור גדול מהמלבן של האובייקט, כדי שהאובייקט לא ייחתך כשהוא מרחף ונוטה
const CANVAS_GROW = 1.6;

const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const link = document.querySelector('.project-object');
const item = OBJECTS[link.dataset.object];

// --- הבמה: renderer, מצלמה ותאורה (כמו בהירו) ---
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });  // alpha: רקע שקוף
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
link.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
keyLight.position.set(-300, 500, 600);
scene.add(keyLight);

const camera = new THREE.PerspectiveCamera(30, 1, 1, 10000);

// --- האובייקט ---
const object = item.create();
object.rotation.set(...item.tilt);
scene.add(object);

// הגודל שלו בזווית המנוחה, לפני הקטנה (נמדד פעם אחת)
object.updateMatrixWorld(true);
const baseSize = new THREE.Box3().setFromObject(object, true).getSize(new THREE.Vector3());
let size = 1;

// הציור והמצלמה לפי גודל המלבן: יחידה אחת בעולם התלת-ממדי = פיקסל אחד במסך
function layout() {
  const width = link.clientWidth;
  const height = link.clientHeight;
  renderer.setSize(width * CANVAS_GROW, height * CANVAS_GROW);
  camera.aspect = width / height;
  camera.position.z = (height * CANVAS_GROW / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  camera.updateProjectionMatrix();
  size = Math.min(width / baseSize.x, height / baseSize.y);  // ממלא את המלבן בלי לחרוג ממנו
}
new ResizeObserver(layout).observe(link);

// --- העכבר ---
const mouse = new THREE.Vector2();       // איפה העכבר, מ-‎-1 עד 1
const mouseTilt = new THREE.Vector2();   // ההטיה הנוכחית (נרגעת לאט לכיוון העכבר)
let hovered = false;
let lift = 0;

window.addEventListener('pointermove', (event) => {
  mouse.set((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
});
link.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') hovered = true; });
link.addEventListener('pointerleave', () => { hovered = false; });

// --- כל פריים ---
const clock = new THREE.Clock();
const floatPhase = Math.random() * Math.PI * 2;

function update() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;

  const wave = REDUCE_MOTION ? 0 : Math.sin(time * IDLE.floatSpeed * Math.PI + floatPhase);
  const sway = REDUCE_MOTION ? 0 : Math.sin(time * 0.37 + floatPhase * 2);
  mouseTilt.lerp(mouse, 1 - Math.exp(-4 * dt));
  lift += ((hovered ? IDLE.hoverLift : 0) - lift) * (1 - Math.exp(-8 * dt));

  object.position.set(0, wave * IDLE.floatHeight, lift);
  object.rotation.set(
    item.tilt[0] + mouseTilt.y * IDLE.mouseTilt,
    item.tilt[1] + mouseTilt.x * IDLE.mouseTilt + sway * IDLE.floatSway,
    item.tilt[2] + wave * IDLE.floatTurn,
  );
  object.scale.setScalar(size);

  // ה-euka tea צריך לדעת כמה זמן עבר, כדי להזיז את התה שבתוכו
  if (object.userData.tick) object.userData.tick(dt);

  renderer.render(scene, camera);
  requestAnimationFrame(update);
}

layout();
update();
