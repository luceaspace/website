(function () {
  const TAG = '[LuceaSpace]';
  const log = (...args) => console.log(TAG, ...args);
  const warn = (...args) => console.warn(TAG, ...args);
  const err = (...args) => console.error(TAG, ...args);

  // ---------- Helpers ----------
  function ensureSiteToast() {
    let toastEl = document.getElementById('siteToast');
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'siteToast';
      toastEl.className = 'site-toast';
      toastEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(toastEl);
      log('Created fallback #siteToast element.');
    } else {
      log('#siteToast exists.');
    }
    return toastEl;
  }

  function showToast(msg, ms = 2200) {
    const toastEl = ensureSiteToast();
    if (!toastEl) { console.log(msg); return; }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    toastEl.setAttribute('aria-hidden', 'false');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => {
      toastEl.classList.remove('show');
      toastEl.setAttribute('aria-hidden', 'true');
    }, ms);
  }

  function setInertForMain(inert) {
    // Use inert attribute where available to block background interaction for assistive tech.
    // This avoids aria-hidden on a focused element issue.
    try {
      const nodes = document.querySelectorAll('main, header, footer');
      nodes.forEach(n => {
        if (inert) n.setAttribute('inert', '');
        else n.removeAttribute('inert');
      });
    } catch (e) {
      // inert may not be supported in older browsers — ignore silently
    }
  }

  // Simple auth token helpers (localStorage)
  const API_BASE = '/api';
  function saveToken(token) { localStorage.setItem('ls_token', token); }
  function getToken() { return localStorage.getItem('ls_token'); }
  function removeToken() { localStorage.removeItem('ls_token'); }
  function authHeaders() {
    const t = getToken();
    return t ? { 'Authorization': 'Bearer ' + t } : {};
  }

  // ---------- Profile & Navigation UI ----------
  async function fetchProfile() {
    const t = getToken();
    if (!t) return null;
    try {
      const res = await fetch(API_BASE + '/user/profile', { headers: authHeaders() });
      if (!res.ok) { removeToken(); return null; }
      const j = await res.json();
      return { name: j.name, email: j.email, avatar: j.avatar || '' };
    } catch (e) {
      err('fetchProfile error', e);
      return null;
    }
  }


  
  //async function refreshAuthUI() {
  //  const navAuth = document.getElementById('navAuth');
  //  const sbActions = document.getElementById('sbActions');
  //  if (!navAuth) { log('No #navAuth element — skipping auth UI update'); return; }
  //  const profile = await fetchProfile();
  //  if (profile) {
  //    navAuth.innerHTML = `
  //      <div class="profile" id="profileWrap">
  //        <div class="avatar"><img src="${profile.avatar}" alt="${profile.name}" style="width:100%;height:100%;object-fit:cover;border-radius:6px" /></div>
  //        <div class="profile-menu">
  //          <div style="font-weight:700">${profile.name}</div>
  //          <div style="font-size:12px;color:#666">${profile.email}</div>
  //          <div class="menu" id="profileMenu">
  //            <button id="gotoDashboard">Dashboard</button>
  //            <button id="logoutBtn">Logout</button>
 //           </div>
  //        </div>
  //      </div>`;
  //    if (sbActions) sbActions.innerHTML = `<button class="btn ghost" id="sbProfile">Profile</button>`;

  //    const wrap = document.getElementById('profileWrap');
  //    const menu = document.getElementById('profileMenu');
  //    if (wrap && menu) wrap.addEventListener('click', () => menu.classList.toggle('show'));
  //    document.getElementById('logoutBtn')?.addEventListener('click', () => { removeToken(); showToast('Signed out'); setTimeout(()=>window.location.reload(), 400); });
  //    document.getElementById('gotoDashboard')?.addEventListener('click', () => { window.location.href = '/home.html'; });
  //  } else {
  //    navAuth.innerHTML = `
  //      <button class="btn outline" id="signinBtn">Sign in</button>
  //      <button class="btn primary" id="signupBtn">Sign up</button>
 //     `;
 //     if (sbActions) sbActions.innerHTML = `
  //      <button class="btn outline" id="sbSignin">Sign in</button>
   //     <button class="btn primary" id="sbSignup">Sign up</button>
    //  `;
  //    document.getElementById('signinBtn')?.addEventListener('click', () => { window.location.href = '/sign.html#signin'; });
  //    document.getElementById('signupBtn')?.addEventListener('click', () => { window.location.href = '/sign.html#signup'; });
  //    document.getElementById('sbSignin')?.addEventListener('click', () => { window.location.href = '/sign.html#signin'; });
  //    document.getElementById('sbSignup')?.addEventListener('click', () => { window.location.href = '/sign.html#signup'; });
   // }
  //} 

  // ---------- Sidebar controls ----------
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileSidebar = document.getElementById('mobileSidebar');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const sideContactBar = document.getElementById('sideContactBar');

  

  function openSidebar() {
    if (!mobileSidebar) { warn('openSidebar: #mobileSidebar not found'); return; }
    // Avoid hiding focused element from AT: use inert on background instead of aria-hidden on focused item.
    mobileSidebar.classList.add('open');
    mobileSidebar.setAttribute('aria-hidden', 'false');
    setInertForMain(true);
    if (mobileOverlay) { mobileOverlay.hidden = false; setTimeout(()=>mobileOverlay.classList.add('show'), 10); }
    try { closeSidebarBtn?.focus(); } catch(e) {}
    document.body.style.overflow = 'hidden';
    log('Sidebar opened');

    if (sideContactBar) sideContactBar.classList.add('hide');

  }

  function closeSidebar() {
    if (!mobileSidebar) { warn('closeSidebar: #mobileSidebar not found'); return; }
    mobileSidebar.classList.remove('open');
    mobileSidebar.setAttribute('aria-hidden', 'true');
    setInertForMain(false);
    if (mobileOverlay) { mobileOverlay.classList.remove('show'); setTimeout(()=>{ if (mobileOverlay) mobileOverlay.hidden = true; }, 240); }
    document.body.style.overflow = '';
    log('Sidebar closed');

    if (sideContactBar) sideContactBar.classList.remove('hide');

  }

  // Add handlers idempotently
  if (mobileMenuBtn) {
    // Add a click logger so you can see clicks in console
    mobileMenuBtn.addEventListener('click', function onMobileMenuClick(e) {
      log('CLICK: #mobileMenuBtn pressed');
      if (mobileSidebar && mobileSidebar.classList.contains('open')) {
        log('Sidebar already open — ignoring');
        return;
      }
      openSidebar();
    }, { passive: true });
    log('Attached click to #mobileMenuBtn');
  } else {
    warn('#mobileMenuBtn element not found');
  }

  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', function () {
      log('CLICK: #closeSidebarBtn pressed');
      closeSidebar();
    });
    log('Attached click to #closeSidebarBtn');
  } else {
    warn('#closeSidebarBtn element not found');
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', function () {
      log('CLICK: #mobileOverlay pressed -> closing sidebar');
      closeSidebar();
    });
    log('Attached click to #mobileOverlay');
  } else {
    warn('#mobileOverlay element not found');
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileSidebar && mobileSidebar.classList.contains('open')) {
      log('Escape pressed -> closing sidebar');
      closeSidebar();
    }
  });

  // ---------- Explore & request buttons ----------
  document.querySelectorAll('.explore-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      const svc = b.dataset.service || 'service';
      if (svc.toLowerCase().includes('website')) window.location.href = 'web.html';
      else if (svc.toLowerCase().includes('digital') || svc.toLowerCase().includes('ads') || svc.toLowerCase().includes('advert')) window.location.href = 'digi.html';
      else window.location.href = 'digi.html';
    });
  });

  document.querySelectorAll('.request-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      const svc = b.dataset.request || 'service';
      const phone = '+917904384080';
      const msg = encodeURIComponent(`Hello, I'm interested in ${svc}. Please contact me.`);
      const wa = 'https://wa.me/' + phone.replace(/\D/g, '') + '?text=' + msg;
      window.open(wa, '_blank');
    });
  });

  // ---------- Hero / CTA ----------
  document.getElementById('seeCase')?.addEventListener('click', function () {
    const s = document.querySelector('.services');
    if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.getElementById('contactHero')?.addEventListener('click', function () {
    window.location.href = 'contact.html';
  });

  // ---------- Contact / footer population ----------
  const phoneEl = document.getElementById('phoneValue');
  if (phoneEl) phoneEl.textContent = '+91 7904384080';
  const linkedEl = document.getElementById('linkedIn');
  if (linkedEl) {
    linkedEl.href = 'https://www.linkedin.com/company/luceaspace';
    linkedEl.textContent = 'https://www.linkedin.com/company/luceaspace';
  }

  // ---------- Resize helper ----------
  (function () {
    const nav = document.querySelector('nav');
    function resetNavOnResize() {
      if (!nav) return;
      const sb = document.getElementById('mobileSidebar');
      const overlay = document.getElementById('mobileOverlay');
      if (window.innerWidth > 1000) {
        nav.style.display = 'flex';
        if (sb) sb.classList.remove('open');
        if (overlay) { overlay.classList.remove('show'); overlay.hidden = true; }
        document.body.style.overflow = '';
      } else {
        nav.style.display = '';
      }
      log('Viewport width:', window.innerWidth, '— nav reset');
    }
    window.addEventListener('resize', resetNavOnResize);
    setTimeout(resetNavOnResize, 60);
  })();

  // ---------- Debug helpers exposed to console ----------
  window.LuceaSpaceSidebarDebug = {
    open: openSidebar,
    close: closeSidebar,
    dump: function () {
      const sb = document.getElementById('mobileSidebar');
      const nav = sb ? sb.querySelector('.sb-nav') : null;
      const info = {
        mobileMenuBtn: !!document.getElementById('mobileMenuBtn'),
        mobileSidebar: !!sb,
        closeSidebarBtn: !!document.getElementById('closeSidebarBtn'),
        mobileOverlay: !!document.getElementById('mobileOverlay'),
        sbNavCount: nav ? nav.querySelectorAll('li').length : 0,
        sbOpen: sb ? sb.classList.contains('open') : false,
        sbInnerText: sb ? (sb.innerText || '').slice(0, 500) : null
      };
      log('dump:', info);
      return info;
    }
  };

  // ---------- Init sequence ----------
  function initOnce() {
    ensureSiteToast();
    refreshAuthUI().catch(e => warn('refreshAuthUI error', e));
    log('OK: #mobileMenuBtn found.', !!mobileMenuBtn);
    log('OK: #mobileSidebar found.', !!mobileSidebar);
    log('OK: #closeSidebarBtn found.', !!closeSidebarBtn);
    log('OK: #mobileOverlay found.', !!mobileOverlay);
    log('OK: #siteToast found.', !!document.getElementById('siteToast'));

    // debug print of sidebar list items
    const navList = document.querySelectorAll('#mobileSidebar .sb-nav li');
    log('sb-nav li count:', navList.length);
    navList.forEach((li, i) => {
      const cs = window.getComputedStyle(li);
      log(`li[${i}] text="${li.textContent.trim()}" display=${cs.display} visibility=${cs.visibility} opacity=${cs.opacity}`);
    });

    log('Debug helpers available: LuceaSpaceSidebarDebug.dump(), .open(), .close()');
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initOnce, 40);
  } else {
    document.addEventListener('DOMContentLoaded', initOnce);
  }

})(); // end script



