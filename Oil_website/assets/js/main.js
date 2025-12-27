/* ================== Table Of Content ==================
1. Mobile Navigation Toggle
2. Header Scroll Effect
3. Fade-In Animation on Scroll
4. Contact Form Submission
5. FAQ Accordion
6. Hero Slider Functionality
7. WhatsApp Float Button
8. Preloader
9. Offer Bar
10. Auto-Close Mobile Nav on Link Click
====================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Initialize all functionality
    initMobileNavigation();
    initHeaderScroll();
    initFadeAnimations();
    initContactForm();
    initFAQAccordion();
    initHeroSlider();
    initWhatsAppButton();
    initOfferBar();
    initPreloader();
});

/* 1. Mobile Navigation Toggle */
function initMobileNavigation() {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    const closeBtn = document.querySelector(".close-btn");

    if (!hamburger || !navLinks) return;

    const toggleNav = (isOpen) => {
        const expanded = String(isOpen);
        hamburger.setAttribute("aria-expanded", expanded);
        hamburger.classList.toggle("active", isOpen);
        navLinks.classList.toggle("active", isOpen);
        document.body.classList.toggle("nav-open", isOpen);
    };

    hamburger.addEventListener("click", () => {
        const isOpen = navLinks.classList.contains("active");
        toggleNav(!isOpen);
    });

    if (closeBtn) {
        closeBtn.addEventListener("click", () => toggleNav(false));
    }

    // Auto-close mobile nav when clicking nav links
    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => toggleNav(false));
    });
}

/* 2. Header Scroll Effect */
function initHeaderScroll() {
    const header = document.getElementById("header");
    const SCROLL_THRESHOLD = 50;

    if (!header) return;

    const updateHeaderOnScroll = () => {
        header.classList.toggle("header-scrolled", window.scrollY > SCROLL_THRESHOLD);
    };

    let scrollTimeout;
    window.addEventListener("scroll", () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateHeaderOnScroll, 10);
    }, { passive: true });

    updateHeaderOnScroll();
}

/* 3. Fade-In Animation on Scroll */
function initFadeAnimations() {
    const fadeElements = Array.from(document.querySelectorAll(".fade-in"));
    const VISIBLE_OFFSET = 150;

    if (fadeElements.length === 0) return;

    const fadeInOnScroll = () => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            fadeElements.forEach(el => el.classList.add("visible"));
            return;
        }

        fadeElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top <= window.innerHeight - VISIBLE_OFFSET) {
                el.classList.add("visible");
            }
        });
    };

    window.addEventListener("scroll", fadeInOnScroll, { passive: true });
    window.addEventListener("resize", fadeInOnScroll);
    fadeInOnScroll();
}

/* 4. Contact Form Submission */
function initContactForm() {
    const contactForm = document.getElementById("contactForm");
    const successMsg = document.getElementById("formSuccess");

    if (!contactForm || !successMsg) return;

    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const firstInvalid = contactForm.querySelector(":invalid");
        if (firstInvalid) {
            firstInvalid.focus();
            return;
        }

        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;

        const formData = new FormData(contactForm);

        fetch('submit_contact.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Show success message
                    successMsg.style.display = "block";
                    successMsg.setAttribute("role", "status");
                    successMsg.setAttribute("aria-live", "polite");
                    // Use the message from the server or user preference
                    successMsg.textContent = "Thank you! We will contact you soon.";

                    successMsg.scrollIntoView({ behavior: "smooth", block: "center" });
                    contactForm.reset();

                    // Hide success message after 5 seconds
                    setTimeout(() => {
                        successMsg.style.display = "none";
                    }, 5000);
                } else {
                    alert(data.message || "An error occurred. Please try again.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("There was a problem sending your message. Please try again later.");
            })
            .finally(() => {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            });
    });
}

/* 5. FAQ Accordion */
function initFAQAccordion() {
    const faqItems = Array.from(document.querySelectorAll(".faq-item"));

    if (faqItems.length === 0) return;

    faqItems.forEach(item => {
        const question = item.querySelector(".faq-question");
        if (!question) return;

        question.setAttribute("role", "button");
        question.setAttribute("tabindex", "0");
        question.setAttribute("aria-expanded", String(item.classList.contains("active")));

        const toggleFAQ = () => {
            const isActive = item.classList.contains("active");

            // Close all other items
            faqItems.forEach(other => {
                if (other !== item) {
                    other.classList.remove("active");
                    const q = other.querySelector(".faq-question");
                    if (q) q.setAttribute("aria-expanded", "false");
                }
            });

            // Toggle current item
            item.classList.toggle("active");
            question.setAttribute("aria-expanded", String(!isActive));
        };

        question.addEventListener("click", toggleFAQ);
        question.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                toggleFAQ();
            }
        });
    });
}

