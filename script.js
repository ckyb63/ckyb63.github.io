// Main JavaScript for Max Chen's Portfolio Website

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle functionality
    const hamburger = document.querySelector('.hamburger-menu');
    const navOverlay = document.querySelector('.nav-overlay');
    const navLinks = document.querySelectorAll('.nav-links a');
    const body = document.body;
    
    function toggleMobileMenu() {
        body.classList.toggle('menu-open');
    }
    
    function closeMobileMenu() {
        body.classList.remove('menu-open');
    }
    
    // Add event listeners if elements exist
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    if (navOverlay) {
        navOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (body.classList.contains('menu-open')) {
                closeMobileMenu();
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (body.classList.contains('menu-open')) {
            const isMenuClick = e.target.closest('.nav-links') || 
                               e.target.closest('.hamburger-menu');
            if (!isMenuClick) {
                closeMobileMenu();
            }
        }
    });
    
    // Handle escape key to close menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && body.classList.contains('menu-open')) {
            closeMobileMenu();
        }
    });
    
    // Function to handle scrolling to an element with proper offset
    function scrollToElement(targetElement, useSmooth = true) {
        if (!targetElement) return;
        
        // Get the height of the fixed header
        const nav = document.querySelector('nav');
        const navHeight = nav ? nav.offsetHeight : 60;
        // Add extra padding for better visual appearance
        const extraPadding = 30;
        const totalOffset = navHeight + extraPadding;
        
        // Get the element's position relative to the viewport
        const elementRect = targetElement.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        
        // Scroll to element
        window.scrollTo({
            top: absoluteElementTop - totalOffset,
            behavior: useSmooth ? 'smooth' : 'auto'
        });
    }
    
    // Smooth scrolling for anchor links (only for same-page links)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            
            // Skip if it's just "#" or empty
            if (targetId === '#' || targetId === '#top') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }
            
            const targetElement = document.querySelector(targetId);
            
            // Only prevent default if target exists on current page
            if (targetElement) {
                e.preventDefault();
                scrollToElement(targetElement, true);
            }
            // If target doesn't exist, let the browser handle it (might be on another page)
        });
    });
    
    // Handle direct URL navigation to anchor links
    if (window.location.hash) {
        // Use a delay to ensure the page is fully loaded and rendered
        setTimeout(function() {
            const targetId = window.location.hash;
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                scrollToElement(targetElement, false);
            }
        }, 300);
    }
    
    // Recalculate scroll positions when window is resized
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // If we're at a hash location, reposition after resize
            if (window.location.hash) {
                const targetElement = document.querySelector(window.location.hash);
                if (targetElement) {
                    scrollToElement(targetElement, false);
                }
            }
        }, 250);
    });
    
    // Add scrolled class to body when page is scrolled
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            body.classList.add('scrolled');
        } else {
            body.classList.remove('scrolled');
        }
        
        // Show/hide back to top button
        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
        
        // Update progress bar
        updateProgressBar();
    });
    
    // Active section highlighting in navigation (only for single-page sections)
    const sections = document.querySelectorAll('.content-section');
    const navLinksArray = document.querySelectorAll('nav ul li a[href^="#"]');
    
    if (sections.length > 0 && navLinksArray.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            const nav = document.querySelector('nav');
            const navHeight = nav ? nav.offsetHeight : 60;
            const scrollPosition = window.scrollY + navHeight + 30;
            
            sections.forEach(section => {
                const sectionTop = section.getBoundingClientRect().top + window.pageYOffset;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    current = section.getAttribute('id');
                }
            });
            
            // Update navigation active state for same-page links only
            navLinksArray.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }
    
    // Set active page in navigation for multi-page structure
    function setActivePageNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('nav ul li a');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkPath = link.getAttribute('href');
            
            // Check if this link matches the current page
            if (linkPath === currentPage || 
                (currentPage === '' && linkPath === 'index.html') ||
                (currentPage === 'index.html' && linkPath === 'index.html') ||
                linkPath.endsWith(currentPage)) {
                link.classList.add('active');
            }
        });
    }
    
    // Set active page navigation on load
    setActivePageNav();
    
    // Image lazy loading
    const lazyImages = document.querySelectorAll('img[loading="lazy"], .gallery-item img, .project-image img');
    
    // For browsers that support IntersectionObserver
    if ('IntersectionObserver' in window && lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    
                    // If the image has a data-src, load that image
                    if (image.dataset.src) {
                        image.src = image.dataset.src;
                        image.removeAttribute('data-src');
                    }
                    
                    image.classList.add('loaded');
                    imageObserver.unobserve(image);
                }
            });
        });
        
        lazyImages.forEach(image => {
            imageObserver.observe(image);
        });
    }
    
    // Contact form handling (if on contact page)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            if (!data.name || !data.email || !data.subject || !data.message) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // For now, just show a success message
            // In production, you'd send this to a server
            alert('Thank you for your message! I\'ll get back to you soon.');
            contactForm.reset();
        });
    }
    
    // Gallery functionality for project images
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length > 0) {
        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                const img = this.querySelector('img');
                if (img) {
                    openImageModal(img.src, img.alt);
                }
            });
        });
    }
    
    // Clickable image functionality
    const clickableImages = document.querySelectorAll('.clickable-image');
    if (clickableImages.length > 0) {
        clickableImages.forEach(item => {
            item.addEventListener('click', function() {
                const img = this.querySelector('img');
                if (img) {
                    openImageModal(img.src, img.alt);
                }
            });
        });
    }
    
    // Simple image modal for gallery
    function openImageModal(src, alt) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content">
                    <img src="${src}" alt="${alt}">
                    <button class="modal-close" aria-label="Close">&times;</button>
                </div>
            </div>
        `;
        
        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const modalImg = modal.querySelector('img');
        modalImg.style.cssText = `
            max-width: 80vw;
            max-height: 70vh;
            width: auto;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        `;
        
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 10px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1001;
        `;
        
        // Close modal function
        function closeModal() {
            modal.remove();
        }
        
        // Event listeners
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal || e.target === modal.querySelector('.modal-backdrop')) {
                closeModal();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        // Add to DOM
        document.body.appendChild(modal);
    }
    
    // Progress bar functionality
    function updateProgressBar() {
        const progressBar = document.getElementById('progress-bar');
        if (!progressBar) return;
        
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        progressBar.style.width = scrolled + '%';
    }
    
    // Initialize progress bar
    updateProgressBar();
    
    // Smooth scroll for back to top button
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Add animation on scroll for content sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe content sections for animation
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        sectionObserver.observe(section);
    });
});

