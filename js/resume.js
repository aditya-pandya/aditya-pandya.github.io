// Set the PDF.js worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

document.addEventListener('DOMContentLoaded', function() {
    const pdfPath = './Aditya Pandya - Resume.pdf'; // Path to PDF relative to this HTML file
    const thumbnailCanvas = document.getElementById('pdfThumbnail');
    const downloadBtn = document.getElementById('downloadBtn');
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    
    // Download button event listener
    downloadBtn.addEventListener('click', function() {
        const a = document.createElement('a');
        a.href = pdfPath;
        a.download = 'Aditya Pandya - Resume.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // Function to generate a high-quality thumbnail from the PDF
    async function loadPdfThumbnail() {
        try {
            const loadingTask = pdfjsLib.getDocument(pdfPath);
            
            // Show loading state
            thumbnailContainer.style.backgroundColor = "var(--bg-hover)";
            
            const pdf = await loadingTask.promise;
            
            // Get the first page
            const page = await pdf.getPage(1);
            
            // Calculate the scale to fit the canvas with higher quality
            const containerWidth = thumbnailContainer.clientWidth;
            const originalViewport = page.getViewport({ scale: 1 });
            
            // Use a higher scale for better quality (2x device pixel ratio)
            const pixelRatio = window.devicePixelRatio || 2;
            const scale = (containerWidth / originalViewport.width) * pixelRatio;
            const viewport = page.getViewport({ scale: scale });
            
            // Prepare canvas for rendering
            const context = thumbnailCanvas.getContext('2d');
            thumbnailCanvas.width = viewport.width;
            thumbnailCanvas.height = viewport.height;
            thumbnailCanvas.style.width = `${containerWidth}px`;
            thumbnailCanvas.style.height = `${(containerWidth / originalViewport.width) * originalViewport.height}px`;
            
            // Set higher quality rendering
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = 'high';
            
            // Render the page
            const renderContext = {
                canvasContext: context,
                viewport: viewport,
                intent: 'display'
            };
            
            await page.render(renderContext).promise;
            
            // Track PDF view success using the function from resume-analytics.js if available
            if (window.trackPdfViewSuccess) {
                window.trackPdfViewSuccess();
            }

            // Fix for potential vertical scrollbar by checking if we need to adjust height
            const mainContent = document.querySelector('.main-content');
            const totalHeight = thumbnailContainer.offsetHeight + downloadBtn.offsetHeight + 30; // Add padding
            const windowHeight = window.innerHeight - 140; // Subtract nav and footer space
            
            // If the content would cause scrolling, adjust height for iPad and other devices
            if (totalHeight > windowHeight && window.innerWidth >= 768) {
                const newHeight = windowHeight - downloadBtn.offsetHeight - 30;
                thumbnailContainer.style.height = `${newHeight}px`;
                thumbnailCanvas.style.height = `${newHeight}px`;
            }
        } catch (error) {
            console.error('Error generating thumbnail:', error);
            thumbnailContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);text-align:center;padding:20px;">Resume preview unavailable.<br>Click below to download.</div>';
            
            // Track PDF view error using the function from resume-analytics.js if available
            if (window.trackPdfViewError) {
                window.trackPdfViewError();
            }
        }
    }
    
    // Load the PDF for thumbnail generation with error handling
    loadPdfThumbnail();
    
    // Prevent vertical scroll bars by checking window dimensions
    window.addEventListener('resize', function() {
        const body = document.body;
        const html = document.documentElement;
        const windowHeight = window.innerHeight;
        const docHeight = Math.max(
            body.scrollHeight, body.offsetHeight,
            html.clientHeight, html.scrollHeight, html.offsetHeight
        );
        
        // If document is taller than window, apply fix
        if (docHeight > windowHeight) {
            // Adjust for iPad and other tablets
            if (window.innerWidth >= 768) {
                const thumbnailContainer = document.getElementById('thumbnailContainer');
                if (thumbnailContainer) {
                    const mainContent = document.querySelector('.main-content');
                    const downloadBtn = document.getElementById('downloadBtn');
                    const availableHeight = windowHeight - 140; // Subtract nav and footer
                    const btnHeight = downloadBtn ? downloadBtn.offsetHeight : 60;
                    const newHeight = availableHeight - btnHeight - 30; // Padding
                    
                    thumbnailContainer.style.height = `${newHeight}px`;
                    // If canvas exists, adjust it too
                    if (thumbnailCanvas) {
                        thumbnailCanvas.style.height = `${newHeight}px`;
                    }
                }
            }
        }
    });
});
