(function () {
  // --- config ---
  const API = '/api'; // your backend base
  const CONTACT_ROUTE = API + '/contact';
  // default Formspree endpoint (you can override by setting window.CONTACT_FROMSPREE)
  const DEFAULT_FORMSPREE = 'https://formspree.io/f/xldklwgy';

  // --- helpers ---
  function log(...args) { console.log('[ContactJS]', ...args); }
  function warn(...args) { console.warn('[ContactJS]', ...args); }
  function error(...args) { console.error('[ContactJS]', ...args); }

  // toast helper (uses element with id="toast")
  const toastEl = document.getElementById('toast');
  function showToast(msg, ms = 2200) {
    if (!toastEl) { log('toast:', msg); return; }
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    toastEl.setAttribute('aria-hidden', 'false');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () {
      toastEl.style.opacity = '0';
      toastEl.setAttribute('aria-hidden', 'true');
    }, ms);
  }

  // token helper (keeps compatibility if you had auth)
  function getToken() { return localStorage.getItem('ls_token'); }

  // Choose which Formspree endpoint to use (global override allowed)
  function getFormspreeEndpoint() {
    return (window && window.CONTACT_FROMSPREE) ? window.CONTACT_FROMSPREE : DEFAULT_FORMSPREE;
  }

  // Small util to parse JSON safe
  async function tryParseJSON(text) {
    try { return JSON.parse(text); } catch (e) { return text; }
  }

  // --- main form wiring ---
  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    if (!form) {
      error('contactForm not found in DOM — nothing to wire.');
      return;
    }

    // debug: show initial state
    log('Wiring contact form. CONTACT_ROUTE=', CONTACT_ROUTE, 'Formspree fallback=', getFormspreeEndpoint());

    // Clear button (if exists)
    document.getElementById('clearBtn')?.addEventListener('click', function () {
      form.reset();
      showToast('Cleared');
    });

    // copy phone / links (preserve previous behavior)
    document.getElementById('copyPhone')?.addEventListener('click', function () {
      const txt = this.textContent.trim();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(() => showToast('Copied phone'), () => showToast('Copy failed'));
      } else { showToast('Copy not supported'); }
    });
    document.getElementById('emailLink')?.addEventListener('click', function () {
      window.location.href = 'mailto:luceaspace@gmail.com?subject=Enquiry';
    });
    document.getElementById('linkedInLink')?.addEventListener('click', function () {
      window.open('https://www.linkedin.com/company/luceaspace', '_blank');
    });

    // form submit handler
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Read elements directly (avoids name mismatch)
      const nameEl = form.querySelector('[name="name"]');
      const emailEl = form.querySelector('[name="email"]');
      const phoneEl = form.querySelector('[name="phone"]');
      const serviceEl = form.querySelector('[name="service"]');
      const messageEl = form.querySelector('[name="message"]');

      const payload = {
        name: nameEl ? nameEl.value.trim() : '',
        email: emailEl ? emailEl.value.trim() : '',
        phone: phoneEl ? phoneEl.value.trim() : '',
        service: serviceEl ? serviceEl.value : '',
        message: messageEl ? messageEl.value.trim() : ''
      };

      log('Outgoing payload:', payload);

      // basic validation
      if (!payload.name || !payload.email || !payload.message) {
        showToast('Please enter name, email and message');
        return;
      }

      // ---- Fallback to Formspree ----
      // Use FormData and let browser set the proper Content-Type for form posts
      try {
        const formspreeUrl = getFormspreeEndpoint();
        const formData = new FormData();
        formData.append('name', payload.name);
        formData.append('email', payload.email);
        formData.append('phone', payload.phone);
        formData.append('service', payload.service);
        formData.append('message', payload.message);
        // optional: add a hidden _subject for Formspree
        formData.append('_subject', `New contact — ${payload.name}`);

        log('Attempting fallback post to Formspree:', formspreeUrl);
        const res2 = await fetch(formspreeUrl, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' } // request JSON response from Formspree
        });

        const raw2 = await res2.text();
        const parsed2 = await tryParseJSON(raw2);
        log('Formspree response raw:', raw2, 'parsed:', parsed2);

        if (res2.ok) {
          form.reset();
          showToast('Message sent — we will contact you shortly');
          log('Contact delivered via Formspree.');
          return;
        } else {
          // both backend and fallback failed
          error('Formspree request failed:', { status: res2.status, body: parsed2 });
          showToast('Failed to send message. See console for details.');
        }
      } catch (fsErr) {
        error('Formspree request exception:', fsErr);
        showToast('Network error while trying fallback');
      }
    }); // end submit
  }); // end DOMContentLoaded wrapper

  // expose small debug helpers
  window.ContactJS = {
    setFormspree: function (url) {
      if (typeof url === 'string' && url.length > 5) {
        window.CONTACT_FROMSPREE = url;
        log('CONTACT_FROMSPREE set to', url);
      } else {
        warn('setFormspree requires a URL string');
      }
    },
    getFormspree: function () { return getFormspreeEndpoint(); }
  };
})();
