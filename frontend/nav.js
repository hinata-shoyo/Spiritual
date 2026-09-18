document.addEventListener('DOMContentLoaded', function () {
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a:not(.lang-toggle)').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });

    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      }
    });
  }

  // Back to top button
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Language toggle
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    var currentLang = localStorage.getItem('gurujiLang') || 'en';
    applyLanguage(currentLang);

    langToggle.addEventListener('click', function () {
      var newLang = currentLang === 'en' ? 'hi' : 'en';
      currentLang = newLang;
      localStorage.setItem('gurujiLang', newLang);
      applyLanguage(newLang);
    });
  }

  function applyLanguage(lang) {
    var toggle = document.getElementById('langToggle');
    if (toggle) {
      toggle.textContent = lang === 'en' ? 'हिन्दी' : 'English';
    }
    document.querySelectorAll('[data-en]').forEach(function (el) {
      el.textContent = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-hi');
    });
    document.querySelectorAll('[data-en-placeholder]').forEach(function (el) {
      el.placeholder = lang === 'en' ? el.getAttribute('data-en-placeholder') : el.getAttribute('data-hi-placeholder');
    });
  }

  // Auto-dismiss error messages
  document.querySelectorAll('.error-message').forEach(function (el) {
    setTimeout(function () {
      el.style.transition = 'opacity 0.5s';
      el.style.opacity = '0';
      setTimeout(function () { el.style.display = 'none'; }, 500);
    }, 8000);
  });
});
