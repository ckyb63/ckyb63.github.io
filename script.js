// ============================================================================
// Shared JavaScript for Max Chen Portfolio Website
// Consolidated from experience-visual.html, index-visual.html, projects-visual.html
// ============================================================================

function getI18nText(key, fallback) {
    return (typeof window.__i18nGet === 'function' && window.__i18nGet(key)) || fallback;
}

function setBodyScrollLocked(locked) {
    document.body.style.overflow = locked ? 'hidden' : '';
}

// ============================================================================
// Intersection Observer for Animations
// ============================================================================
(function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Support both 'visible' and 'animate-in' classes
                entry.target.classList.add('visible', 'animate-in');
                
                // Animate stat numbers (for index-visual.html)
                if (entry.target.classList.contains('stat-card') || entry.target.classList.contains('overview-stat')) {
                    const statNumber = entry.target.querySelector('.stat-number, .overview-stat-number');
                    if (statNumber) {
                        const finalValue = statNumber.textContent;
                        const isNumber = /^\d+/.test(finalValue);
                        if (isNumber) {
                            const num = parseInt(finalValue);
                            const suffix = finalValue.replace(/^\d+/, '');
                            let current = 0;
                            const increment = num / 30;
                            const timer = setInterval(() => {
                                current += increment;
                                if (current >= num) {
                                    statNumber.textContent = finalValue;
                                    clearInterval(timer);
                                } else {
                                    statNumber.textContent = Math.floor(current) + suffix;
                                }
                            }, 30);
                        }
                    }
                }
            }
        });
    }, observerOptions);

    // Observe elements based on what exists on the page
    document.querySelectorAll('.animate-on-scroll, .timeline-item-wrapper, .development-card, .section-header').forEach(el => {
        observer.observe(el);
    });
})();

// ============================================================================
// Mobile Menu Toggle
// ============================================================================
(function initMobileMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu-links a');
    const body = document.body;

    function toggleMobileMenu() {
        body.classList.toggle('menu-open');
        if (body.classList.contains('menu-open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    function closeMobileMenu() {
        body.classList.remove('menu-open');
        document.body.style.overflow = '';
    }

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleMobileMenu);
    }

    // Close menu when clicking on overlay background
    if (mobileMenu) {
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                closeMobileMenu();
            }
        });
    }

    // Close menu when clicking on a link
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close menu with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && body.classList.contains('menu-open')) {
            closeMobileMenu();
        }
    });
})();

// ============================================================================
// Navigation Hide/Show on Scroll
// ============================================================================
(function initNavScroll() {
    let lastScrollTop = 0;
    const nav = document.querySelector('nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Always show nav at the top
        if (scrollTop < 50) {
            nav.classList.remove('hidden');
            lastScrollTop = scrollTop;
            return;
        }
        
        // Hide nav when scrolling down, show when scrolling up
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            nav.classList.add('hidden');
        } else {
            // Scrolling up
            nav.classList.remove('hidden');
        }
        
        lastScrollTop = scrollTop;
    }, { passive: true });
})();

// ============================================================================
// Back to Top Button
// ============================================================================
(function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    
    if (!backToTop) return;
    
    // Show/hide button on scroll
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    // Smooth scroll to top (for projects-visual.html)
    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
})();

// ============================================================================
// Experience Page Specific: Expand Details Buttons
// ============================================================================
(function initExpandDetails() {
    document.querySelectorAll('.expand-details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.experience-card');
        if (card) {
            card.classList.toggle('expanded');
            const span = this.querySelector('span');
            if (span) {
                const expanded = card.classList.contains('expanded');
                const expandKey = 'aria.expandDetails';
                const collapseKey = 'aria.collapseDetails';
                const expandStr = (typeof window.__i18nGet === 'function' && window.__i18nGet(expandKey)) || 'Expand for more details';
                const collapseStr = (typeof window.__i18nGet === 'function' && window.__i18nGet(collapseKey)) || 'Collapse details';
                span.textContent = expanded ? collapseStr : expandStr;
            }
        }
        });
    });
})();

