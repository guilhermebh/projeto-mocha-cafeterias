document.addEventListener("DOMContentLoaded", () => {
    // Initialize map, centered roughly on Belo Horizonte
    const map = L.map('map').setView([-19.9167, -43.9345], 13);
    
    // Custom dark map tile
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Custom Icon for Cafes
    const cafeIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // Custom Icon for User
    const userIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const markers = {};

    // Get all cafe cards
    const cafeCards = document.querySelectorAll('.cafe-card');
    
    cafeCards.forEach(card => {
        const lat = parseFloat(card.getAttribute('data-lat'));
        const lng = parseFloat(card.getAttribute('data-lng'));
        const name = card.getAttribute('data-name');
        
        // Add marker to map
        const marker = L.marker([lat, lng], {icon: cafeIcon}).addTo(map)
            .bindPopup(`<b>${name}</b>`);
            
        markers[name] = marker;

        // Hover effect to highlight marker
        card.addEventListener('mouseenter', () => {
            marker.openPopup();
        });
        
        // Click to zoom
        card.addEventListener('click', () => {
            map.setView([lat, lng], 16);
            marker.openPopup();
        });
    });

    // Geolocation API
    const geoStatus = document.getElementById("geolocation-status");
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                geoStatus.innerHTML = `<i class='bx bx-check-circle'></i> Localização encontrada!`;
                geoStatus.style.color = "#2ecc71";

                // Add user marker
                L.marker([userLat, userLng], {icon: userIcon}).addTo(map)
                    .bindPopup("<b>Você está aqui</b>").openPopup();
                
                // Adjust map bounds to include user and some cafes (simplified to just re-center for now)
                map.setView([userLat, userLng], 13);
            },
            (error) => {
                geoStatus.innerHTML = `<i class='bx bx-error-circle'></i> Permissão de localização negada ou indisponível.`;
                geoStatus.style.color = "#e74c3c";
            }
        );
    } else {
        geoStatus.innerHTML = `<i class='bx bx-error-circle'></i> Geolocalização não suportada.`;
    }

    // Listen for location selections from script.js (Google Places)
    window.addEventListener('locationSelected', (e) => {
        const { lat, lng, name } = e.detail;
        map.setView([lat, lng], 14);
        
        // Add a temporary marker for the searched location
        L.marker([lat, lng], {icon: userIcon}).addTo(map)
            .bindPopup(`<b>${name}</b>`)
            .openPopup();
    });
});
