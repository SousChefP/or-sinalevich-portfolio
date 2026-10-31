// ==========================================
// הקו התחתון בהובר על הקישורים בהירו
// ה-CSS מצייר עותק שקוף של הטקסט עם קו תחתון (data-text), ונחשף מהאמצע החוצה.
// הקובץ הזה שומר שהעותק תמיד זהה לטקסט, גם כשהוא משתנה
// (למשל [Classic View] ← [Playful View], או [Say Hi] ← [Copied!])
// ==========================================

const underlined = document.querySelectorAll('.hero-link:not(.hero-link-two-lines), .hero-link-line');

function copyText(element) {
  element.dataset.text = element.textContent;
}

const watcher = new MutationObserver((changes) => {
  for (const change of changes) {
    const element = change.target.nodeType === Node.TEXT_NODE ? change.target.parentElement : change.target;
    copyText(element);
  }
});

for (const element of underlined) {
  copyText(element);
  watcher.observe(element, { childList: true, characterData: true, subtree: true });
}
