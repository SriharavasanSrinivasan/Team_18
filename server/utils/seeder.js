const User = require('../models/User');
const Bus = require('../models/Bus');
const BusStop = require('../models/BusStop');

const routeData = [
    {
        routeNo: "1",
        destination: "SRM Kattankulathur",
        stops: [
            { name: "Chengalpattu", lat: 12.6925, lng: 79.9770 },
            { name: "Mahindra City", lat: 12.7300, lng: 79.9850 },
            { name: "Potheri", lat: 12.8238, lng: 80.0421 }
        ]
    },
    {
        routeNo: "2",
        destination: "SRM Kattankulathur",
        stops: [
            { name: "Tambaram", lat: 12.9249, lng: 80.1275 },
            { name: "Perungalathur", lat: 12.9095, lng: 80.1000 },
            { name: "Urapakkam", lat: 12.8674, lng: 80.0715 },
            { name: "Guduvanchery", lat: 12.8452, lng: 80.0606 }
        ]
    },
    {
        routeNo: "5",
        destination: "SRM Kattankulathur",
        stops: [
            { name: "Thiruvanmiyur", lat: 12.9830, lng: 80.2594 },
            { name: "Besant Nagar", lat: 13.0003, lng: 80.2667 },
            { name: "Adyar", lat: 13.0012, lng: 80.2565 },
            { name: "Thoraipakkam", lat: 12.9416, lng: 80.2362 },
            { name: "Sholinganallur", lat: 12.9010, lng: 80.2279 },
            { name: "Medavakkam", lat: 12.9189, lng: 80.1920 }
        ]
    },
    {
        routeNo: "6",
        destination: "SRM Kattankulathur",
        stops: [
            { name: "Navalur", lat: 12.8450, lng: 80.2260 },
            { name: "Siruseri", lat: 12.8235, lng: 80.2238 },
            { name: "Kelambakkam", lat: 12.7870, lng: 80.2200 }
        ]
    },
    {
        routeNo: "7",
        destination: "SRM Kattankulathur",
        stops: [
            { name: "Avadi", lat: 13.1143, lng: 80.1098 },
            { name: "Ambattur", lat: 13.0982, lng: 80.1610 },
            { name: "Anna Nagar", lat: 13.0850, lng: 80.2101 },
            { name: "Koyambedu", lat: 13.0696, lng: 80.2031 },
            { name: "Vadapalani", lat: 13.0500, lng: 80.2120 },
            { name: "Guindy", lat: 13.0067, lng: 80.2206 }
        ]
    },
    {
        routeNo: "8",
        destination: "SRM Kattankulathur",
        stops: [
            { name: "Red Hills", lat: 13.1850, lng: 80.1990 },
            { name: "Madhavaram", lat: 13.1480, lng: 80.2300 },
            { name: "Perambur", lat: 13.1210, lng: 80.2320 },
            { name: "Vepery", lat: 13.0827, lng: 80.2668 },
            { name: "Egmore", lat: 13.0732, lng: 80.2609 },
            { name: "Guindy", lat: 13.0067, lng: 80.2206 }
        ]
    },
    {
        routeNo: "9",
        destination: "SRM Kattankulathur",
        stops: [
            { name: "T Nagar", lat: 13.0418, lng: 80.2341 },
            { name: "Saidapet", lat: 13.0237, lng: 80.2209 },
            { name: "Guindy", lat: 13.0067, lng: 80.2206 }
        ]
    }
];

const seedUsers = async () => {
    try {
        const adminExists = await User.findOne({ email: 'admin@college.edu' });
        if (!adminExists) {
            await User.create({
                name: 'System Admin',
                email: 'admin@college.edu',
                password: 'admin',
                role: 'admin'
            });
            console.log('✅ Default Admin seeded: admin@college.edu / admin');
        }

        // Seed 10 Faculties
        const facultiesCount = await User.countDocuments({ role: 'faculty' });
        if (facultiesCount === 0) {
            for (let i = 1; i <= 10; i++) {
                await User.create({
                    name: `Faculty ${i}`,
                    email: `faculty${i}@college.edu`,
                    password: 'password123',
                    role: 'faculty'
                });
            }
            console.log('✅ 10 Faculties seeded successfully');
        }

        // Seed 10 Drivers
        const driversCount = await User.countDocuments({ role: 'driver' });
        if (driversCount === 0) {
            for (let i = 1; i <= 10; i++) {
                await User.create({
                    name: `Driver ${i}`,
                    email: `driver${i}@college.edu`,
                    password: 'password123',
                    role: 'driver'
                });
            }
            console.log('✅ 10 Drivers seeded successfully');
        }

    } catch (err) {
        console.error('❌ User seeding error:', err);
    }
};

const seedBusData = async () => {
    try {
        // 1. Seed unique BusStops
        const uniqueStops = new Map();
        routeData.forEach(route => {
            route.stops.forEach(stop => {
                if (!uniqueStops.has(stop.name)) uniqueStops.set(stop.name, stop);
            });
        });

        const stopCount = await BusStop.countDocuments();
        if (stopCount === 0) {
            console.log(`Seeding ${uniqueStops.size} unique bus stops...`);
            for (const [name, stop] of uniqueStops) {
                await BusStop.create({ 
                    name, 
                    lat: stop.lat, 
                    lng: stop.lng, 
                    description: `Automated seed stop for ${name}` 
                });
            }
        }

        // 2. Seed Bus Routes
        const busCount = await Bus.countDocuments();
        if (busCount === 0) {
            for (const data of routeData) {
                const busId = `Route ${data.routeNo}`;
                await Bus.create({
                    busId,
                    routeName: `${data.destination} (via Route ${data.routeNo})`,
                    stops: data.stops,
                    isActive: true
                });
            }
            console.log(`✅ ${routeData.length} Bus routes seeded successfully`);
        }
    } catch (err) {
        console.error('❌ Bus data seeding error:', err);
    }
};

module.exports = { seedUsers, seedBusData };
