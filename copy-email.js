// ==========================================
// העתקת כתובת המייל בלחיצה (במחשב)
// הקישור עצמו הוא mailto:, אז אם ההעתקה לא מצליחה, נפתחת אפליקציית המייל.
// ==========================================

const FEEDBACK_TIME = 2000;  // כמה זמן (במילישניות) מוצג "[Copied!]"

document.querySelectorAll('[data-copy-email]').forEach((link) => {
  const feedback = link.querySelector('.copy-email-feedback');
  const originalText = feedback.textContent;
  const email = link.href.replace('mailto:', '');
  let timer;

  link.addEventListener('click', async (event) => {
    event.preventDefault();  // לא לפתוח את אפליקציית המייל

    try {
      await navigator.clipboard.writeText(email);
    } catch {
      window.location.href = link.href;  // ההעתקה נכשלה: פותחים את המייל במקום
      return;
    }

    // פידבק: הטקסט מתחלף ל-"[Copied!]" וחוזר אחרי רגע
    feedback.textContent = '[Copied!]';
    clearTimeout(timer);
    timer = setTimeout(() => {
      feedback.textContent = originalText;
    }, FEEDBACK_TIME);
  });
});
