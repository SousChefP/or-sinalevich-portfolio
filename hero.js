// ==========================================
// ההירו: ארבעת האובייקטים התלת-ממדיים
// כל אובייקט מתחיל במקום ובזווית שלו מהפיגמה, ומשם:
// - מרחף ונודד בחלל כל הזמן, ולא יוצא מהמסך
// - נתקע באובייקטים האחרים ודוחף אותם, ולא עובר דרכם
// - נוטה וזז קצת לכיוון העכבר
// - אפשר לתפוס, לגרור ולזרוק אותו
// - נגיעה או לחיצה מסובבת אותו, ואחרי סיבוב הוא חוזר לזווית המנוחה
// ב-Classic View האובייקטים מסתדרים בשורה ומרחפים קלות במקום. אי אפשר להזיז אותם,
// אבל הם עדיין מגיבים: מתקרבים כשהעכבר עליהם, ומסתובבים בנגיעה או בגרירה.
// ב-About me האובייקטים עוברים לפינות ומתנהגים כמו ב-Classic View.
// בטלפון הם נעים בתחתית כמו על מסוע: יוצאים מצד אחד של המסך וחוזרים מהצד השני.
// במעבר בין התצוגות כל אובייקט עף בתנועה רכה למקום החדש שלו.
// ==========================================

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { createTalkAboutIt } from './3d objects/talk-about-it-object/talk-about-it-object.js';
import { createReach } from './3d objects/reach-object/reach-object.js';
import { createSmallSpaces } from './3d objects/small-spaces-object/small-spaces-object.js';
import { createEukaTea } from './3d objects/euka-tea-object/euka-tea-object.js';

// --- המיקומים מהפיגמה ---
// box: המלבן של התמונה בפריים (x, y, רוחב, גובה בפיקסלים).
// האובייקט מוקטן או מוגדל כך שימלא את המלבן הזה, ואז מוגדל עוד לפי objectSize.
// ב-Classic View בטלפון הפריים ארוך (393×2028), וגוללים בו. לכן שם המיקום נמדד מלמעלה.
const FRAMES = {
  desktop: { width: 1440, height: 823, objectSize: 1.25, calmSize: 1 },  // objectSize: פי כמה גדול מהפיגמה
  mobile: { width: 393, height: 670, objectSize: 1.25, calmSize: 1 },    // calmSize: ב-Classic View וב-About
};

// הסדר כאן הוא הסדר בשורה של Classic View (משמאל לימין / מלמעלה למטה)
const OBJECTS = [
  {
    name: 'REACH',
    create: createReach,
    tilt: [0.25, -0.4, 0.12],    // נראה קצת מלמעלה ומימין, עולה ימינה
    label: 'Product, UX.UI Design, Branding',  // הטקסט שמופיע בהובר / בלחיצה ממושכת
    desktop: [899, 134, 358, 180],
    mobile: [213, 83, 151, 76],
    classicDesktop: [28, 398, 294, 148],
    classicMobile: [65, 498, 261, 131],
    aboutDesktop: [1180, 132, 231, 117],
    aboutMobile: [330, 570, 111, 56],
    conveyorSlot: 3,        // המקום בתור על המסוע (About בטלפון)
  },
  {
    name: 'talk about it',
    create: createTalkAboutIt,
    tilt: [-0.22, 0.45, -0.14],  // זווית המנוחה (x, y, z). לכל אובייקט זווית אחרת
    label: null,                 // עוד אין טקסט
    desktop: [132, 61, 369, 231],
    mobile: [28, 122, 156, 97],
    classicDesktop: [366, 378, 303, 189],
    classicMobile: [61, 837, 269, 169],
    aboutDesktop: [118, 568, 284, 178],
    aboutMobile: [-50, 549, 114, 71],  // חלק מהאובייקט מחוץ למסך, כמו בפיגמה
    conveyorSlot: 0,        // המקום בתור על המסוע (About בטלפון)
  },
  {
    name: 'small spaces',
    create: createSmallSpaces,
    tilt: [-0.35, -0.2, 0.06],   // נראה מלמטה, פונה קצת שמאלה
    label: null,                 // עוד אין טקסט
    desktop: [177, 477, 436, 233],
    mobile: [209, 416, 184, 98],
    classicDesktop: [712, 374, 359, 191],
    classicMobile: [43, 1227, 306, 163],
    aboutDesktop: [29, 128, 281, 150],
    aboutMobile: [179, 553, 136, 73],
    conveyorSlot: 2,        // המקום בתור על המסוע (About בטלפון)
  },
  {
    name: 'euka tea',
    create: createEukaTea,
    tilt: [0.12, 0.6, -0.22],    // מסובב הרבה ימינה ונוטה למטה
    label: null,                 // עוד אין טקסט
    desktop: [889, 477, 311, 246],
    mobile: [35, 520, 131, 104],
    classicDesktop: [1121, 370, 255, 202],
    classicMobile: [76, 1616, 239, 189],
    aboutDesktop: [1175, 551, 200, 159],
    aboutMobile: [69, 553, 96, 77],
    conveyorSlot: 1,        // המקום בתור על המסוע (About בטלפון)
  },
];

