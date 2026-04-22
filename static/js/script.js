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
    let placesService = null;

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
     * Performs a nearby search for coffee shops and filters by rating
     */
    const searchNearbyCafes = (lat, lng) => {
        if (!placesService) {
            // Create a dummy div for PlacesService if not on a Google Map
            const dummyDiv = document.createElement('div');
            placesService = new google.maps.places.PlacesService(dummyDiv);
        }

        const request = {
            location: new google.maps.LatLng(lat, lng),
            radius: '3000', // 3km radius
            type: ['cafe'],
            keyword: 'cafeteria coffee'
        };

        placesService.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Filter results with rating > 4
                const topRatedCafes = results.filter(place => place.rating && place.rating >= 4);
                
                // Dispatch event with the new cafes
                const event = new CustomEvent('cafesFound', {
                    detail: { 
                        cafes: topRatedCafes.map(p => ({
                            name: p.name,
                            lat: p.geometry.location.lat(),
                            lng: p.geometry.location.lng(),
                            address: p.vicinity,
                            rating: p.rating,
                            image_url: p.photos ? p.photos[0].getUrl({maxWidth: 400}) : '/static/assets/cafe1.jpg',
                            description: 'Cafeteria encontrada via Google Maps.'
                        }))
                    }
                });
                window.dispatchEvent(event);
            } else {
                console.warn('Google Places search failed or no results found:', status);
            }
        });
    };

    /**
     * Initializes Google Places Autocomplete for location search
     */
    const initLocationSearch = () => {
        const searchInput = document.querySelector(CONFIG.selectors.locationSearch);
        if (!searchInput || typeof google === 'undefined') return;

        // Initialize Google Autocomplete
        const autocomplete = new google.maps.places.Autocomplete(searchInput, {
            types: ['(regions)'], // Allows neighborhoods and cities
            componentRestrictions: { country: 'br' }
        });

        // When user selects a place
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            
            if (!place.geometry || !place.geometry.location) return;

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            // 1. Center map
            window.dispatchEvent(new CustomEvent('locationSelected', {
                detail: { lat, lng, name: place.name }
            }));

            // 2. Search for cafes in this area
            searchNearbyCafes(lat, lng);
        });
    };

    /**
     * Initializes the application modules
     */
    const init = () => {
        handleNavbarScroll();

        window.addEventListener('scroll', () => {
            window.requestAnimationFrame(handleNavbarScroll);
        }, { passive: true });

        initLocationSearch();

        console.log('☕ Mocha Premium Experience Initialized');
    };

    return { init };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', MochaApp.init);
