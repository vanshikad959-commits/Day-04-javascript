/* ==========================================================
   Orbits. – Day 4: JavaScript Fundamentals & DOM Manipulation
   ----------------------------------------------------------
   Modules (each is a small function called from init()):
     1. Helpers & event log
     2. Theme toggle (dark / light)
     3. Digital clock & time-based greeting
     4. Responsive navigation menu + active link highlight
     5. 3D orbit scene (mouseover, mouseleave, click, dblclick)
     6. Event playground (click, dblclick, mouseover, mouseleave,
        keypress, input, submit)
     7. Random quote generator
     8. Character counter + contact form
     9. Client-side form validation
    10. Footer year
   ========================================================== */

'use strict'; // catch common mistakes early

/* ----------------------------------------------------------
   1. Helpers & event log
   ---------------------------------------------------------- */

// Short selectors (arrow functions)
const $  = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Shared application state (object)
const state = {
  clicks: 0,
  quotesShown: 0,
  lastQuoteIndex: -1,
  accentIndex: 0,
  events: [],          // array of { name, time }
  maxLogItems: 6,
  simple: false        // simplified view (turns the space canvas off)
};

// Zero-pad numbers for the clock: 7 -> "07"
const pad = (n) => String(n).padStart(2, '0');

/**
 * Add an entry to the on-page event log.
 * @param {string} name - event name, e.g. "click"
 */
const logEvent = (name) => {
  const now = new Date();
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  state.events.unshift({ name, time });                 // newest first
  if (state.events.length > state.maxLogItems) state.events.pop();

  const list = $('#eventLog');
  list.innerHTML = '';                                  // clear old items

  // Loop through the array and build the list
  for (const item of state.events) {
    const li = document.createElement('li');
    li.innerHTML = `<b>${item.name}</b><time>${item.time}</time>`;
    list.appendChild(li);
  }
};

/* ----------------------------------------------------------
   2. Theme toggle
   ---------------------------------------------------------- */
const initTheme = () => {
  const root = document.documentElement;
  const button = $('#themeToggle');
  const label = $('.label', button);

  // Show the mode the button will switch TO
  const apply = (theme) => {
    root.dataset.theme = theme;
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    label.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  };

  // Use the saved choice, otherwise start in dark mode
  let saved = null;
  try { saved = localStorage.getItem('orbits-theme'); } catch (e) { /* storage blocked */ }
  apply(saved === 'light' ? 'light' : 'dark');

  button.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('orbits-theme', next); } catch (e) { /* ignore */ }
  });
};

/* ----------------------------------------------------------
   3. Digital clock & dynamic greeting
   ---------------------------------------------------------- */
const getGreeting = (hour) => {
  if (hour < 5)  return 'Working late?';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
};

const initClock = () => {
  const timeEl = $('#clockTime');
  const dateEl = $('#clockDate');
  const greetEl = $('#greeting');

  const tick = () => {
    const now = new Date();
    timeEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    dateEl.textContent = now.toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    greetEl.textContent = getGreeting(now.getHours());
  };

  tick();                       // show immediately
  setInterval(tick, 1000);      // then update every second
};

/* ----------------------------------------------------------
   4. Responsive navigation + active link
   ---------------------------------------------------------- */