// --- ההתנהגות: כל המספרים שאפשר לכוונן ---
const MOTION = {
  weight: 1,             // משקל, זהה לכל האובייקטים: כבד = זז ומסתובב פחות ונרגע מהר יותר
  driftSpeed: 18,        // כמה פיקסלים בשנייה האובייקט נודד בחלל כל הזמן
  driftWander: 0.6,      // כמה מהר כיוון הנדידה משתנה
  floatHeight: 10,       // כמה פיקסלים האובייקט עולה ויורד בריחוף
  floatTurn: 0.06,       // כמה הוא מתנדנד בזמן הריחוף (ברדיאנים)
  floatSway: 0.12,       // כמה הוא מסתובב הלוך ושוב מצד לצד (ברדיאנים)
  floatSpeed: 0.5,       // כמה ריחופים בשנייה, בערך
  mouseTilt: 0.2,        // כמה הוא נוטה לכיוון העכבר (ברדיאנים)
  mouseShift: 12,        // כמה פיקסלים הוא זז לכיוון העכבר
  mouseSmooth: 4,        // כמה מהר הוא מגיב לעכבר (גבוה = מהר)
  throwSlowdown: 1.2,    // כמה מהר זריקה נעצרת (גבוה = נעצר מהר)
  bounce: 0.35,          // כמה אובייקטים קופצים זה מזה בהתנגשות (0 = נעצרים, 1 = קופצים חזק)
  impactSpin: 0.01,      // כמה התנגשות מסובבת אותם
  dragSpin: 0.08,        // כמה סיבוב יוצרת גרירה
  tapSpin: 10,           // כמה חזק נגיעה מסובבת
  returnSpring: 9,       // כמה חזק האובייקט נמשך חזרה לזווית המנוחה
  liftWhenHeld: 40,      // כמה האובייקט "מתקרב" למסך כשמחזיקים אותו
  tapMaxMove: 6,         // תזוזה מקסימלית (בפיקסלים) שעדיין נחשבת נגיעה ולא גרירה
  tapMaxTime: 300,       // זמן מקסימלי (במילישניות) שעדיין נחשב נגיעה
  longPressTime: 450,    // כמה זמן (במילישניות) מחזיקים אצבע כדי שהטקסט יופיע בטלפון
  labelStayTime: 1500,   // כמה זמן הטקסט נשאר אחרי שמרימים את האצבע
};

// --- Classic View: ריחוף שקט במקום ---
const IDLE = {
  floatHeight: 5,        // כמה פיקסלים האובייקט עולה ויורד
  floatTurn: 0.03,       // כמה הוא מתנדנד
  floatSway: 0.08,       // כמה הוא מסתובב הלוך ושוב
  mouseTilt: 0.12,       // כמה הוא נוטה לכיוון העכבר
  hoverLift: 25,         // כמה הוא "מתקרב" למסך כשהעכבר עליו
  dragSpin: 0.15,        // כמה גרירה מסובבת אותו במקום
  maxSpread: 1.3,        // במסך רחב השורה נפתחת לרוחב, עד פי כמה מהמרווחים בפיגמה
};

// --- About בטלפון: המסוע ---
const CONVEYOR = {
  grow: 1.6,             // פי כמה גדולים מהפיגמה
  spacing: 210,          // המרחק בין אובייקט לאובייקט על המסוע (בפיקסלים של הפריים)
  speed: 30,             // כמה פיקסלים בשנייה המסוע זז שמאלה
  y: 590,                // גובה המסוע בפריים (המרכז של האובייקטים)
};
let conveyorDistance = 0;  // כמה המסוע זז מאז שנכנסו ל-About

// --- המעבר בין התצוגות ---
const VIEW_CHANGE = {
  duration: 1.1,         // כמה שניות כל אובייקט בדרך (כמו --hero-view-time ב-styles.css)
  stagger: 0.08,         // כל אובייקט יוצא קצת אחרי הקודם
  arc: 60,               // כמה פיקסלים האובייקט מתקרב למסך באמצע הדרך, כמו קשת
};

// מי שביקש פחות תנועה בהגדרות המכשיר: בלי ריחוף ובלי תגובה לעכבר (גרירה עדיין עובדת)
const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// באיזה רוחב מסך עוברים לעיצוב של הטלפון (כמו ב-styles.css)
const MOBILE_QUERY = window.matchMedia('(max-width: 767px)');

// --- הבמה: renderer, מצלמה ותאורה ---
const hero = document.querySelector('.hero');
const container = document.getElementById('hero-objects');

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });  // alpha: רקע שקוף
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// "סביבה" שהאובייקטים משקפים: בלעדיה המתכת והשרף נראים שטוחים
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// אור עיקרי מלמעלה-שמאל, כמו ברינדורים
const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
keyLight.position.set(-300, 500, 600);
scene.add(keyLight);

const camera = new THREE.PerspectiveCamera(30, 1, 1, 10000);

// --- יצירת האובייקטים ---
// כמה נקודות על פני השטח של כל אובייקט. בכל פריים בודקים איפה הן על המסך,
// וכך יודעים בדיוק איפה הקצוות של האובייקט, גם כשהוא מסובב
const EDGE_POINTS = 400;

function samplePoints(object) {
  object.updateMatrixWorld(true);
  const points = [];
  object.traverse((part) => {
    if (!part.isMesh) return;
    const positions = part.geometry.attributes.position;
    const step = Math.max(1, Math.floor(positions.count / EDGE_POINTS));
    for (let i = 0; i < positions.count; i += step) {
      points.push(new THREE.Vector3().fromBufferAttribute(positions, i).applyMatrix4(part.matrixWorld));
    }
  });
  return points;
}

