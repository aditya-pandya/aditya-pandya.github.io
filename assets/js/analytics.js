// Google Analytics configuration
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-NDCMBB8TEX', {
  'page_path': window.location.pathname + window.location.hash // Capture hash-based navigation
});

// Enhanced event tracking
document.addEventListener('DOMContentLoaded', function() {
  // 1. Navigation Tracking
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const sectionName = this.getAttribute('href').substring(1);
      gtag('event', 'navigation_click', {
        'section_name': sectionName,
        'navigation_type': 'main_nav'
      });
    });
  });
  
  // 2. Form Submission Tracking (if form exists)
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      gtag('event', 'form_submit', {
        'form_name': 'contact_form'
      });
    });
    
    // Track form field engagement
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
      input.addEventListener('focus', function() {
        gtag('event', 'form_field_engage', {
          'field_name': this.id || this.name
        });
      });
    });
  }
  
  // 3. Theme Toggle Tracking
  const themeToggles = document.querySelectorAll('.theme-toggle');
  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      gtag('event', 'theme_toggle', {
        'old_theme': currentTheme,
        'new_theme': newTheme
      });
    });
  });
  
  // 4. External Link Tracking
  const externalLinks = document.querySelectorAll('a[target="_blank"]');
  externalLinks.forEach(link => {
    link.addEventListener('click', function() {
      gtag('event', 'external_link_click', {
        'url': this.href,
        'link_text': this.innerText || this.textContent
      });
    });
  });
  
  // 5. Scroll Depth Tracking
  let scrollMarkers = [25, 50, 75, 90, 100];
  let scrollDepthTriggered = {};
  
  window.addEventListener('scroll', function() {
    const winHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const scrollPos = window.scrollY + winHeight;
    const scrollPercent = (scrollPos / docHeight) * 100;
    
    scrollMarkers.forEach(marker => {
      if (scrollPercent >= marker && !scrollDepthTriggered[marker]) {
        scrollDepthTriggered[marker] = true;
        gtag('event', 'scroll_depth', {
          'depth_percentage': marker,
          'page_section': getCurrentSection()
        });
        });
  });
  
  function getCurrentSection() {
    const sections = document.querySelectorAll('section');
    const scrollPosition = window.scrollY + (window.innerHeight / 3);
    
    for (const section of sections) {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        return section.id || 'unknown';
      }
    }
    return 'header';
  }
  
  // 6. Time on Page Tracking
  const startTime = new Date();
  let timeOnPageTracked = {};
  const timeIntervals = [30, 60, 120, 300]; // seconds
  
  setInterval(function() {
    const timeSpent = Math.floor((new Date() - startTime) / 1000);
    timeIntervals.forEach(interval => {
      if (timeSpent >= interval && !timeOnPageTracked[interval]) {
        timeOnPageTracked[interval] = true;
        gtag('event', 'time_on_page', {
          'time_seconds': interval,
          'current_section': getCurrentSection()
        });
      }
    });
  }, 1000);
  
  // 7. Skill Tag Interactions (if they exist)
  const skillTags = document.querySelectorAll('.tag');
  skillTags.forEach(tag => {
    tag.addEventListener('click', function() {
      gtag('event', 'skill_tag_click', {
        'skill_name': this.textContent.trim()
      });
    });
  });
  
  // 8. Mobile Menu Usage (if it exists)
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
      const isOpening = !document.querySelector('.nav-links').classList.contains('active');
      gtag('event', 'mobile_menu', {
        'action': isOpening ? 'open' : 'close'
      });
    });
  }
  
  // 9. Career Highlight Cards Visibility (if they exist)
  if ('IntersectionObserver' in window) {
    const highlightCards = document.querySelectorAll('.card');
    
    if (highlightCards.length > 0) {
      const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const cardTitle = entry.target.querySelector('.card-title')?.textContent.trim();
            if (cardTitle) {
              gtag('event', 'highlight_card_view', {
                'card_title': cardTitle
              });
            }
            cardObserver.unobserve(entry.target); // Only trigger once
          }
        });
      }, {threshold: 0.5});
      
      highlightCards.forEach(card => {
        cardObserver.observe(card);
      });
    }
  }
});