// ============================================================================
// Experience Page Specific: Toggle Earlier Experiences
// ============================================================================
function toggleEarlierExperiences(button) {
    const content = button.nextElementSibling;
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        button.classList.remove('expanded');
        const span = button.querySelector('span');
        if (span) {
            span.textContent = getI18nText('sections.experience.earlierToggle', 'View Earlier Experiences & Education');
        }
    } else {
        content.classList.add('expanded');
        button.classList.add('expanded');
        const span = button.querySelector('span');
        if (span) {
            span.textContent = getI18nText('sections.experience.earlierToggleHide', 'Hide Earlier Experiences & Education');
        }
    }
}

// Make function globally available for onclick handlers
window.toggleEarlierExperiences = toggleEarlierExperiences;

// ============================================================================
// Experience Page Specific: Move Job Tags on Mobile
// ============================================================================
(function initMoveJobTags() {
    function moveJobTagsToDetails() {
        if (window.innerWidth <= 968) {
            document.querySelectorAll('.experience-card').forEach(card => {
                const jobTags = card.querySelector('.job-tags:not(.job-details .job-tags)');
                const jobDetails = card.querySelector('.job-details');
                
                if (jobTags && jobDetails && !jobDetails.querySelector('.job-tags')) {
                    // Clone and move job-tags into job-details
                    const clonedTags = jobTags.cloneNode(true);
                    clonedTags.style.display = 'flex';
                    clonedTags.style.marginTop = '1.5rem';
                    clonedTags.style.padding = '0 0 1.5rem 0';
                    
                    // Insert before experience-links if it exists, otherwise at the end
                    const experienceLinks = jobDetails.querySelector('.experience-links');
                    if (experienceLinks) {
                        jobDetails.insertBefore(clonedTags, experienceLinks);
                    } else {
                        jobDetails.appendChild(clonedTags);
                    }
                }
            });
        } else {
            // Desktop: remove cloned job-tags from job-details to avoid duplicates when resizing back
            document.querySelectorAll('.job-details .job-tags').forEach(el => el.remove());
        }
    }
    
    // Run on load and resize
    document.addEventListener('DOMContentLoaded', function() {
        moveJobTagsToDetails();
        window.addEventListener('resize', moveJobTagsToDetails);
    });
})();

