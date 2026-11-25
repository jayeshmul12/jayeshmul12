(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s,c){return (c||document).querySelector(s)};
  var $$ = function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

  /* theme */
  var root = document.documentElement;
  try{ var saved = localStorage.getItem('jm-theme'); if(saved) root.setAttribute('data-theme', saved); }catch(e){}
  $('#themeBtn').addEventListener('click', function(){
    var t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', t);
    try{ localStorage.setItem('jm-theme', t); }catch(e){}
    drawColors();
  });

  /* mobile menu */
  var burger = $('#burger'), links = $('#links');
  burger.addEventListener('click', function(){ burger.classList.toggle('open'); links.classList.toggle('open'); });
  $$('#links a').forEach(function(a){ a.addEventListener('click', function(){ burger.classList.remove('open'); links.classList.remove('open'); }); });

  /* scroll: progress bar, nav state, active link */
  var nav = $('#nav'), bar = $('#progress');
  var secs = $$('main section[id]');
  function onScroll(){
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
    nav.classList.toggle('scrolled', scrollY > 30);
    var cur = '';
    secs.forEach(function(s){ if(s.getBoundingClientRect().top < innerHeight * .4) cur = s.id; });
    $$('#links a').forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#' + cur); });
  }
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* reveal + counters */
  function countUp(el){
    var target = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if(reduce){ el.textContent = pre + target + suf; return; }
    var t0 = performance.now(), dur = 1400;
    (function tick(t){
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(target * e) + suf;
      if(p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      en.target.classList.add('in');
      $$('[data-count]', en.target).forEach(countUp);
      var sh = $('.sec-head', en.target); if(sh) sh.classList.add('in');
      io.unobserve(en.target);
    });
  }, {threshold:.15});
  $$('.reveal').forEach(function(el){ io.observe(el); });

  /* typing */
  var roles = ['Network Engineer','RAN Performance Analyst','Python Automation Enthusiast','4G / 5G KPI Specialist'];
  var tEl = $('#typed'), ri = 0, ci = 0, del = false;
  function type(){
    var w = roles[ri];
    tEl.textContent = w.slice(0, ci);
    if(!del && ci === w.length){ del = true; return setTimeout(type, 1600); }
    if(del && ci === 0){ del = false; ri = (ri + 1) % roles.length; return setTimeout(type, 350); }
    ci += del ? -1 : 1;
    setTimeout(type, del ? 35 : 70);
  }
  if(reduce) tEl.textContent = roles[0]; else type();

  /* tabs */
  $$('.tab').forEach(function(tab){
    tab.addEventListener('click', function(){
      $$('.tab').forEach(function(t){ t.classList.remove('active'); });
      $$('.panel').forEach(function(p){ p.classList.remove('active'); });
      tab.classList.add('active');
      $('#p-' + tab.dataset.tab).classList.add('active');
    });
  });

  /* cursor glow */
  var glow = $('#cursorGlow');
  addEventListener('mousemove', function(e){ glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }, {passive:true});

  /* hero photo 3D tilt */
  var tilt = $('#tilt');
  if(tilt && !reduce){
    var hv = $('.hero-visual');
    hv.addEventListener('mousemove', function(e){
      var r = tilt.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      tilt.style.transform = 'perspective(900px) rotateY(' + x * 14 + 'deg) rotateX(' + -y * 14 + 'deg)';
    });
    hv.addEventListener('mouseleave', function(){ tilt.style.transform = ''; });
  }

  /* project cards: tilt + spotlight */
  $$('.tilt-card').forEach(function(c){
    c.addEventListener('mousemove', function(e){
      var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
      if(!reduce) c.style.transform = 'perspective(900px) rotateX(' + ((y / r.height - .5) * -6) + 'deg) rotateY(' + ((x / r.width - .5) * 6) + 'deg) translateY(-4px)';
    });
    c.addEventListener('mouseleave', function(){ c.style.transform = ''; });
  });

  /* magnetic buttons */
  if(!reduce) $$('.magnetic').forEach(function(b){
    b.addEventListener('mousemove', function(e){
      var r = b.getBoundingClientRect();
      b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .15) + 'px,' + ((e.clientY - r.top - r.height / 2) * .25) + 'px)';
    });
    b.addEventListener('mouseleave', function(){ b.style.transform = ''; });
  });

  /* network canvas background */
  var cv = $('#net'), ctx = cv.getContext('2d'), W, H, nodes = [], mouse = {x:-999,y:-999}, col = '47,155,255';
  function drawColors(){ col = root.getAttribute('data-theme') === 'light' ? '11,111,214' : '47,155,255'; cv.style.opacity = root.getAttribute('data-theme') === 'light' ? .45 : .7; }
  function resize(){
    var d = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    var n = Math.min(Math.floor(W * H / 20000), 70);
    nodes = [];
    for(var i = 0; i < n; i++) nodes.push({x:Math.random() * W, y:Math.random() * H, vx:(Math.random() - .5) * .35, vy:(Math.random() - .5) * .35, r:Math.random() * 1.6 + .8});
  }
  addEventListener('resize', resize);
  addEventListener('mousemove', function(e){ mouse.x = e.clientX; mouse.y = e.clientY; }, {passive:true});
  function frame(){
    ctx.clearRect(0, 0, W, H);
    for(var i = 0; i < nodes.length; i++){
      var a = nodes[i];
      a.x += a.vx; a.y += a.vy;
      if(a.x < 0 || a.x > W) a.vx *= -1;
      if(a.y < 0 || a.y > H) a.vy *= -1;
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fillStyle = 'rgba(' + col + ',.8)'; ctx.fill();
      for(var j = i + 1; j < nodes.length; j++){
        var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
        if(d < 18000){ ctx.strokeStyle = 'rgba(' + col + ',' + (.22 * (1 - d / 18000)) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      var mx = a.x - mouse.x, my = a.y - mouse.y, md = mx * mx + my * my;
      if(md < 25000){ ctx.strokeStyle = 'rgba(25,224,192,' + (.5 * (1 - md / 25000)) + ')'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    }
    requestAnimationFrame(frame);
  }
  drawColors(); resize();
  if(reduce){ frame = function(){}; } else { frame(); }

  $('#yr').textContent = new Date().getFullYear();
})();