// Helper function to close TOC if it's open
function closeTOCIfOpen() {
    const floatingTOC = document.querySelector('.floating-toc');
    const toggleButton = document.querySelector('.toc-toggle');
    
    if (floatingTOC && floatingTOC.classList.contains('expanded')) {
        floatingTOC.classList.remove('expanded');
        if (toggleButton) {
            toggleButton.setAttribute('aria-label', 'Open table of contents');
        }
    }
}

// Modal functions for resume preview
function openResumeModal() {
    // Close TOC if it's open
    closeTOCIfOpen();
    
    const modal = document.getElementById('resumeModal');
    const frame = document.getElementById('resumeFrame');
    
    // Set the PDF source
    frame.src = 'documents/Max_Chen_Resume.pdf';
    
    // Show modal
    modal.style.display = 'block';
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
}

function closeResumeModal() {
    const modal = document.getElementById('resumeModal');
    const frame = document.getElementById('resumeFrame');
    
    // Hide modal
    modal.style.display = 'none';
    
    // Clear iframe source to stop loading
    frame.src = '';
    
    // Re-enable body scrolling
    document.body.style.overflow = 'auto';
}

function downloadFromModal() {
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = 'documents/Max_Chen_Resume.pdf';
    link.download = 'Max_Chen_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// CV Modal functions
function openCVModal() {
    // Close TOC if it's open
    closeTOCIfOpen();
    
    const modal = document.getElementById('cvModal');
    const frame = document.getElementById('cvFrame');
    
    // Set the PDF source
    frame.src = 'documents/Max_Chen_CV.pdf';
    
    // Show modal
    modal.style.display = 'block';
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
}

function closeCVModal() {
    const modal = document.getElementById('cvModal');
    const frame = document.getElementById('cvFrame');
    
    // Hide modal
    modal.style.display = 'none';
    
    // Clear iframe source to stop loading
    frame.src = '';
    
    // Re-enable body scrolling
    document.body.style.overflow = 'auto';
}

function downloadCVFromModal() {
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = 'documents/Max_Chen_CV.pdf';
    link.download = 'Max_Chen_CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const resumeModal = document.getElementById('resumeModal');
    const cvModal = document.getElementById('cvModal');
    
    if (event.target === resumeModal) {
        closeResumeModal();
    }
    if (event.target === cvModal) {
        closeCVModal();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const resumeModal = document.getElementById('resumeModal');
        const cvModal = document.getElementById('cvModal');
        
        if (resumeModal.style.display === 'block') {
            closeResumeModal();
        }
        if (cvModal.style.display === 'block') {
            closeCVModal();
        }
    }
}); 