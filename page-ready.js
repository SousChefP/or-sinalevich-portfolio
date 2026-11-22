// ==========================================
// הדף מופיע רק כשהמסך הראשון מוכן: עד אז הוא מוסתר (לבן), ואז מופיע בבת אחת.
// כך באינטרנט איטי לא רואים חלקים שנטענים כל אחד בזמן אחר.
// מחכים ל: פונטים, האובייקטים התלת-ממדיים (project-object.js), והתמונות והסרטונים שנראים במסך הראשון.
// מה שלמטה בעמוד ממשיך להיטען ברקע, ולא מעכב את ההופעה.
// ליתר ביטחון: אם משהו נתקע, הדף מופיע בכל מקרה אחרי MAX_WAIT.
// הסקריפט נטען ב-head (לפני שהדף מצויר), כדי שלא יראו את הדף לפני שהוא הוסתר
// ==========================================

(function () {
  const MAX_WAIT = 15000;   // מילישניות: הכי הרבה זמן שהדף נשאר מוסתר

  const root = document.documentElement;
  root.classList.add('is-loading');   // styles.css מסתיר את הדף כל עוד המחלקה הזו קיימת

  let shown = false;
  function showPage() {
    if (shown) return;
    shown = true;
    root.classList.remove('is-loading');
  }
  setTimeout(showPage, MAX_WAIT);

  // --- האם האלמנט נמצא במסך הראשון (בלי לגלול) ---
  function onFirstScreen(element) {
    const box = element.getBoundingClientRect();
    return box.width > 0 && box.top < window.innerHeight && box.bottom > 0;
  }

  // --- תמונה: מוכנה כשסיימה להיטען (או אם נכשלה: לא מחכים לה) ---
  function imageReady(image) {
    if (image.complete) return Promise.resolve();
    return new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  }

  // --- סרטון: מוכן כשיש לו את הפריים הראשון (או אם נכשל: לא מחכים לו) ---
  function videoReady(video) {
    if (video.readyState >= 2 || video.error) return Promise.resolve();
    return new Promise((resolve) => {
      video.addEventListener('loadeddata', resolve, { once: true });
      video.addEventListener('error', resolve, { once: true });
    });
  }

  // --- האובייקטים התלת-ממדיים: מוכנים אחרי הציור הראשון (hero.js בעמוד הבית, project-object.js בעמוד פרויקט) ---
  function objectsReady() {
    if (!document.querySelector('#hero-objects, .project-object') || window.objectsReady) return Promise.resolve();
    return new Promise((resolve) => window.addEventListener('objects-ready', resolve, { once: true }));
  }

  // --- האם הסרטון נטען בגודל המסך הזה (בטלפון לא נטענים הסרטונים של המחשב, ולהפך) ---
  function willLoad(video) {
    if (video.getAttribute('src')) return true;
    return [...video.querySelectorAll('source')].some((source) => !source.media || window.matchMedia(source.media).matches);
  }

  // כשהעמוד בנוי (בלי לחכות לכל הקבצים), בודקים מה נמצא במסך הראשון ומחכים רק לו
  document.addEventListener('DOMContentLoaded', () => {
    const images = [...document.querySelectorAll('img')].filter(onFirstScreen);
    const videos = [...document.querySelectorAll('video')].filter((video) => willLoad(video) && onFirstScreen(video));
    Promise.all([document.fonts.ready, objectsReady(), ...images.map(imageReady), ...videos.map(videoReady)]).then(showPage);
  });
})();