// ============================================================================
// Floating TOC Functionality (Experience & Projects Pages)
// ============================================================================
(function initFloatingTOC() {
    const floatingTOC = document.querySelector('.floating-toc');
    const toggleButton = document.querySelector('.toc-toggle');
    const tocPanel = document.querySelector('.toc-panel');
    const tocLinks = document.querySelectorAll('.toc-link');
    const progressBar = document.querySelector('.toc-progress-bar');
    
    if (!floatingTOC || !toggleButton) return;
    
    // Determine which selector to use for sections based on page
    const sections = document.querySelectorAll('section[id], .timeline-item-wrapper[id]');
    
    let isExpanded = false;
    
    // Ensure TOC starts closed
    function ensureTOCClosed() {
        isExpanded = false;
        floatingTOC.classList.remove('expanded');
        toggleButton.setAttribute('aria-label', 'Open table of contents');
    }
    
    // Function to update active navigation item and progress
    function updateActiveNavItem() {
        let currentSection = '';
        const scrollY = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = (scrollY / documentHeight) * 100;
        
        // Update progress bar
        if (progressBar) {
            progressBar.style.height = Math.min(scrollProgress, 100) + '%';
        }
        
        // Find current section
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + window.pageYOffset;
            const sectionHeight = rect.height;
            
            // Use the same offset calculation as the scroll function
            const header = document.querySelector('nav');
            const headerHeight = header ? header.offsetHeight : 60;
            const threshold = headerHeight + 50;
            
            if (scrollY >= sectionTop - threshold && scrollY < sectionTop + sectionHeight - threshold) {
                currentSection = section.getAttribute('id');
            }
        });
        
        // Update active states
        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSection) {
                link.classList.add('active');
            }
        });
    }
    
    // Smooth scroll function
    function smoothScrollTo(targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            // Calculate offset based on fixed header height and desired padding
            const header = document.querySelector('nav');
            const headerHeight = header ? header.offsetHeight : 60;
            const additionalPadding = 40;
            const offset = headerHeight + additionalPadding;
            
            // Get the element's position relative to the document
            const elementRect = targetElement.getBoundingClientRect();
            const elementPosition = elementRect.top + window.pageYOffset;
            const offsetPosition = Math.max(0, elementPosition - offset);
            
            // Ensure we don't scroll past the bottom of the document
            const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
            const finalPosition = Math.min(offsetPosition, maxScrollTop);
            
            window.scrollTo({
                top: finalPosition,
                behavior: 'smooth'
            });
        }
    }
    
    // Toggle TOC function
    function toggleTOC() {
        isExpanded = !isExpanded;
        floatingTOC.classList.toggle('expanded', isExpanded);
        
        // Update button aria-label
        toggleButton.setAttribute('aria-label', 
            isExpanded ? 'Close table of contents' : 'Open table of contents'
        );
    }
    
    // Close TOC function
    function closeTOC() {
        isExpanded = false;
        floatingTOC.classList.remove('expanded');
        toggleButton.setAttribute('aria-label', 'Open table of contents');
    }
    
    // Event listeners
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleTOC);
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', updateActiveNavItem, { passive: true });
    
    // Add resize event listener to ensure TOC stays closed
    window.addEventListener('resize', function() {
        if (!isExpanded) {
            ensureTOCClosed();
        }
    });
    
    // Initialize active state and ensure TOC is closed
    updateActiveNavItem();
    ensureTOCClosed();
    
    // Add click event listeners for all TOC links
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            smoothScrollTo(targetId);
            
            // Close TOC after navigation on mobile
            if (window.innerWidth <= 768) {
                setTimeout(closeTOC, 300);
            }
        });
    });
    
    // Handle escape key to close TOC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isExpanded) {
            closeTOC();
        }
    });
    
    // Close TOC when clicking outside
    document.addEventListener('click', function(e) {
        if (isExpanded && !floatingTOC.contains(e.target)) {
            closeTOC();
        }
    });
})();

// ============================================================================
// Index Page Specific: Modal Functions for Resume/CV (use EN/zh Drive link by current language)
// ============================================================================
function getDriveIdFromLink(link) {
    if (!link || !link.href) return null;
    const m = link.href.match(/[?&]id=([^&]+)/);
    return m ? m[1] : null;
}

function openResumeModal() {
    const modal = document.getElementById('resumeModal');
    const frame = document.getElementById('resumeFrame');
    const resumeLink = document.querySelector('a[data-download-resume]');
    const id = getDriveIdFromLink(resumeLink);
    if (modal && frame && id) {
        frame.src = 'https://drive.google.com/file/d/' + id + '/preview?usp=sharing#pagemode=none&view=FitH';
        modal.classList.add('active');
        setBodyScrollLocked(true);
    }
}

function closeResumeModal() {
    const modal = document.getElementById('resumeModal');
    const frame = document.getElementById('resumeFrame');
    if (modal && frame) {
        modal.classList.remove('active');
        frame.src = '';
        setBodyScrollLocked(false);
    }
}

function openCVModal() {
    const modal = document.getElementById('cvModal');
    const frame = document.getElementById('cvFrame');
    const cvLink = document.querySelector('a[data-download-cv]');
    const id = getDriveIdFromLink(cvLink);
    if (modal && frame && id) {
        frame.src = 'https://drive.google.com/file/d/' + id + '/preview?usp=sharing#pagemode=bookmarks&view=FitH';
        modal.classList.add('active');
        setBodyScrollLocked(true);
    }
}

