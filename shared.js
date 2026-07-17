/* shared.js — nav scroll, reveal animation, modal init */
(function () {
  // Nav scroll
  var nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // Scroll reveal
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 80 + 'ms';
    io.observe(el);
  });

  // Modal — generic, auto-discovers all .modal elements
  function initModal(modal) {
    if (!modal) return;
    var form      = modal.querySelector('form');
    var successEl = modal.querySelector('.modal-success');
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var first = modal.querySelector('input, textarea');
      if (first) setTimeout(function () { first.focus(); }, 30);
    }
    function close() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    // Wire open triggers by modal id
    var attrMap = { joinModal: 'data-open-join', waitlistModal: 'data-open-waitlist' };
    var triggerAttr = attrMap[modal.id];
    if (triggerAttr) {
      document.querySelectorAll('[' + triggerAttr + ']').forEach(function (el) {
        el.addEventListener('click', function (e) { e.preventDefault(); open(); });
      });
    }

    // Wire close triggers inside the modal
    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });

    // Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });

    // Tab trap
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusable = Array.from(modal.querySelectorAll('button, input, textarea, select, a[href]'))
        .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // Form submit → show success
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        form.hidden = true;
        if (successEl) successEl.hidden = false;
      });
    }
  }

  document.querySelectorAll('.modal').forEach(initModal);
})();
