// ==========================================
// האובייקט התלת-ממדי בעמוד פרויקט.
// מרחף בשקט במקום, נוטה קצת לכיוון העכבר ומתקרב כשהעכבר עליו.
// אפשר לסובב אותו בגרירה (הוא לא זז ממקומו), ולחיצה קצרה מחזירה להירו,
// לתצוגה שממנה הגיעו (hero.js שומר אותה כשפותחים פרויקט).
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
  dragSpin: 0.15,        // כמה גרירה מסובבת אותו
  returnSpring: 3.5,     // כמה חזק הוא חוזר לזווית המנוחה אחרי סיבוב
  tapMaxMove: 6,         // תזוזה מקסימלית (בפיקסלים) שעדיין נחשבת לחיצה ולא גרירה
};

const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const link = document.querySelector('.project-object');
const item = OBJECTS[link.dataset.object];

// --- הבמה: renderer, מצלמה ותאורה (כמו בהירו) ---
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });  // alpha: רקע שקוף
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// הציור מכסה את כל המסך (שקוף, ולא תופס לחיצות), כדי שהאובייקט אף פעם לא ייחתך.
// המקום והגודל של האובייקט נלקחים מהקישור (project-object), שבו גם תופסים את הלחיצות
renderer.domElement.classList.add('project-object-canvas');
document.body.appendChild(renderer.domElement);

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

// הציור והמצלמה לפי גודל המסך: יחידה אחת בעולם התלת-ממדי = פיקסל אחד במסך
function layout() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.position.z = (window.innerHeight / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', layout);

// --- העכבר ---
const mouse = new THREE.Vector2();       // איפה העכבר, מ-‎-1 עד 1
const mouseTilt = new THREE.Vector2();   // ההטיה הנוכחית (נרגעת לאט לכיוון העכבר)
let hovered = false;
let lift = 0;

// --- חזרה להירו: לתצוגה שממנה הגיעו (המשחקית, Classic View או About) ---
let heroView = 'playful';
try {
  heroView = sessionStorage.getItem('heroView') || 'playful';
} catch {
  // בלי שמירה: חוזרים לתצוגה המשחקית
}
if (heroView !== 'playful') link.href = `${link.getAttribute('href')}#${heroView}`;

// --- סיבוב בגרירה ---
const spin = new THREE.Vector2();          // סיבוב נוסף על זווית המנוחה (x, y)
const spinVelocity = new THREE.Vector2();  // מהירות הסיבוב
let press = null;                          // איפה התחילה הלחיצה, ואיפה האצבע / העכבר עכשיו

link.addEventListener('dragstart', (event) => event.preventDefault());  // בלי "לגרור את הקישור"

link.addEventListener('pointerdown', (event) => {
  press = { startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, moved: false };
  link.setPointerCapture(event.pointerId);
});

window.addEventListener('pointermove', (event) => {
  mouse.set((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
  if (!press) return;
  spinVelocity.y += (event.clientX - press.x) * IDLE.dragSpin;
  spinVelocity.x += (event.clientY - press.y) * IDLE.dragSpin;
  press.x = event.clientX;
  press.y = event.clientY;
  if (Math.hypot(event.clientX - press.startX, event.clientY - press.startY) > IDLE.tapMaxMove) press.moved = true;
});

const endPress = () => { setTimeout(() => { press = null; }); };  // אחרי ה-click, כדי שיֵדע אם גררו
link.addEventListener('pointerup', endPress);
link.addEventListener('pointercancel', endPress);

// גרירה היא משחק, לא לחיצה: הקישור לא נפתח
link.addEventListener('click', (event) => {
  if (press && press.moved) event.preventDefault();
});

link.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') hovered = true; });
link.addEventListener('pointerleave', () => { hovered = false; });

// הסיבוב נמשך חזרה לזווית המנוחה, כמו קפיץ (ואחרי סיבוב שלם משלים לסיבוב הקרוב)
function springBack(axis, dt) {
  const fullTurn = Math.PI * 2;
  const rest = Math.round(spin[axis] / fullTurn) * fullTurn;
  const stiffness = IDLE.returnSpring;
  const friction = 1.2 * Math.sqrt(stiffness);
  spinVelocity[axis] += (-(spin[axis] - rest) * stiffness - spinVelocity[axis] * friction) * dt;
  spin[axis] += spinVelocity[axis] * dt;
}

// --- כל פריים ---
const clock = new THREE.Clock();
const floatPhase = Math.random() * Math.PI * 2;

function update() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;

  const wave = REDUCE_MOTION ? 0 : Math.sin(time * IDLE.floatSpeed * Math.PI + floatPhase);
  const sway = REDUCE_MOTION ? 0 : Math.sin(time * 0.37 + floatPhase * 2);
  mouseTilt.lerp(mouse, 1 - Math.exp(-4 * dt));
  lift += ((hovered || press ? IDLE.hoverLift : 0) - lift) * (1 - Math.exp(-8 * dt));
  springBack('x', dt);
  springBack('y', dt);

  // המקום והגודל: מרכז הקישור על המסך (גם כשגוללים), והאובייקט ממלא את המלבן שלו
  const box = link.getBoundingClientRect();
  const size = Math.min(box.width / baseSize.x, box.height / baseSize.y);
  object.position.set(
    box.left + box.width / 2 - window.innerWidth / 2,
    window.innerHeight / 2 - (box.top + box.height / 2) + wave * IDLE.floatHeight,
    lift,
  );
  object.rotation.set(
    item.tilt[0] + spin.x + mouseTilt.y * IDLE.mouseTilt,
    item.tilt[1] + spin.y + mouseTilt.x * IDLE.mouseTilt + sway * IDLE.floatSway,
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