for (const item of OBJECTS) {
  item.object = item.create();
  item.edgePoints = samplePoints(item.object);  // לפני ההטיה: נקודות ביחס לאובייקט עצמו
  item.object.rotation.set(...item.tilt);
  item.object.userData.heroItem = item;  // כדי לדעת על איזה אובייקט לחצו
  scene.add(item.object);

  // הגודל של האובייקט בזווית שלו, לפני הקטנה (נמדד פעם אחת)
  item.object.updateMatrixWorld(true);
  item.baseSize = new THREE.Box3().setFromObject(item.object, true).getSize(new THREE.Vector3());

  // המצב של האובייקט. מרחקים בפיקסלים של הפריים בפיגמה, כדי שיישארו נכונים כשהמסך משתנה
  item.offset = new THREE.Vector2();         // כמה הזיזו אותו מהמקום שלו
  item.velocity = new THREE.Vector2();       // מהירות (אחרי זריקה)
  item.spin = new THREE.Vector2();           // סיבוב נוסף על זווית המנוחה (x, y)
  item.spinVelocity = new THREE.Vector2();   // מהירות הסיבוב
  item.mouseTilt = new THREE.Vector2();      // ההטיה הנוכחית לכיוון העכבר
  item.lift = 0;                             // כמה הוא קרוב למסך (כשמחזיקים אותו)
  item.floatPhase = Math.random() * Math.PI * 2;  // כל אובייקט מרחף בקצב קצת אחר
  item.driftAngle = Math.random() * Math.PI * 2;  // הכיוון שאליו הוא נודד
  item.extra = new THREE.Vector2();          // הריחוף והעכבר בפריים האחרון
  item.home = new THREE.Vector2();           // המקום בתצוגה המשחקית, בעולם התלת-ממדי
  item.travel = null;                        // בזמן מעבר בין תצוגות: מאיפה יצא ומתי
  item.pose = null;                          // המיקום, הזווית והגודל שצוירו בפריים האחרון
}

// --- מיקום לפי גודל המסך ---
// המצלמה מוצבת כך שיחידה אחת בעולם התלת-ממדי = פיקסל אחד במסך.
// כך אפשר להשתמש במספרים מהפיגמה ישירות.
let view = 'playful';  // 'playful' (התצוגה המשחקית), 'classic' או 'about'
let screenWidth = 0;   // גודל האזור שבו מצוירים האובייקטים
let screenHeight = 0;
let heroScreen = null; // גודל ההירו כשהוא מסך אחד (בתצוגה המשחקית)
let scale = 1;         // כמה פיקסלים במסך שווה פיקסל אחד בפריים (כמו --hero-scale ב-CSS)

