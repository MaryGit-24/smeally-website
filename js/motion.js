/* Gentle movement for the SME Ally website.
   1. The Home page chat card plays out like a real conversation.
   2. Sections rise softly into view as you scroll.
   Everything is switched off for visitors whose phone is set to "reduce motion".
   If this file ever fails to load, the site still shows everything, just without movement. */
(function () {
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('motion');

  /* ---------- 2. Soft rise on scroll ---------- */
  var selectors = [
    'main h2', '.grid > *', '.steps > *', '.rule-item', '.service',
    '.faq-item', '.svc', 'details.faq', '.timeline li', '.step-card', '.pills', '.cta-box', '.cta-band .cta-inner', '.faith', '.big-quote', '.credit'
  ];
  var items = document.querySelectorAll(selectors.join(','));
  var seen = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add('in');
      setTimeout(function () { el.style.transitionDelay = ''; }, 900); // so hover lifts respond instantly
      seen.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  Array.prototype.forEach.call(items, function (el) {
    if (el.closest('.hero')) return; // the top of each page is already in view, leave it still
    // small stagger for cards sitting side by side
    var parent = el.parentElement;
    if (parent && (parent.classList.contains('grid') || parent.classList.contains('steps'))) {
      var i = Array.prototype.indexOf.call(parent.children, el);
      el.style.transitionDelay = (i * 70) + 'ms';
    }
    el.classList.add('reveal');
    seen.observe(el);
  });

  /* ---------- 1. Chat card plays out ---------- */
  var chat = document.getElementById('hero-chat');
  if (!chat) return;
  var bubbles = chat.querySelectorAll('.bubble');
  var foot = chat.querySelector('.chat-foot');
  chat.style.minHeight = chat.offsetHeight + 'px'; // keep the card the same size while it plays
  chat.classList.add('playing');

  var typing = document.createElement('div');
  typing.className = 'bubble ally typing';
  typing.setAttribute('aria-hidden', 'true');
  typing.innerHTML = '<span></span><span></span><span></span>';

  // [bubble index, wait before it appears in ms]
  var plan = [[0, 500], [1, 1900], [2, 1300], [3, 1700]];
  var step = 0;

  function next() {
    if (step >= plan.length) {
      setTimeout(function () { foot.classList.add('show'); }, 500);
      return;
    }
    var b = bubbles[plan[step][0]];
    var wait = plan[step][1];
    var fromAlly = !b.classList.contains('them');
    if (fromAlly) {
      // show "typing" dots first, then the reply
      chat.insertBefore(typing, b);
      setTimeout(function () { typing.classList.add('show'); }, 150);
    }
    setTimeout(function () {
      if (typing.parentNode) typing.parentNode.removeChild(typing);
      typing.classList.remove('show');
      b.classList.add('show');
      step++;
      next();
    }, wait);
  }

  var started = false;
  var watch = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !started) {
      started = true;
      watch.disconnect();
      next();
    }
  }, { threshold: 0.4 });
  watch.observe(chat);
})();
