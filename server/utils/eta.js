/**
 * Haversine formula — distance between two lat/lng points in km
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Calculate ETA in minutes
 * @param {number} busLat  - current bus latitude
 * @param {number} busLng  - current bus longitude
 * @param {number} stopLat - destination stop latitude
 * @param {number} stopLng - destination stop longitude
 * @param {number} speedKmh - current speed in km/h (default 30)
 */
const calculateETA = (busLat, busLng, stopLat, stopLng, speedKmh = 30) => {
    const distance = haversineDistance(busLat, busLng, stopLat, stopLng);
    const avgSpeed = speedKmh > 5 ? speedKmh : 30; // fallback to 30 kmh if speed too low
    const etaHours = distance / avgSpeed;
    const etaMinutes = Math.round(etaHours * 60);
    return { distance: parseFloat(distance.toFixed(2)), etaMinutes };
};

module.exports = { haversineDistance, calculateETA };
