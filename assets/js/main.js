// TaG Makes — main.js

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
  });
}

// Active nav link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  if (link.getAttribute('href') === currentPage) link.classList.add('active');
});

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling;
    const isOpen = btn.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-question.open').forEach(q => {
      q.classList.remove('open');
      q.nextElementSibling.classList.remove('open');
    });
    // Open clicked if it was closed
    if (!isOpen) {
      btn.classList.add('open');
      answer.classList.add('open');
    }
  });
});

// Prefers reduced motion check
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll fade-in (Intersection Observer)
const revealTargets = document.querySelectorAll('section, .scroll-reveal, .service-block, .portfolio-card, .blog-card');

if (prefersReducedMotion) {
  // Skip animation — make everything visible immediately
  revealTargets.forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  revealTargets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    observer.observe(el);
  });
}

// Animated counter for score numbers — proof section only
function animateCount(el, from, to, duration = 1200) {
  const start = performance.now();
  const update = (time) => {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + eased * (to - from));
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = to;
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const target = parseInt(e.target.dataset.count, 10);
      if (!isNaN(target)) {
        if (prefersReducedMotion) {
          e.target.textContent = target;
        } else {
          animateCount(e.target, parseInt(e.target.dataset.countStart || '0', 10), target);
        }
      }
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.proof-section [data-count]').forEach(el => counterObserver.observe(el));

// Contact form — Web3Forms handler
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn     = document.getElementById('formSubmit');
    const success = document.getElementById('formSuccess');
    const error   = document.getElementById('formError');
    const orig    = btn.textContent;

    btn.textContent = 'Sending...';
    btn.disabled    = true;
    success.style.display = 'none';
    error.style.display   = 'none';

    try {
      const res  = await fetch('https://api.web3forms.com/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify(Object.fromEntries(new FormData(contactForm)))
      });
      const data = await res.json();
      if (data.success) {
        success.style.display = 'block';
        contactForm.reset();
        btn.style.display = 'none';
      } else {
        throw new Error('Failed');
      }
    } catch {
      error.style.display = 'block';
      btn.textContent = orig;
      btn.disabled    = false;
    }
  });
}