function closeCVModal() {
    const modal = document.getElementById('cvModal');
    const frame = document.getElementById('cvFrame');
    if (modal && frame) {
        modal.classList.remove('active');
        frame.src = '';
        setBodyScrollLocked(false);
    }
}

function downloadFromModal() {
    const resumeLink = document.querySelector('a[data-download-resume]');
    if (resumeLink && resumeLink.href) {
        window.open(resumeLink.href, '_blank', 'noopener,noreferrer');
    }
}

function downloadCVFromModal() {
    const cvLink = document.querySelector('a[data-download-cv]');
    if (cvLink && cvLink.href) {
        window.open(cvLink.href, '_blank', 'noopener,noreferrer');
    }
}

// Make functions globally available for onclick handlers
window.openResumeModal = openResumeModal;
window.closeResumeModal = closeResumeModal;
window.openCVModal = openCVModal;
window.closeCVModal = closeCVModal;
window.downloadFromModal = downloadFromModal;
window.downloadCVFromModal = downloadCVFromModal;

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    const resumeModal = document.getElementById('resumeModal');
    const cvModal = document.getElementById('cvModal');
    
    if (e.target === resumeModal) {
        closeResumeModal();
    }
    if (e.target === cvModal) {
        closeCVModal();
    }
});

// ============================================================================
// Performance-lite mode for heavier browsers (e.g., Opera) or low-memory devices
// ============================================================================
(() => {
    const ua = navigator.userAgent || '';
    const isOpera = ua.includes('OPR/') || ua.includes('Opera');
    const isLowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
    if (isOpera || isLowMemory) {
        document.body.classList.add('performance-lite');
    }
})();

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeResumeModal();
        closeCVModal();
        closeProjectModal();
    }
});

// ============================================================================
// Projects Page Specific: Toggle Details Function
// ============================================================================
function toggleDetails(button) {
    const detailsSection = button.nextElementSibling;
    const showStr = getI18nText('sections.projects.showMoreDetails', 'Show More Details');
    const hideStr = getI18nText('sections.projects.hideDetails', 'Hide Details');
    
    if (detailsSection.classList.contains('expanded')) {
        detailsSection.classList.remove('expanded');
        button.innerHTML = '<i class="fas fa-chevron-down"></i> ' + showStr;
    } else {
        detailsSection.classList.add('expanded');
        button.innerHTML = '<i class="fas fa-chevron-up"></i> ' + hideStr;
    }
}

// Make function globally available for onclick handlers
window.toggleDetails = toggleDetails;

// ============================================================================
// Projects Page: Project detail modal (compact card "View details")
// ============================================================================
function openProjectModal(trigger) {
    const card = trigger.closest('.portfolio-card');
    if (!card) return;
    const titleEl = card.querySelector('.portfolio-card-title');
    const bodyEl = card.querySelector('.project-detail-body');
    const modal = document.getElementById('projectDetailModal');
    const modalTitleEl = document.getElementById('projectDetailModalTitle');
    const modalBodyEl = document.querySelector('.project-detail-modal-body');
    const modalContent = document.querySelector('.project-detail-modal-content');
    if (!modal || !modalTitleEl || !modalBodyEl) return;
    modalTitleEl.textContent = titleEl ? titleEl.textContent : '';
    modalBodyEl.innerHTML = bodyEl ? bodyEl.innerHTML : '';
    if (modalContent) {
        if (modalBodyEl.querySelector('.detail-modal-videos') || modalBodyEl.querySelector('iframe')) {
            modalContent.classList.add('is-wide');
        } else {
            modalContent.classList.remove('is-wide');
        }
    }
    modal.classList.add('active');
    setBodyScrollLocked(true);
}

