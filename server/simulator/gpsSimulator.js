/**
 * GPS Simulator — simulates 3 college buses moving along predefined routes
 * Updates location every 5 seconds by POSTing to the backend API.
 * Run: node server/simulator/gpsSimulator.js
 */

const http = require('http');

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5001';

// Predefined routes: waypoints around a typical college area (lat/lng)
const routes = [
    {
        busId: 'BUS-001',
        routeName: 'Route A — Main Campus Loop',
        waypoints: [
            { lat: 12.8236, lng: 80.0425 }, // Main Gate
            { lat: 12.8228, lng: 80.0435 }, // University Building
            { lat: 12.8215, lng: 80.0440 }, // Tech Park
            { lat: 12.8195, lng: 80.0450 }, // Library
            { lat: 12.8180, lng: 80.0455 }, // Biotech Block
            { lat: 12.8170, lng: 80.0445 }, // Arch Gate
        ],
    },
    {
        busId: 'BUS-002',
        routeName: 'Route B — Hostel Route',
        waypoints: [
            { lat: 12.8248, lng: 80.0460 }, // SRM Hospital
            { lat: 12.8260, lng: 80.0475 }, // Medical College
            { lat: 12.8275, lng: 80.0490 }, // Nelson Mandela Hostel
            { lat: 12.8290, lng: 80.0485 }, // Oori Hostel
            { lat: 12.8305, lng: 80.0470 }, // Dental College
            { lat: 12.8295, lng: 80.0450 }, // PG Hostel
        ],
    },
    {
        busId: 'BUS-003',
        routeName: 'Route C — Railway Station Link',
        waypoints: [
            { lat: 12.8250, lng: 80.0380 }, // Potheri Station
            { lat: 12.8245, lng: 80.0400 }, // Station Gate
            { lat: 12.8238, lng: 80.0415 }, // Valliammai Engg
            { lat: 12.8236, lng: 80.0425 }, // SRM Main Gate
            { lat: 12.8240, lng: 80.0440 }, // Java Green
            { lat: 12.8248, lng: 80.0460 }, // SRM Hospital
        ],
    },
];

// Track current index for each bus
const busState = routes.map((r) => ({ ...r, currentIndex: 0, direction: 1 }));

function postJSON(path, data) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(data);
        const options = {
            hostname: 'localhost',
            port: 5001,
            path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
            },
        };
        const req = http.request(options, (res) => {
            let raw = '';
            res.on('data', (chunk) => (raw += chunk));
            res.on('end', () => resolve(raw));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// Add small random noise to simulate realistic GPS jitter
function addNoise(val, factor = 0.0002) {
    return val + (Math.random() - 0.5) * factor;
}

async function simulateTick() {
    for (const bus of busState) {
        const waypoint = bus.waypoints[bus.currentIndex];
        // More realistic speed: 90% chance of movement, 10% chance of being stationary
        const speed = Math.random() > 0.1 ? Math.round(15 + Math.random() * 35) : 0; 

        const payload = {
            busId: bus.busId,
            latitude: addNoise(waypoint.lat),
            longitude: addNoise(waypoint.lng),
            speed,
            heading: Math.round(Math.random() * 360),
            routeIndex: bus.currentIndex,
        };

        try {
            await postJSON('/api/location/update', payload);
            console.log(`📍 ${bus.busId} → [${payload.latitude.toFixed(4)}, ${payload.longitude.toFixed(4)}] at ${speed} km/h`);
        } catch (err) {
            console.error(`⚠️  ${bus.busId} update failed: ${err.message}`);
        }

        // Move to next waypoint (bounce back at ends)
        bus.currentIndex += bus.direction;
        if (bus.currentIndex >= bus.waypoints.length - 1) bus.direction = -1;
        if (bus.currentIndex <= 0) bus.direction = 1;
    }
}

console.log('🚌 GPS Simulator started — updating every 5 seconds...');
simulateTick(); // immediate first tick
setInterval(simulateTick, 5000);
