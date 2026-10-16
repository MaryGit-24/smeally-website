/* Get started form: sends answers by email (Web3Forms), then opens the booking calendar (Cal.com).
   You should not need to edit this file. Settings live in js/config.js. */
(function () {
  var cfg = window.SME_ALLY || {};
  var form = document.getElementById('lead-form');
  if (!form) return;

  var errorBox = document.getElementById('form-error');
  var sendBtn = document.getElementById('send-btn');
  var callNote = document.getElementById('call-note');
  var keyReady = cfg.FORM_KEY && cfg.FORM_KEY.indexOf('PASTE') !== 0;
  var calReady = cfg.CAL_LINK && cfg.CAL_LINK.indexOf('PASTE') !== 0;

  function val(name) {
    var el = form.elements[name];
    return el ? String(el.value || '').trim() : '';
  }
  function wantsCall() {
    var picked = form.querySelector('input[name="call"]:checked');
    return picked ? picked.value : '';
  }
  function show(id) {
    ['step-form', 'step-book', 'step-done'].forEach(function (s) {
      document.getElementById(s).hidden = (s !== id);
    });
    window.scrollTo(0, 0);
  }
  function whatsappLink(intro) {
    var lines = [
      intro,
      'Name: ' + val('name'),
      'Business: ' + val('business'),
      'Kind of business: ' + val('kind'),
      'Based in: ' + val('location'),
      'WhatsApp: ' + val('whatsapp'),
      'Taking my time: ' + val('time_taker'),
      'Free call: ' + (wantsCall() || 'not chosen')
    ];
    return 'https://wa.me/' + (cfg.WHATSAPP || '2348155720669') + '?text=' + encodeURIComponent(lines.join('\n'));
  }
  function showError(html) {
    errorBox.innerHTML = html;
    errorBox.hidden = false;
    errorBox.focus && errorBox.setAttribute('tabindex', '-1');
    errorBox.focus();
  }

  form.addEventListener('change', function (e) {
    if (e.target.name === 'call') callNote.hidden = (wantsCall() !== 'Yes');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorBox.hidden = true;

    // Check the must-have answers
    var missing = [];
    [['name', 'your name'], ['business', 'your business name'], ['whatsapp', 'your WhatsApp number']].forEach(function (f) {
      var el = form.elements[f[0]];
      var empty = !val(f[0]);
      el.setAttribute('aria-invalid', empty ? 'true' : 'false');
      if (empty) missing.push(f[1]);
    });
    var digits = val('whatsapp').replace(/\D/g, '');
    if (val('whatsapp') && digits.length < 8) {
      form.elements.whatsapp.setAttribute('aria-invalid', 'true');
      missing.push('a full WhatsApp number');
    }
    if (!wantsCall()) missing.push('whether you want a free call');
    if (missing.length) {
      showError('Please add ' + missing.join(', ') + '.');
      return;
    }

    if (!keyReady) {
      showError('The form is not switched on yet. Please <a href="' + whatsappLink('Hello SME Ally, here are my details:') + '">send your details on WhatsApp</a> instead.');
      return;
    }

    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';

    var payload = {
      access_key: cfg.FORM_KEY,
      subject: 'New SME Ally enquiry: ' + val('business'),
      from_name: 'SME Ally website',
      botcheck: form.elements.botcheck.checked,
      'Name': val('name'),
      'Business name': val('business'),
      'Kind of business': val('kind'),
      'City and country': val('location'),
      'WhatsApp': val('whatsapp'),
      'What is taking most of their time': val('time_taker'),
      'Wants a free call': wantsCall(),
      'WhatsApp them': 'https://wa.me/' + digits
    };

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || !data.success) throw new Error((data && data.message) || 'not sent');
        afterSend();
      })
      .catch(function () {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
        showError('Sorry, that did not go through. Your connection may be weak. Try again, or <a href="' +
          whatsappLink('Hello SME Ally, here are my details:') + '">send it on WhatsApp</a> with one tap.');
      });
  });

  function afterSend() {
    if (wantsCall() === 'Yes' && calReady) {
      show('step-book');
      document.getElementById('cal-wa').href = whatsappLink('Hello SME Ally, I just filled the form and I would like to book a call.');
      openCalendar();
    } else if (wantsCall() === 'Yes') {
      document.getElementById('done-text').textContent = "We'll message you on WhatsApp within a day to fix a time for your call.";
      show('step-done');
    } else {
      show('step-done');
    }
  }

  function openCalendar() {
    /* Official Cal.com embed loader */
    (function (C, A, L) { var p = function (a, ar) { a.q.push(ar); }; var d = C.document; C.Cal = C.Cal || function () { var cal = C.Cal; var ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; } if (ar[0] === L) { var api = function () { p(api, arguments); }; var namespace = ar[1]; api.q = api.q || []; if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, 'https://app.cal.com/embed/embed.js', 'init');

    Cal('init', { origin: 'https://cal.com' });
    Cal('inline', {
      elementOrSelector: '#cal-box',
      calLink: cfg.CAL_LINK,
      layout: 'month_view',
      config: {
        name: val('name'),
        notes: 'Business: ' + val('business') + ' (' + val('kind') + ', ' + val('location') + '). WhatsApp: ' + val('whatsapp') + '. Taking their time: ' + val('time_taker'),
        theme: 'dark'
      }
    });
    Cal('ui', {
      theme: 'dark',
      cssVarsPerTheme: { dark: { 'cal-brand': '#E9C46A', 'cal-brand-text': '#0B0B0C' } },
      hideEventTypeDetails: false,
      layout: 'month_view'
    });
    Cal('on', {
      action: 'bookingSuccessful',
      callback: function () {
        document.getElementById('done-text').textContent = "Your call is booked. Check your email for the details. We'll also remind you on WhatsApp.";
        show('step-done');
      }
    });
  }
})();
