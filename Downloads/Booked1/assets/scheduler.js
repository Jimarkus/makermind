/* ====================================================================
   Real booking calendar.

   If MM_CONFIG.scheduler names a provider, the live scheduler is
   embedded and the built-in date/time picker is removed — so visitors
   can only choose times you are genuinely free, and every booking lands
   in your own dashboard and calendar.

   With no provider set, nothing happens here and the manual picker
   stays in place as a placeholder.

   NOTE ON WHAT CAN AND CANNOT BE STYLED
   The scheduler renders inside an iframe served from Calendly's own
   domain. Nothing on this page can reach inside it, so its internals
   cannot be rearranged, restyled or reordered. The only levers are the
   query parameters Calendly publishes (below) and the size of the box
   the iframe sits in.
   ==================================================================== */
(function () {
  'use strict';

  var CFG    = (window.MM_CONFIG && window.MM_CONFIG.scheduler) || {};
  var host   = document.getElementById('schedEmbed');
  var manual = document.getElementById('schedManual');
  if (!host) return;

  var provider = (CFG.provider || '').trim().toLowerCase();
  /* accept either the bare path ("me/30min") or a full booking URL pasted
     straight out of Calendly or Cal.com */
  var user = (CFG.user || '').trim()
    .replace(/^https?:\/\/(www\.)?(calendly\.com|cal\.com|app\.cal\.com)\//i, '')
    .replace(/^\/+|\/+$/g, '')
    .split('?')[0];
  if (!provider || !user) return;          // keep the manual picker

  var hideDetails = CFG.hideDetails !== false;      // default: hide
  var height      = parseInt(CFG.height, 10) || 620;

  /* the embed replaces the manual fields entirely */
  if (manual) manual.remove();
  host.hidden = false;
  host.style.setProperty('--sched-h', height + 'px');

  function note(text) {
    var p = document.createElement('p');
    p.className = 'sched-note';
    p.textContent = text;
    host.parentNode.insertBefore(p, host.nextSibling);
  }

  function load(src, done) {
    var t = document.createElement('script');
    t.src = src; t.async = true;
    t.onload = done;
    t.onerror = function () {
      host.innerHTML = '';
      note('The booking calendar could not load. Please call 0435 285 530 or email us instead.');
    };
    document.head.appendChild(t);
  }

  if (provider === 'cal') {
    host.setAttribute('data-cal-namespace', '');
    load('https://app.cal.com/embed/embed.js', function () {
      try {
        window.Cal('inline', { elementOrSelector: '#schedEmbed', calLink: user });
        window.Cal('ui', { hideEventTypeDetails: hideDetails, layout: 'month_view' });
      } catch (e) {
        note('The booking calendar could not start. Please call 0435 285 530 instead.');
      }
    });

  } else if (provider === 'calendly') {
    /* hide_event_type_details drops Calendly's own header — the event
       name, the duration row and the description — leaving just the
       calendar. hide_gdpr_banner drops the cookie strip. Both are
       documented, no-cost parameters. */
    var q = ['hide_gdpr_banner=1'];
    if (hideDetails) q.push('hide_event_type_details=1');
    /* a booking that came from a scanned business card is tagged so it is
       identifiable in the Calendly dashboard (book.html sets MM_OFFER) */
    if (window.MM_OFFER) {
      q.push('utm_source=website');
      q.push('utm_campaign=first-session-free');
      q.push('utm_content=' + encodeURIComponent(window.MM_OFFER));
    }

    var box = document.createElement('div');
    box.className = 'calendly-inline-widget';
    box.setAttribute('data-url', 'https://calendly.com/' + user + '?' + q.join('&'));
    box.setAttribute('data-resize', 'true');   // let it shrink to its content
    box.style.height = height + 'px';
    host.appendChild(box);
    load('https://assets.calendly.com/assets/external/widget.js', function () {});

    /* ---- send the visitor to a real confirmation page ----------------
       Calendly posts a message to this page when a booking completes.
       The iframe's own URL never reaches the parent window, so this is
       the only way the site can know a booking actually happened — and
       therefore the only way an ads or analytics conversion measured on
       a page view can mean "booked" rather than "opened the calendar".

       Calendly's own "redirect to an external site" setting is the wrong
       tool here: inside an inline embed it shows the invitee a warning
       screen first. Leave the event type set to "Display confirmation
       page" and let this handle it.

       Set scheduler.confirmPage to '' in config.js to switch this off.

       Every calendly.* message is logged to the console on purpose. If a
       booking does not redirect, open the browser console: the version
       line below tells you whether this file is the one deployed, and
       the event lines tell you whether Calendly is talking to the page
       at all. */
    var confirmPage = CFG.confirmPage === undefined ? 'booked.html'
                                                    : CFG.confirmPage;
    var DEBUG = 'MakerMind scheduler v2';
    try {
      console.info('[MakerMind] ' + DEBUG + ' — confirmPage: ' +
                   (confirmPage || '(disabled)'));
    } catch (e) {}

    if (confirmPage) {
      window.addEventListener('message', function (e) {
        /* Calendly serves the frame from calendly.com, but accept any
           calendly.com subdomain rather than one exact string, so a
           change on their side does not silently break the redirect. */
        var fromCalendly = /^https:\/\/([a-z0-9-]+\.)*calendly\.com$/i
                             .test(e.origin || '');
        var d = e.data;
        if (typeof d === 'string') {            // some builds post JSON text
          try { d = JSON.parse(d); } catch (err) { return; }
        }
        if (!d || typeof d.event !== 'string' ||
            d.event.indexOf('calendly.') !== 0) return;

        try { console.info('[MakerMind] Calendly event:', d.event,
                           'from', e.origin); } catch (err) {}

        if (!fromCalendly) {
          try { console.warn('[MakerMind] ignored a Calendly-looking ' +
                             'message from an unexpected origin: ' + e.origin);
          } catch (err) {}
          return;
        }
        if (d.event !== 'calendly.event_scheduled') return;

        var to = confirmPage;
        if (window.MM_OFFER) {
          to += (to.indexOf('?') === -1 ? '?' : '&') +
                'offer=' + encodeURIComponent(window.MM_OFFER);
        }
        try { console.info('[MakerMind] booking confirmed, going to ' + to); }
        catch (err) {}
        window.location.href = to;
      });
    }

  } else {
    host.hidden = true;
    if (manual) host.parentNode.insertBefore(manual, host);
    return;
  }

  /* Only worth explaining when the visitor has no say in the length. With
     the duration picker showing they choose it themselves, so the note
     would just be noise. */
  if (hideDetails) {
    note('Consults run about 20 minutes. The slot is booked a little longer ' +
         'so there is room to go over if you need it.');
  }
})();
