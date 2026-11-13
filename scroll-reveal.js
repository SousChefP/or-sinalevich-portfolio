// ==========================================
// עמוד פרויקט בטלפון (case): כל חלק (.case-reveal) מופיע כשהוא נכנס למסך בגלילה.
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

    // חלק מופיע כשהקצה העליון שלו עבר קצת מעל תחתית המסך, ונשאר גלוי
    const revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px' });

    parts.forEach((part) => revealObserver.observe(part));
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
