document.addEventListener('DOMContentLoaded', function () {
  // Elements
  var pricingPanel = document.getElementById('pricingPanel');
  var plansWrap = document.getElementById('plansWrap');
  var closePricingBtn = document.getElementById('closePricing');

  /* ---------- Pricing panel logic ---------- */

  // Hide all .plans groups (we'll show the matching one when needed)
  Array.prototype.forEach.call(plansWrap.querySelectorAll('.plans'), function (p) {
    p.style.display = 'none';
  });

  function openPricingFor(key) {
    if (!pricingPanel || !plansWrap) return;
    // show only matching block
    Array.prototype.forEach.call(plansWrap.querySelectorAll('.plans'), function (b) {
      if (b.getAttribute('data-for') === key) {
        b.style.display = 'flex';
      } else {
        b.style.display = 'none';
      }
    });

    pricingPanel.setAttribute('aria-hidden', 'false');

    // measure and animate open
    requestAnimationFrame(function () {
      pricingPanel.style.maxHeight = pricingPanel.scrollHeight + 'px';
    });

    // mark clicked card visually (optional)
    var all = document.querySelectorAll('.service-card');
    all.forEach(function (c) { c.classList.remove('open'); });
    var card = document.querySelector('.service-card[data-key="' + key + '"]');
    if (card) card.classList.add('open');

    // scroll into view if needed
    setTimeout(function () {
      pricingPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 260);
  }

  function closePricing() {
    if (!pricingPanel) return;
    pricingPanel.setAttribute('aria-hidden', 'true');
    pricingPanel.style.maxHeight = null;
    // remove open class from any card
    var openCards = document.querySelectorAll('.service-card.open');
    openCards.forEach(function (c) { c.classList.remove('open'); });
  }

  // Wire Know more buttons (cards)
  var toggles = document.querySelectorAll('.card-toggle');
  toggles.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var key = btn.getAttribute('data-target');
      if (!key) return;
      // if open and same group -> close
      var isOpen = pricingPanel.getAttribute('aria-hidden') === 'false';
      var visible = plansWrap.querySelector('.plans[data-for="' + key + '"]');
      var isSameVisible = visible && visible.style.display === 'flex';
      if (isOpen && isSameVisible) {
        closePricing();
      } else {
        openPricingFor(key);
      }
      // ensure sidebar closed on mobile when opening pricing
      closeSidebar();
    });
  });

  if (closePricingBtn) closePricingBtn.addEventListener('click', closePricing);

  // Get quote buttons (simple handler; replace with your modal/form)
  var quoteBtns = document.querySelectorAll('.get-quote');
  quoteBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var svc = b.getAttribute('data-service') || 'service';
      // open whatsapp with prefilled message
      var phone = '+917904384080';
      var msg = encodeURIComponent('Hello, I am interested in ' + svc + '. Please contact me.');
      try {
        window.open('https://wa.me/' + phone.replace(/\D/g, '') + '?text=' + msg, '_blank');
      } catch (e) {
        alert('Requesting quote: ' + svc);
      }
    });
  });

  // Recompute panel heights when images load or window resizes
  var imgs = document.querySelectorAll('img');
  imgs.forEach(function (img) {
    img.addEventListener('load', function () {
      if (pricingPanel && pricingPanel.getAttribute('aria-hidden') === 'false') {
        pricingPanel.style.maxHeight = pricingPanel.scrollHeight + 'px';
      }
    });
  });

  window.addEventListener('resize', function () {
    // keep open panel sized correctly
    if (pricingPanel && pricingPanel.getAttribute('aria-hidden') === 'false') {
      pricingPanel.style.maxHeight = pricingPanel.scrollHeight + 'px';
    }
  });

  // Safety: prevent accidental horizontal overflow by ensuring container children can shrink
  (function shrinkFix() {
    var elems = document.querySelectorAll('.container, .cards-grid, .service-card, .pricing-inner, .plan-card');
    elems.forEach(function (el) {
      el.style.minWidth = '0';
    });
  })();
});
