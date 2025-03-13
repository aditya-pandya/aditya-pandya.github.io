// Resume page specific analytics
document.addEventListener('DOMContentLoaded', function() {
    // Download button event listener with Google Analytics tracking
    const downloadBtn = document.getElementById('downloadBtn');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            // Track the download event
            if (typeof gtag === 'function') {
                gtag('event', 'download_resume', {
                    'event_category': 'Resume',
                    'event_label': 'Resume Download',
                    'value': 1
                });
            }
        });
    }
    
    // Add event tracking for PDF view success and errors from the resume.js file
    window.trackPdfViewSuccess = function() {
        if (typeof gtag === 'function') {
            gtag('event', 'view_resume', {
                'event_category': 'Resume',
                'event_label': 'Resume View Success',
                'value': 1
            });
        }
    };
    
    window.trackPdfViewError = function() {
        if (typeof gtag === 'function') {
            gtag('event', 'view_resume_error', {
                'event_category': 'Resume',
                'event_label': 'Resume View Error',
                'value': 1
            });
        }
    };
    
    // Track navigation back to main site
    const backLink = document.querySelector('.nav-link');
    if (backLink) {
        backLink.addEventListener('click', function() {
            if (typeof gtag === 'function') {
                gtag('event', 'navigation', {
                    'event_category': 'Navigation',
                    'event_label': 'Back to Main Site',
                    'value': 1
                });
            }
        });
    }
});
