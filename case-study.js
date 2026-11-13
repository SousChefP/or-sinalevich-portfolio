// ==========================================
// הקייס סטאדי בעמוד פרויקט (במחשב): הטקסט משמאל עוקב אחרי הדימויים מימין.
// - כשדימוי של חלק אחר מגיע לאמצע המסך, הטקסט מתחלף לחלק שלו (כמו קרוסלה אנכית)
// - לחיצה על כותרת של חלק גוללת לדימוי הראשון שלו
// החלקים והדימויים מחוברים לפי data-chapter (insight, idea, application, impact)
// ==========================================

(function () {
  const chapters = [...document.querySelectorAll('.study-chapter')];
  const media = [...document.querySelectorAll('.study-case-media [data-chapter]')];
  const bar = document.querySelector('.study-bar');
  if (!chapters.length || !media.length) return;

  const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- מסמנים חלק פעיל. החלקים שלפניו יוצאים למעלה, ואלה שאחריו מחכים למטה ---
  let activeName = null;

  function setActive(name) {
    if (name === activeName) return;
    activeName = name;
    const activeIndex = chapters.findIndex((chapter) => chapter.dataset.chapter === name);
    chapters.forEach((chapter, index) => {
      chapter.classList.toggle('is-active', index === activeIndex);
      chapter.classList.toggle('is-before', index < activeIndex);
    });
  }

  // --- איזה חלק פעיל: של הדימוי האחרון שהקצה העליון שלו כבר עבר את אמצע המסך ---
  function update() {
    const line = window.innerHeight / 2;
    let current = media[0].dataset.chapter;
    for (const item of media) {
      if (item.getBoundingClientRect().top <= line) current = item.dataset.chapter;
    }
    setActive(current);
  }

  // בודקים פעם אחת בכל פריים, גם אם הגלילה שולחת הרבה אירועים
  let waiting = false;
  function onScroll() {
    if (waiting) return;
    waiting = true;
    requestAnimationFrame(() => {
      waiting = false;
      update();
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // --- לחיצה על כותרת: גוללים כך שהדימוי הראשון של החלק יתחיל מתחת לפס העליון ---
  for (const chapter of chapters) {
    const title = chapter.querySelector('.study-chapter-title');
    const first = media.find((item) => item.dataset.chapter === chapter.dataset.chapter);
    if (!title || !first) continue;

    title.addEventListener('click', () => {
      const barHeight = bar ? bar.offsetHeight : 0;
      const top = window.scrollY + first.getBoundingClientRect().top - barHeight;
      window.scrollTo({ top, behavior: REDUCE_MOTION ? 'auto' : 'smooth' });
    });
  }
})();
