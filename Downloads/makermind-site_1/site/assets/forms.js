/* ====================================================================
   Enquiry form handling.

   With MM_CONFIG.formEndpoint set, the form is posted in the background
   and the visitor gets an inline confirmation. Without it, the form
   falls back to opening the visitor's mail client with a readable,
   pre-filled message addressed to MM_CONFIG.enquiryEmail.

   Either way the enquiry ends up at the address in config.js.
   ==================================================================== */
(function () {
  'use strict';

  var CFG  = window.MM_CONFIG || {};
  var form = document.getElementById('enquiryForm');
  if (!form) return;

  var statusEl = document.getElementById('formStatus');
  var endpoint = (CFG.formEndpoint || '').trim();
  var to       = CFG.enquiryEmail || 'enquiries@makermindtutoring.com';

  if (endpoint) form.setAttribute('action', endpoint);

  /* nicer labels than the raw field names, for the email body */
  var LABEL = {
    name: 'Name', email: 'Email', phone: 'Phone', year: 'Student year level',
    topic: 'Help needed with', preferred_date: 'Preferred date',
    start_time: 'Start time', end_time: 'Finish time', message: 'Message',
    offer: 'Offer', source: 'Came from'
  };

  function say(kind, text) {
    if (!statusEl) return;
    statusEl.className = 'form-status ' + kind;
    statusEl.textContent = text;
    statusEl.hidden = false;
  }

  /* same, but ending in a real link the visitor can click if their mail
     client did not open on its own */
  function sayWithLink(kind, text, href, label) {
    if (!statusEl) return;
    statusEl.className = 'form-status ' + kind;
    statusEl.textContent = text + ' ';
    var a = document.createElement('a');
    a.id = 'mailtoLink';
    a.href = href;
    a.textContent = label;
    statusEl.appendChild(a);
    statusEl.hidden = false;
  }

  /* the availability picker exposes a human-readable summary */
  function slot() {
    try {
      if (window.Picker && Picker.summary) return Picker.summary();
    } catch (e) {}
    return '';
  }

  function collect() {
    var out = [], seen = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.name === '_gotcha' || el.type === 'submit') return;
      var v = (el.value || '').trim();
      if (!v || seen[el.name]) return;
      seen[el.name] = 1;
      out.push([el.name, v]);
    });
    return out;
  }

  function mailtoFallback() {
    var when = slot();
    /* when the picker gives us a readable summary, use that instead of the
       three raw machine fields it is built from */
    var skip = when ? {preferred_date: 1, start_time: 1, end_time: 1} : {};
    var body = [];
    collect().forEach(function (p) {
      if (!skip[p[0]]) body.push((LABEL[p[0]] || p[0]) + ': ' + p[1]);
    });
    if (when) body.push('Requested slot: ' + when);
    body.push('', 'Sent from makermindtutoring.com');

    var who = (form.elements.name && form.elements.name.value.trim()) || 'website visitor';
    var url = 'mailto:' + encodeURIComponent(to) +
              '?subject=' + encodeURIComponent('Tutoring enquiry — ' + who) +
              '&body='    + encodeURIComponent(body.join('\n'));
    sayWithLink('ok',
      'Your email app should now be open with the enquiry ready to send. ' +
      'If nothing happened, use this link instead:', url, 'email ' + to);
    window.location.href = url;
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();

    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (form.elements._gotcha && form.elements._gotcha.value) return;  // bot

    if (!endpoint) { mailtoFallback(); return; }

    var data = new FormData(form);
    data.delete('_gotcha');
    var when = slot();
    if (when) data.set('requested_slot', when);
    data.set('_subject', 'Tutoring enquiry — ' +
      ((form.elements.name && form.elements.name.value.trim()) || 'website'));
    if (form.elements.email) data.set('_replyto', form.elements.email.value.trim());

    form.classList.add('sending');
    say('', 'Sending&hellip;');
    statusEl.textContent = 'Sending…';

    fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) {
        form.classList.remove('sending');
        if (r.ok) {
          form.reset();
          if (window.Picker && Picker.refresh) Picker.refresh();
          say('ok', 'Thank you — your enquiry is on its way. We reply within two business days.');
        } else {
          say('bad', 'Sorry, that did not send. Please email us at ' + to + ' and we will pick it up.');
        }
      })
      .catch(function () {
        form.classList.remove('sending');
        say('bad', 'Sorry, that did not send — you may be offline. Please email us at ' + to + '.');
      });
  });
})();
