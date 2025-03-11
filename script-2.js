document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM
    const elements = {
        menuToggle: document.getElementById('menuToggle'),
        fullscreenMenu: document.getElementById('fullscreenMenu'),
        closeMenu: document.getElementById('closeMenu')
    };

    // Animasi smooth untuk menu
    const toggleMenu = (show) => {
        const menu = elements.fullscreenMenu;
        const start = performance.now();
        const duration = 300;
        const initialBottom = show ? -100 : 0;
        const targetBottom = show ? 0 : -100;

        const animate = (time) => {
            const progress = Math.min((time - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            menu.style.bottom = `${initialBottom + (targetBottom - initialBottom) * ease}%`;
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if (!show) menu.classList.remove('active');
                document.body.style.overflow = show ? 'hidden' : '';
            }
        };

        if (show) menu.classList.add('active');
        requestAnimationFrame(animate);
    };

    // Event listener untuk menu
    elements.menuToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu(true);
    });

    elements.closeMenu?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu(false);
    });

    document.addEventListener('click', (e) => {
        const target = e.target;
        if (elements.fullscreenMenu?.classList.contains('active') && 
            !elements.fullscreenMenu.contains(target) && 
            target !== elements.menuToggle) {
            toggleMenu(false);
        }
    }, { passive: true });

    // Animasi scroll dengan IntersectionObserver
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in, .zoom-in, .slide-up').forEach(element => {
        element.classList.remove('visible'); // Reset saat load
        observer.observe(element);
    });
});