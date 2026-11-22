const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const opened = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(opened));
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const topButton = document.querySelector('.to-top');
if (topButton) {
  window.addEventListener('scroll', () => {
    topButton.classList.toggle('show', window.scrollY > 500);
  });
  topButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const year = document.getElementById('year');
if (year) {
  year.textContent = String(new Date().getFullYear());
}
