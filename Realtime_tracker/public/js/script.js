const socket = io();

// Initialize the map
const map = L.map("map").setView([0, 0], 16);

// Add tile layer
L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap",
}).addTo(map);

const markers = {}; // Object to keep track of user markers

// Emit location updates
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error('Geolocation error:', error.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    }
  );
}

// Handle receiving location updates
socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;

  // Update or add marker for the user
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }

  // Optionally, you can add a popup or custom styling for the marker
  markers[id].bindPopup(`User: ${id}`).openPopup();
});

// Handle user disconnection
socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
