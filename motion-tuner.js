// ==========================================
// לוח כיוונון לתנועה של האובייקטים (כלי עבודה, לא חלק מהאתר).
// נפתח רק בכתובת שמסתיימת ב-?tune, למשל http://localhost:8000/?tune
// כל שינוי בסליידר משפיע מיד. "העתק ערכים" מעתיק את כל המספרים, כדי להדביק בצ'אט.
// ==========================================

// הסליידרים של ההירו (התצוגה המשחקית), מקובצים לפי סוג התנועה. אותם סליידרים במחשב ובטלפון.
// key: השם ב-MOTION שב-hero.js. min / max / step: הטווח של הסליידר
const HERO_CONTROLS = [
  {
    group: 'משקל',
    controls: [
      { key: 'weight', label: 'משקל (כבד = זז פחות ונרגע מהר)', min: 0.2, max: 5, step: 0.1 },
    ],
  },
  {
    group: 'נדידה בחלל',
    controls: [
      { key: 'driftSpeed', label: 'מהירות נדידה (פיקסלים לשנייה)', min: 0, max: 120, step: 1 },
      { key: 'driftWander', label: 'כמה מהר הכיוון משתנה', min: 0, max: 3, step: 0.05 },
    ],
  },
  {
    group: 'ריחוף',
    controls: [
      { key: 'floatHeight', label: 'גובה הריחוף (פיקסלים)', min: 0, max: 40, step: 1 },
      { key: 'floatSpeed', label: 'קצב הריחוף', min: 0, max: 2, step: 0.05 },
      { key: 'floatTurn', label: 'נדנוד (הטיה לצדדים)', min: 0, max: 0.4, step: 0.01 },
      { key: 'floatSway', label: 'סיבוב הלוך ושוב', min: 0, max: 0.6, step: 0.01 },
    ],
  },
  {
    group: 'תגובה לעכבר',
    controls: [
      { key: 'mouseTilt', label: 'הטיה לכיוון העכבר', min: 0, max: 0.8, step: 0.01 },
      { key: 'mouseShift', label: 'תזוזה לכיוון העכבר (פיקסלים)', min: 0, max: 60, step: 1 },
      { key: 'mouseSmooth', label: 'מהירות התגובה לעכבר', min: 0.5, max: 20, step: 0.5 },
    ],
  },
  {
    group: 'זריקה והתנגשויות',
    controls: [
      { key: 'throwSlowdown', label: 'כמה מהר זריקה נעצרת', min: 0, max: 6, step: 0.1 },
      { key: 'bounce', label: 'קפיצה בהתנגשות (0–1)', min: 0, max: 1, step: 0.05 },
      { key: 'impactSpin', label: 'סיבוב מהתנגשות', min: 0, max: 0.1, step: 0.002 },
    ],
  },
  {
    group: 'גרירה ונגיעה',
    controls: [
      { key: 'dragSpin', label: 'סיבוב מגרירה', min: 0, max: 0.4, step: 0.01 },
      { key: 'returnSpring', label: 'חזרה לזווית המנוחה (קפיץ)', min: 0.5, max: 40, step: 0.5 },
      { key: 'liftWhenHeld', label: 'התקרבות למסך כשמחזיקים', min: 0, max: 150, step: 5 },
    ],
  },
];

const STORAGE_KEY = 'motion-tuner-hero';  // הערכים נשמרים בדפדפן, כדי שרענון לא ימחק אותם