function layout() {
  screenWidth = container.clientWidth;
  screenHeight = container.clientHeight;

  renderer.setSize(screenWidth, screenHeight);
  camera.aspect = screenWidth / screenHeight;
  camera.position.z = (screenHeight / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();  // כדי שבדיקת הקצוות תעבוד כבר בפריים הראשון

  const mobile = MOBILE_QUERY.matches;
  const frame = mobile ? FRAMES.mobile : FRAMES.desktop;

  // ב-Classic View בטלפון ההירו ארוך, אז שומרים את הגובה שלו כשהיה מסך אחד
  const longHero = view === 'classic' && mobile && heroScreen;
  heroScreen = {
    width: hero.clientWidth,
    height: longHero ? heroScreen.height : hero.clientHeight,
  };
  scale = Math.min(heroScreen.width / frame.width, heroScreen.height / frame.height);

  // במחשב, במסך רחב: כמה המרווחים של Classic View ו-About נפתחים לרוחב (כמו --spread ב-CSS)
  const spread = mobile ? scale : Math.min(Math.max(scale, heroScreen.width / frame.width), scale * IDLE.maxSpread);

  // גודל: האובייקט ממלא את המלבן בלי לחרוג ממנו
  const fit = (item, w, h) => Math.min((w * scale) / item.baseSize.x, (h * scale) / item.baseSize.y);

  for (const item of OBJECTS) {
    // התצוגה המשחקית: מרכז המלבן מהפיגמה, ביחס להירו (בפיקסלים, y למטה)
    const [x, y, w, h] = mobile ? item.mobile : item.desktop;
    item.homeOnHero = new THREE.Vector2(
      heroScreen.width / 2 + (x + w / 2 - frame.width / 2) * scale,
      heroScreen.height / 2 + (y + h / 2 - frame.height / 2) * scale,
    );
    item.playfulSize = fit(item, w, h) * frame.objectSize;

    // Classic View. במחשב: ממורכז כמו הפריים. בטלפון: ממורכז לרוחב, ונמדד מלמעלה (גוללים)
    const [cx, cy, cw, ch] = mobile ? item.classicMobile : item.classicDesktop;
    item.calmPlaces = {};
    item.calmSizes = {};
    item.calmPlaces.classic = new THREE.Vector2(
      heroScreen.width / 2 + (cx + cw / 2 - frame.width / 2) * spread,
      mobile ? (cy + ch / 2) * scale : heroScreen.height / 2 + (cy + ch / 2 - frame.height / 2) * scale,
    );
    item.calmSizes.classic = fit(item, cw, ch) * frame.calmSize;

    // About: ממורכז כמו הפריים, במחשב ובטלפון
    const [ax, ay, aw, ah] = mobile ? item.aboutMobile : item.aboutDesktop;
    item.calmPlaces.about = new THREE.Vector2(
      heroScreen.width / 2 + (ax + aw / 2 - frame.width / 2) * spread,
      heroScreen.height / 2 + (ay + ah / 2 - frame.height / 2) * scale,
    );
    item.calmSizes.about = fit(item, aw, ah) * (mobile ? CONVEYOR.grow : frame.calmSize);
  }
}

// המקום של אובייקט על המסוע. כשהוא יוצא משמאל (מחוץ למסך) הוא קופץ לסוף התור מימין
function conveyorPlace(item) {
  const frame = FRAMES.mobile;
  const loop = CONVEYOR.spacing * OBJECTS.length;  // אורך המסוע כולו, ארוך מהמסך
  const along = THREE.MathUtils.euclideanModulo((item.conveyorSlot + 0.5) * CONVEYOR.spacing - conveyorDistance, loop);
  const x = along - (loop - frame.width) / 2;  // המסוע ממורכז, והקצוות שלו מחוץ למסך
  return new THREE.Vector2(
    heroScreen.width / 2 + (x - frame.width / 2) * scale,
    heroScreen.height / 2 + (CONVEYOR.y - frame.height / 2) * scale,
  );
}

// ממיר נקודה בהירו (בפיקסלים) לנקודה בעולם התלת-ממדי. ההירו זז כשגוללים
let heroRect = hero.getBoundingClientRect();

function heroToWorld(point) {
  return new THREE.Vector2(
    heroRect.left + point.x - screenWidth / 2,
    screenHeight / 2 - (heroRect.top + point.y),
  );
}

layout();
window.addEventListener('resize', layout);

// ==========================================
// העכבר והמגע
// ==========================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();     // מיקום העכבר, מ-‎-1 עד 1 בכל כיוון
let held = null;                       // האובייקט שמחזיקים עכשיו
let turning = null;                    // ב-Classic View: האובייקט שמסובבים עכשיו
let suppressClick = false;             // לא להפעיל קישור שנמצא מתחת לאובייקט שלחצו עליו
let pointerInside = false;             // העכבר נמצא מעל ההירו (במחשב)
let lastClient = { x: 0, y: 0 };       // המיקום האחרון של העכבר במסך

// --- הטקסט שמופיע ליד אובייקט ---
// במחשב: כשהעכבר מעל האובייקט. בטלפון: בלחיצה ממושכת עליו.
const label = document.querySelector('.hero-object-label');
let labelItem = null;      // האובייקט שהטקסט שלו מוצג עכשיו
let labelBlocked = null;   // אחרי לחיצה / גרירה / זריקה: הטקסט של האובייקט הזה לא חוזר עד שהעכבר עוזב אותו
let longPressTimer = null;
let labelHideTimer = null;

function showLabel(item) {
  clearTimeout(labelHideTimer);
  if (!item || !item.label) { hideLabel(); return; }
  if (labelItem !== item) label.textContent = item.label;
  labelItem = item;
  label.classList.add('is-visible');
}

function hideLabel() {
  labelItem = null;
  label.classList.remove('is-visible');
}

// הטקסט צמוד לפינה הימנית-תחתונה של האובייקט (כמו בפיגמה), ונשאר בתוך המסך
function placeLabel() {
  if (!labelItem) return;
  const { right, bottom, top } = labelItem.bounds;
  const width = label.offsetWidth;
  const height = label.offsetHeight;
  let x = right - 135 * scale;
  let y = bottom + 5 * scale;
  if (y + height > heroScreen.height) y = top - height - 5 * scale;  // אין מקום למטה: מעל האובייקט
  x = THREE.MathUtils.clamp(x, 8, heroScreen.width - width - 8);
  label.style.transform = `translate(${x}px, ${y}px)`;
}

// ממיר נקודה במסך לנקודה בעולם התלת-ממדי (בגובה האובייקטים)
function toWorld(clientX, clientY) {
  const rect = container.getBoundingClientRect();
  return new THREE.Vector2(
    clientX - rect.left - screenWidth / 2,
    screenHeight / 2 - (clientY - rect.top),
  );
}

// איזה אובייקט נמצא מתחת לנקודה הזאת (או null)
function objectAt(clientX, clientY) {
  const rect = container.getBoundingClientRect();
  const point = new THREE.Vector2(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -((clientY - rect.top) / rect.height) * 2 + 1,
  );
  raycaster.setFromCamera(point, camera);
  const hits = raycaster.intersectObjects(OBJECTS.map((item) => item.object), true);
  if (hits.length === 0) return null;

  // עולים מהחלק שנפגע עד האובייקט השלם
  let part = hits[0].object;
  while (part && !part.userData.heroItem) part = part.parent;
  return part ? part.userData.heroItem : null;
}

// בטלפון: נגיעה באובייקט לא גוללת את העמוד
hero.addEventListener('touchstart', (event) => {
  if (view !== 'playful') return;  // ב-Classic View וב-About גוללים כרגיל
  const touch = event.touches[0];
  if (objectAt(touch.clientX, touch.clientY)) event.preventDefault();
}, { passive: false });

// לחיצה: אם יש אובייקט מתחת, תופסים אותו
hero.addEventListener('pointerdown', (event) => {
  if (view !== 'playful') { startTurning(event); return; }  // רק לסובב במקום
  const item = objectAt(event.clientX, event.clientY);
  if (!item || item.travel) return;  // אובייקט שעוד בדרך למקומו אי אפשר לתפוס

  event.preventDefault();
  hero.setPointerCapture(event.pointerId);
  held = item;
  suppressClick = true;

  const pointer = toWorld(event.clientX, event.clientY);
  item.grabOffset = item.object.position.clone();  // איפה תפסו אותו, ביחס לעכבר
  item.grabOffset.x -= pointer.x;
  item.grabOffset.y -= pointer.y;
  item.velocity.set(0, 0);
  item.lastPointer = { x: event.clientX, y: event.clientY, time: event.timeStamp };
  item.pressStart = { x: event.clientX, y: event.clientY, time: event.timeStamp };
  hero.style.cursor = 'grabbing';

  // משחקים באובייקט: הטקסט נעלם כדי לא להפריע
  if (event.pointerType !== 'touch') {
    hideLabel();
    labelBlocked = item;
  }

  // בטלפון: אם האצבע נשארת על האובייקט בלי לזוז, הטקסט שלו מופיע
  if (event.pointerType === 'touch') {
    clearTimeout(longPressTimer);
    longPressTimer = setTimeout(() => showLabel(item), MOTION.longPressTime);
  }
});

// ב-Classic View וב-About: לחיצה על אובייקט מתחילה לסובב אותו במקום
function startTurning(event) {
  const item = objectAt(event.clientX, event.clientY);
  if (!item || item.travel) return;
  turning = item;
  item.pressStart = { x: event.clientX, y: event.clientY, time: event.timeStamp };
  item.lastPointer = { x: event.clientX, y: event.clientY, time: event.timeStamp };

  // בטלפון לא תופסים את האצבע, כדי שעדיין אפשר יהיה לגלול
  if (event.pointerType !== 'touch') {
    event.preventDefault();
    hero.setPointerCapture(event.pointerId);
    hero.style.cursor = 'grabbing';
  }
}

hero.addEventListener('pointermove', (event) => {
  const rect = container.getBoundingClientRect();
  mouse.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    ((event.clientY - rect.top) / rect.height) * 2 - 1,
  );
  if (event.pointerType === 'mouse') pointerInside = true;
  lastClient = { x: event.clientX, y: event.clientY };

  // ב-Classic View וב-About: גרירה עם העכבר מסובבת את האובייקט, והוא נשאר במקום
  if (turning && event.pointerType !== 'touch') {
    turning.spinVelocity.y += (event.clientX - turning.lastPointer.x) * IDLE.dragSpin / MOTION.weight;
    turning.spinVelocity.x += (event.clientY - turning.lastPointer.y) * IDLE.dragSpin / MOTION.weight;
    turning.lastPointer = { x: event.clientX, y: event.clientY, time: event.timeStamp };
  }

  if (!held) return;

  // אם האצבע זזה, זו גרירה ולא לחיצה ממושכת
  const movedSincePress = Math.hypot(event.clientX - held.pressStart.x, event.clientY - held.pressStart.y);
  if (movedSincePress > MOTION.tapMaxMove) {
    clearTimeout(longPressTimer);
    if (labelItem === held) hideLabel();  // גוררים: הטקסט נעלם
    labelBlocked = held;
  }

  // גרירה: האובייקט הולך אחרי העכבר
  const pointer = toWorld(event.clientX, event.clientY);
  held.offset.set(
    (pointer.x + held.grabOffset.x - held.home.x) / scale - held.extra.x,
    -(pointer.y + held.grabOffset.y - held.home.y) / scale - held.extra.y,
  );

  // המהירות של היד: כשמשחררים, האובייקט ממשיך בה (זריקה)
  const dt = Math.max((event.timeStamp - held.lastPointer.time) / 1000, 0.001);
  const moveX = (event.clientX - held.lastPointer.x) / scale;
  const moveY = (event.clientY - held.lastPointer.y) / scale;
  held.velocity.lerp(new THREE.Vector2(moveX / dt, moveY / dt), 0.3);

  // גרירה גם מסובבת אותו קצת, לפי המשקל
  held.spinVelocity.y += (moveX * MOTION.dragSpin) / MOTION.weight;
  held.spinVelocity.x += (moveY * MOTION.dragSpin) / MOTION.weight;

  held.lastPointer = { x: event.clientX, y: event.clientY, time: event.timeStamp };
});

