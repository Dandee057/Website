// ===== ASCII Pet: lag + run animation + head-shake-on-"Cage Katniss" hover =====
document.addEventListener('DOMContentLoaded', () => {
  const petWrap = document.querySelector('.ascii-pet');
  const pre = petWrap?.querySelector('pre');
  const btnPet = petWrap?.querySelector('.pet-say');
  if (!petWrap || !pre || !btnPet) return;

  const inlineToggle = document.getElementById('petToggle') || null;

  // ---------- PET FRAMES (original doggo) ----------
  const idle = [
String.raw`  

   /\_/\ 
  ( •ᴥ• )/
  (  ^  )
   | | |`,
String.raw`  

   /\_/\ 
 \( •ᴥ• ) 
  (  ^  )
   | | |`,
String.raw`  

   /\_/\ 
  ( -ᴥ- )/
  (  ^  )
   | | |`,
String.raw`  

   /\_/\ 
 \( •ᴥ• ) 
  (  ^  )
   | | |`
  ];

  const runR = [
String.raw`  

   /\_/\
ε=( >ᴥ> )
  (  ^  )
   / | \
`,
String.raw`  

   /\_/\
ε=( >ᴥ> )
  (  ^  )
   \ | /
`,
String.raw`  

   /\_/\
ε=( >ᴥ> )
  (  ^  )
   / | \
`,
String.raw`  

   /\_/\
ε=( >ᴥ> )
  (  ^  )
   \ | /
`
];

const runL = [
String.raw`  

   /\_/\
  ( <ᴥ< )=3
  (  ^  )
   / | \
`,
String.raw`  

   /\_/\
  ( <ᴥ< )=3
  (  ^  )
   \ | /
`,
String.raw`  

   /\_/\
  ( <ᴥ< )=3
  (  ^  )
   / | \
`,
String.raw`  

   /\_/\
  ( <ᴥ< )=3
  (  ^  )
   \ | /
`
];

  const hearts = [
String.raw`  
    ♥
   /\_/\ 
  ( ^ᴥ^ )/
  (  ^  )
   | | |`,
String.raw`  
    ♥♥
   /\_/\ 
  ( ^ᴥ^ )/
  (  ^  )
   | | |`,
String.raw`  
    ♥♥♥
   /\_/\ 
  ( ^ᴥ^ )/
  (  ^  )
   | | |`
  ];

  // ---------- NEW: HEAD-SHAKING ASCII CAT (plays on "Cage Katniss" hover) ----------
  // Loops while hovering the "Cage Katniss" button(s).
  const catShake = [
String.raw`  
  /\_/\ 
 ( o .o)
  > ^ <`,
String.raw`  
  /\_/\ 
 ( o_o )
  > ^ <`,
String.raw`  
  /\_/\ 
 (o . o )
  > ^ <`
  ];

  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ---------- STATE ----------
  let animTimer = null;
  let animIndex = 0;
  let currentSet = idle;
  let currentSpeed = 500;
  let playingHearts = false;

  const draw = f => { pre.textContent = f; };
  const startAscii = (frames, speedMs) => {
    clearInterval(animTimer);
    currentSet = frames;
    currentSpeed = speedMs;
    animIndex = 0;
    draw(frames[0]);
    if (mql.matches) return;
    animTimer = setInterval(() => {
      animIndex = (animIndex + 1) % frames.length;
      draw(frames[animIndex]);
    }, speedMs);
  };
  const stopAscii = () => { clearInterval(animTimer); animTimer = null; };

  // initial idle loop
  startAscii(idle, 500);
  mql.addEventListener?.('change', () => startAscii(idle, 500));

  // hearts on “Pet”
  btnPet.textContent = 'Pet Katniss';
  btnPet.addEventListener('click', () => {
    if (playingHearts) return;
    playingHearts = true;
    stopAscii();

    if (mql.matches) {
      draw(hearts[1]);
      setTimeout(() => { startAscii(idle, 500); playingHearts = false; }, 700);
      return;
    }

    let h = 0;
    draw(hearts[h++]);
    const temp = setInterval(() => {
      if (h >= hearts.length) {
        clearInterval(temp);
        startAscii(idle, 500);
        playingHearts = false;
      } else {
        draw(hearts[h++]);
      }
    }, 220);
  });

  // ---------- FREE-ROAM FOLLOW (with lag + direction) ----------
  const prefersReduced = mql.matches;

  let active = false;
  let rafId = null;
  let target = { x: 0, y: 0 };
  let pos    = { x: 0, y: 0 };
  let petSize = { w: 0, h: 0 };
  let homeRect = null;

  const RUN_DISTANCE  = 35;
  const IDLE_DISTANCE = 8;
  const EASE = prefersReduced ? 1.0 : 0.01;

  let lastX = 0;
  let lastDir = 'right';

  const setHome = () => { homeRect = petWrap.getBoundingClientRect(); };
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const apply = () => { petWrap.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`; };

  function onMove(clientX, clientY) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = 8;
    const maxX = vw - petSize.w - pad;
    const maxY = vh - petSize.h - pad;
    const offsetX = 16, offsetY = 12;

    target.x = clamp(clientX + offsetX, pad, maxX);
    target.y = clamp(clientY + offsetY, pad, maxY);

    if (prefersReduced) {
      pos.x = target.x; pos.y = target.y;
      apply();
    }
  }

// In your loop() function, right after apply();
function loop() {
  // Ease towards target (laggy)
  pos.x += (target.x - pos.x) * EASE;
  pos.y += (target.y - pos.y) * EASE;
  apply();

  // ⛳ NEW: don't change animation set while special anims run
  if (shaking || playingHearts) {
    rafId = requestAnimationFrame(loop);
    return;
  }

  // Direction: velocity > vector-to-target
  const vx = pos.x - lastX;
  const dx = target.x - pos.x, dy = target.y - pos.y;
  const dist = Math.hypot(dx, dy);

  let dir = Math.abs(vx) > 0.4 ? (vx > 0 ? 'right' : 'left') : (dx >= 0 ? 'right' : 'left');
  const desiredRun = dir === 'right' ? runR : runL;

  if (dist > RUN_DISTANCE && currentSet !== desiredRun) {
    startAscii(desiredRun, 120);
  } else if (dist < IDLE_DISTANCE && currentSet !== idle) {
    startAscii(idle, 500);
  }

  lastDir = dir;
  lastX = pos.x;

  rafId = requestAnimationFrame(loop);
}

  // hide/show inline controls while free
  const hideInlineControls = (hide) => {
    btnPet.style.display = hide ? 'none' : '';
    if (inlineToggle) inlineToggle.style.display = hide ? 'none' : '';
  };

  function enableFree() {
    if (active) return;
    active = true;

    petWrap.style.animation = 'none';
    petSize = { w: petWrap.offsetWidth, h: petWrap.offsetHeight };
    setHome();
    petWrap.classList.add('pet-free');
    hideInlineControls(true);

    pos.x = homeRect.left; pos.y = homeRect.top;
    target.x = pos.x; target.y = pos.y;
    lastX = pos.x;
    apply();

    const mouseMove = (e) => onMove(e.clientX, e.clientY);
    const touchMove = (e) => { if (e.touches?.[0]) onMove(e.touches[0].clientX, e.touches[0].clientY); };
    const keyHandler = (e) => { if (e.key === 'Escape') disableFree(); };
    const resizeHandler = () => { setHome(); };

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('touchmove', touchMove, { passive: true });
    document.addEventListener('keydown', keyHandler);
    window.addEventListener('resize', resizeHandler);

    petWrap._cleanup = () => {
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('touchmove', touchMove);
      document.removeEventListener('keydown', keyHandler);
      window.removeEventListener('resize', resizeHandler);
    };

    if (!prefersReduced) rafId = requestAnimationFrame(loop);

    setDockState(true);
  }

  function disableFree() {
    if (!active) return;
    active = false;

    if (petWrap._cleanup) petWrap._cleanup();
    if (rafId) cancelAnimationFrame(rafId);

    petWrap.classList.remove('pet-free');
    petWrap.style.transform = '';
    petWrap.style.animation = '';
    hideInlineControls(false);
    startAscii(idle, 500);

    setDockState(false);
  }

  // ---------- ALWAYS-VISIBLE DOCK BUTTON ----------
  const dockBtn = (() => {
    let b = document.getElementById('petDockToggle');
    if (!b) {
      b = document.createElement('button');
      b.id = 'petDockToggle';
      b.className = 'pet-toggle-fixed';
      b.type = 'button';
      document.body.appendChild(b);
    }
    return b;
  })();

  function setDockState(free) {
    dockBtn.textContent = free ? 'Cage Katniss' : 'Free Katniss';
    dockBtn.setAttribute('aria-pressed', free ? 'true' : 'false');
    dockBtn.dataset.state = free ? 'cage' : 'free'; // handy attribute if needed
  }
  setDockState(false);

  dockBtn.addEventListener('click', () => active ? disableFree() : enableFree());
  inlineToggle?.addEventListener('click', () => active ? disableFree() : enableFree());

  // ---------- NEW: Hover-to-shake handler when label says "Cage Katniss" ----------
  let savedSet = idle;
  let savedSpeed = 500;
  let shaking = false;

  const shouldShake = (el) => (el?.textContent || '').toLowerCase().includes('cage katniss');

  const startCatShakeLoop = () => {
    if (shaking) return;
    shaking = true;
    // remember what we were playing
    savedSet = currentSet;
    savedSpeed = currentSpeed;

    if (mql.matches) {
      // reduced motion: flash a single "turned head" frame briefly
      draw(catShake[0]);
      setTimeout(() => {
        if (!shaking) return; // already restored
        startAscii(savedSet, savedSpeed);
        shaking = false;
      }, 600);
      return;
    }
    startAscii(catShake, 110);
  };

  const stopCatShakeLoop = () => {
    if (!shaking) return;
    shaking = false;
    startAscii(savedSet, savedSpeed);
  };

  const addHoverShake = (el) => {
    if (!el) return;
    el.addEventListener('pointerenter', () => { if (shouldShake(el)) startCatShakeLoop(); });
    el.addEventListener('pointerleave', stopCatShakeLoop);
    // also re-check after clicks (label can change)
    el.addEventListener('click', () => {
      // small delay so textContent reflects the new state
      setTimeout(() => { if (!shouldShake(el)) stopCatShakeLoop(); }, 0);
    });
  };

  addHoverShake(dockBtn);
  addHoverShake(inlineToggle);
});





// ===== Smooth scroll ONLY for section/nav links, not lightbox controls =====
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll(
    'a[href^="#"]:not(.g-thumb):not(.lb-prev):not(.lb-next):not(.lb-close)'
  ).forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', id);
      }
    });
  });
});


// ===== Scroll-spy: set active tab by section in view =====
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tabbar .tab');
  const setActive = (id) => {
    tabs.forEach(t => t.classList.toggle('is-active', t.getAttribute('href') === `#${id}`));
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 });
  document.querySelectorAll('section.section, main.section').forEach(s => io.observe(s));
});

