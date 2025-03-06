// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.parallax-section');
    let currentSection = 0;
    let isTransitioning = false;
    const navLinks = document.querySelectorAll('.nav-links a');

    // Initialize: show first section only.
    sections.forEach((sec, idx) => {
        sec.classList.remove('active','inactive');
        if (idx === 0) {
            sec.classList.add('active');
        }
    });

    // Helper to update nav link active state by matching section id
    function updateNavLinks() {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if(link.getAttribute('href').substring(1) === sections[currentSection].id) {
                link.classList.add('active');
            }
        });
    }

    function showSection(newIndex) {
        if(isTransitioning) return;
        isTransitioning = true;

        // Handle infinite scroll
        if (newIndex < 0) {
            newIndex = sections.length - 1;
        } else if (newIndex >= sections.length) {
            newIndex = 0;
        }

        const outgoing = sections[currentSection];
        const incoming = sections[newIndex];

        // Reduced transition amount
        outgoing.style.opacity = '0';
        outgoing.style.transform = 'translateY(10px)'; // Reduced from 20px

        setTimeout(() => {
            outgoing.classList.remove('active');
            incoming.classList.add('active');
            incoming.style.opacity = '1';
            incoming.style.transform = 'translateY(0)';
            
            currentSection = newIndex;
            updateNavLinks();
            isTransitioning = false;
        }, 500);
    }

    // Add touch support for mobile
    let touchStartY = 0;
    window.addEventListener('touchstart', e => {
        touchStartY = e.touches[0].clientY;
    });

    window.addEventListener('touchend', e => {
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY - touchEndY;

        if (Math.abs(deltaY) > 50) { // Minimum swipe distance
            if (deltaY > 0) {
                showSection(currentSection + 1);
            } else {
                showSection(currentSection - 1);
            }
        }
    });

    // Update wheel event listener for infinite scroll
    window.addEventListener('wheel', function(e) {
        e.preventDefault();
        if (isTransitioning) return;
        
        if (e.deltaY > 0) {
            showSection(currentSection + 1);
        } else {
            showSection(currentSection - 1);
        }
    }, { passive: false });

    // Update nav click handlers for the new showSection logic
    navLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showSection(index);
        });
    });

    // Floating animation for cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        card.classList.add('floating');
        card.style.animationDelay = `${index * 0.2}s`;
    });
    
    // Skill bars animation
    const skillFills = document.querySelectorAll('.skill-fill');
    
    // Intersection Observer to trigger animations when elements are in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add animation class when element is visible
                entry.target.style.animation = 'fillAnimation 1.5s ease-out forwards';
                // Stop observing after animation is triggered
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    // Observe all skill bars
    skillFills.forEach(fill => {
        observer.observe(fill);
    });
    
    // Interactive hover effect for cards
    const glassCards = document.querySelectorAll('.glass-card');
    
    glassCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate rotation based on mouse position
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            // Apply the transform
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
            // Add shine effect
            const shine = this.querySelector('.shine') || document.createElement('div');
            if (!this.querySelector('.shine')) {
                shine.classList.add('shine');
                this.appendChild(shine);
            }
            
            shine.style.opacity = '0.3';
            shine.style.transform = `translate(${x}px, ${y}px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            // Reset transform on mouse leave
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            
            // Fade out shine effect
            const shine = this.querySelector('.shine');
            if (shine) {
                shine.style.opacity = '0';
            }
        });
    });
    
    // Create animated stars in the background
    function createStars() {
        const stars1 = document.getElementById('stars');
        const stars2 = document.getElementById('stars2');
        const stars3 = document.getElementById('stars3');
        
        // Already created in CSS with background images
        // This function could be used to add more dynamic stars if needed
    }
    
    createStars();
    
    // Form validation
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            const name = this.querySelector('#name').value;
            const email = this.querySelector('#email').value;
            const message = this.querySelector('#message').value;
            
            if (!name || !email || !message) {
                alert('Please fill in all required fields.');
                return;
            }
            
            if (!isValidEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Simulate form submission
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                alert('Message sent successfully! I\'ll get back to you soon.');
                this.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }
    
    // Email validation helper
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Add some particles for a more futuristic feel
    function createParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles-container';
        document.body.appendChild(particlesContainer);
        
        for (let i = 0; i < 30; i++) { // Reduced from 50
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random position
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            
            // Random size
            const size = Math.random() * 5 + 1;
            
            // Random opacity
            const opacity = Math.random() * 0.3 + 0.1; // Reduced opacity range
            
            // Random animation duration
            const duration = Math.random() * 20 + 10;
            
            // Apply styles
            particle.style.cssText = `
                position: fixed;
                top: ${posY}%;
                left: ${posX}%;
                width: ${size}px;
                height: ${size}px;
                background: rgba(129, 140, 248, ${opacity});
                border-radius: 50%;
                pointer-events: none;
                z-index: -1;
                animation: floatParticle ${duration}s linear infinite;
            `;
            
            particlesContainer.appendChild(particle);
        }
    }
    
    // Add keyframes for particle animation
    const styleSheet = document.createElement('style');
    styleSheet.innerText = `
        @keyframes floatParticle {
            0% {
                transform: translateY(0) rotate(0deg);
            }
            100% {
                transform: translateY(-100vh) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(styleSheet);
    
    createParticles();
    
    // Custom cursor circle code
    const cursorCircle = document.createElement('div');
    cursorCircle.className = 'cursor-circle';
    document.body.appendChild(cursorCircle);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
        cursorCircle.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        cursorCircle.style.opacity = '1';
    });

    function animateCursor() {
        cursorCircle.style.left = mouseX + 'px';
        cursorCircle.style.top = mouseY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Disable right-click
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // Initialize any third-party libraries or additional features here
});