function closeProjectModal() {
    const modal = document.getElementById('projectDetailModal');
    const modalContent = document.querySelector('.project-detail-modal-content');
    if (modal) {
        modal.classList.remove('active');
        setBodyScrollLocked(false);
    }
    if (modalContent) modalContent.classList.remove('is-wide');
}

window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;

(function initProjectDetailModal() {
    const modal = document.getElementById('projectDetailModal');
    if (!modal) return;
    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeProjectModal();
    });
    const content = modal.querySelector('.project-detail-modal-content');
    if (content) content.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeProjectModal();
    });
})();

// ============================================================================
// Experience Page: Experience detail modal (compact card "View details")
// ============================================================================
function openExperienceModal(trigger) {
    const card = trigger.closest('.experience-card-compact');
    if (!card) return;
    const titleEl = card.querySelector('h3');
    const bodyEl = card.querySelector('.experience-detail-body');
    const modal = document.getElementById('experienceDetailModal');
    const modalTitleEl = document.getElementById('experienceDetailModalTitle');
    const modalBodyEl = document.querySelector('.experience-detail-modal-body');
    if (!modal || !modalTitleEl || !modalBodyEl) return;
    modalTitleEl.textContent = titleEl ? titleEl.textContent.trim() : '';
    modalBodyEl.innerHTML = bodyEl ? bodyEl.innerHTML : '';
    modal.classList.add('active');
    setBodyScrollLocked(true);
}

function closeExperienceModal() {
    const modal = document.getElementById('experienceDetailModal');
    if (modal) {
        modal.classList.remove('active');
        setBodyScrollLocked(false);
    }
}

window.openExperienceModal = openExperienceModal;
window.closeExperienceModal = closeExperienceModal;

(function initExperienceDetailModal() {
    const modal = document.getElementById('experienceDetailModal');
    if (!modal) return;
    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeExperienceModal();
    });
    const content = modal.querySelector('.experience-detail-modal-content');
    if (content) content.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeExperienceModal();
    });
})();

// ============================================================================
// ============================================================================
(function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
})();

// ============================================================================
// Projects Page Specific: Project Card Hover Effects
// ============================================================================
(function initProjectCardHover() {
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
})();

// ============================================================================
// Projects Page Specific: Image Modal Functionality
// ============================================================================
let __imageModalToken = 0;

function openImageModal(imageSrc, imageAlt, imageElement) {
    const token = ++__imageModalToken;
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalBadge = document.getElementById('modalBadge');
    const modalDescription = document.getElementById('modalDescription');
    const modalTech = document.getElementById('modalTech');
    const imageWrap = modalImg ? modalImg.closest('.image-modal-image-wrap') : null;
    
    if (!modal || !modalImg) return;

    // Clear first to prevent "previous image flash" while the new image loads.
    modalImg.removeAttribute('src');
    modalImg.alt = imageAlt;
    if (imageWrap) imageWrap.classList.add('is-loading');
    
    // Get project details from data attributes (or derive from i18n gallery keys)
    if (imageElement && imageElement.dataset) {
        let title = imageElement.dataset.projectTitle || imageAlt;
        let badge = imageElement.dataset.projectBadge || '';
        let description = imageElement.dataset.projectDescription || '';
        const tech = imageElement.dataset.projectTech || '';

        // If this is a gallery item, use i18n keys for localized title/description
        const galleryKey = imageElement.dataset.galleryKey;
        if (galleryKey && typeof window.__i18nGet === 'function') {
            const tKey = `sections.projects.gallery${galleryKey}Title`;
            const dKey = `sections.projects.gallery${galleryKey}Desc`;
            title = window.__i18nGet(tKey) || title;
            description = window.__i18nGet(dKey) || description;
        }
        
        if (modalTitle) modalTitle.textContent = title;
        if (modalBadge) modalBadge.textContent = badge;
        if (modalDescription) modalDescription.textContent = description;
        
        // Clear and populate tech tags
        if (modalTech) {
            modalTech.innerHTML = '';
            if (tech) {
                const techArray = tech.split(',');
                techArray.forEach(tag => {
                    const techTag = document.createElement('span');
                    techTag.className = 'modal-tech-tag';
                    techTag.textContent = tag.trim();
                    modalTech.appendChild(techTag);
                });
            }
        }
        
        // Show/hide details based on available data
        const detailsDiv = document.getElementById('modalDetails');
        if (detailsDiv) {
            if (title || badge || description) {
                detailsDiv.style.display = 'block';
            } else {
                detailsDiv.style.display = 'none';
            }
        }
    } else {
        // Fallback if no data attributes
        if (modalTitle) modalTitle.textContent = imageAlt;
        if (modalBadge) modalBadge.textContent = '';
        if (modalDescription) modalDescription.textContent = '';
        if (modalTech) modalTech.innerHTML = '';
        const detailsDiv = document.getElementById('modalDetails');
        if (detailsDiv) detailsDiv.style.display = 'none';
    }
    
    modal.classList.add('active');
    setBodyScrollLocked(true);

    // Preload and only apply if this is the latest request (prevents race conditions).
    const pre = new Image();
    pre.decoding = 'async';
    pre.src = imageSrc;
    const apply = () => {
        if (__imageModalToken !== token) return;
        modalImg.src = imageSrc;
        if (imageWrap) imageWrap.classList.remove('is-loading');
    };
    if (pre.decode) {
        pre.decode().then(apply).catch(apply);
    } else {
        pre.onload = apply;
        pre.onerror = apply;
    }
}

