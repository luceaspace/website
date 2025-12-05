// sign.js - handles sign in / sign up behavior and Google redirect token handling
(function(){
  const API = '/api';
  const authCard = document.getElementById('authCard');
  const switchBtn = document.getElementById('switchBtn');
  const createAccount = document.getElementById('createAccount');
  const toSignIn = document.getElementById('toSignIn');
  const siForm = document.getElementById('signinForm');
  const suForm = document.getElementById('signupForm');

  // read token returned by Google redirect (query param)
  function getQueryToken(){
    const q = new URLSearchParams(location.search);
    return q.get('token');
  }

  // save token & redirect to home
  function saveAndGo(token){
    try { localStorage.setItem('ls_token', token); } catch(e){}
    // remove query string for cleanliness
    history.replaceState({}, '', 'sign.html');
    window.location.href = 'home.html';
  }

  // If Google returned token in query, save & go
  const googleToken = getQueryToken();
  if (googleToken) {
    saveAndGo(googleToken);
  }

  // Default state
  let signupMode = location.hash === '#signup';

  function updateSlide(){
    const title = document.getElementById('slideTitle');
    const text = document.getElementById('slideText');
    if (signupMode) {
      authCard.classList.add('sign-up-active');
      switchBtn.textContent = 'Sign In';
      title.textContent = 'Welcome back!';
      text.textContent = 'Already have an account? Sign in to continue.';
    } else {
      authCard.classList.remove('sign-up-active');
      switchBtn.textContent = 'Sign Up';
      title.textContent = 'Hello, Friend!';
      text.textContent = 'Enter your details and start your journey with us.';
    }
    setTimeout(()=>{
      if (signupMode) document.querySelector('#signupForm input')?.focus();
      else document.querySelector('#signinForm input')?.focus();
    }, 220);
  }

  switchBtn?.addEventListener('click', function () { signupMode = !signupMode; updateSlide(); });
  createAccount?.addEventListener('click', function (e) { e.preventDefault(); signupMode = true; updateSlide(); });
  toSignIn?.addEventListener('click', function (e) { e.preventDefault(); signupMode = false; updateSlide(); });

  // pw toggles
  document.querySelectorAll('.pw-toggle').forEach(btn=>{
    btn.addEventListener('click', function(){
      const id = btn.getAttribute('data-target');
      const inp = document.getElementById(id);
      if (!inp) return;
      if (inp.type === 'password'){ inp.type = 'text'; btn.textContent = '🙈'; btn.setAttribute('aria-pressed','true'); }
      else { inp.type = 'password'; btn.textContent = '👁️'; btn.setAttribute('aria-pressed','false'); }
    });
  });

  function toast(msg){
    // simple toast using siteToast if present
    const t = document.getElementById('siteToast');
    if (!t) { alert(msg); return; }
    t.textContent = msg; t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),1800);
  }

  // Signup submit
  suForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = document.getElementById('su-name').value.trim();
    const email = document.getElementById('su-email').value.trim();
    const password = document.getElementById('su-pass').value;
    if (!name || !email || !password) { toast('Please fill name, email and password'); return; }
    try {
      const res = await fetch(API + '/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const j = await res.json();
      if (!res.ok) { toast(j.error || 'Signup failed'); return; }
      localStorage.setItem('ls_token', j.token);
      window.location.href = 'home.html';
    } catch (err) { console.error(err); toast('Network error'); }
  });

  // Signin submit
  siForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('si-email').value.trim();
    const password = document.getElementById('si-pass').value;
    if (!email || !password) { toast('Please fill email & password'); return; }
    try {
      const res = await fetch(API + '/auth/signin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const j = await res.json();
      if (!res.ok) { toast(j.error || 'Signin failed'); return; }
      localStorage.setItem('ls_token', j.token);
      window.location.href = 'home.html';
    } catch (err) { console.error(err); toast('Network error'); }
  });

  // Google buttons (open backend route)
  document.getElementById('siGoogle')?.addEventListener('click', function () {
    window.location.href = '/api/auth/google';
  });
  document.getElementById('suGoogle')?.addEventListener('click', function () {
    window.location.href = '/api/auth/google';
  });

  // initial state
  updateSlide();
})();
