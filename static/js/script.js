document.addEventListener("DOMContentLoaded", () => {
    // Add scroll effect to navbar
    const nav = document.querySelector('.glass-nav');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(15, 15, 17, 0.8)';
            nav.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
        } else {
            nav.style.background = 'rgba(15, 15, 17, 0.4)';
            nav.style.boxShadow = 'none';
        }
    });

    // Simple cursor follower or micro-interaction can be added here
});
