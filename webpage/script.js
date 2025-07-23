let map;
let marker;

window.onload = function () {
  map = L.map('map').setView([45.4215, -75.6972], 13); // Ottawa

  const MAPTILER_API_KEY = 'YDRKDIjIxJm3I35jNXGb';

  L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`, {
    attribution: '© MapTiler © OpenStreetMap contributors',
  }).addTo(map);

  // Handle point click
  map.on('click', function (e) {
    const { lat, lng } = e.latlng;

    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);

    document.getElementById('status').textContent = `Selected: [${lat.toFixed(5)}, ${lng.toFixed(5)}]`;
  });

  // Save clicked point
  document.getElementById('saveBtn').addEventListener('click', () => {
    if (!marker) return alert('Click the map first.');

    const { lat, lng } = marker.getLatLng();
    const geojson = {
      name: "User selected point",
      type: "point",
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
    };

    console.log("Saving Point:", geojson);

    fetch('http://localhost:3000/api/save-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geojson)
    })
      .then(res => res.json())
      .then(() => document.getElementById('status').textContent = "Point saved!")
      .catch(err => {
        console.error(err);
        document.getElementById('status').textContent = "Error saving point.";
      });
  });

  // Address search (geocoding)
  document.getElementById('searchBtn').addEventListener('click', () => {
    const address = document.getElementById('locationInput').value.trim();
    if (!address) return alert('Enter a location to search.');

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
          document.getElementById('status').textContent = "No results found.";
          return;
        }

        const { lat, lon } = data[0];
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);

        map.setView([latNum, lonNum], 15);

        if (marker) map.removeLayer(marker);
        marker = L.marker([latNum, lonNum]).addTo(map);
        document.getElementById('status').textContent = `Found: [${latNum.toFixed(5)}, ${lonNum.toFixed(5)}]`;
      })
      .catch(err => {
        console.error(err);
        document.getElementById('status').textContent = "Search failed.";
      });
  });

  // Leaflet Draw
  const drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  const drawControl = new L.Control.Draw({
    draw: {
      marker: false,
      circle: true,
      polyline: false,
      rectangle: false,
      circlemarker: false,
      polygon: {
        allowIntersection: false,
        showArea: true,
        shapeOptions: {
          color: 'blue'
        }
      }
    },
    edit: {
      featureGroup: drawnItems
    }
  });
  map.addControl(drawControl);

  map.on(L.Draw.Event.CREATED, function (e) {
    const layer = e.layer;
    drawnItems.addLayer(layer);

    if (e.layerType === 'polygon') {
      const latlngs = layer.getLatLngs()[0];
      const coordinates = latlngs.map(ll => [ll.lng, ll.lat]);

      const geojson = {
        name: "User drawn zone",
        type: "zone",
        location: {
          type: "Polygon",
          coordinates: [coordinates]
        }
      };

      console.log("Saving Polygon:", geojson);

      fetch('http://localhost:3000/api/save-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geojson)
      })
        .then(res => res.json())
        .then(() => document.getElementById('status').textContent = "Polygon saved!")
        .catch(err => {
          console.error(err);
          document.getElementById('status').textContent = "Error saving polygon.";
        });
    }

    else if (e.layerType === 'circle') {
      const center = layer.getLatLng();
      const radius = layer.getRadius();

      const geojson = {
        name: "User drawn circle",
        type: "circle",
        center: {
          type: "Point",
          coordinates: [center.lng, center.lat]
        },
        radiusInMeters: radius
      };

      console.log("Saving Circle:", geojson);

      fetch('http://localhost:3000/api/save-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geojson)
      })
        .then(res => res.json())
        .then(() => document.getElementById('status').textContent = "Circle saved!")
        .catch(err => {
          console.error(err);
          document.getElementById('status').textContent = "Error saving circle.";
        });
    }
  });
};
