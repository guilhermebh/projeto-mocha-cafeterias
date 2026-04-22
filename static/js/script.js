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
     * Performs a search for cafes and pastry shops, filtering by rating > 3.8
     */
    const searchNearbyCafes = (lat, lng, isNeighborhood = false) => {
        if (!placesService) {
            const dummyDiv = document.createElement('div');
            placesService = new google.maps.places.PlacesService(dummyDiv);
        }

        // Use a smaller radius for neighborhoods to keep results local
        const radius = isNeighborhood ? '1500' : '3000';

        const request = {
            location: new google.maps.LatLng(lat, lng),
            radius: radius,
            type: ['cafe', 'bakery'],
            keyword: 'cafeteria coffee doceria confeitaria'
        };

        placesService.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Filter results with rating > 3.8
                const filteredResults = results.filter(place => place.rating && place.rating >= 3.8);
                
                const event = new CustomEvent('cafesFound', {
                    detail: { 
                        cafes: filteredResults.map(p => ({
                            name: p.name,
                            lat: p.geometry.location.lat(),
                            lng: p.geometry.location.lng(),
                            address: p.vicinity,
                            rating: p.rating,
                            image_url: p.photos ? p.photos[0].getUrl({maxWidth: 400}) : '/static/assets/cafe1.jpg',
                            description: p.types.includes('bakery') ? 'Doceria / Confeitaria selecionada.' : 'Cafeteria premium selecionada.'
                        }))
                    }
                });
                window.dispatchEvent(event);
            } else {
                console.warn('Google Places search failed:', status);
                // Dispatch empty results if none found
                window.dispatchEvent(new CustomEvent('cafesFound', { detail: { cafes: [] } }));
            }
        });
    };

    /**
     * Initializes Google Places Autocomplete
     */
    const initLocationSearch = () => {
        const searchInput = document.querySelector(CONFIG.selectors.locationSearch);
        if (!searchInput || typeof google === 'undefined') return;

        const autocomplete = new google.maps.places.Autocomplete(searchInput, {
            types: ['geocode'], // Allows neighborhoods (sublocality) and addresses
            componentRestrictions: { country: 'br' }
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            
            if (!place.geometry || !place.geometry.location) return;

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            // Check if the selected place is a neighborhood or specific locality
            const isNeighborhood = place.types.includes('sublocality') || place.types.includes('neighborhood');

            window.dispatchEvent(new CustomEvent('locationSelected', {
                detail: { lat, lng, name: place.name }
            }));

            searchNearbyCafes(lat, lng, isNeighborhood);
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

document.addEventListener('DOMContentLoaded', MochaApp.init);
