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
            // Show loading state
            thumbnailContainer.style.backgroundColor = "var(--bg-hover)";
            
            const loadingTask = pdfjsLib.getDocument(pdfPath);
            const pdf = await loadingTask.promise;
            
            // Get the first page
            const page = await pdf.getPage(1);
            
            // Calculate the scale to fit the container width
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
            
            // Set the display size to match container width while maintaining aspect ratio
            thumbnailCanvas.style.width = '100%';
            thumbnailCanvas.style.height = 'auto';
            
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
            
            // Track PDF view success if analytics function exists
            if (window.trackPdfViewSuccess) {
                window.trackPdfViewSuccess();
            }
            
            // Adjust the container height to match the rendered PDF aspect ratio
            const aspectRatio = originalViewport.height / originalViewport.width;
            thumbnailContainer.style.aspectRatio = `${1}/${aspectRatio}`;
            
            // Remove background color once loaded
            thumbnailContainer.style.backgroundColor = "";
        } catch (error) {
            console.error('Error generating thumbnail:', error);
            thumbnailContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);text-align:center;padding:20px;">Resume preview unavailable.<br>Click below to download.</div>';
            
            // Track PDF view error if analytics function exists
            if (window.trackPdfViewError) {
                window.trackPdfViewError();
            }
        }
    }
    
    // Load the PDF for thumbnail generation
    loadPdfThumbnail();
    
    // Handle window resize events to maintain proper aspect ratio
    window.addEventListener('resize', function() {
        // Reload the PDF thumbnail if the container width changes significantly
        const newWidth = thumbnailContainer.clientWidth;
        if (Math.abs(newWidth - parseInt(thumbnailCanvas.style.width)) > 50) {
            loadPdfThumbnail();
        }
    });
});
