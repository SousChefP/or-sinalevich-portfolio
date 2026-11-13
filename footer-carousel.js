// ==========================================
// הפוטר בעמוד פרויקט בטלפון: שלושת הפרויקטים זזים לאט שמאלה בקרוסלה אינסופית.
// - כדי שהשורה לא תיגמר, משכפלים את הפרויקטים כמה פעמים (לפני ש-project-object.js מצייר את האובייקטים)
// - כשנוגעים באובייקט (כדי לסובב אותו), הקרוסלה עוצרת בעדינות, וממשיכה כשעוזבים
// ==========================================

(function () {
  const list = document.querySelector('.case-footer-list');
  if (!list) return;

  const SPEED = 30;         // פיקסלים לשנייה
  const EASE = 4;           // כמה מהר הקרוסלה עוצרת וממשיכה (גדול יותר = מהר יותר)
  const COPIES = 4;         // כמה פעמים השורה מופיעה: מספיק כדי למלא גם מסך רחב של 767

  const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (REDUCE_MOTION) return;  // בלי תנועה: השורה נשארת במקום, כמו בפיגמה

  // --- משכפלים את הפרויקטים. העותקים מוסתרים מקוראי מסך ולא נגישים במקלדת ---
  const originals = [...list.children];
  for (let copy = 1; copy < COPIES; copy++) {
    for (const item of originals) {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a').forEach((link) => link.setAttribute('tabindex', '-1'));
      list.appendChild(clone);
    }
  }
  list.classList.add('is-moving');

  // אורך של סיבוב אחד: שלושת הפרויקטים והרווחים ביניהם (המרחק עד העותק הבא)
  let period = 0;
  let start = 0;  // המקום ההתחלתי: העותק השני באמצע המסך, כמו בפיגמה

  function measure() {
    period = list.children[originals.length].offsetLeft - list.children[0].offsetLeft;
    const rowWidth = period - parseFloat(getComputedStyle(list).columnGap);
    start = (list.parentElement.clientWidth - rowWidth) / 2 - period;
  }

  // --- עצירה כשנוגעים, והמשך כשעוזבים ---
  let pressed = false;
  list.addEventListener('pointerdown', () => { pressed = true; });
  window.addEventListener('pointerup', () => { pressed = false; });
  window.addEventListener('pointercancel', () => { pressed = false; });

  // --- כל פריים: זזים שמאלה, ואחרי סיבוב שלם חוזרים אחורה בדיוק בסיבוב אחד (בלי שרואים קפיצה) ---
  let moved = 0;
  let speed = SPEED;
  let lastTime = performance.now();

  function update(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.25);  // (אחרי מעבר לטאב אחר: בלי קפיצה גדולה)
    lastTime = now;
    speed += ((pressed ? 0 : SPEED) - speed) * (1 - Math.exp(-EASE * dt));
    if (!period) measure();  // במחשב העמוד הזה מוסתר ואין לו רוחב: לא זזים
    if (period) {
      moved = (moved + speed * dt) % period;
      list.style.transform = `translateX(${start - moved}px)`;
    }
    requestAnimationFrame(update);
  }

  measure();
  window.addEventListener('resize', measure);
  requestAnimationFrame(update);
})();