// ===== Footer year =====
document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('y'); 
  if (y) y.textContent = new Date().getFullYear();
});

// ===== Credentials <details> smooth dropdown =====
document.addEventListener('DOMContentLoaded', () => {
  const detailsList = document.querySelectorAll('.cred-details');
  detailsList.forEach(details => {
    const box = details.querySelector('.collapsible');
    const summary = details.querySelector('summary');
    const btnLess = details.querySelector('.show-less');
    if (!box || !summary) return;

    if (!details.open) box.style.height = '0px';

    const openAnim = () => {
      const end = box.scrollHeight;
      box.style.height = '0px';
      box.animate([{height:'0px'},{height: end + 'px'}], {duration: 280, easing: 'ease'}).onfinish = () => {
        box.style.height = 'auto';
      };
    };

    const closeAnim = () => {
      const start = box.offsetHeight;
      box.style.height = start + 'px';
      box.animate([{height: start + 'px'},{height:'0px'}], {duration: 280, easing: 'ease'}).onfinish = () => {
        box.style.height = '0px';
      };
    };

    details.addEventListener('toggle', () => {
      if (details.open) openAnim();
      else closeAnim();
    });

    btnLess?.addEventListener('click', () => {
      if (!details.open) return;
      closeAnim();
      setTimeout(() => {
        details.open = false;
        summary.focus();
        summary.scrollIntoView({behavior:'smooth', block:'center'});
      }, 1);
    });
  });
});

// ===== Floating dandelion seeds =====
(() => {
  const wrap = document.createElement('div');
  wrap.className = 'dandelion-bg';
  document.body.insertBefore(wrap, document.body.firstChild);

  const count = 12; // tweak density
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'dandelion-seed';
    s.style.setProperty('--x', (Math.random() * 100).toFixed(2) + 'vw');
    s.style.setProperty('--dx', ((Math.random() * 120) - 60).toFixed(0) + 'px');
    s.style.setProperty('--dur', (16 + Math.random() * 10).toFixed(1) + 's');
    s.style.setProperty('--delay', (Math.random() * 20).toFixed(1) + 's');
    wrap.appendChild(s);
  }
})();