/* 6. Hero Slider Functionality */
function initHeroSlider() {
    const slides = document.querySelectorAll(".slide");
    const dotsContainer = document.getElementById("dots");

    if (slides.length === 0 || !dotsContainer) return;

    let currentSlide = 0;
    let slideInterval;

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement("div");
        dot.addEventListener("click", () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.children;

    function showSlide(n) {
        // Hide all slides and remove active class from dots
        slides.forEach(slide => slide.classList.remove("active"));
        Array.from(dots).forEach(dot => dot.classList.remove("active"));

        // Show current slide and activate dot
        slides[n].classList.add("active");
        dots[n].classList.add("active");

        currentSlide = n;
    }

    function goToSlide(n) {
        clearInterval(slideInterval);
        showSlide(n);
        startAutoSlide();
    }

    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        goToSlide(next);
    }

    function prevSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(prev);
    }

    function startAutoSlide() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    // Initialize slider controls
    const nextBtn = document.getElementById("nextSlide");
    const prevBtn = document.getElementById("prevSlide");

    if (nextBtn) nextBtn.onclick = nextSlide;
    if (prevBtn) prevBtn.onclick = prevSlide;

    // Start with first slide and auto-slide
    showSlide(0);
    startAutoSlide();

    // Pause auto-slide on hover
    const slider = document.querySelector(".hero-slider");
    if (slider) {
        slider.addEventListener("mouseenter", () => clearInterval(slideInterval));
        slider.addEventListener("mouseleave", startAutoSlide);
    }
}

/* 7. WhatsApp Float Button */
function initWhatsAppButton() {
    const whatsappMain = document.getElementById("whatsappMain");
    const whatsappOptions = document.getElementById("whatsappOptions");
    const whatsappFloat = document.querySelector(".whatsapp-float");

    if (!whatsappMain || !whatsappOptions) return;

    // Toggle options visibility
    whatsappMain.addEventListener("click", (e) => {
        e.stopPropagation();
        whatsappOptions.classList.toggle("active");
    });

    // Close options when clicking outside
    document.addEventListener("click", (e) => {
        if (!whatsappMain.contains(e.target) && !whatsappOptions.contains(e.target)) {
            whatsappOptions.classList.remove("active");
        }
    });

    // Close options after selecting an option
    const whatsappOptionsLinks = document.querySelectorAll(".whatsapp-option");
    whatsappOptionsLinks.forEach(link => {
        link.addEventListener("click", () => {
            whatsappOptions.classList.remove("active");
        });
    });

    // Show/hide button based on scroll position
    if (whatsappFloat) {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const pageHeight = document.documentElement.scrollHeight - window.innerHeight;

            if (scrollTop > pageHeight * 0.18) {
                whatsappFloat.classList.add("show");
                whatsappFloat.classList.remove("hidden");
            } else {
                whatsappFloat.classList.remove("show");
                whatsappFloat.classList.add("hidden");
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Initial check
    }
}

/* 8. Preloader */
function initPreloader() {
    const preloader = document.getElementById("preloader");

    if (!preloader) return;

    // Hide preloader when page is fully loaded
    window.addEventListener("load", () => {
        preloader.classList.add("hide");

        // Remove from DOM after animation completes
        setTimeout(() => {
            if (preloader.parentNode) {
                preloader.parentNode.removeChild(preloader);
            }
        }, 600);
    });

    // Fallback: hide preloader after max 3 seconds
    setTimeout(() => {
        if (preloader.parentNode && !preloader.classList.contains("hide")) {
            preloader.classList.add("hide");
            setTimeout(() => preloader.parentNode.removeChild(preloader), 600);
        }
    }, 3000);
}

/* 9. Offer Bar */
function initOfferBar() {
    const offerBar = document.getElementById("offerBar");
    const offerText = document.getElementById("offerText");

    if (!offerBar || !offerText) return;

    const offers = [
        "🔥 Today's Offer: Buy 2L Gingelly Oil & Get 200ml Free!",
        "💥 Special Price: Groundnut Oil 1L – ₹199 Only!",
        "🎉 Festival Combo: Buy 5L & Save ₹150!",
        "✨ Pure Coconut Oil – Fresh Batch Available!"
    ];

    let offerIndex = 0;

    // Set initial text
    offerText.textContent = offers[offerIndex];

    // Rotate offers every 10 seconds
    const offerInterval = setInterval(() => {
        offerIndex = (offerIndex + 1) % offers.length;
        offerText.textContent = offers[offerIndex];
    }, 10000);

    // Close button functionality
    window.closeOfferBar = function () {
        offerBar.style.display = "none";
        clearInterval(offerInterval);
    };

    // Close offer bar when clicking close button
    const closeBtn = offerBar.querySelector(".offer-close");
    if (closeBtn) {
        closeBtn.addEventListener("click", window.closeOfferBar);
    }
}

/* 10. Utility Functions */
// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Error handling for missing elements
function safeQuerySelector(selector) {
    try {
        return document.querySelector(selector);
    } catch (error) {
        console.warn(`Element not found: ${selector}`);
        return null;
    }
}




