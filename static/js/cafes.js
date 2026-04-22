document.addEventListener("DOMContentLoaded", () => {
    // Initialize map
    const map = L.map('map').setView([-19.9167, -43.9345], 13);
    
    // Custom dark map tile
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Icons
    const cafeIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const userIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    let currentMarkers = [];
    const listContainer = document.getElementById('cafes-list');

    /**
     * Renders a list of cafes in the sidebar and on the map
     */
    const renderCafes = (cafes) => {
        // Clear existing markers
        currentMarkers.forEach(m => map.removeLayer(m));
        currentMarkers = [];

        // Clear sidebar list
        listContainer.innerHTML = '';

        cafes.forEach(cafe => {
            // Add Marker
            const marker = L.marker([cafe.lat, cafe.lng], {icon: cafeIcon}).addTo(map)
                .bindPopup(`<b>${cafe.name}</b><br>${cafe.rating} ★`);
            currentMarkers.push(marker);

            // Add Sidebar Card
            const card = document.createElement('div');
            card.className = 'cafe-card fade-in-up';
            card.innerHTML = `
                <img src="${cafe.image_url}" alt="${cafe.name}" class="cafe-image">
                <div class="cafe-info">
                    <h3>${cafe.name}</h3>
                    <p class="desc">${cafe.description}</p>
                    <p class="addr"><i class='bx bx-map'></i> ${cafe.address}</p>
                    <div class="rating">
                        <i class='bx bxs-star'></i> <span>${cafe.rating}</span>
                    </div>
                </div>
            `;

            card.addEventListener('mouseenter', () => marker.openPopup());
            card.addEventListener('click', () => {
                map.setView([cafe.lat, cafe.lng], 16);
                marker.openPopup();
            });

            listContainer.appendChild(card);
        });
    };

    // Initial render from server-side data (if any)
    const initialCafes = Array.from(document.querySelectorAll('.cafe-card')).map(card => ({
        name: card.querySelector('h3').innerText,
        lat: parseFloat(card.getAttribute('data-lat')),
        lng: parseFloat(card.getAttribute('data-lng')),
        description: card.querySelector('.desc').innerText,
        address: card.querySelector('.addr').innerText,
        rating: card.querySelector('.rating span').innerText,
        image_url: card.querySelector('img').src
    }));
    
    // Clear the static HTML and re-render dynamically to set up markers
    if (initialCafes.length > 0) renderCafes(initialCafes);

    // Listen for new cafes found via Google Places search
    window.addEventListener('cafesFound', (e) => {
        renderCafes(e.detail.cafes);
    });

    // Listen for location selections
    window.addEventListener('locationSelected', (e) => {
        const { lat, lng, name } = e.detail;
        map.setView([lat, lng], 14);
        L.marker([lat, lng], {icon: userIcon}).addTo(map)
            .bindPopup(`<b>Busca: ${name}</b>`)
            .openPopup();
    });

    // Native Geolocation
    const geoStatus = document.getElementById("geolocation-status");
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                geoStatus.innerHTML = `<i class='bx bx-check-circle'></i> Localização encontrada!`;
                geoStatus.style.color = "#2ecc71";
                L.marker([userLat, userLng], {icon: userIcon}).addTo(map)
                    .bindPopup("<b>Você está aqui</b>").openPopup();
                map.setView([userLat, userLng], 13);
            },
            () => {
                geoStatus.innerHTML = `<i class='bx bx-error-circle'></i> Localização indisponível.`;
                geoStatus.style.color = "#e74c3c";
            }
        );
    }
});
