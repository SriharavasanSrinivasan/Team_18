const User = require('../models/User');
const Bus = require('../models/Bus');
const BusStop = require('../models/BusStop');
const TeamMember = require('../models/TeamMember');

const droppingPoint = { name: "SRM KTR Dropping Point", lat: 12.8229, lng: 80.0388 };

const routeData = [
    {
        routeNo: "S1",
        routeName: "Avadi",
        stops: [
            { name: "Avadi", lat: 13.1165, lng: 80.1018 },
            { name: "Thirumullaivoyal", lat: 13.1311, lng: 80.1332 },
            { name: "Ambattur OT", lat: 13.1114, lng: 80.1554 },
            { name: "Decathlon Service Road", lat: 13.1147, lng: 80.1706 },
            { name: "Porur Toll Gate", lat: 13.0334, lng: 80.1557 },
            droppingPoint
        ]
    },
    {
        routeNo: "S1A",
        routeName: "Senthil Nagar",
        stops: [
            { name: "Temple School", lat: 13.1254, lng: 80.1601 },
            { name: "Senthil Nagar", lat: 13.1158, lng: 80.1633 },
            { name: "Thirumangalam", lat: 13.0850, lng: 80.1920 },
            { name: "Waves", lat: 13.0854, lng: 80.1874 },
            { name: "Collector Nagar", lat: 13.0841, lng: 80.1812 },
            { name: "Golden Flats", lat: 13.0841, lng: 80.1812 },
            droppingPoint
        ]
    },
    {
        routeNo: "S2",
        routeName: "Ayanavaram",
        stops: [
            { name: "Kellys", lat: 13.0874, lng: 80.2458 },
            { name: "Mental Hospital (Keezhpak)", lat: 13.0862, lng: 80.2424 },
            { name: "Ayanavaram Signal", lat: 13.0970, lng: 80.2355 },
            { name: "Noor Hotel", lat: 13.1001, lng: 80.2312 },
            { name: "Joint Office", lat: 13.1015, lng: 80.2255 },
            { name: "Police Quatras", lat: 13.1030, lng: 80.2201 },
            { name: "ICF", lat: 13.0990, lng: 80.2170 },
            { name: "Nathamuni", lat: 13.0945, lng: 80.2085 },
            { name: "Anna Nagar West Depot", lat: 13.0847, lng: 80.1989 },
            { name: "Rohini Theatre", lat: 13.0735, lng: 80.1945 },
            { name: "Madhuravoyal Erikkarai", lat: 13.0675, lng: 80.1712 },
            droppingPoint
        ]
    },
    {
        routeNo: "S3",
        routeName: "Koyambedu",
        stops: [
            { name: "Koyambedu", lat: 13.0674, lng: 80.2048 },
            { name: "MMDA", lat: 13.0645, lng: 80.2105 },
            { name: "Vadapalani", lat: 13.0500, lng: 80.2121 },
            { name: "Ashok Pillar", lat: 13.0355, lng: 80.2123 },
            { name: "Kasi Theatre", lat: 13.0298, lng: 80.2131 },
            { name: "Ekkattuthangal", lat: 13.0195, lng: 80.2065 },
            { name: "Pallavaram", lat: 12.9675, lng: 80.1491 },
            { name: "MIT Chrompet", lat: 12.9515, lng: 80.1408 },
            droppingPoint
        ]
    },
    {
        routeNo: "S4",
        routeName: "Mylapore",
        stops: [
            { name: "Mylapore Tank", lat: 13.0334, lng: 80.2687 },
            { name: "Mandaveli Depot", lat: 13.0275, lng: 80.2635 },
            { name: "Vannandurai", lat: 12.9961, lng: 80.2520 },
            { name: "Indira Nagar Water Tank", lat: 12.9925, lng: 80.2505 },
            { name: "Adyar Canal", lat: 12.9995, lng: 80.2455 },
            { name: "IIT", lat: 12.9915, lng: 80.2335 },
            { name: "Anna University", lat: 13.0130, lng: 80.2355 },
            { name: "Guindy", lat: 13.0067, lng: 80.2206 },
            { name: "Chrompet", lat: 12.9515, lng: 80.1408 },
            droppingPoint
        ]
    },
    {
        routeNo: "S5",
        routeName: "Nandambakkam",
        stops: [
            { name: "Nandampakkam Trade Centre", lat: 13.0185, lng: 80.1905 },
            { name: "Ramapuram (MIOT)", lat: 13.0324, lng: 80.1804 },
            { name: "Mugalivakkam", lat: 13.0195, lng: 80.1705 },
            { name: "Sakthi Nagar", lat: 13.0255, lng: 80.1655 },
            { name: "Porur Roundana", lat: 13.0381, lng: 80.1578 },
            { name: "Porur Service Road", lat: 13.0325, lng: 80.1545 },
            { name: "Porur Toll Gate", lat: 13.0334, lng: 80.1557 },
            droppingPoint
        ]
    },
    {
        routeNo: "S6",
        routeName: "Thiruvottriyur",
        stops: [
            { name: "Thiruvottriyur (Beach Road)", lat: 13.1598, lng: 80.3015 },
            { name: "Ellaiyamman Kovil", lat: 13.1512, lng: 80.3005 },
            { name: "Toll Gate", lat: 13.1278, lng: 80.2974 },
            { name: "N4 Police Station", lat: 13.1180, lng: 80.2955 },
            { name: "Kasi Medu", lat: 13.1185, lng: 80.2952 },
            { name: "Kal Mandabam", lat: 13.1115, lng: 80.2935 },
            { name: "Beach Station", lat: 13.0935, lng: 80.2891 },
            { name: "Shanthi Theatre", lat: 13.0645, lng: 80.2645 },
            { name: "LIC", lat: 13.0640, lng: 80.2660 },
            { name: "Church Park School", lat: 13.0565, lng: 80.2545 },
            { name: "Teynampet Apollo Hospital", lat: 13.0441, lng: 80.2505 },
            { name: "Nandanam Signal", lat: 13.0335, lng: 80.2445 },
            { name: "Saidapet", lat: 13.0215, lng: 80.2235 },
            { name: "Chinnamalai", lat: 13.0165, lng: 80.2225 },
            { name: "Santhi Petrol Bunk", lat: 13.0085, lng: 80.2215 },
            droppingPoint
        ]
    },
    {
        routeNo: "S7",
        routeName: "Velachery",
        stops: [
            { name: "Gandhi Road Junction", lat: 12.9855, lng: 80.2205 },
            { name: "Vijaya Nagar (Velachery)", lat: 12.9804, lng: 80.2221 },
            { name: "Kaiveli", lat: 12.9691, lng: 80.2185 },
            { name: "Kamachi Hospital", lat: 12.9455, lng: 80.2085 },
            { name: "Sunnambu Kolathur", lat: 12.9415, lng: 80.1995 },
            { name: "Echangadu", lat: 12.9315, lng: 80.1945 },
            droppingPoint
        ]
    },
    {
        routeNo: "S7A",
        routeName: "Pallikaranai",
        stops: [
            { name: "Balaji Dental College", lat: 12.9355, lng: 80.2145 },
            { name: "Pallikaranai (Oil Mill)", lat: 12.9345, lng: 80.2125 },
            { name: "Pallikaranai (Jeyachandran)", lat: 12.9335, lng: 80.2115 },
            { name: "Medavakkam", lat: 12.9168, lng: 80.1912 },
            { name: "Medavakkam X Road", lat: 12.9168, lng: 80.1912 },
            { name: "Vijaya Nagar", lat: 12.9105, lng: 80.1855 },
            { name: "Santhosapuram", lat: 12.9095, lng: 80.1785 },
            { name: "Sempakkam", lat: 12.9192, lng: 80.1625 },
            { name: "Kamaraja Puram", lat: 12.9215, lng: 80.1555 },
            { name: "Rajakilpakkam", lat: 12.9185, lng: 80.1495 },
            { name: "Camp Road", lat: 12.9135, lng: 80.1416 },
            { name: "Selaiyur", lat: 12.9115, lng: 80.1385 },
            { name: "Christ King School", lat: 12.9105, lng: 80.1305 },
            { name: "Poondi Bazaar", lat: 12.9155, lng: 80.1245 },
            droppingPoint
        ]
    },
    {
        routeNo: "S8",
        routeName: "Mount Subway",
        stops: [
            { name: "Mount Subway", lat: 12.9984, lng: 80.2018 },
            { name: "Jeyalakshmi Theatre", lat: 12.9945, lng: 80.1985 },
            { name: "Thillai Nagar (Perumal Kovil)", lat: 12.9855, lng: 80.1955 },
            { name: "Alandur Subway", lat: 13.0035, lng: 80.2014 },
            { name: "Tambaram", lat: 12.9238, lng: 80.1171 },
            droppingPoint
        ]
    },
    {
        routeNo: "S9",
        routeName: "Padappai",
        stops: [
            { name: "Padappai", lat: 12.8715, lng: 80.0215 },
            { name: "Mannivakkam (Ruby Builders)", lat: 12.8905, lng: 80.0515 },
            { name: "Lakshmi Nagar (Police Booth)", lat: 12.8955, lng: 80.0615 },
            { name: "Mudichur Petrol Bunk", lat: 12.9095, lng: 80.0768 },
            { name: "Mudichur Attai Company", lat: 12.9125, lng: 80.0815 },
            { name: "Parvathi Nagar", lat: 12.9155, lng: 80.0855 },
            { name: "Pathmavathi Nagar", lat: 12.9185, lng: 80.0895 },
            { name: "Bharathi Nagar", lat: 12.9215, lng: 80.0935 },
            { name: "Lakshmi Puram", lat: 12.9245, lng: 80.0975 },
            { name: "Krishna Nagar", lat: 12.9275, lng: 80.1015 },
            { name: "Old Tambaram", lat: 12.9305, lng: 80.1105 },
            { name: "Tambaram (Bridge)", lat: 12.9255, lng: 80.1155 },
            droppingPoint
        ]
    },
    {
        routeNo: "S10",
        routeName: "Chengalpat",
        stops: [
            { name: "CMCH Hospital", lat: 12.6955, lng: 79.9755 },
            { name: "Ratina Kinaru", lat: 12.6895, lng: 79.9765 },
            { name: "New Bus Stand", lat: 12.6841, lng: 79.9774 },
            { name: "Old Bus Stand", lat: 12.6925, lng: 79.9815 },
            { name: "Mahindra City", lat: 12.7394, lng: 79.9922 },
            { name: "SP Kovil", lat: 12.7615, lng: 80.0035 },
            { name: "MM Nagar", lat: 12.7919, lng: 80.0322 },
            droppingPoint
        ]
    },
    {
        routeNo: "S11",
        routeName: "Chrompet",
        stops: [
            { name: "Chrompet", lat: 12.9515, lng: 80.1408 },
            { name: "Dr. Rajendra Prasath Road", lat: 12.9455, lng: 80.1355 },
            { name: "Varadhara Theatre", lat: 12.9415, lng: 80.1315 },
            { name: "Sanatorium Railway Station", lat: 12.9295, lng: 80.1384 },
            { name: "Irumbuliyur", lat: 12.9092, lng: 80.1068 },
            { name: "Perungalathur", lat: 12.9004, lng: 80.0934 },
            droppingPoint
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
    } catch (err) {
        console.error('❌ User seeding error:', err);
    }
};

const seedBusData = async () => {
    try {
        const uniqueStopsMap = new Map();
        routeData.forEach(route => {
            route.stops.forEach(stop => {
                if (!uniqueStopsMap.has(stop.name)) {
                    uniqueStopsMap.set(stop.name, stop);
                }
            });
        });

        console.log(`Seeding ${uniqueStopsMap.size} unique bus stops...`);
        for (const [name, stop] of uniqueStopsMap) {
            await BusStop.findOneAndUpdate(
                { name },
                { lat: stop.lat, lng: stop.lng, description: `Stop for ${name}` },
                { upsert: true, returnDocument: 'after' }
            );
        }

        console.log('Seeding bus routes...');
        for (const data of routeData) {
            await Bus.findOneAndUpdate(
                { busId: data.routeNo },
                { 
                    routeName: data.routeName, 
                    stops: data.stops, 
                    isActive: true 
                },
                { upsert: true, returnDocument: 'after' }
            );
        }
        console.log(`✅ ${routeData.length} Bus routes seeded successfully`);
    } catch (err) {
        console.error('❌ Bus data seeding error:', err);
    }
};

const seedTeamMembers = async () => {
    // Keep clean as requested
};

module.exports = { seedUsers, seedBusData, seedTeamMembers };
