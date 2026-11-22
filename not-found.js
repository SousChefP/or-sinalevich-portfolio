// ==========================================
// עמוד 404: מילה אחת מכרום (OhNo, Hmm, Nada, Ope, Whoops) מרחפת על המסך.
// אפשר לתפוס, לגרור ולזרוק אותה, כמו את האובייקטים בהירו.
// כמו הלוגו של ה-DVD הישן: היא נוסעת בקו ישר ובמהירות קבועה, באלכסון, וכשהיא פוגעת בקצה המסך
// היא קופצת חזרה לכיוון הצד השני ומתחלפת למילה הבאה בתור. זריקה משגרת אותה לכיוון אחר,
// ומשם היא מאטה בחזרה למהירות הקבועה. המילה הראשונה אקראית, ומשם הסדר קבוע.
// ==========================================

import * as THREE from 'three';
import { createChromeWord } from './3d objects/404 page/chrome-404-objects/chrome-404-objects.js';

// --- המילים, לפי הסדר. הרוחב (בפיקסלים) הוא הרוחב שלהן בפריים בפיגמה ---
const WORDS = [
  { name: 'ohno', desktopWidth: 371, mobileWidth: 209 },
  { name: 'hmm', desktopWidth: 381, mobileWidth: 213 },
  { name: 'nada', desktopWidth: 381, mobileWidth: 214 },
  { name: 'ope', desktopWidth: 309, mobileWidth: 174 },
  { name: 'whoops', desktopWidth: 521, mobileWidth: 292 },
];

// הפריים בפיגמה: במחשב 1440×781, בטלפון 393×670. המילה גדלה וקטנה לפי המסך, כמו הטקסט
const FRAMES = {
  desktop: { width: 1440, height: 781 },
  mobile: { width: 393, height: 670 },
};
const MOBILE_QUERY = window.matchMedia('(max-width: 767px)');

// הזווית של המילה במנוחה (כמו האובייקט של REACH)
const TILT = [0.25, -0.4, 0.12];

// --- התנועה: הנסיעה של ה-DVD, והשאר אותם ערכים כמו בתצוגה המשחקית בהירו (hero.js) ---
const MOTION = {
  cruiseSpeed: 160,      // המהירות הקבועה של הנסיעה (פיקסלים בשנייה, בפריים של פיגמה)
  minAngle: 30,          // הנסיעה תמיד באלכסון: בין 30 ל-60 מעלות מהאופק
  maxAngle: 60,
  bounceVariety: 7,      // בכל פגיעה הזווית משתנה קצת (עד כמה מעלות), כדי שהמסלול לא יחזור על עצמו
  diagonalSteer: 0.8,    // אחרי זריקה שטוחה מדי: כמה מהר הכיוון חוזר לאלכסון
  swapTime: 0.5,         // כמה שניות לוקח המעבר למילה הבאה (סיבוב כמו מטבע)
  weight: 0.9,           // משקל: כבד = זז ומסתובב פחות ונרגע מהר יותר
  floatHeight: 11,       // כמה פיקסלים היא עולה ויורדת בריחוף
  floatTurn: 0.04,       // כמה היא מתנדנדת בזמן הריחוף
  floatSway: 0.26,       // כמה היא מסתובבת הלוך ושוב מצד לצד
  floatSpeed: 0.4,       // כמה ריחופים בשנייה, בערך
  mouseTilt: 0.08,       // כמה היא נוטה לכיוון העכבר
  mouseShift: 5,         // כמה פיקסלים היא זזה לכיוון העכבר
  mouseSmooth: 9,        // כמה מהר היא מגיבה לעכבר
  throwSlowdown: 2.1,    // כמה מהר זריקה מאטה בחזרה למהירות הקבועה
  impactSpin: 0.008,     // כמה פגיעה בקצה מסובבת אותה
  dragSpin: 0.01,        // כמה סיבוב יוצרת גרירה
  returnSpring: 3.5,     // כמה חזק היא נמשכת חזרה לזווית המנוחה
  liftWhenHeld: 150,     // כמה היא "מתקרבת" למסך כשמחזיקים אותה
};

