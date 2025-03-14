// Immediately set up the theme to prevent theme flicker
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

document.addEventListener('DOMContentLoaded', function() {
  // Theme toggling functionality
  const themeToggles = document.querySelectorAll('.theme-toggle');
  const htmlElement = document.documentElement;
  const savedTheme = localStorage.getItem('theme') || 'dark';
  htmlElement.setAttribute('data-theme', savedTheme);
  updateThemeIcons(savedTheme);

  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcons(newTheme);
    });
  });

  function updateThemeIcons(theme) {
    themeToggles.forEach(toggle => {
      const icon = toggle.querySelector('i');
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
  }

  // Mobile menu functionality - Only run if the mobile menu toggle exists
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuToggle && navLinks) {
    const hamburgerIcon = mobileMenuToggle.querySelector('i');

    mobileMenuToggle.addEventListener('click', function(event) {
      event.stopPropagation();
      navLinks.classList.toggle('active');
      hamburgerIcon.className = navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    });

    document.addEventListener('click', function(event) {
      if (navLinks.classList.contains('active') &&
          !navLinks.contains(event.target) &&
          event.target !== mobileMenuToggle) {
        navLinks.classList.remove('active');
        hamburgerIcon.className = 'fas fa-bars';
      }
    });
  }

  // Scroll functionality - Only run if the progress bar exists
  const progressBar = document.getElementById("progressBar");
  
  if (progressBar) {
    window.addEventListener('scroll', function() {
      updateProgressBar();
      highlightActiveSection();
    });

    function updateProgressBar() {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + "%";
    }

    function highlightActiveSection() {
      const sections = document.querySelectorAll('.section');
      const navLinks = document.querySelectorAll('.nav-link');
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= (sectionTop - 300)) {
          current = section.getAttribute('id');
        }
      });
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') && link.getAttribute('href').substring(1) === current) {
          link.classList.add('active');
        }
      });
    }

    // Initialize on page load
    updateProgressBar();
    highlightActiveSection();
  }
});