const initNav = () => {
  const menu = $('#navMenu');
  const button = $('#menuBtn');

  const setOpen = (open) => {
    menu.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  button.addEventListener('click', () => setOpen(!menu.classList.contains('open')));

  // Close after choosing a link
  $$('a', menu).forEach((link) => link.addEventListener('click', () => setOpen(false)));

  // Close with Escape
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  // Highlight the link for the section currently in view
  const links = $$('a', menu);
  const sections = links.map((l) => $(l.getAttribute('href')));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((s) => s && observer.observe(s));
};

/* ----------------------------------------------------------
   5. 3D orbit scene
   ---------------------------------------------------------- */
const initScene = () => {
  const scene = $('#scene');
  const system = $('#system');
  const planet = $('#planet');
  const accents = ['violet', 'magenta', 'cyan'];   // array of palettes

  // Tilt the whole system toward the pointer
  scene.addEventListener('mousemove', (e) => {
    const rect = scene.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 .. 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    system.style.setProperty('--ty', `${x * 24}deg`);
    system.style.setProperty('--tx', `${-y * 24}deg`);
  });

  // Reset the tilt when the pointer leaves
  scene.addEventListener('mouseleave', () => {
    system.style.setProperty('--tx', '0deg');
    system.style.setProperty('--ty', '0deg');
  });

  // Pause the orbits while hovering the planet
  planet.addEventListener('mouseover', () => { system.classList.add('paused'); logEvent('mouseover'); });
  planet.addEventListener('mouseleave', () => { system.classList.remove('paused'); logEvent('mouseleave'); });

  // Click: pulse
  planet.addEventListener('click', () => {
    planet.classList.remove('pulse');
    void planet.offsetWidth;                 // restart the CSS animation
    planet.classList.add('pulse');
    logEvent('click');
  });

  // Double-click: next colour palette
  planet.addEventListener('dblclick', () => {
    state.accentIndex = (state.accentIndex + 1) % accents.length;
    document.documentElement.dataset.accent = accents[state.accentIndex];
    logEvent('dblclick');
  });
};

/* ----------------------------------------------------------
   6. Event playground
   ---------------------------------------------------------- */
const initPlayground = () => {
  // click -> counter
  const clickBtn = $('#clickBtn');
  const clickCount = $('#clickCount');
  clickBtn.addEventListener('click', () => {
    state.clicks++;
    clickCount.textContent = state.clicks;
    logEvent('click');
  });

  // dblclick -> flip card (also works with the keyboard via Enter)
  const dblCard = $('#dblCard');
  const dblText = $('#dblText');
  const flip = () => {
    const flipped = dblCard.classList.toggle('flipped');
    dblText.textContent = flipped
      ? 'Flipped! Double-click again to reset.'
      : 'Double-click this card to flip its state.';
    logEvent('dblclick');
  };
  dblCard.addEventListener('dblclick', flip);
  dblCard.addEventListener('keydown', (e) => { if (e.key === 'Enter') flip(); });

  // mouseover / mouseleave -> highlight card
  const hoverCard = $('#hoverCard');
  const hoverText = $('#hoverText');
  hoverCard.addEventListener('mouseover', () => {
    hoverCard.classList.add('hot');
    hoverText.textContent = 'The mouse is over this card.';
    logEvent('mouseover');
  });
  hoverCard.addEventListener('mouseleave', () => {
    hoverCard.classList.remove('hot');
    hoverText.textContent = 'The mouse has left. Move it back over.';
    logEvent('mouseleave');
  });

  // keypress + input -> show last key and length
  const keyInput = $('#keyInput');
  const lastKey = $('#lastKey');
  const keyLen = $('#keyLen');
  keyInput.addEventListener('keypress', (e) => {
    lastKey.textContent = e.key === ' ' ? 'Space' : e.key;
    logEvent('keypress');
  });
  keyInput.addEventListener('input', () => {
    keyLen.textContent = keyInput.value.length;
    logEvent('input');
  });

  // submit -> stay on the page and greet
  const playForm = $('#playForm');
  const playName = $('#playName');
  const playMsg = $('#playMsg');
  playForm.addEventListener('submit', (e) => {
    e.preventDefault();                       // stop the page reload
    const name = playName.value.trim();
    playMsg.textContent = name ? `Hello, ${name}! The page did not reload.` : 'Please type your name first.';
    logEvent('submit');
  });
};

/* ----------------------------------------------------------
   7. Random quote generator
   ---------------------------------------------------------- */
const quotes = [
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
  { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
  { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
  { text: 'Code is like humor. When you have to explain it, it is bad.', author: 'Cory House' },
  { text: 'Programs must be written for people to read, and only incidentally for machines to execute.', author: 'Harold Abelson' },
  { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
  { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
  { text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci' }
];

const initQuotes = () => {
  const card = $('.quote-card');
  const textEl = $('#quoteText');
  const authorEl = $('#quoteAuthor');
  const countEl = $('#quoteCount');
  const button = $('#quoteBtn');

  const showQuote = () => {
    // Pick a random index that is different from the last one
    let index;
    do {
      index = Math.floor(Math.random() * quotes.length);
    } while (index === state.lastQuoteIndex);
    state.lastQuoteIndex = index;

    card.classList.add('swap');                 // fade out
    setTimeout(() => {
      textEl.textContent = `“${quotes[index].text}”`;
      authorEl.textContent = quotes[index].author;
      state.quotesShown++;
      countEl.textContent = `${state.quotesShown} ${state.quotesShown === 1 ? 'quote' : 'quotes'} shown`;
      card.classList.remove('swap');            // fade in
    }, 220);
  };

  button.addEventListener('click', showQuote);
};

/* ----------------------------------------------------------
   8. Character counter
   ---------------------------------------------------------- */
const initCounter = () => {
  const area = $('#story');
  const chars = $('#charCount');
  const words = $('#wordCount');
  const fill = $('#meterFill');
  const max = Number(area.getAttribute('maxlength'));

  const update = () => {
    const length = area.value.length;
    const wordCount = area.value.trim() === '' ? 0 : area.value.trim().split(/\s+/).length;

    chars.textContent = length;
    words.textContent = wordCount;

    const percent = (length / max) * 100;
    fill.style.width = `${percent}%`;
    fill.classList.toggle('warn', percent >= 80 && percent < 100);
    fill.classList.toggle('max', percent >= 100);
  };

  area.addEventListener('input', update);
  update();

  // Contact form: the brief is required (at least 10 characters)
  const form = $('#contactForm');
  const error = $('#storyError');
  const ok = $('#contactSuccess');

  area.addEventListener('input', () => { error.textContent = ''; area.classList.remove('invalid'); ok.hidden = true; });

  form.addEventListener('submit', (e) => {
    e.preventDefault();                                   // no page reload
    const text = area.value.trim();
    if (text.length < 10) {
      error.textContent = text ? 'Add a little more detail (at least 10 characters).' : 'Write a short brief before sending.';
      area.classList.add('invalid');
      area.focus();
      return;
    }
    ok.textContent = 'Thanks, your brief has been sent. We will reply within two working days.';
    ok.hidden = false;
    form.reset();
    update();
  });
};

/* ----------------------------------------------------------
   9. Client-side form validation
   ---------------------------------------------------------- */

// Each rule returns an error message, or '' when the value is valid
const validators = {
  fullName: (v) => {
    if (!v.trim()) return 'Enter your full name.';
    if (v.trim().length < 3) return 'Name must be at least 3 characters.';
    if (!/^[A-Za-z][A-Za-z .'-]*$/.test(v.trim())) return 'Use letters only.';
    return '';
  },
  email: (v) => {
    if (!v.trim()) return 'Enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Enter a valid email, like name@example.com.';
    return '';
  },
  phone: (v) => {
    if (!v.trim()) return 'Enter your phone number.';
    const digits = v.replace(/[\s-]/g, '').replace(/^(\+91|0)/, '');
    if (!/^[6-9]\d{9}$/.test(digits)) return 'Enter a 10-digit number starting with 6, 7, 8 or 9.';
    return '';
  },
  password: (v) => {
    if (!v) return 'Create a password.';
    if (v.length < 8) return `Add ${8 - v.length} more character${8 - v.length === 1 ? '' : 's'} (minimum 8).`;
    return '';
  },
  confirmPassword: (v) => {
    if (!v) return 'Repeat your password.';
    if (v !== $('#password').value) return 'Passwords do not match.';
    return '';
  }
};

// Score a password from 0 (empty) to 4 (strong)
const scorePassword = (pw) => {
  if (!pw) return 0;
  const checks = [pw.length >= 8, /[A-Z]/.test(pw) && /[a-z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)];
  return checks.filter(Boolean).length;
};

const initForm = () => {
  const form = $('#regForm');
  const success = $('#formSuccess');
  const fieldNames = Object.keys(validators);

  // Validate one field and show / clear its message
  const validateField = (name) => {
    const input = $(`#${name}`);
    const message = validators[name](input.value);
    $(`#${name}Error`).textContent = message;
    input.classList.toggle('invalid', Boolean(message));
    input.classList.toggle('valid', !message);
    input.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  };

  // Validate while typing (once the field has been touched) and on blur
  fieldNames.forEach((name) => {
    const input = $(`#${name}`);
    input.addEventListener('blur', () => validateField(name));
    input.addEventListener('input', () => {
      if (input.classList.contains('invalid') || input.classList.contains('valid')) validateField(name);
      success.hidden = true;
    });
  });

  // Re-check "confirm" when the first password changes
  $('#password').addEventListener('input', () => {
    if ($('#confirmPassword').value) validateField('confirmPassword');
  });

  // Password strength meter
  const bar = $('#strengthBar');
  const strengthText = $('#strengthText');
  const levels = [
    { label: 'none',   color: 'var(--danger)', width: '0%' },
    { label: 'weak',   color: 'var(--danger)', width: '25%' },
    { label: 'fair',   color: 'var(--warn)',   width: '50%' },
    { label: 'good',   color: 'var(--accent)', width: '75%' },
    { label: 'strong', color: 'var(--ok)',     width: '100%' }
  ];
  $('#password').addEventListener('input', (e) => {
    const level = levels[scorePassword(e.target.value)];
    bar.style.width = level.width;
    bar.style.background = level.color;
    strengthText.textContent = `Strength: ${level.label}`;
  });

  // Show / hide password buttons
  $$('.pw-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = $(`#${btn.dataset.target}`);
      const showing = target.type === 'text';
      target.type = showing ? 'password' : 'text';
      btn.textContent = showing ? 'Show' : 'Hide';
    });
  });

  // Submit: check everything, never reload the page
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Run every validator (no short-circuit so all errors appear)
    const results = fieldNames.map(validateField);
    const allValid = results.every(Boolean);

    if (!allValid) {
      const firstBad = fieldNames.find((_, i) => !results[i]);
      $(`#${firstBad}`).focus();
      success.hidden = true;
      return;
    }

    const firstName = $('#fullName').value.trim().split(' ')[0];
    success.textContent = `Welcome aboard, ${firstName}! Your account details are valid.`;
    success.hidden = false;

    form.reset();
    fieldNames.forEach((name) => {
      const input = $(`#${name}`);
      input.classList.remove('valid', 'invalid');
      input.removeAttribute('aria-invalid');
    });
    bar.style.width = '0%';
    strengthText.textContent = 'Strength: none';
    $$('.pw-toggle').forEach((b) => { b.textContent = 'Show'; });
  });
};

/* ----------------------------------------------------------
   10. Footer year
   ---------------------------------------------------------- */
const initYear = () => { $('#year').textContent = new Date().getFullYear(); };


/* ----------------------------------------------------------
   11. HUD: scroll state, cursor coordinates, simplified view
   ---------------------------------------------------------- */
const initHud = () => {
  const body = document.body;

  // Shrink the brand and hide the scroll cue once the page scrolls
  const onScroll = () => body.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Cursor coordinate readout
  const coords = $('#coords');
  document.addEventListener('mousemove', (e) => {
    coords.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 16}px)`;
    coords.textContent = `x:${e.clientX} y:${e.clientY}`;
    coords.classList.add('on');
  });
  document.addEventListener('mouseleave', () => coords.classList.remove('on'));

  // Simplified view: switch the animated background off
  const button = $('#simpleBtn');
  const text = $('.txt', button);
  button.addEventListener('click', () => {
    state.simple = !state.simple;
    body.classList.toggle('simple', state.simple);
    button.setAttribute('aria-pressed', String(state.simple));
    text.textContent = state.simple ? 'Full view' : 'Simplified view';
    if (state.simple) {
      $('#fpsVal').textContent = '--';
      $('#fpsBar').style.width = '0%';
    }
  });
};

/* ----------------------------------------------------------
   12. Space canvas
   Draws a nebula, a perspective grid floor, twinkling stars and
   planetary systems that drift as you scroll and shift with the
   mouse. It also measures real FPS and lowers star density when
   the frame rate drops (the "Quality" gauge).
   ---------------------------------------------------------- */
const initSpace = () => {
  const canvas = $('#space');
  const ctx = canvas.getContext('2d');
  const TAU = Math.PI * 2;
  const mod = (n, m) => ((n % m) + m) % m;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0;
  let ink = '244,244,248', accent = '155,107,255', isDark = true;
  let quality = 100;
  let scrollY = window.scrollY;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };   // eased parallax, -1 .. 1

  // Read colours from the CSS variables so themes and accents carry over
  const readColors = () => {
    const cs = getComputedStyle(document.documentElement);
    ink = cs.getPropertyValue('--ink-rgb').trim() || ink;
    accent = cs.getPropertyValue('--accent-rgb').trim() || accent;
    isDark = document.documentElement.dataset.theme !== 'light';
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // Stars: array of objects with depth (z) used for parallax and size
  const stars = Array.from({ length: 320 }, () => ({
    x: Math.random(), y: Math.random(), z: 0.2 + Math.random() * 0.8, p: Math.random() * TAU
  }));

  // Planetary systems (positions are fractions of the viewport)
  const systems = [
    { label: 'Services',  x: 0.50, y: 0.58, s: 1.15, tint: 'ink',
      planets: [{ o: 150, sp: 0.35, r: 9, ph: 0 }, { o: 105, sp: -0.5, r: 7, ph: 2 }, { o: 205, sp: 0.2, r: 6, ph: 4 }] },
    { label: 'Live demo', x: 0.10, y: 0.90, s: 1.3, tint: 'ink',
      planets: [{ o: 130, sp: 0.3, r: 8, ph: 1 }, { o: 190, sp: -0.22, r: 10, ph: 3 }] },
    { label: 'Contact',   x: 0.90, y: 0.34, s: 0.75, tint: 'accent',
      planets: [{ o: 120, sp: 0.4, r: 8, ph: 2 }, { o: 170, sp: -0.3, r: 6, ph: 5 }] },
    { label: 'Process',   x: 0.24, y: 0.22, s: 0.6, tint: 'accent',
      planets: [{ o: 130, sp: 0.45, r: 8, ph: 0 }, { o: 90, sp: -0.6, r: 6, ph: 3 }, { o: 175, sp: 0.25, r: 5, ph: 1 }] },
    { label: 'Register',  x: 0.78, y: 1.12, s: 0.95, tint: 'ink',
      planets: [{ o: 140, sp: -0.28, r: 9, ph: 4 }, { o: 95, sp: 0.5, r: 6, ph: 1 }] }
  ];

  // A planet drawn as a "scanline" sphere (striped, shaded)
  const drawPlanet = (x, y, r, rgb) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.clip();
    ctx.fillStyle = `rgba(${rgb},0.16)`;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);

    const step = Math.max(2, r / 5);
    for (let yy = -r; yy < r; yy += step) {
      const edge = Math.abs(yy) / r;                            // 0 centre .. 1 edge
      ctx.fillStyle = `rgba(${rgb},${0.55 + 0.4 * (1 - edge)})`;
      ctx.fillRect(x - r, y + yy, r * 2, step * (0.3 + 0.45 * (1 - edge)));
    }

    const shade = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
    shade.addColorStop(0, 'rgba(255,255,255,0.28)');
    shade.addColorStop(0.55, 'rgba(0,0,0,0)');
    shade.addColorStop(1, `rgba(0,0,0,${isDark ? 0.55 : 0.3})`);
    ctx.fillStyle = shade;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  };

  // The nebula is painted once to a small offscreen canvas (cheap), then
  // drawn each frame with a slight parallax shift.
  const nebula = document.createElement('canvas');
  const buildNebula = () => {
    nebula.width = Math.max(1, Math.round(W / 2));
    nebula.height = Math.max(1, Math.round(H / 2));
    const n = nebula.getContext('2d');
    const a = isDark ? 0.10 : 0.13;
    const paint = (x, y, r, rgb, alpha) => {
      const g = n.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${rgb},${alpha})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      n.fillStyle = g;
      n.fillRect(0, 0, nebula.width, nebula.height);
    };
    const big = Math.max(nebula.width, nebula.height);
    paint(nebula.width * 0.28, nebula.height * 0.45, big * 0.55, ink, a);
    paint(nebula.width * 0.80, nebula.height * 0.30, big * 0.45, accent, a * 0.9);
    paint(nebula.width * 0.55, nebula.height * 0.88, big * 0.5, ink, a * 0.7);
  };

  const drawNebula = () => {
    const pad = 60;
    ctx.drawImage(nebula, -pad + pointer.x * -22, -pad + pointer.y * -14, W + pad * 2, H + pad * 2);
  };

  const drawGrid = (t) => {
    const horizon = H * 0.28;
    const vx = W / 2 + pointer.x * 40;
    const fade = ctx.createLinearGradient(0, horizon, 0, H);
    fade.addColorStop(0, `rgba(${ink},0)`);
    fade.addColorStop(1, `rgba(${ink},${isDark ? 0.16 : 0.22})`);
    ctx.strokeStyle = fade;
    ctx.lineWidth = 1;

    // Lines converging on the vanishing point
    ctx.beginPath();
    for (let i = -16; i <= 16; i++) {
      ctx.moveTo(vx, horizon);
      ctx.lineTo(vx + i * W * 0.11, H);
    }
    ctx.stroke();

    // Horizontal lines that slide toward the viewer
    const rows = 20;
    const offset = (t * 0.12 + scrollY * 0.0015) % 1;
    ctx.beginPath();
    for (let k = 0; k < rows; k++) {
      const f = ((k + offset) % rows) / rows;
      const y = horizon + (H - horizon) * Math.pow(f, 2.2);
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();
  };

  const drawStars = (t) => {
    const count = Math.floor(stars.length * (quality / 100));
    for (let i = 0; i < count; i++) {
      const st = stars[i];
      const x = mod(st.x * W - pointer.x * st.z * 26, W);
      const y = mod(st.y * H - scrollY * 0.09 * st.z - pointer.y * st.z * 16, H);
      const twinkle = 0.55 + 0.45 * Math.sin(t * 1.4 + st.p);
      ctx.fillStyle = `rgba(${ink},${(0.25 + 0.6 * st.z) * twinkle})`;
      ctx.fillRect(x, y, st.z * 1.8, st.z * 1.8);
    }
  };

  const drawSystem = (sys, t) => {
    const s = sys.s;
    const cx = sys.x * W + pointer.x * s * 30;
    const cy = mod(sys.y * H - scrollY * 0.14, H * 1.5) - H * 0.25 + pointer.y * s * 18;
    if (cy < -320 || cy > H + 320) return;                       // off screen
    const rgb = sys.tint === 'accent' ? accent : ink;
    const tilt = 0.42;

    // Dotted orbits
    ctx.lineWidth = 1;
    ctx.setLineDash([1, 5]);
    ctx.strokeStyle = `rgba(${rgb},0.55)`;
    for (const p of sys.planets) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, p.o * s, p.o * s * tilt, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Planets sorted so those behind the star are drawn first
    const bodies = sys.planets.map((p) => {
      const a = p.ph + t * p.sp;
      return { x: cx + Math.cos(a) * p.o * s, y: cy + Math.sin(a) * p.o * s * tilt, r: p.r * s, back: Math.sin(a) < 0 };
    });
    bodies.filter((b) => b.back).forEach((b) => drawPlanet(b.x, b.y, b.r, rgb));
    drawPlanet(cx, cy, 15 * s, rgb);
    bodies.filter((b) => !b.back).forEach((b) => drawPlanet(b.x, b.y, b.r, rgb));

    // Label with a leader line
    const fontSize = Math.round(11 + 6 * s);
    ctx.font = `${fontSize}px "Share Tech Mono", monospace`;
    const lx = cx + 64 * s, ly = cy - 36 * s;
    const textW = ctx.measureText(sys.label).width;
    ctx.strokeStyle = `rgba(${rgb},0.7)`;
    ctx.beginPath();
    ctx.moveTo(cx + 12 * s, cy - 10 * s);
    ctx.lineTo(lx, ly);
    ctx.lineTo(lx + textW + 12, ly);
    ctx.stroke();
    ctx.fillStyle = `rgba(${rgb},0.9)`;
    ctx.fillText(sys.label, lx + 6, ly - 6);
  };

  const draw = (t) => {
    ctx.clearRect(0, 0, W, H);
    drawNebula();
    drawGrid(t);
    drawStars(t);
    systems.forEach((sys) => drawSystem(sys, t));
  };

  // Live FPS + adaptive quality readout
  const fpsVal = $('#fpsVal'), fpsBar = $('#fpsBar');
  const qualityVal = $('#qualityVal'), qualityBar = $('#qualityBar');
  qualityBar.style.width = '100%';
  let lowSamples = 0;

  const report = (fps) => {
    fpsVal.textContent = fps;
    fpsBar.style.width = `${Math.min(100, (fps / 60) * 100)}%`;
    lowSamples = fps < 28 ? lowSamples + 1 : 0;
    if (lowSamples >= 2 && quality > 40) {          // reduce detail when the frame rate drops
      quality -= 20;
      lowSamples = 0;
    }
    qualityVal.textContent = `${quality}%`;
    qualityBar.style.width = `${quality}%`;
  };

  // Events
  window.addEventListener('resize', () => { resize(); buildNebula(); if (reduceMotion) draw(0); });
  window.addEventListener('scroll', () => { scrollY = window.scrollY; if (reduceMotion) draw(0); }, { passive: true });
  window.addEventListener('mousemove', (e) => {
    pointer.tx = (e.clientX / W - 0.5) * 2;
    pointer.ty = (e.clientY / H - 0.5) * 2;
  });
  new MutationObserver(() => { readColors(); buildNebula(); if (reduceMotion) draw(0); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-accent'] });

  readColors();
  resize();
  buildNebula();

  if (reduceMotion) {                               // single still frame, no loop
    fpsVal.textContent = '--';
    draw(0);
    return;
  }

  let last = performance.now(), frames = 0, elapsed = 0;
  const loop = (now) => {
    const dt = now - last;
    last = now;
    if (!state.simple && !document.hidden) {
      pointer.x += (pointer.tx - pointer.x) * 0.05;  // ease toward the mouse
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      draw(now / 1000);
      frames++;
      elapsed += dt;
      if (elapsed >= 500) {
        report(Math.round((frames * 1000) / elapsed));
        frames = 0;
        elapsed = 0;
      }
    } else {
      frames = 0;
      elapsed = 0;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
};

/* ----------------------------------------------------------
   Start everything once the DOM is ready
   ---------------------------------------------------------- */
const init = () => {
  initTheme();
  initClock();
  initNav();
  initScene();
  initPlayground();
  initQuotes();
  initCounter();
  initForm();
  initYear();
  initHud();
  initSpace();
};

document.addEventListener('DOMContentLoaded', init);