const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- הבמה: ציור שקוף על כל המסך, מעל הטקסט. הלחיצות עוברות דרכו (pointer-events ב-styles.css) ---
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.domElement.classList.add('not-found-canvas');
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, 1, 10000);

// יחידה אחת בעולם התלת-ממדי = פיקסל אחד במסך
let screenWidth = 0;
let screenHeight = 0;
let frameScale = 1;  // כמה פיקסלים במסך שווה פיקסל אחד בפריים בפיגמה

function layout() {
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;
  const frame = MOBILE_QUERY.matches ? FRAMES.mobile : FRAMES.desktop;
  // במחשב, במסך גדול: גדל עד מסך ברוחב 1920 ולא יותר (כמו --not-found-scale ב-CSS ועמוד הבית)
  const maxScale = MOBILE_QUERY.matches ? Infinity : 1920 / 1440;
  frameScale = Math.min(screenWidth / frame.width, screenHeight / frame.height, maxScale);
  renderer.setSize(screenWidth, screenHeight);
  camera.aspect = screenWidth / screenHeight;
  camera.position.z = (screenHeight / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  camera.updateProjectionMatrix();
}
layout();
window.addEventListener('resize', layout);

// --- המילים: נבנות רק כשצריך אותן, ונשמרות לפעם הבאה ---
const EDGE_POINTS = 400;  // כמה נקודות מקו המתאר בודקים כדי לדעת איפה הקצוות של המילה

function samplePoints(object) {
  object.updateMatrixWorld(true);
  const points = [];
  object.traverse((part) => {
    if (!part.isMesh) return;
    const positions = part.geometry.attributes.position;
    const step = Math.max(1, Math.floor(positions.count / EDGE_POINTS));
    for (let i = 0; i < positions.count; i += step) {
      points.push(new THREE.Vector3().fromBufferAttribute(positions, i));
    }
  });
  return points;
}

const built = new Map();

function buildWord(index) {
  if (built.has(index)) return built.get(index);
  const object = createChromeWord(WORDS[index].name, { renderer });
  const points = samplePoints(object);  // לפני ההטיה: נקודות ביחס למילה עצמה
  object.rotation.set(...TILT);
  object.updateMatrixWorld(true);
  const baseWidth = new THREE.Box3().setFromObject(object, true).getSize(new THREE.Vector3()).x;
  const word = { object, points, baseWidth };
  built.set(index, word);
  return word;
}

// --- המצב של המילה (בפיקסלים של המסך) ---
const state = {
  index: Math.floor(Math.random() * WORDS.length),  // המילה הראשונה: אקראית
  word: null,
  position: new THREE.Vector2(),      // המרכז שלה במסך
  velocity: new THREE.Vector2(),      // המהירות והכיוון של הנסיעה (פיקסלים בשנייה)
  direction: new THREE.Vector2(),     // כיוון הנסיעה (באורך 1). נשמר גם כשמחזיקים אותה
  spin: new THREE.Vector2(),          // סיבוב נוסף על זווית המנוחה
  spinVelocity: new THREE.Vector2(),
  mouseTilt: new THREE.Vector2(),
  lift: 0,
  floatPhase: Math.random() * Math.PI * 2,
  touchingEdge: false,                // נוגעת עכשיו בקצה (מתחלפת רק בפגיעה חדשה)
  swap: null,                         // בזמן מעבר למילה הבאה: כמה מהמעבר עבר (0 עד 1), ולאיזה צד מסתובבים
  bounds: null,                       // הקצוות שלה במסך בפריים האחרון
};

function showWord(index) {
  if (state.word) scene.remove(state.word.object);
  state.index = index;
  state.word = buildWord(index);
  scene.add(state.word.object);
}

// מתחילה במקום אקראי, לא קרוב מדי לקצוות
state.position.set(
  screenWidth * (0.3 + Math.random() * 0.4),
  screenHeight * (0.3 + Math.random() * 0.4),
);
showWord(state.index);

// --- הכיוון: תמיד באלכסון ---
// הזווית של כיוון הנסיעה מהאופק (0 עד 90 מעלות), בלי קשר לאיזה צד היא נוסעת
const angleFromFloor = () => THREE.MathUtils.radToDeg(Math.atan2(Math.abs(state.direction.y), Math.abs(state.direction.x)));

// קובע זווית חדשה מהאופק, ושומר על הצד שאליו היא נוסעת (ימינה/שמאלה, למעלה/למטה)
function setAngleFromFloor(degrees) {
  const angle = THREE.MathUtils.degToRad(degrees);
  state.direction.set(
    Math.cos(angle) * (Math.sign(state.direction.x) || 1),
    Math.sin(angle) * (Math.sign(state.direction.y) || 1),
  );
}

// הכיוון הראשון: אלכסון אקראי לאחד מארבעת הצדדים, כמו הלוגו של ה-DVD
state.direction.set(Math.random() < 0.5 ? -1 : 1, Math.random() < 0.5 ? -1 : 1);
setAngleFromFloor(MOTION.minAngle + Math.random() * (MOTION.maxAngle - MOTION.minAngle));

// --- העכבר והאצבע ---
const mouse = new THREE.Vector2();   // איפה העכבר, מ-‎-1 עד 1
const raycaster = new THREE.Raycaster();
let held = null;                     // כשמחזיקים את המילה: איפה תפסו אותה, ואיפה היד הייתה

function wordAt(x, y) {
  const pointer = new THREE.Vector2((x / screenWidth) * 2 - 1, -(y / screenHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObject(state.word.object, true).length > 0;
}

window.addEventListener('pointermove', (event) => {
  mouse.set((event.clientX / screenWidth) * 2 - 1, (event.clientY / screenHeight) * 2 - 1);
  if (!held) {
    // העכבר מעל המילה: יד פתוחה
    if (event.pointerType === 'mouse') document.body.classList.toggle('is-over-word', wordAt(event.clientX, event.clientY));
    return;
  }

  // גרירה: המילה הולכת אחרי היד, ומסתובבת קצת לפי התנועה
  const dt = Math.max((event.timeStamp - held.time) / 1000, 0.001);
  const moveX = event.clientX - held.x;
  const moveY = event.clientY - held.y;
  state.position.set(event.clientX + held.offsetX, event.clientY + held.offsetY);
  state.velocity.lerp(new THREE.Vector2(moveX / dt, moveY / dt), 0.3);  // המהירות של היד, לזריקה
  state.spinVelocity.y += (moveX * MOTION.dragSpin) / MOTION.weight;
  state.spinVelocity.x += (moveY * MOTION.dragSpin) / MOTION.weight;
  held.x = event.clientX;
  held.y = event.clientY;
  held.time = event.timeStamp;
});

window.addEventListener('pointerdown', (event) => {
  if (!wordAt(event.clientX, event.clientY)) return;  // לא על המילה: לחיצה רגילה (למשל על הקישור)
  event.preventDefault();
  held = {
    offsetX: state.position.x - event.clientX,
    offsetY: state.position.y - event.clientY,
    x: event.clientX,
    y: event.clientY,
    time: event.timeStamp,
  };
  state.velocity.set(0, 0);
  document.body.classList.add('is-holding-word');
});

function release() {
  if (!held) return;
  held = null;
  // זריקה: הכיוון החדש הוא כיוון היד. שחרור בלי תנועה: ממשיכה בכיוון הקודם
  if (state.velocity.length() > 20) state.direction.copy(state.velocity).normalize();
  document.body.classList.remove('is-holding-word');
}
window.addEventListener('pointerup', release);
window.addEventListener('pointercancel', release);

// --- הקצוות של המסך: המילה קופצת חזרה, ובפגיעה חדשה מתחלפת למילה הבאה ---
const screenPoint = new THREE.Vector3();

function measureBounds() {
  const { object, points } = state.word;
  object.updateMatrixWorld(true);
  let left = Infinity;
  let right = -Infinity;
  let top = Infinity;
  let bottom = -Infinity;
  for (const point of points) {
    screenPoint.copy(point).applyMatrix4(object.matrixWorld).project(camera);
    const x = (screenPoint.x + 1) / 2 * screenWidth;
    const y = (1 - screenPoint.y) / 2 * screenHeight;
    left = Math.min(left, x);
    right = Math.max(right, x);
    top = Math.min(top, y);
    bottom = Math.max(bottom, y);
  }
  state.bounds = { left, right, top, bottom };
}

function bounceOffEdges(dt) {
  const { left, right, top, bottom } = state.bounds;
  const touch = 1;  // פיקסל אחד של סובלנות: מילה שצמודה לקצה עדיין "נוגעת" בו

  let pushX = 0;
  if (left < 0) pushX = -left;
  else if (right > screenWidth) pushX = screenWidth - right;
  let pushY = 0;
  if (top < 0) pushY = -top;
  else if (bottom > screenHeight) pushY = screenHeight - bottom;

  const touching = left <= touch || right >= screenWidth - touch || top <= touch || bottom >= screenHeight - touch;

  // מחזירים פנימה. אחרי שהמילה התחלפה למילה רחבה יותר, היא מחליקה פנימה בעדינות ולא קופצת
  const softness = state.swap && state.swap.done ? 1 - Math.exp(-14 * dt) : 1;
  state.position.x += pushX * softness;
  state.position.y += pushY * softness;

  // קופצת חזרה כמו ה-DVD: הכיוון מתהפך לכיוון פנים המסך, והפגיעה מסובבת אותה קצת.
  // הזווית משתנה טיפה בכל פגיעה (ונשארת באלכסון), כדי שהמסלול יהיה כל פעם אחר
  let bounced = false;
  if (pushX !== 0 && Math.sign(state.direction.x) === -Math.sign(pushX)) {
    state.spinVelocity.y += state.velocity.x * MOTION.impactSpin / MOTION.weight;
    state.direction.x *= -1;
    state.velocity.x *= -1;
    bounced = true;
  }
  if (pushY !== 0 && Math.sign(state.direction.y) === -Math.sign(pushY)) {
    state.spinVelocity.x += state.velocity.y * MOTION.impactSpin / MOTION.weight;
    state.direction.y *= -1;
    state.velocity.y *= -1;
    bounced = true;
  }
  if (bounced && !held) {
    const variety = (Math.random() * 2 - 1) * MOTION.bounceVariety;
    setAngleFromFloor(THREE.MathUtils.clamp(angleFromFloor() + variety, MOTION.minAngle, MOTION.maxAngle));
  }

  // פגיעה חדשה בקצה (לא כשהיא כבר צמודה אליו, ולא באמצע מעבר): מתחיל המעבר למילה הבאה
  if (touching && !state.touchingEdge && !state.swap) {
    state.swap = { progress: 0, turn: Math.sign(state.direction.x) || 1, done: false };
  }
  state.touchingEdge = touching;
}

// --- המעבר למילה הבאה: המילה מסתובבת כמו מטבע. כשהיא בדיוק על הצד (כמעט בלתי נראית)
// היא מתחלפת, והמילה החדשה ממשיכה להסתובב עד שהיא פונה קדימה ---
const flip = new THREE.Quaternion();
const upAxis = new THREE.Vector3(0, 1, 0);
const easeInOut = (t) => t * t * (3 - 2 * t);

// מחזירה את זווית הסיבוב (ברדיאנים) ואת הגודל הזמני של המילה בנקודה הזאת במעבר
function advanceSwap(dt) {
  const swap = state.swap;
  if (!swap) return { angle: 0, size: 1 };
  swap.progress = Math.min(swap.progress + dt / MOTION.swapTime, 1);

  // באמצע המעבר: מחליפים מילה
  if (swap.progress >= 0.5 && !swap.done) {
    showWord((state.index + 1) % WORDS.length);
    swap.done = true;
  }

  const p = swap.progress;
  const quarter = Math.PI / 2;
  const angle = p < 0.5
    ? easeInOut(p / 0.5) * quarter * swap.turn              // הישנה מסתובבת עד הצד
    : -(1 - easeInOut((p - 0.5) / 0.5)) * quarter * swap.turn;  // החדשה ממשיכה מהצד השני עד קדימה
  const size = 1 - 0.12 * Math.sin(Math.PI * p);  // קטנה קצת באמצע, כמו קפיצה

  if (p >= 1) state.swap = null;
  return { angle, size };
}

// הסיבוב נמשך חזרה לזווית המנוחה, כמו קפיץ (ואחרי סיבוב שלם משלים לסיבוב הקרוב)
function springBack(axis, dt) {
  const fullTurn = Math.PI * 2;
  const rest = Math.round(state.spin[axis] / fullTurn) * fullTurn;
  const stiffness = MOTION.returnSpring;
  const friction = 1.2 * Math.sqrt(stiffness) * MOTION.weight;
  state.spinVelocity[axis] += (-(state.spin[axis] - rest) * stiffness - state.spinVelocity[axis] * friction) * dt;
  state.spin[axis] += state.spinVelocity[axis] * dt;
}

// --- כל פריים ---
const clock = new THREE.Clock();

function update() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;

  // 1. ריחוף ועכבר (לא כשמבקשים פחות תנועה)
  let wave = 0;
  let sway = 0;
  if (!REDUCE_MOTION) {
    wave = Math.sin(time * MOTION.floatSpeed * Math.PI + state.floatPhase);
    sway = Math.sin(time * 0.37 + state.floatPhase * 2);
    state.mouseTilt.lerp(mouse.clone().multiplyScalar(1 / MOTION.weight), 1 - Math.exp(-MOTION.mouseSmooth * dt));
  }

  // 2. תנועה: נוסעת בקו ישר בכיוון שלה. אחרי זריקה המהירות יורדת בהדרגה למהירות הקבועה,
  // אבל לא נעצרת אף פעם (כשמבקשים פחות תנועה: רק הזריקה, בלי נסיעה)
  if (!held) {
    const cruise = REDUCE_MOTION ? 0 : MOTION.cruiseSpeed * frameScale;
    const speed = cruise + (state.velocity.length() - cruise) * Math.exp(-MOTION.throwSlowdown * dt);
    // אחרי זריקה שטוחה או תלולה מדי, הכיוון חוזר לאט לאלכסון
    const angle = angleFromFloor();
    if (angle < MOTION.minAngle || angle > MOTION.maxAngle) {
      const target = THREE.MathUtils.clamp(angle, MOTION.minAngle, MOTION.maxAngle);
      setAngleFromFloor(angle + (target - angle) * (1 - Math.exp(-MOTION.diagonalSteer * dt)));
    }
    state.velocity.copy(state.direction).multiplyScalar(Math.max(speed, 0));
    state.position.addScaledVector(state.velocity, dt);
  }

  // 3. סיבוב: חוזר לזווית המנוחה. 4. כשמחזיקים אותה היא מתקרבת קצת למסך
  springBack('x', dt);
  springBack('y', dt);
  state.lift += ((held ? MOTION.liftWhenHeld : 0) - state.lift) * (1 - Math.exp(-10 * dt));

  // המעבר למילה הבאה (אם יש עכשיו). המילה עלולה להתחלף כאן, אז לוקחים אותה רק אחרי זה
  const swapPose = advanceSwap(dt);
  const { object, baseWidth } = state.word;

  // מחברים הכול: המקום, הזווית והגודל (הרוחב מהפיגמה, לפי גודל המסך)
  const width = (MOBILE_QUERY.matches ? WORDS[state.index].mobileWidth : WORDS[state.index].desktopWidth) * frameScale;
  object.scale.setScalar(width / baseWidth);
  object.position.set(
    state.position.x + state.mouseTilt.x * MOTION.mouseShift - screenWidth / 2,
    screenHeight / 2 - (state.position.y + wave * MOTION.floatHeight * frameScale + state.mouseTilt.y * MOTION.mouseShift),
    state.lift * frameScale,
  );
  object.rotation.set(
    TILT[0] + state.spin.x + state.mouseTilt.y * MOTION.mouseTilt,
    TILT[1] + state.spin.y + state.mouseTilt.x * MOTION.mouseTilt + sway * MOTION.floatSway,
    TILT[2] + wave * MOTION.floatTurn,
  );

  // 5. הקצוות של המסך: נמדדים בלי הסיבוב של המעבר, כדי שהמילה לא "תקפוץ" באמצע שלו
  measureBounds();
  bounceOffEdges(dt);

  // 6. הסיבוב והגודל של המעבר, רק לציור
  object.quaternion.premultiply(flip.setFromAxisAngle(upAxis, swapPose.angle));
  object.scale.multiplyScalar(swapPose.size);

  renderer.render(scene, camera);
  requestAnimationFrame(update);
}

update();
