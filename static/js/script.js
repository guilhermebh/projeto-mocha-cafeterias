/**
 * Mocha Coffee - Main Script
 * Optimized for performance and follow best practices.
 */

const MochaApp = (() => {
    // Configuration
    const CONFIG = {
        scrollThreshold: 50,
        classes: {
            scrolled: 'scrolled'
        },
        selectors: {
            nav: '.glass-nav',
            locationSearch: '#location-search'
        }
    };

    // State
    let isScrolled = false;

    /**
     * Handles the navbar scroll effect using requestAnimationFrame
     */
    const handleNavbarScroll = () => {
        const nav = document.querySelector(CONFIG.selectors.nav);
        if (!nav) return;

        const currentScroll = window.scrollY;

        if (currentScroll > CONFIG.scrollThreshold && !isScrolled) {
            nav.classList.add(CONFIG.classes.scrolled);
            isScrolled = true;
        } else if (currentScroll <= CONFIG.scrollThreshold && isScrolled) {
            nav.classList.remove(CONFIG.classes.scrolled);
            isScrolled = false;
        }
    };

    /**
     * Initializes Google Places Autocomplete for location search
     */
    const initLocationSearch = () => {
        const searchInput = document.querySelector(CONFIG.selectors.locationSearch);
        if (!searchInput || typeof google === 'undefined') return;

        // Initialize Google Autocomplete
        const autocomplete = new google.maps.places.Autocomplete(searchInput, {
            types: ['(cities)'],
            componentRestrictions: { country: 'br' } // Restricted to Brazil
        });

        // When user selects a place
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            
            if (!place.geometry || !place.geometry.location) {
                console.error("Lugar não encontrado ou sem coordenadas.");
                return;
            }

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            // Dispatch a custom event so other scripts (like cafes.js) can react
            const event = new CustomEvent('locationSelected', {
                detail: { lat, lng, name: place.name }
            });
            window.dispatchEvent(event);
        });
    };

    /**
     * Initializes the application modules
     */
    const init = () => {
        // Initial check on load
        handleNavbarScroll();

        // Navbar Scroll Listener
        window.addEventListener('scroll', () => {
            window.requestAnimationFrame(handleNavbarScroll);
        }, { passive: true });

        // Initialize Geolocation Search if on the correct page
        initLocationSearch();

        console.log('☕ Mocha Premium Experience Initialized');
    };

    return { init };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', MochaApp.init);