// פותח את הלוח. values: האובייקט MOTION מ-hero.js (משנים אותו ישירות, וזה משפיע מיד)
export function openTuner(values) {
  const original = { ...values };  // הערכים מהקוד, בשביל "איפוס"
  restoreSaved(values);

  const panel = document.createElement('aside');
  panel.className = 'motion-tuner';
  panel.dir = 'rtl';

  // הכותרת, עם כפתור לקפל / לפתוח
  const header = document.createElement('div');
  header.className = 'motion-tuner-header';
  const heading = document.createElement('h2');
  heading.className = 'motion-tuner-title';
  heading.textContent = 'תנועה: הירו (מחשב וטלפון)';
  const foldButton = document.createElement('button');
  foldButton.type = 'button';
  foldButton.className = 'motion-tuner-button';
  foldButton.textContent = 'קפל';
  foldButton.addEventListener('click', () => {
    const folded = panel.classList.toggle('is-folded');
    foldButton.textContent = folded ? 'פתח' : 'קפל';
  });
  header.append(heading, foldButton);

  // כל הסליידרים
  const body = document.createElement('div');
  body.className = 'motion-tuner-body';
  const rows = [];
  for (const { group, controls } of HERO_CONTROLS) {
    const groupTitle = document.createElement('h3');
    groupTitle.className = 'motion-tuner-group';
    groupTitle.textContent = group;
    body.append(groupTitle);
    for (const control of controls) {
      const row = createRow(control, values);
      rows.push(row);
      body.append(row.element);
    }
  }

  // הכפתורים למטה
  const actions = document.createElement('div');
  actions.className = 'motion-tuner-actions';
  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'motion-tuner-button';
  copyButton.textContent = 'העתק ערכים';
  copyButton.addEventListener('click', async () => {
    await copyText(valuesAsText(values, original));
    copyButton.textContent = 'הועתק!';
    setTimeout(() => { copyButton.textContent = 'העתק ערכים'; }, 1500);
  });
  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.className = 'motion-tuner-button';
  resetButton.textContent = 'איפוס';
  resetButton.addEventListener('click', () => {
    Object.assign(values, original);
    for (const row of rows) row.refresh();
    save(values, original);
  });
  actions.append(copyButton, resetButton);
  body.append(actions);

  // כל שינוי נשמר בדפדפן
  body.addEventListener('input', () => save(values, original));

  panel.append(header, body);
  document.body.append(panel);
}

// שורה אחת: שם, סליידר ותיבת מספר, מסונכרנים זה עם זה
function createRow({ key, label, min, max, step }, values) {
  const element = document.createElement('label');
  element.className = 'motion-tuner-row';

  const name = document.createElement('span');
  name.className = 'motion-tuner-label';
  name.textContent = label;

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'motion-tuner-slider';
  slider.dir = 'ltr';  // ימינה = יותר, גם בלוח בעברית
  Object.assign(slider, { min, max, step });

  const number = document.createElement('input');
  number.type = 'number';
  number.className = 'motion-tuner-number';
  Object.assign(number, { min, max, step });

  const refresh = () => {
    slider.value = values[key];
    number.value = values[key];
  };
  slider.addEventListener('input', () => {
    values[key] = Number(slider.value);
    number.value = slider.value;
  });
  // מספר שהוקלד: נכנס לתוקף רק אם הוא בטווח של הסליידר.
  // מספר לא תקין (למשל 0 במשקל) שובר את החישוב, והאובייקטים נעלמים
  number.addEventListener('input', () => {
    if (!isInRange(number.value, min, max)) return;  // ריק, באמצע הקלדה או מחוץ לטווח
    values[key] = Number(number.value);
    slider.value = number.value;
  });
  number.addEventListener('change', refresh);  // בסוף ההקלדה: מציגים את הערך שבאמת בשימוש
  refresh();

  element.append(name, slider, number);
  return { element, refresh };
}

// הטקסט שמועתק: כל הערכים, ומה השתנה לעומת הקוד
function valuesAsText(values, original) {
  const lines = ['MOTION (hero):'];
  for (const { controls } of HERO_CONTROLS) {
    for (const { key } of controls) {
      const changed = values[key] !== original[key] ? `   (was ${original[key]})` : '';
      lines.push(`  ${key}: ${values[key]}${changed}`);
    }
  }
  return lines.join('\n');
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // דפדפן שלא מרשה להעתיק: מציגים את הטקסט כדי להעתיק ידנית
    window.prompt('העתיקי מכאן:', text);
  }
}

// שומרים רק ערכים ששונו, כדי ששינוי בקוד עדיין ייכנס לתוקף
function save(values, original) {
  const changed = {};
  for (const key of Object.keys(original)) {
    if (values[key] !== original[key]) changed[key] = values[key];
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(changed));
  } catch {
    // בלי שמירה (למשל בחלון פרטי): הלוח עדיין עובד
  }
}

function isInRange(value, min, max) {
  return value !== '' && value !== null && Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max;
}

// רק ערכים תקינים: של סליידר שקיים, ובטווח שלו
function restoreSaved(values) {
  const controls = HERO_CONTROLS.flatMap((group) => group.controls);
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    for (const [key, value] of Object.entries(saved)) {
      const control = controls.find((c) => c.key === key);
      if (control && isInRange(value, control.min, control.max)) values[key] = Number(value);
    }
  } catch {
    // אין ערכים שמורים
  }
}
