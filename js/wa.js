/* WhatsApp quick form.
   On every page, "Chat on WhatsApp" buttons open a short form in a pop-up.
   On smeally.com/chat (the link you share outside the website) the same form sits on the page.
   It records the visit by email (Web3Forms), then opens WhatsApp with the answers typed in.
   If anything fails, WhatsApp still opens. */
(function () {
  var form = document.getElementById('wa-form');
  if (!form) return;
  var dlg = document.getElementById('wa-dialog');
  var err = document.getElementById('wa-error');
  var cfg = window.SME_ALLY || {};
  var number = cfg.WHATSAPP || '2348155720669';

  if (dlg && typeof dlg.showModal === 'function') {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-wa]');
      if (!a || a.id === 'cal-wa') return;
      e.preventDefault();
      err.hidden = true;
      dlg.showModal();
      setTimeout(function () { document.getElementById('wa-name').focus(); }, 50);
    });
    document.getElementById('wa-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = function (n) { return (form.elements[n] && form.elements[n].value || '').trim(); };
    var name = v('name'), biz = v('business'), kind = v('kind'), need = v('need');
    if (!name) { err.hidden = false; form.elements.name.focus(); return; }

    var msg = (form.getAttribute('data-intro') || 'Hello SME Ally.') + '\n\nName: ' + name +
      (biz ? '\nBusiness: ' + biz : '') + (kind ? '\nKind of business: ' + kind : '') +
      (need ? '\n\n' + need : '');

    if (cfg.FORM_KEY && cfg.FORM_KEY.indexOf('PASTE') !== 0) {
      try {
        fetch('https://api.web3forms.com/submit', {
          method: 'POST', keepalive: true,
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: cfg.FORM_KEY,
            subject: 'WhatsApp chat started: ' + name + (biz ? ' (' + biz + ')' : ''),
            from_name: 'SME Ally website',
            'Name': name, 'Business name': biz, 'Kind of business': kind, 'What they need': need,
            'Came from': location.pathname === '/chat' || location.pathname === '/chat.html' ? 'Your shared link smeally.com/chat' : 'The website (' + location.pathname + ')',
            'Note': 'They were sent to WhatsApp. Check your WhatsApp for their message.'
          })
        });
      } catch (x) {}
    }
    if (dlg && dlg.open) dlg.close();
    location.href = 'https://wa.me/' + number + '?text=' + encodeURIComponent(msg);
  });
})();