// נגיעה קצרה בלי תזוזה: מסובבת את האובייקט
function isTap(item, event) {
  const moved = Math.hypot(event.clientX - item.pressStart.x, event.clientY - item.pressStart.y);
  const time = event.timeStamp - item.pressStart.time;
  return event.type !== 'pointercancel' && moved < MOTION.tapMaxMove && time < MOTION.tapMaxTime;
}

function tapSpin(item) {
  const direction = Math.random() < 0.5 ? -1 : 1;
  item.spinVelocity.y += (direction * MOTION.tapSpin) / MOTION.weight;
}

function release(event) {
  if (turning) {
    if (isTap(turning, event)) tapSpin(turning);
    turning = null;
    hero.style.cursor = '';
    return;
  }

  // באצבע אין "עכבר" שנשאר במקום, אז האובייקטים חוזרים להסתכל קדימה
  if (event.pointerType === 'touch') mouse.set(0, 0);
  if (!held) return;

  if (isTap(held, event)) tapSpin(held);

  held = null;
  hero.style.cursor = '';

  // בטלפון: הטקסט נשאר עוד רגע אחרי שמרימים את האצבע, ואז נעלם
  clearTimeout(longPressTimer);
  if (event.pointerType === 'touch') {
    labelBlocked = null;
    if (labelItem) labelHideTimer = setTimeout(hideLabel, MOTION.labelStayTime);
  }
}

hero.addEventListener('pointerup', release);
hero.addEventListener('pointercancel', release);

// העכבר יצא מההירו: האובייקטים חוזרים להסתכל קדימה, והטקסט נעלם
hero.addEventListener('pointerleave', (event) => {
  mouse.set(0, 0);
  if (event.pointerType === 'mouse') {
    pointerInside = false;
    if (!held) hideLabel();
  }
});

// אם לחצו על אובייקט, הלחיצה לא עוברת לקישור שמתחתיו
hero.addEventListener('click', (event) => {
  if (suppressClick) {
    event.preventDefault();
    event.stopPropagation();
    suppressClick = false;
  }
}, true);

// ==========================================
// התנועה: מחושבת מחדש בכל פריים
// ==========================================

// --- הצורה של כל אובייקט על המסך ---
// בכל פריים מטילים את הנקודות של האובייקט על המסך ומחשבים את קו המתאר שלו
// (כמו גומייה שנמתחת סביבו). לפיו יודעים איפה הוא נוגע בקצוות ובאובייקטים האחרים.
const screenPoint = new THREE.Vector3();

function measure(item) {
  item.object.updateMatrixWorld(true);
  const points = [];
  for (const point of item.edgePoints) {
    screenPoint.copy(point).applyMatrix4(item.object.matrixWorld).project(camera);
    points.push({
      x: (screenPoint.x + 1) / 2 * screenWidth,
      y: (1 - screenPoint.y) / 2 * screenHeight,
    });
  }
  item.outline = outlineAround(points);
  updateBounds(item);
}

