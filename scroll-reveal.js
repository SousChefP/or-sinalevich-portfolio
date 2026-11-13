// ==========================================
// עמוד פרויקט בטלפון (case): כל חלק (.case-reveal) מופיע כשהוא נכנס למסך בגלילה, בכל פעם מחדש.
// (החלק העליון, עד הסקירה, מוצג מיד בלי תנועה: אין לו case-reveal)
// אותו מעבר כמו הטקסט שמתחלף בקייס סטאדי במחשב: מתחיל שקוף וקצת למטה, ועולה למקום (styles.css).
// בנוסף: הסרטונים נטענים רק כשמגיעים קרוב אליהם (data-src), כדי שהעמוד ייפתח מהר בטלפון
// ==========================================

(function () {
  const page = document.querySelector('.case');
  if (!page) return;

  // --- הופעה בגלילה ---
  const parts = page.querySelectorAll('.case-reveal');

  // בלי IntersectionObserver (דפדפן ישן מאוד): לא מסתירים כלום
  if ('IntersectionObserver' in window) {
    page.classList.add('is-revealing');

    // חלק מופיע כשהקצה העליון שלו עבר קצת מעל תחתית המסך
    const revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      }
    }, { rootMargin: '0px 0px -8% 0px' });

    // ונעלם רק כשהוא כבר לגמרי מחוץ למסך, כדי שבפעם הבאה שגוללים אליו הוא יופיע שוב
    const hideObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) entry.target.classList.remove('is-visible');
      }
    });

    parts.forEach((part) => {
      revealObserver.observe(part);
      hideObserver.observe(part);
    });
  }

  // --- טעינת הסרטונים: כשהם במרחק של בערך מסך אחד מהמסך ---
  const videos = page.querySelectorAll('video[data-src]');

  function loadVideo(video) {
    video.src = video.dataset.src;
    video.removeAttribute('data-src');
    video.play().catch(() => {});  // אם הדפדפן לא מנגן לבד, נשארת התמונה הראשונה
  }

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        loadVideo(entry.target);
        videoObserver.unobserve(entry.target);
      }
    }, { rootMargin: '100% 0px' });

    videos.forEach((video) => videoObserver.observe(video));
  } else {
    videos.forEach(loadVideo);
  }
})();
