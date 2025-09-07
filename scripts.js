// ===== ASCII Pet =====
document.addEventListener('DOMContentLoaded', () => {
  const pre = document.querySelector('.ascii-pet pre');
  const btn = document.querySelector('.pet-say');
  if (!pre || !btn) return;
  btn.textContent = 'Pet';

  const normal = [
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

  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  let i = 0, loop = null, playingHearts = false;

  const draw = (frame) => { pre.textContent = frame; };
  const stopLoop = () => { if (loop) { clearInterval(loop); loop = null; } };
  const startLoop = () => {
    stopLoop();
    if (mql.matches) { i = 0; return draw(normal[0]); }
    loop = setInterval(() => { i = (i + 1) % normal.length; draw(normal[i]); }, 500);
  };

  draw(normal[0]);
  startLoop();
  mql.addEventListener?.('change', startLoop);

  btn.addEventListener('click', () => {
    if (playingHearts) return;
    playingHearts = true;
    stopLoop();

    if (mql.matches) {
      draw(hearts[1]);
      setTimeout(() => { draw(normal[0]); playingHearts = false; }, 700);
      return;
    }

    let h = 0;
    draw(hearts[h++]);
    const temp = setInterval(() => {
      if (h >= hearts.length) {
        clearInterval(temp);
        playingHearts = false;
        i = 0;
        draw(normal[0]);
        startLoop();
      } else {
        draw(hearts[h++]);
      }
    }, 220);
  });
});

// ===== Smooth scroll for internal links =====
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
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
  const y = document.getElementById('y'); if (y) y.textContent = new Date().getFullYear();
});

// ===== Credentials <details> smooth dropdown =====
document.addEventListener('DOMContentLoaded', () => {
  const detailsList = document.querySelectorAll('.cred-details');
  detailsList.forEach(details => {
    const box = details.querySelector('.collapsible');
    const summary = details.querySelector('summary');
    const btnLess = details.querySelector('.show-less');
    if (!box || !summary) return;

    // Initial height (closed)
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
