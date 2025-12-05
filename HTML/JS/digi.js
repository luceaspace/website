document.addEventListener('DOMContentLoaded', function () {

  /* --- pricing panel logic (single shared panel) --- */
  var pricingPanel = document.getElementById('pricingPanel');
  var plansWrap = document.getElementById('plansWrap');
  var closePricing = document.getElementById('closePricing');

  function closeAllServices() {
    document.querySelectorAll('.service-card.open').forEach(function (c) {
      c.classList.remove('open');
    });
    // hide all plan blocks
    if (plansWrap) {
      plansWrap.querySelectorAll('.plans').forEach(function (p) {
        p.style.display = 'none';
      });
    }
    if (pricingPanel) {
      pricingPanel.setAttribute('aria-hidden', 'true');
      pricingPanel.style.maxHeight = null;
    }
  }

  function openFor(key) {
    if (!pricingPanel || !plansWrap) return;
    // show only matching plans
    var blocks = plansWrap.querySelectorAll('.plans');
    blocks.forEach(function (b) {
      b.style.display = (b.getAttribute('data-for') === key) ? 'flex' : 'none';
    });

    pricingPanel.setAttribute('aria-hidden', 'false');

    // measure and expand to content
    requestAnimationFrame(function () {
      pricingPanel.style.maxHeight = pricingPanel.scrollHeight + 'px';
    });

    // mark clicked card open for slight visual effect
    var card = document.querySelector('.service-card[data-key="' + key + '"]');
    if (card) card.classList.add('open');

    // scroll into view (for smaller screens)
    setTimeout(function () {
      pricingPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 220);
  }

  function toggleService(key) {
    var card = document.querySelector('.service-card[data-key="' + key + '"]');
    if (!card || !plansWrap || !pricingPanel) return;

    var wasOpen = card.classList.contains('open');
    closeAllServices();

    if (!wasOpen) {
      openFor(key);
    } else {
      // already open - closed by closeAllServices
    }
  }

  // wire the Know more buttons
  document.querySelectorAll('.card-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-target');
      if (!key) return;
      toggleService(key);
    });
  });

  // close pricing panel
  if (closePricing) closePricing.addEventListener('click', function () {
    closeAllServices();
    // small accessibility focus move
    var firstToggle = document.querySelector('.card-toggle');
    if (firstToggle) firstToggle.focus();
  });

  // Get quote
  document.querySelectorAll('.get-quote').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var svc = btn.getAttribute('data-service') || 'service';
      // open whatsapp with prefilled message
      var phone = '+917904384080';
      var msg = encodeURIComponent('Hello, I am interested in ' + svc + '. Please contact me.');
      try {
        window.open('https://wa.me/' + phone.replace(/\D/g, '') + '?text=' + msg, '_blank');
      } catch (e) {
        alert('Requesting a quote for: ' + svc);
      }
    });
  });

  // contact demo
  document.querySelectorAll('.btn').forEach(function (b) {
    // keep default behaviour; some have other listeners above
  });

  // Recalculate heights when images load
  document.querySelectorAll('.card-img').forEach(function (img) {
    if (img.complete) return;
    img.addEventListener('load', function () {
      document.querySelectorAll('.pricing-panel[aria-hidden="false"]').forEach(function (p) {
        p.style.maxHeight = p.scrollHeight + 'px';
      });
    });
  });

  // On resize, recalculates panel height and prints debug info to console for overflow detection
  window.addEventListener('resize', function () {
    if (pricingPanel && pricingPanel.getAttribute('aria-hidden') === 'false') {
      pricingPanel.style.maxHeight = pricingPanel.scrollHeight + 'px';
    }

    // Debug lines - prints sizes to console. Remove these lines when you don't need them.
    console.log('Viewport width:', window.innerWidth, 'Body scrollWidth:', document.body.scrollWidth);
  });

  // Initial console debug (helpful for the left/right blank space issue)
  console.log('Initial viewport:', window.innerWidth, 'Body scrollWidth:', document.body.scrollWidth);

});
