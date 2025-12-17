const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const navMenu = document.querySelector('.nav-links');

// Smooth scroll for in-page anchors
const navLinks = document.querySelectorAll('a[href^="#"]');
navLinks.forEach(link => {
  link.addEventListener('click', event => {
    const targetId = link.getAttribute('href');
    if (targetId && targetId !== '#') {
      event.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
    if (navMenu) {
      navMenu.classList.remove('open');
    }
  });
});

// Add shadow when scrolling
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      header.classList.add('shadow');
    } else {
      header.classList.remove('shadow');
    }
  });
}

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });
}
