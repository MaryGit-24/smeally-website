/* Shop / Farm / Service tabs on the What we do page */
(function () {
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    function pick(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { pick(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') pick(tabs[(i + 1) % tabs.length], true);
        if (e.key === 'ArrowLeft') pick(tabs[(i - 1 + tabs.length) % tabs.length], true);
      });
    });
  });
})();
