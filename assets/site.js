document.getElementById('year').textContent = new Date().getFullYear();
  // hero background video — play at half speed, and not at all if the
  // visitor has asked for reduced motion
  (function(){
    var v = document.querySelector('.hero-video');
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){ v.pause(); return; }
    var slow = function(){ try { v.playbackRate = 0.5; } catch(e){} };
    v.addEventListener('loadedmetadata', slow);
    slow();
  })();

  var burger = document.getElementById('burger');
  var mnav = document.getElementById('mobileNav');
  burger.addEventListener('click', function(){ mnav.classList.toggle('open'); });
  mnav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ mnav.classList.remove('open'); });
  });
