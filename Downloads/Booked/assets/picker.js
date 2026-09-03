/* ====================================================================
   AVAILABILITY PICKER
   --------------------------------------------------------------------
   BOOKED holds the times that are already taken, keyed by date:

       BOOKED['2026-09-14'] = [['16:00','17:00'], ['17:30','18:30']];

   The sample entries below are generated relative to today so the
   greyed-out states are visible while you are testing. DELETE the
   seedSample() call once you are wiring this to real data.

   To connect a real calendar, replace seedSample() with a fetch that
   fills BOOKED in the same shape, then call Picker.refresh():

       fetch('/api/booked').then(r => r.json())
         .then(data => { Object.assign(BOOKED, data); Picker.refresh(); });

   Anything not listed in BOOKED is treated as available.
   ==================================================================== */
var Picker = (function(){
  'use strict';

  var OPEN = '09:00', CLOSE = '20:00', STEP = 30, MAX_DAYS_AHEAD = 120;
  var BOOKED = {};

  var $ = function(id){ return document.getElementById(id); };
  var trigger = $('dateTrigger');
  if (!trigger) return { refresh:function(){} };          // page has no picker

  var pop = $('calPop'), grid = $('calGrid'), title = $('calTitle'),
      prev = $('calPrev'), next = $('calNext'),
      label = $('dateLabel'), dateField = $('dateField'),
      startSel = $('startTime'), endSel = $('endTime'), note = $('slotNote');

  /* ---------- helpers ---------- */
  function toMin(t){ var p = t.split(':'); return (+p[0]) * 60 + (+p[1]); }
  function toHHMM(m){ return String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0'); }
  function pretty(t){
    var m = toMin(t), h = Math.floor(m/60), mm = m%60, ap = h >= 12 ? 'pm' : 'am';
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    return h12 + (mm ? ':' + String(mm).padStart(2,'0') : ':00') + ap;
  }
  function iso(d){
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function startOfToday(){ var d = new Date(); d.setHours(0,0,0,0); return d; }

  function slotStarts(){
    var out = [], t = toMin(OPEN), end = toMin(CLOSE);
    for (; t < end; t += STEP) out.push(toHHMM(t));
    return out;
  }
  function ranges(dateStr){ return BOOKED[dateStr] || []; }
  /* does [a,b) collide with anything booked that day? */
  function clashes(dateStr, a, b){
    var r = ranges(dateStr);
    for (var i = 0; i < r.length; i++){
      if (a < toMin(r[i][1]) && b > toMin(r[i][0])) return true;
    }
    return false;
  }
  function freeStarts(dateStr){
    return slotStarts().filter(function(s){
      var a = toMin(s);
      return !clashes(dateStr, a, a + STEP);
    });
  }
  function dayFull(dateStr){ return freeStarts(dateStr).length === 0; }

  /* ---------- sample data (delete for production) ---------- */
  function seedSample(){
    var base = startOfToday();
    var plan = {
      1:  [['16:00','17:00'], ['17:30','18:30']],
      2:  [['09:00','20:00']],                       // a fully booked day
      3:  [['10:00','11:00'], ['15:00','16:30']],
      5:  [['18:00','19:30']],
      7:  [['09:00','12:00']],
      8:  [['13:00','14:00'], ['16:00','18:00']],
      12: [['09:00','20:00']],                       // another fully booked day
      14: [['10:30','11:30']]
    };
    Object.keys(plan).forEach(function(off){
      var d = new Date(base); d.setDate(d.getDate() + (+off));
      BOOKED[iso(d)] = plan[off];
    });
  }
  seedSample();

  /* ---------- state ---------- */
  var today = startOfToday();
  var limit = new Date(today); limit.setDate(limit.getDate() + MAX_DAYS_AHEAD);
  var view = new Date(today.getFullYear(), today.getMonth(), 1);
  var selected = null;                                  // Date

  /* ---------- calendar ---------- */
  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

  function draw(){
    title.textContent = MONTHS[view.getMonth()] + ' ' + view.getFullYear();
    grid.innerHTML = '';

    var first = new Date(view.getFullYear(), view.getMonth(), 1);
    var lead = (first.getDay() + 6) % 7;                 // Monday-first
    var days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

    for (var i = 0; i < lead; i++){
      var b = document.createElement('div');
      b.className = 'cal-day blank';
      grid.appendChild(b);
    }
    for (var day = 1; day <= days; day++){
      var d = new Date(view.getFullYear(), view.getMonth(), day);
      var ds = iso(d);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day';
      btn.textContent = day;
      btn.setAttribute('data-date', ds);

      var past = d < today, beyond = d > limit, full = dayFull(ds);
      if (past || beyond || full){
        btn.disabled = true;
        if (full && !past && !beyond){
          btn.classList.add('full');
          btn.title = 'Fully booked';
          btn.setAttribute('aria-label', d.toDateString() + ' — fully booked');
        }
      } else if (ranges(ds).length){
        btn.classList.add('has');
        btn.title = 'Some times already booked';
      }
      if (+d === +today) btn.classList.add('today');
      if (selected && +d === +selected) { btn.classList.add('sel'); btn.setAttribute('aria-current','date'); }
      grid.appendChild(btn);
    }

    prev.disabled = (view.getFullYear() === today.getFullYear() && view.getMonth() === today.getMonth());
    next.disabled = (view.getFullYear() === limit.getFullYear() && view.getMonth() === limit.getMonth());
  }

  function openCal(){
    pop.hidden = false;
    trigger.setAttribute('aria-expanded','true');
    draw();
    var f = grid.querySelector('.cal-day.sel') || grid.querySelector('.cal-day:not(:disabled):not(.blank)');
    if (f) f.focus();
  }
  function closeCal(back){
    pop.hidden = true;
    trigger.setAttribute('aria-expanded','false');
    if (back) trigger.focus();
  }

  function choose(ds){
    var p = ds.split('-');
    selected = new Date(+p[0], +p[1] - 1, +p[2]);
    dateField.value = ds;
    label.textContent = selected.toLocaleDateString(undefined,
      { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    trigger.classList.remove('empty');
    fillStarts(ds);
    closeCal(true);
  }

  /* ---------- time selects ---------- */
  function fillStarts(ds){
    var free = freeStarts(ds), all = slotStarts();
    startSel.innerHTML = '';
    startSel.appendChild(new Option('Select a start time', ''));
    all.forEach(function(t){
      var ok = free.indexOf(t) !== -1;
      var o = new Option(pretty(t) + (ok ? '' : '  —  booked'), t);
      o.disabled = !ok;
      startSel.appendChild(o);
    });
    startSel.disabled = false;
    startSel.value = '';
    endSel.innerHTML = '';
    endSel.appendChild(new Option('Pick a start time', ''));
    endSel.disabled = true;

    var taken = all.length - free.length;
    note.className = 'slotnote';
    note.textContent = taken
      ? taken + ' of ' + all.length + ' start times are already booked on this date — those appear greyed out.'
      : 'Every time is free on this date. Sessions run in 30-minute blocks.';
  }

  function fillEnds(ds, start){
    var a = toMin(start), close = toMin(CLOSE);
    endSel.innerHTML = '';
    endSel.appendChild(new Option('Select a finish time', ''));
    var any = false;
    for (var e = a + STEP; e <= close; e += STEP){
      var ok = !clashes(ds, a, e);                       // the whole block must be clear
      var mins = e - a;
      var dur = mins >= 60
        ? (mins/60 % 1 ? (mins/60).toFixed(1) : mins/60) + (mins === 60 ? ' hr' : ' hrs')
        : mins + ' min';
      var o = new Option(pretty(toHHMM(e)) + '  (' + dur + ')' + (ok ? '' : '  —  booked'), toHHMM(e));
      o.disabled = !ok;
      if (ok) any = true;
      endSel.appendChild(o);
    }
    endSel.disabled = false;
    endSel.value = '';
    if (!any){
      note.className = 'slotnote warn';
      note.textContent = 'That start time butts up against a booking. Try an earlier slot.';
    }
  }

  /* ---------- events ---------- */
  trigger.addEventListener('click', function(){ pop.hidden ? openCal() : closeCal(true); });
  prev.addEventListener('click', function(){ view.setMonth(view.getMonth() - 1); draw(); });
  next.addEventListener('click', function(){ view.setMonth(view.getMonth() + 1); draw(); });

  grid.addEventListener('click', function(e){
    var b = e.target.closest('.cal-day');
    if (b && !b.disabled && b.dataset.date) choose(b.dataset.date);
  });

  grid.addEventListener('keydown', function(e){
    var keys = { ArrowLeft:-1, ArrowRight:1, ArrowUp:-7, ArrowDown:7 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    var cells = Array.prototype.slice.call(grid.querySelectorAll('.cal-day:not(.blank)'));
    var i = cells.indexOf(document.activeElement);
    if (i === -1) return;
    var j = i + keys[e.key];
    while (j >= 0 && j < cells.length && cells[j].disabled) j += (keys[e.key] > 0 ? 1 : -1);
    if (j >= 0 && j < cells.length) cells[j].focus();
  });

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && !pop.hidden) closeCal(true);
  });
  document.addEventListener('mousedown', function(e){
    if (!pop.hidden && !pop.contains(e.target) && !trigger.contains(e.target)) closeCal(false);
  });

  startSel.addEventListener('change', function(){
    if (!startSel.value){ endSel.innerHTML=''; endSel.appendChild(new Option('Pick a start time','')); endSel.disabled = true; return; }
    fillEnds(dateField.value, startSel.value);
  });

  draw();

  return {
    refresh: function(){ draw(); if (dateField.value) fillStarts(dateField.value); },
    booked: BOOKED,
    /* human-readable summary for the enquiry email */
    summary: function(){
      if (!dateField.value) return '';
      var s = startSel.value, e = endSel.value;
      return label.textContent + (s && e ? ', ' + pretty(s) + ' – ' + pretty(e) : '');
    }
  };
})();
