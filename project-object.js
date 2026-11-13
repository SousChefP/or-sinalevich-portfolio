// ==========================================
// האובייקטים התלת-ממדיים בעמוד פרויקט: אחד לכל קישור .project-object.
// כל אחד מרחף בשקט במקום, נוטה קצת לכיוון העכבר ומתקרב כשהעכבר עליו.
// אפשר לסובב אותו בגרירה (הוא לא זז ממקומו), ולחיצה קצרה פותחת את הקישור שלו:
// האובייקט של הפרויקט מחזיר להירו, לתצוגה שממנה הגיעו (hero.js שומר אותה),
// ואובייקטים של פרויקטים אחרים (בפוטר) פותחים את העמוד שלהם.
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

// --- הבמה: renderer, מצלמה ותאורה (כמו בהירו) ---
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });  // alpha: רקע שקוף
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// הציור מכסה את כל המסך (שקוף, ולא תופס לחיצות), כדי שהאובייקטים אף פעם לא ייחתכו.
// המקום והגודל של כל אובייקט נלקחים מהקישור שלו (project-object), שבו גם תופסים את הלחיצות
renderer.domElement.classList.add('project-object-canvas');
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
keyLight.position.set(-300, 500, 600);
scene.add(keyLight);

const camera = new THREE.PerspectiveCamera(30, 1, 1, 10000);

// הציור והמצלמה לפי גודל המסך: יחידה אחת בעולם התלת-ממדי = פיקסל אחד במסך
function layout() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.position.z = (window.innerHeight / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', layout);

// --- העכבר (משותף לכל האובייקטים) ---
const mouse = new THREE.Vector2();       // איפה העכבר, מ-‎-1 עד 1
const mouseTilt = new THREE.Vector2();   // ההטיה הנוכחית (נרגעת לאט לכיוון העכבר)

window.addEventListener('pointermove', (event) => {
  mouse.set((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
});

// --- חזרה להירו: לתצוגה שממנה הגיעו (המשחקית, Classic View או About) ---
// קישורים עם data-back-to-hero (האובייקט של הפרויקט ו-[Go Back]) מחזירים לשם
let heroView = 'playful';
try {
  heroView = sessionStorage.getItem('heroView') || 'playful';
} catch {
  // בלי שמירה: חוזרים לתצוגה המשחקית
}
if (heroView !== 'playful') {
  for (const backLink of document.querySelectorAll('[data-back-to-hero]')) {
    backLink.href = `${backLink.getAttribute('href')}#${heroView}`;
  }
}

// --- אובייקט לכל קישור .project-object בעמוד ---
// (למשל בעמוד REACH: האובייקט בהדר, ושלושת הפרויקטים האחרים בפוטר.
// קישור מוסתר, כמו העמוד של הטלפון כשמסתכלים במחשב, לא מצויר)
function createProjectObject(link) {
  const item = OBJECTS[link.dataset.object];
  const object = item.create();
  object.rotation.set(...item.tilt);
  scene.add(object);

  // הגודל שלו בזווית המנוחה, לפני הקטנה (נמדד פעם אחת)
  object.updateMatrixWorld(true);
  const baseSize = new THREE.Box3().setFromObject(object, true).getSize(new THREE.Vector3());

  const state = {
    link,
    item,
    object,
    baseSize,
    spin: new THREE.Vector2(),          // סיבוב נוסף על זווית המנוחה (x, y)
    spinVelocity: new THREE.Vector2(),  // מהירות הסיבוב
    press: null,                        // איפה התחילה הלחיצה, ואיפה העכבר / האצבע עכשיו
    hovered: false,
    lift: 0,
    floatPhase: Math.random() * Math.PI * 2,  // כל אובייקט מרחף בקצב קצת אחר
  };

  link.addEventListener('dragstart', (event) => event.preventDefault());  // בלי "לגרור את הקישור"

  // --- סיבוב בגרירה ---
  link.addEventListener('pointerdown', (event) => {
    state.press = { startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, moved: false };
    link.setPointerCapture(event.pointerId);
  });

  link.addEventListener('pointermove', (event) => {
    const press = state.press;
    if (!press) return;
    state.spinVelocity.y += (event.clientX - press.x) * IDLE.dragSpin;
    state.spinVelocity.x += (event.clientY - press.y) * IDLE.dragSpin;
    press.x = event.clientX;
    press.y = event.clientY;
    if (Math.hypot(event.clientX - press.startX, event.clientY - press.startY) > IDLE.tapMaxMove) press.moved = true;
  });

  const endPress = () => { setTimeout(() => { state.press = null; }); };  // אחרי ה-click, כדי שיֵדע אם גררו
  link.addEventListener('pointerup', endPress);
  link.addEventListener('pointercancel', endPress);

  // גרירה היא משחק, לא לחיצה: הקישור לא נפתח
  link.addEventListener('click', (event) => {
    if (state.press && state.press.moved) event.preventDefault();
  });

  link.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') state.hovered = true; });
  link.addEventListener('pointerleave', () => { state.hovered = false; });

  return state;
}

const objects = [...document.querySelectorAll('.project-object')].map(createProjectObject);

// הסיבוב נמשך חזרה לזווית המנוחה, כמו קפיץ (ואחרי סיבוב שלם משלים לסיבוב הקרוב)
function springBack(state, axis, dt) {
  const fullTurn = Math.PI * 2;
  const rest = Math.round(state.spin[axis] / fullTurn) * fullTurn;
  const stiffness = IDLE.returnSpring;
  const friction = 1.2 * Math.sqrt(stiffness);
  state.spinVelocity[axis] += (-(state.spin[axis] - rest) * stiffness - state.spinVelocity[axis] * friction) * dt;
  state.spin[axis] += state.spinVelocity[axis] * dt;
}

// --- כל פריים ---
const clock = new THREE.Clock();

function update() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;
  mouseTilt.lerp(mouse, 1 - Math.exp(-4 * dt));

  for (const state of objects) {
    const { link, item, object, baseSize } = state;

    // המקום והגודל: המלבן של הקישור על המסך (גם כשגוללים). מוסתר או רחוק מהמסך: לא מציירים
    const box = link.getBoundingClientRect();
    object.visible = box.width > 0 && box.bottom > -box.height && box.top < window.innerHeight + box.height;
    if (!object.visible) continue;

    const wave = REDUCE_MOTION ? 0 : Math.sin(time * IDLE.floatSpeed * Math.PI + state.floatPhase);
    const sway = REDUCE_MOTION ? 0 : Math.sin(time * 0.37 + state.floatPhase * 2);
    state.lift += ((state.hovered || state.press ? IDLE.hoverLift : 0) - state.lift) * (1 - Math.exp(-8 * dt));
    springBack(state, 'x', dt);
    springBack(state, 'y', dt);

    const size = Math.min(box.width / baseSize.x, box.height / baseSize.y);
    object.position.set(
      box.left + box.width / 2 - window.innerWidth / 2,
      window.innerHeight / 2 - (box.top + box.height / 2) + wave * IDLE.floatHeight,
      state.lift,
    );
    object.rotation.set(
      item.tilt[0] + state.spin.x + mouseTilt.y * IDLE.mouseTilt,
      item.tilt[1] + state.spin.y + mouseTilt.x * IDLE.mouseTilt + sway * IDLE.floatSway,
      item.tilt[2] + wave * IDLE.floatTurn,
    );
    object.scale.setScalar(size);

    // ה-euka tea צריך לדעת כמה זמן עבר, כדי להזיז את התה שבתוכו
    if (object.userData.tick) object.userData.tick(dt);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(update);
}

layout();
update();