// קו המתאר: המצולע הקטן ביותר שמקיף את כל הנקודות (convex hull)
function outlineAround(points) {
  points.sort((a, b) => a.x - b.x || a.y - b.y);
  const turn = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower = [];
  for (const p of points) {
    while (lower.length >= 2 && turn(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    while (upper.length >= 2 && turn(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

// המלבן שמקיף את קו המתאר, ומרכז האובייקט על המסך
function updateBounds(item) {
  let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
  for (const p of item.outline) {
    left = Math.min(left, p.x); right = Math.max(right, p.x);
    top = Math.min(top, p.y); bottom = Math.max(bottom, p.y);
  }
  item.bounds = { left, right, top, bottom, centerX: (left + right) / 2, centerY: (top + bottom) / 2 };
}

// מזיז אובייקט בכמה פיקסלים במסך (dy חיובי = למטה)
function moveBy(item, dx, dy) {
  item.offset.x += dx / scale;
  item.offset.y += dy / scale;
  item.object.position.x += dx;
  item.object.position.y -= dy;
  for (const p of item.outline) { p.x += dx; p.y += dy; }
  updateBounds(item);
}

// --- הקצוות של המסך ---
// האובייקט כולו נשאר בתוך המסך: כשהוא מגיע לקצה הוא נעצר שם ולא עובר אותו.
// הנדידה שלו מתהפכת, כדי שירחף משם בחזרה פנימה.
function keepInside(item) {
  const { left, right, top, bottom } = item.bounds;
  const edgeLeft = heroRect.left;
  const edgeTop = heroRect.top;
  const edgeRight = edgeLeft + heroScreen.width;
  const edgeBottom = edgeTop + heroScreen.height;

  let pushX = 0;
  if (left < edgeLeft) pushX = edgeLeft - left;
  else if (right > edgeRight) pushX = edgeRight - right;
  let pushY = 0;
  if (top < edgeTop) pushY = edgeTop - top;
  else if (bottom > edgeBottom) pushY = edgeBottom - bottom;

  if (pushX === 0 && pushY === 0) return;
  moveBy(item, pushX, pushY);

  if (pushX !== 0) {
    item.velocity.x = 0;  // נתקע בקצה
    if (Math.sign(Math.cos(item.driftAngle)) === -Math.sign(pushX)) item.driftAngle = Math.PI - item.driftAngle;
  }
  if (pushY !== 0) {
    item.velocity.y = 0;
    if (Math.sign(Math.sin(item.driftAngle)) === -Math.sign(pushY)) item.driftAngle = -item.driftAngle;
  }
}

// --- התנגשויות בין אובייקטים ---
// בודקים אם שני קווי המתאר חופפים. אם כן: מרחיקים אותם בדיוק כמה שצריך,
// והם מעבירים תנופה אחד לשני, כמו שני גופים בעלי משקל.
function overlapOf(a, b) {
  let smallest = Infinity;
  let axis = null;
  for (const outline of [a.outline, b.outline]) {
    for (let i = 0; i < outline.length; i++) {
      const p1 = outline[i];
      const p2 = outline[(i + 1) % outline.length];
      const length = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      if (length === 0) continue;
      const nx = -(p2.y - p1.y) / length;
      const ny = (p2.x - p1.x) / length;

      // "הצל" של כל אובייקט על הכיוון הזה
      let minA = Infinity, maxA = -Infinity, minB = Infinity, maxB = -Infinity;
      for (const p of a.outline) { const d = p.x * nx + p.y * ny; minA = Math.min(minA, d); maxA = Math.max(maxA, d); }
      for (const p of b.outline) { const d = p.x * nx + p.y * ny; minB = Math.min(minB, d); maxB = Math.max(maxB, d); }

      const overlap = Math.min(maxA, maxB) - Math.max(minA, minB);
      if (overlap <= 0) return null;  // יש רווח ביניהם: לא נוגעים
      if (overlap < smallest) { smallest = overlap; axis = { x: nx, y: ny }; }
    }
  }
  // הכיוון צריך להצביע מ-a אל b
  const towardB = (b.bounds.centerX - a.bounds.centerX) * axis.x + (b.bounds.centerY - a.bounds.centerY) * axis.y;
  if (towardB < 0) { axis.x = -axis.x; axis.y = -axis.y; }
  return { depth: smallest, axis };
}

function collide(a, b) {
  // בדיקה מהירה: אם המלבנים לא נוגעים, גם האובייקטים לא
  if (a.bounds.right < b.bounds.left || b.bounds.right < a.bounds.left ||
      a.bounds.bottom < b.bounds.top || b.bounds.bottom < a.bounds.top) return;

  const hit = overlapOf(a, b);
  if (!hit) return;
  const { depth, axis } = hit;

  // מרחיקים אותם. את האובייקט שמחזיקים היד לא נותנת להזיז, אז השני זז את כל המרחק
  const shareA = a === held ? 0 : b === held ? 1 : 0.5;
  const shareB = 1 - shareA;
  moveBy(a, -axis.x * depth * shareA, -axis.y * depth * shareA);
  moveBy(b, axis.x * depth * shareB, axis.y * depth * shareB);

  // תנופה: אם הם נעים זה לכיוון זה, הם מעבירים מהירות אחד לשני
  const speedA = a.velocity.x * axis.x + a.velocity.y * axis.y;
  const speedB = b.velocity.x * axis.x + b.velocity.y * axis.y;
  const closing = speedA - speedB;
  if (closing > 0) {
    const push = (1 + MOTION.bounce) * closing;
    if (a !== held) a.velocity.addScaledVector(axis, -push * shareA);
    if (b !== held) b.velocity.addScaledVector(axis, push * shareB);

    // מכה מסובבת קצת את שניהם
    const spin = closing * MOTION.impactSpin / MOTION.weight;
    a.spinVelocity.x -= axis.y * spin; a.spinVelocity.y -= axis.x * spin;
    b.spinVelocity.x += axis.y * spin; b.spinVelocity.y += axis.x * spin;
  }

  // אחרי מגע, כל אחד נודד הלאה מהשני
  a.driftAngle = Math.atan2(-axis.y, -axis.x);
  b.driftAngle = Math.atan2(axis.y, axis.x);
}

// הסיבוב נמשך חזרה לזווית המנוחה, כמו קפיץ.
// אחרי סיבוב שלם הוא משלים לסיבוב הקרוב, ולא מסתובב אחורה.
function springBack(spin, spinVelocity, dt, axis) {
  const fullTurn = Math.PI * 2;
  const rest = Math.round(spin[axis] / fullTurn) * fullTurn;
  const stiffness = MOTION.returnSpring;
  const friction = 1.2 * Math.sqrt(stiffness) * MOTION.weight;  // כבד = נרגע מהר יותר
  spinVelocity[axis] += (-(spin[axis] - rest) * stiffness - spinVelocity[axis] * friction) * dt;
  spin[axis] += spinVelocity[axis] * dt;
}

// ==========================================
// מעבר בין התצוגות: המשחקית, Classic View ו-About me
// ==========================================
const viewButtons = document.querySelectorAll('[data-view-toggle]');
const aboutButtons = document.querySelectorAll('[data-about-toggle]');
const title = document.querySelector('.hero-title');
let mainView = 'playful';    // התצוגה שחוזרים אליה מ-About ([Go Back])
let aboutPushed = false;     // נכנסנו ל-About בכפתור, אז "חזרה" = אחורה בדפדפן

// זווית בין ‎-π ל-π, כדי שאחרי סיבובים שלמים האובייקט לא יסתובב אחורה בדרך
function shortestAngle(angle) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function setView(nextView, animate = true) {
  if (nextView === view) return;

  // בטלפון הכותרת משנה צורה ב-About (שורה אחת במקום שתיים), אז היא מופיעה מחדש ברכות
  if (animate && MOBILE_QUERY.matches && (view === 'about' || nextView === 'about') && !REDUCE_MOTION) {
    title.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 150, easing: 'ease', fill: 'backwards' });
  }

  view = nextView;
  if (view !== 'about') mainView = view;
  conveyorDistance = 0;  // המסוע מתחיל מההתחלה
  hero.classList.toggle('is-classic', view === 'classic');
  hero.classList.toggle('is-about', view === 'about');
  for (const button of viewButtons) {
    button.textContent = mainView === 'classic' ? '[Playful View]' : '[Classic View]';
  }
  for (const button of aboutButtons) {
    button.textContent = view === 'about' ? '[Go Back]' : button.dataset.label;
  }

  // משחררים את מה שמחזיקים ומסתירים את הטקסט
  held = null;
  turning = null;
  hero.style.cursor = '';
  hideLabel();
  layout();

  OBJECTS.forEach((item, index) => {
    // בתצוגה המשחקית מתחילים מחדש מהמקום מהפיגמה
    item.offset.set(0, 0);
    item.velocity.set(0, 0);
    item.spin.set(0, 0);
    item.spinVelocity.set(0, 0);
    item.lift = 0;

    if (!animate || REDUCE_MOTION || !item.pose) { item.travel = null; return; }

    // יוצאים מהמקום שבו האובייקט נמצא עכשיו (גם אם הוא באמצע מעבר קודם)
    const from = { ...item.pose };
    from.rx = item.tilt[0] + shortestAngle(from.rx - item.tilt[0]);
    from.ry = item.tilt[1] + shortestAngle(from.ry - item.tilt[1]);
    from.rz = item.tilt[2] + shortestAngle(from.rz - item.tilt[2]);
    item.travel = { from, time: -index * VIEW_CHANGE.stagger };
  });
}

// לכל תצוגה כתובת משלה (‎#classic, ‎#about), כך שאפשר לשתף אותה,
// וכפתור "אחורה" בדפדפן מחזיר לתצוגה הקודמת
function viewFromAddress() {
  if (location.hash === '#classic') return 'classic';
  if (location.hash === '#about') return 'about';
  return 'playful';
}

function goTo(nextView) {
  history.pushState(null, '', nextView === 'playful' ? location.pathname + location.search : '#' + nextView);
  setView(nextView);
}

// [Classic View] / [Playful View]
for (const button of viewButtons) {
  button.addEventListener('click', () => {
    aboutPushed = false;
    goTo(view === 'classic' ? 'playful' : 'classic');
  });
}

// [About me] / [Go Back]
for (const button of aboutButtons) {
  button.dataset.label = button.textContent;  // הטקסט המקורי, לחזרה מ-About
  button.addEventListener('click', () => {
    if (view !== 'about') {
      goTo('about');
      aboutPushed = true;
    } else if (aboutPushed) {
      history.back();  // חוזרים לתצוגה שממנה הגענו
    } else {
      goTo(mainView);  // נכנסו ישר ל-‎#about: חוזרים לתצוגה המשחקית
    }
  });
}

window.addEventListener('popstate', () => {
  aboutPushed = false;
  setView(viewFromAddress());
});

// נכנסים ישר לתצוגה שבכתובת (בלי מעבר)
setView(viewFromAddress(), false);

// אובייקט בדרך: מתקדם מהמקום שממנו יצא אל המקום החדש, ברכות ובקשת קטנה לכיוון המסך
function travel(item, target, dt) {
  const trip = item.travel;
  trip.time += dt;
  const progress = THREE.MathUtils.clamp(trip.time / VIEW_CHANGE.duration, 0, 1);
  const eased = easeInOut(progress);

  const pose = {};
  for (const key in target) pose[key] = THREE.MathUtils.lerp(trip.from[key], target[key], eased);
  pose.z += Math.sin(Math.PI * eased) * VIEW_CHANGE.arc * scale;

  if (progress >= 1) item.travel = null;  // הגיע
  return pose;
}

const clock = new THREE.Clock();

function update() {
  const dt = Math.min(clock.getDelta(), 0.05);  // אם הלשונית הייתה ברקע, לא לקפוץ קדימה
  const time = clock.elapsedTime;
  heroRect = hero.getBoundingClientRect();
  const playful = view === 'playful';
  const onConveyor = view === 'about' && MOBILE_QUERY.matches;
  if (onConveyor && !REDUCE_MOTION) conveyorDistance += CONVEYOR.speed * dt;

  // העכבר (במחשב): על איזה אובייקט הוא עומד. בודקים בכל פריים, כי האובייקטים זזים גם כשהעכבר לא
  let hovered = null;
  if (pointerInside && !held && !turning) {
    hovered = objectAt(lastClient.x, lastClient.y);
    hero.style.cursor = hovered ? 'grab' : '';
  }
  if (playful && pointerInside && !held) {
    if (hovered !== labelBlocked) labelBlocked = null;  // העכבר עזב את האובייקט ששיחקו בו
    if (hovered && hovered !== labelBlocked) showLabel(hovered);
    else hideLabel();
  }

  for (const item of OBJECTS) {
    const object = item.object;
    item.home.copy(heroToWorld(item.homeOnHero));

    // 1. ריחוף ועכבר (לא כשמבקשים פחות תנועה)
    let wave = 0;
    let sway = 0;
    if (!REDUCE_MOTION) {
      wave = Math.sin(time * MOTION.floatSpeed * Math.PI * 2 * 0.5 + item.floatPhase);
      sway = Math.sin(time * 0.37 + item.floatPhase * 2);

      const smooth = 1 - Math.exp(-MOTION.mouseSmooth * dt);
      item.mouseTilt.lerp(mouse.clone().multiplyScalar(1 / MOTION.weight), smooth);
    }

    let target;
    if (playful) {
      const mouseX = item.mouseTilt.x * MOTION.mouseShift;
      const mouseY = item.mouseTilt.y * MOTION.mouseShift;
      item.extra.set(mouseX, wave * MOTION.floatHeight + mouseY);

      // 2. תנועה: זריקה (מאטה בהדרגה) + נדידה איטית בחלל, שלא נעצרת אף פעם.
      // בזמן מעבר בין תצוגות האובייקט בדרך הביתה, אז עוד לא נודד
      if (item !== held && !item.travel) {
        item.offset.addScaledVector(item.velocity, dt);
        item.velocity.multiplyScalar(Math.exp(-MOTION.throwSlowdown * dt));

        if (!REDUCE_MOTION) {
          item.driftAngle += Math.sin(time * 0.3 + item.floatPhase) * MOTION.driftWander * dt;
          item.offset.x += Math.cos(item.driftAngle) * MOTION.driftSpeed * dt;
          item.offset.y += Math.sin(item.driftAngle) * MOTION.driftSpeed * dt;
        }
      }
      // 3. סיבוב: חוזר לזווית המנוחה
      springBack(item.spin, item.spinVelocity, dt, 'x');
      springBack(item.spin, item.spinVelocity, dt, 'y');

      // 4. "הרמה": האובייקט שמחזיקים מתקרב קצת למסך
      const liftTarget = item === held ? MOTION.liftWhenHeld : 0;
      item.lift += (liftTarget - item.lift) * (1 - Math.exp(-10 * dt));

      // מחברים הכול למיקום ולזווית הסופיים
      target = {
        x: item.home.x + (item.offset.x + item.extra.x) * scale,
        y: item.home.y - (item.offset.y + item.extra.y) * scale,
        z: item.lift * scale,
        rx: item.tilt[0] + item.spin.x + item.mouseTilt.y * MOTION.mouseTilt,
        ry: item.tilt[1] + item.spin.y + item.mouseTilt.x * MOTION.mouseTilt + sway * MOTION.floatSway,
        rz: item.tilt[2] + wave * MOTION.floatTurn,
        size: item.playfulSize,
      };
    } else {
      // Classic View ו-About: במקום שלו, מרחף קלות. מסתובב כשנוגעים בו, ומתקרב כשהעכבר עליו
      springBack(item.spin, item.spinVelocity, dt, 'x');
      springBack(item.spin, item.spinVelocity, dt, 'y');
      const liftTarget = item === hovered || item === turning ? IDLE.hoverLift : 0;
      item.lift += (liftTarget - item.lift) * (1 - Math.exp(-8 * dt));

      const place = heroToWorld(onConveyor ? conveyorPlace(item) : item.calmPlaces[view]);
      target = {
        x: place.x,
        y: place.y + wave * IDLE.floatHeight * scale,
        z: item.lift * scale,
        rx: item.tilt[0] + item.spin.x + item.mouseTilt.y * IDLE.mouseTilt,
        ry: item.tilt[1] + item.spin.y + item.mouseTilt.x * IDLE.mouseTilt + sway * IDLE.floatSway,
        rz: item.tilt[2] + wave * IDLE.floatTurn,
        size: item.calmSizes[view],
      };
    }

    // בזמן מעבר בין תצוגות: בדרך מהמקום הקודם למקום החדש
    const pose = item.travel ? travel(item, target, dt) : target;
    item.pose = pose;
    object.position.set(pose.x, pose.y, pose.z);
    object.rotation.set(pose.rx, pose.ry, pose.rz);
    object.scale.setScalar(pose.size);
    measure(item);
  }

  // התנגשויות וקצוות (רק בתצוגה המשחקית, ורק לאובייקטים שכבר הגיעו).
  // חוזרים על זה כמה פעמים, כי הזזה של אחד יכולה לדחוף אחר
  if (playful) {
    const settled = OBJECTS.filter((item) => !item.travel);
    for (let round = 0; round < 3; round++) {
      for (let i = 0; i < settled.length; i++) {
        for (let j = i + 1; j < settled.length; j++) collide(settled[i], settled[j]);
      }
      for (const item of settled) keepInside(item);  // גם האובייקט שמחזיקים לא יוצא מהמסך
    }
  }

  placeLabel();  // הטקסט זז יחד עם האובייקט שלו

  // ה-euka tea צריך לדעת כמה זמן עבר, כדי להזיז את התה שבתוכו
  for (const item of OBJECTS) {
    if (item.object.userData.tick) item.object.userData.tick(dt);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(update);
}

update();