document.addEventListener('DOMContentLoaded', () => {
  // Phone click => call
  const sidePhone = document.getElementById('sidePhone');
  if (sidePhone) {
    sidePhone.addEventListener('click', () => {
      window.location.href = 'tel:+917904384080';
    });
  }

  // WhatsApp click => open chat
  const sideWhatsApp = document.getElementById('sideWhatsApp');
  if (sideWhatsApp) {
    // number without + and spaces
    const waNumber = '917904384080';
    sideWhatsApp.addEventListener('click', () => {
      const msg = encodeURIComponent('Hi, I would like to know more about your services.');
      window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank');
    });
  }

  //  Instagram
  const sideInsta = document.getElementById('sideInsta');
  if (sideInsta) {
    sideInsta.addEventListener('click', () => {
      window.open('https://www.instagram.com/lucea_space', '_blank');
    });
  }

  //  LinkedIn
  const sideLinkedIn = document.getElementById('sideLinkedIn');
  if (sideLinkedIn) {
    sideLinkedIn.addEventListener('click', () => {
      window.open('https://www.linkedin.com/company/luceaspace', '_blank');
    });
  }
});

// intro-loader.js
document.addEventListener('DOMContentLoaded', () => {
  const loader      = document.getElementById('introLoader');
  const desktopVid  = document.querySelector('#introLoader .desktop-video');
  const mobileVid   = document.querySelector('#introLoader .mobile-video');
  const skipBtn     = document.getElementById('skipIntroBtn');
  const introAudio  = document.getElementById('introAudio');

  if (!loader) return;

  // Choose active video by screen size
  const isMobile = window.innerWidth < 1025;
  const activeVideo   = isMobile ? mobileVid : desktopVid;
  const inactiveVideo = isMobile ? desktopVid : mobileVid;

  // Safety: hide & pause unused video
  if (inactiveVideo) {
    inactiveVideo.pause();
    inactiveVideo.style.display = 'none';
  }
  if (activeVideo) {
    activeVideo.style.display = 'block';
  }

  // --- AUDIO HELPERS ---
  function playIntroAudioFromStart() {
    if (!introAudio) return;

    // Reset audio so it can play every time page loads
    introAudio.pause();
    introAudio.currentTime = 0;
    introAudio.volume = 1;
    introAudio.muted = false;

    const p = introAudio.play();
    if (p && typeof p.then === 'function') {
      p.catch(err => {
        console.warn('[IntroAudio] Play blocked (needs user interaction):', err);
      });
    }
  }

  function stopIntroAudio() {
    if (!introAudio) return;
    introAudio.pause();
    introAudio.currentTime = 0;
  }

  // --- HIDE LOADER ---
  function hideIntro() {
    // Fade out
    loader.classList.add('hide');
    stopIntroAudio();
    document.body.style.overflow = '';

    // After CSS transition ends, remove completely
    setTimeout(() => {
      loader.style.display = 'none';
    }, 800); // must match CSS transition duration
  }

  // --- START INTRO ---
  function startIntro() {
    if (!activeVideo) {
      hideIntro();
      return;
    }

    loader.style.display = 'flex';
    loader.classList.remove('hide');
    document.body.style.overflow = 'hidden';

    // Reset video to beginning and play
    activeVideo.currentTime = 0;
    const vp = activeVideo.play();
    if (vp && typeof vp.then === 'function') {
      vp.catch(err => {
        console.warn('[IntroVideo] play() failed:', err);
      });
    }

    // When video ends naturally → hide loader & stop audio
    activeVideo.onended = () => {
      hideIntro();
    };

    // Safety timeout if ended never fires (corrupted duration etc.)
    // We'll pick 12s as "max intro length" fallback
    setTimeout(() => {
      if (loader.style.display !== 'none') {
        console.log('[Intro] Fallback timeout — hiding loader.');
        hideIntro();
      }
    }, 12000);
  }

  // --- SKIP BUTTON ---
 // Skip button logic with countdown
let skipLocked = true;   // Prevent skipping initially
let timeLeft = 4;        // Countdown seconds

// Start countdown on loader start
function startSkipCountdown() {
  skipBtn.textContent = `Skip in ${timeLeft}…`;
  skipBtn.disabled = true;

  const timer = setInterval(() => {
    timeLeft--;

    if (timeLeft > 0) {
      skipBtn.textContent = `Skip in ${timeLeft}…`;
    } else {
      clearInterval(timer);
      skipBtn.disabled = false;
      skipLocked = false;
      skipBtn.textContent = "Skip";
    }
  }, 1000);
}

startSkipCountdown();   // ⬅ call immediately



// UPDATED BUTTON CLICK HANDLER
if (skipBtn) {
  skipBtn.addEventListener('click', () => {

    // Block skip while locked
    if (skipLocked) return;

    if (activeVideo) activeVideo.pause();
    hideIntro();
  });
}

  // --- USER GESTURE → START AUDIO ---
  //
  // Browsers usually *block* sound autoplay until the first user interaction.
  // This handler says: on first click/tap while loader is still visible,
  // start the audio in sync with the running video.
  function onFirstUserGesture() {
    if (loader.style.display !== 'none') {
      playIntroAudioFromStart();
    }
    document.removeEventListener('click', onFirstUserGesture);
    document.removeEventListener('touchstart', onFirstUserGesture);
  }

  document.addEventListener('click', onFirstUserGesture, { passive: true });
  document.addEventListener('touchstart', onFirstUserGesture, { passive: true });

  // Kick off the intro (video will autoplay muted)
  startIntro();
});