function closeImageModal() {
    __imageModalToken++;
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const imageWrap = modalImg ? modalImg.closest('.image-modal-image-wrap') : null;
    if (modal) {
        modal.classList.remove('active');
        setBodyScrollLocked(false);
    }
    if (modalImg) modalImg.removeAttribute('src');
    if (imageWrap) imageWrap.classList.remove('is-loading');
}

// Make functions globally available for onclick handlers
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;

// Initialize image modal functionality
(function initImageModal() {
    const imageModal = document.getElementById('imageModal');
    if (!imageModal) return;
    
    const imageModalContent = document.querySelector('.image-modal-card');
    
    // Close when clicking backdrop (backdrop has its own onclick; also handle click on modal container)
    imageModal.addEventListener('click', function(e) {
        if (e.target === imageModal || e.target.classList.contains('image-modal-backdrop')) {
            closeImageModal();
        }
    });
    
    // Prevent closing when clicking the card (image + details)
    if (imageModalContent) {
        imageModalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeImageModal();
        }
    });
    
    // Add click handlers to all project images and containers (excluding video cards)
    document.querySelectorAll('.showcase-image-card, .project-card.has-image').forEach(container => {
        container.style.cursor = 'pointer';
        container.setAttribute('title', 'Click to enlarge');
        
        container.addEventListener('click', function(e) {
            // Don't trigger if clicking on content overlay
            if (e.target.classList.contains('project-card-content') || 
                e.target.closest('.project-card-content')) {
                return;
            }
            
            // Don't trigger if clicking on iframe (video)
            if (e.target.tagName === 'IFRAME' || e.target.closest('iframe')) {
                return;
            }
            
            const img = this.querySelector('img');
            if (img) {
                e.stopPropagation();
                
                // For gallery cards, try to extract info from card content
                if (this.classList.contains('project-card') && !img.dataset.projectTitle) {
                    const cardContent = this.querySelector('.project-card-content');
                    if (cardContent) {
                        const title = cardContent.querySelector('h3')?.textContent || img.alt;
                        const description = cardContent.querySelector('p')?.textContent || '';
                        const badge = cardContent.querySelector('.project-card-badge')?.textContent || '';
                        
                        img.dataset.projectTitle = title;
                        img.dataset.projectBadge = badge;
                        img.dataset.projectDescription = description;
                    }
                }
                
                openImageModal(img.src, img.alt, img);
            }
        });
    });
})();

