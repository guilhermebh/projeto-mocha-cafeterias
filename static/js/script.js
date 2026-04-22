/**
 * Mocha Coffee - Main Script
 * Optimized for performance and follow best practices.
 */

const MochaApp = (() => {
    // Configuration
    const CONFIG = {
        scrollThreshold: 50,
        classes: {
            scrolled: 'scrolled',
            active: 'active'
        },
        selectors: {
            nav: '.glass-nav',
            locationSearch: '#location-search',
            dropdown: '#neighborhood-dropdown',
            dropdownItem: '.neighborhood-item'
        }
    };

    // State
    let isScrolled = false;
    let placesService = null;
    let geocoder = null;

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

        const radius = isNeighborhood ? '1500' : '3000';

        const request = {
            location: new google.maps.LatLng(lat, lng),
            radius: radius,
            type: ['cafe', 'bakery'],
            keyword: 'cafeteria coffee doceria confeitaria'
        };

        placesService.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
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
                window.dispatchEvent(new CustomEvent('cafesFound', { detail: { cafes: [] } }));
            }
        });
    };

    /**
     * Geocodes a string address and triggers search
     */
    const searchByAddress = (address) => {
        if (!geocoder) geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const loc = results[0].geometry.location;
                const lat = loc.lat();
                const lng = loc.lng();

                window.dispatchEvent(new CustomEvent('locationSelected', {
                    detail: { lat, lng, name: address.split(',')[0] }
                }));

                searchNearbyCafes(lat, lng, true);
            }
        });
    };

    /**
     * Initializes Google Places Autocomplete and Neighborhood Dropdown
     */
    const initLocationSearch = () => {
        const searchInput = document.querySelector(CONFIG.selectors.locationSearch);
        const dropdown = document.querySelector(CONFIG.selectors.dropdown);
        if (!searchInput || typeof google === 'undefined') return;

        // 1. Google Autocomplete
        const autocomplete = new google.maps.places.Autocomplete(searchInput, {
            types: ['geocode'],
            componentRestrictions: { country: 'br' }
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) return;

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const isNeighborhood = place.types.includes('sublocality') || place.types.includes('neighborhood');

            window.dispatchEvent(new CustomEvent('locationSelected', {
                detail: { lat, lng, name: place.name }
            }));

            searchNearbyCafes(lat, lng, isNeighborhood);
            dropdown.classList.remove(CONFIG.classes.active);
        });

        // 2. Dropdown Logic
        searchInput.addEventListener('focus', () => {
            dropdown.classList.add(CONFIG.classes.active);
        });

        // Use mousedown instead of click to trigger before blur
        document.addEventListener('mousedown', (e) => {
            if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove(CONFIG.classes.active);
            }
        });

        const items = dropdown.querySelectorAll(CONFIG.selectors.dropdownItem);
        items.forEach(item => {
            item.addEventListener('click', () => {
                const val = item.getAttribute('data-val');
                searchInput.value = item.innerText;
                searchByAddress(val);
                dropdown.classList.remove(CONFIG.classes.active);
            });
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
