(function () {
  'use strict';

  /* ---------------------------------------------------------------
     Social links - single source of truth for every footer across
     the site. Update a URL here once instead of in every HTML file.
  --------------------------------------------------------------- */
  var SOCIAL_LINKS = {
    linkedin: '#',
    twitter: '#',
    github: '#'
  };

  document.querySelectorAll('[data-social]').forEach(function (link) {
    var url = SOCIAL_LINKS[link.getAttribute('data-social')];
    if (!url || url === '#') return;
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });

  /* ---------------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------------- */
  var hamburger = document.getElementById('hamburgerBtn');
  var mainNav = document.getElementById('mainNav');

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('is-open');
      hamburger.classList.toggle('is-active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    mainNav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('is-open');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) {
        mainNav.classList.remove('is-open');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------------------------------------------------------
     Scroll-based header shadow
  --------------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var expandTrigger = document.querySelector('.mission-strip');
    var updateHeaderShadow = function () {
      var scrolled = expandTrigger
        ? expandTrigger.getBoundingClientRect().top <= 40
        : window.scrollY > 12;
      header.classList.toggle('is-scrolled', scrolled);
    };
    updateHeaderShadow();
    window.addEventListener('scroll', updateHeaderShadow, { passive: true });
    window.addEventListener('resize', updateHeaderShadow);
  }

  /* ---------------------------------------------------------------
     Active nav link detection
  --------------------------------------------------------------- */
  var currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(function (link) {
    var linkPage = link.getAttribute('href');
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---------------------------------------------------------------
     Scroll-reveal animation
  --------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

      revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* ---------------------------------------------------------------
     Flip cards - tap-to-flip fallback for touch devices
     (desktop uses the CSS :hover transform)
  --------------------------------------------------------------- */
  document.querySelectorAll('.flip-card').forEach(function (card) {
    card.addEventListener('click', function () {
      card.classList.toggle('is-flipped');
    });
  });

  /* ---------------------------------------------------------------
     Careers - job filtering + apply action
  --------------------------------------------------------------- */
  var jobFilters = document.getElementById('jobFilters');
  var jobList = document.getElementById('jobList');

  if (jobFilters && jobList) {
    var jobCards = jobList.querySelectorAll('.job-card');

    jobFilters.addEventListener('click', function (e) {
      var chip = e.target.closest('.filter-chip');
      if (!chip) return;

      jobFilters.querySelectorAll('.filter-chip').forEach(function (c) {
        c.classList.remove('is-active');
      });
      chip.classList.add('is-active');

      var filter = chip.getAttribute('data-filter');
      jobCards.forEach(function (card) {
        var show = filter === 'all' || card.getAttribute('data-dept') === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  }

  document.querySelectorAll('.apply-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var role = btn.getAttribute('data-role') || 'this role';
      var id = btn.getAttribute('data-id') || '';
      window.alert(
        'Thanks for your interest in ' + role + ' (Ref: ' + id + ')!\n\n' +
        'Please email your resume and a short note to careers@srstiquantum.com. ' +
        'Include the role reference in your subject line so our team can route it correctly.'
      );
    });
  });

  /* ---------------------------------------------------------------
     Contact form validation
  --------------------------------------------------------------- */
  var contactForm = document.getElementById('contactForm');

  if (contactForm) {
    var formStatus = document.getElementById('formStatus');
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    var fields = [
      {
        input: document.getElementById('fullName'),
        group: document.getElementById('group-name'),
        validate: function (v) { return v.trim().length >= 2; }
      },
      {
        input: document.getElementById('email'),
        group: document.getElementById('group-email'),
        validate: function (v) { return emailPattern.test(v.trim()); }
      },
      {
        input: document.getElementById('interest'),
        group: document.getElementById('group-interest'),
        validate: function (v) { return v.trim().length > 0; }
      },
      {
        input: document.getElementById('message'),
        group: document.getElementById('group-message'),
        validate: function (v) { return v.trim().length >= 10; }
      }
    ];

    var CONTACT_EMAIL = 'hello@srstiquantum.com';

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var allValid = true;
      fields.forEach(function (field) {
        if (!field.input || !field.group) return;
        var valid = field.validate(field.input.value);
        field.group.classList.toggle('has-error', !valid);
        if (!valid) allValid = false;
      });

      if (!formStatus) return;

      if (allValid) {
        var nameInput = document.getElementById('fullName');
        var emailInput = document.getElementById('email');
        var companyInput = document.getElementById('company');
        var interestSelect = document.getElementById('interest');
        var messageInput = document.getElementById('message');

        var interestLabel = interestSelect && interestSelect.selectedIndex >= 0
          ? interestSelect.options[interestSelect.selectedIndex].text
          : '';

        var subject = 'Website Enquiry - ' + interestLabel;
        var bodyLines = [
          'Name: ' + nameInput.value.trim(),
          'Email: ' + emailInput.value.trim(),
          'Company: ' + (companyInput.value.trim() || 'N/A'),
          'Interested In: ' + interestLabel,
          '',
          messageInput.value.trim()
        ];

        var mailtoUrl = 'mailto:' + CONTACT_EMAIL +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(bodyLines.join('\n'));

        window.location.href = mailtoUrl;

        formStatus.textContent = 'Opening your email client to send this to our team. If nothing happens, email us directly at ' + CONTACT_EMAIL + '.';
        formStatus.className = 'form-status is-success';
        contactForm.reset();
        window.setTimeout(function () {
          formStatus.className = 'form-status';
        }, 8000);
      } else {
        formStatus.textContent = 'Please fix the highlighted fields and try again.';
        formStatus.className = 'form-status is-error';
      }
    });

    fields.forEach(function (field) {
      if (!field.input || !field.group) return;
      field.input.addEventListener('input', function () {
        if (field.validate(field.input.value)) {
          field.group.classList.remove('has-error');
        }
      });
    });
  }

})();
