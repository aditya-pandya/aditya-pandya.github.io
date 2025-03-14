// Browser detection for enhanced compatibility
document.addEventListener('DOMContentLoaded', function() {
  // Detect if this is Safari
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  // Detect if this is iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Add classes to body for CSS targeting
  if (isSafari) {
    document.body.classList.add('safari-browser');
  }
  
  if (isIOS) {
    document.body.classList.add('ios-device');
  }
  
  // Specifically handle the navigation bar
  const navBar = document.querySelector('.nav');
  
  if (navBar && (isSafari || isIOS)) {
    // For Safari/iOS, forcibly apply solid background
    navBar.classList.add('solid-nav');
    
    // Remove any backdrop filters
    navBar.style.backdropFilter = 'none';
    navBar.style.webkitBackdropFilter = 'none';
    
    // Apply solid background color based on theme
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      navBar.style.backgroundColor = '#0a0a0a';
    } else {
      navBar.style.backgroundColor = '#FFFFFF';
    }
    
    // Handle theme switching for navigation
    const themeToggles = document.querySelectorAll('.theme-toggle');
    themeToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        setTimeout(() => {
          const newTheme = document.documentElement.getAttribute('data-theme');
          if (newTheme === 'dark') {
            navBar.style.backgroundColor = '#0a0a0a';
          } else {
            navBar.style.backgroundColor = '#FFFFFF';
          }
        }, 50); // Small delay to ensure theme has changed
      });
    });
  }
});
