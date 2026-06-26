// ============================================================
// BOOT SEQUENCE
// ============================================================
(function boot() {
  const bootEl = document.getElementById('boot');
  if (!bootEl) return;
  const lines = bootEl.querySelectorAll('.line');
  let i = 0;
  function next() {
    if (i >= lines.length) {
      setTimeout(() => bootEl.classList.add('hidden'), 420);
      return;
    }
    lines[i].classList.add('show');
    i++;
    setTimeout(next, 260);
  }
  setTimeout(next, 200);
  // safety: never block the page for more than 3.5s
  setTimeout(() => bootEl.classList.add('hidden'), 3500);
})();

// ============================================================
// SCROLL PROGRESS BAR
// ============================================================
(function scrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  function update() {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = (isNaN(scrolled) ? 0 : scrolled) + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// ============================================================
// CURSOR GLOW
// ============================================================
(function cursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;
  if (window.matchMedia('(pointer: coarse)').matches) { glow.style.display = 'none'; return; }
  window.addEventListener('mousemove', (e) => {
    glow.style.setProperty('--cx', e.clientX + 'px');
    glow.style.setProperty('--cy', e.clientY + 'px');
  }, { passive: true });
})();

// ============================================================
// MOBILE NAV TOGGLE
// ============================================================
(function navToggle() {
  const btn = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    links.classList.toggle('open');
    btn.setAttribute('aria-expanded', links.classList.contains('open'));
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
})();

// ============================================================
// ACTIVE NAV LINK ON SCROLL
// ============================================================
(function activeNav() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length) return;
  const map = {};
  navLinks.forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) map[href.slice(1)] = a;
  });
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const link = map[entry.target.id];
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
  sections.forEach(s => obs.observe(s));
})();

// ============================================================
// SCROLL REVEAL
// ============================================================
(function reveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => obs.observe(el));
})();

// ============================================================
// TYPING ANIMATION (hero)
// ============================================================
(function typingHero() {
  const el = document.getElementById('typeText');
  if (!el) return;
  const words = ['Aspiring Software Engineer', 'AI Enthusiast', 'Problem Solver', 'Computer Science Engineer', 'Cloud Learner'];
  let wi = 0, ci = 0, deleting = false;

  function tick() {
    const word = words[wi];
    if (!deleting) {
      ci++;
      el.textContent = word.slice(0, ci);
      if (ci === word.length) {
        deleting = true;
        setTimeout(tick, 1600);
        return;
      }
      setTimeout(tick, 65);
    } else {
      ci--;
      el.textContent = word.slice(0, ci);
      if (ci === 0) {
        deleting = false;
        wi = (wi + 1) % words.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 35);
    }
  }
  tick();
})();

// ============================================================
// PARTICLE BACKGROUND (canvas)
// ============================================================
(function particles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particlesArr = [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = window.innerWidth < 700 ? 35 : 70;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  function makeParticle() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      a: Math.random() * 0.5 + 0.15
    };
  }
  for (let i = 0; i < count; i++) particlesArr.push(makeParticle());

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particlesArr.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(143, 214, 255, ${p.a})`;
      ctx.fill();
    });
    if (!reduceMotion) requestAnimationFrame(draw);
  }
  draw();
})();

// ============================================================
// CONTACT FORM VALIDATION + SUBMISSION (Formspree)
// ============================================================
(function contactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const statusBox = document.getElementById('formStatus');

  function setError(rowId, msg) {
    const row = document.getElementById(rowId);
    if (!row) return;
    row.classList.add('invalid');
    const err = row.querySelector('.form-error');
    if (err) err.textContent = msg;
  }
  function clearError(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    row.classList.remove('invalid');
  }

  function validate(data) {
    let ok = true;
    ['rowName', 'rowEmail', 'rowSubject', 'rowMessage'].forEach(clearError);

    if (!data.name || data.name.trim().length < 2) {
      setError('rowName', 'Enter your name (at least 2 characters).');
      ok = false;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRe.test(data.email.trim())) {
      setError('rowEmail', 'Enter a valid email address.');
      ok = false;
    }
    if (!data.subject || data.subject.trim().length < 2) {
      setError('rowSubject', 'Add a short subject.');
      ok = false;
    }
    if (!data.message || data.message.trim().length < 10) {
      setError('rowMessage', 'Message should be at least 10 characters.');
      ok = false;
    }
    return ok;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    statusBox.className = 'form-status';
    statusBox.textContent = '';

    const data = {
      name: form.name.value,
      email: form.email.value,
      subject: form.subject.value,
      message: form.message.value
    };

    if (!validate(data)) {
      statusBox.className = 'form-status error';
      statusBox.textContent = 'Please fix the highlighted fields above.';
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const action = form.getAttribute('action') || '';
    const isConfigured = action && !action.includes('YOUR_FORM_ID');

    try {
      if (isConfigured) {
        const res = await fetch(action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });
        if (res.ok) {
          statusBox.className = 'form-status success';
          statusBox.textContent = "Message sent — I'll get back to you soon.";
          form.reset();
        } else {
          throw new Error('Form endpoint error');
        }
      } else {
        // Fallback: no endpoint configured yet — open a pre-filled mail draft instead.
        const mailto = `mailto:swarnabindhu36@gmail.com?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(data.message + '\n\nFrom: ' + data.name + ' (' + data.email + ')')}`;
        window.location.href = mailto;
        statusBox.className = 'form-status success';
        statusBox.textContent = "Opening your email app to send this message.";
        form.reset();
      }
    } catch (err) {
      statusBox.className = 'form-status error';
      statusBox.textContent = 'Something went wrong sending this. Please email me directly instead.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
})();

// ============================================================
// FOOTER YEAR (kept static per design, but safe-guarded)
// ============================================================
