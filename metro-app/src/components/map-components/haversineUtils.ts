export interface LocationCoords {
  latitude: number;
  longitude: number;
}

// ✅ Cálculo de distancia Haversine
export function calculateDistance(
  point1: LocationCoords,
  point2: { lat: number | null; lng: number | null } | LocationCoords
): number {
  // ✅ NUEVO: Validar que lat y lng no sean null
  const lat2 = 'lat' in point2 ? point2.lat : point2.latitude;
  const lng2 = 'lng' in point2 ? point2.lng : point2.longitude;

  // Si alguno es null, devolver infinito (muy lejos)
  if (lat2 === null || lng2 === null) {
    return Infinity;
  }

  const toRadian = (angle: number) => (Math.PI / 180) * angle;
  const distance = (a: number, b: number) => (Math.PI / 180) * (a - b);
  const RADIUS_OF_EARTH_IN_KM = 6371;

  const dLat = distance(lat2, point1.latitude);
  const dLon = distance(lng2, point1.longitude);

  const lat1 = toRadian(point1.latitude);
  const lat2Rad = toRadian(lat2);

  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2Rad);
  const c = 2 * Math.asin(Math.sqrt(a));

  return RADIUS_OF_EARTH_IN_KM * c;
}

// ✅ Encontrar paradas OMSA cercanas (máximo 3)
export function findNearestOmsaStops(
  userLocation: LocationCoords,
  omsaStops: any[],
  maxResults: number = 3,
  radiusKm: number = 5
): any[] {
  const withDistance = omsaStops
    // ✅ NUEVO: Filtrar primero las que tengan coordenadas válidas
    .filter(stop => stop.lat !== null && stop.lng !== null)
    .map(stop => ({
      ...stop,
      distance: calculateDistance(userLocation, { lat: stop.lat, lng: stop.lng })
    }))
    .filter(stop => stop.distance !== Infinity && stop.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults);

  return withDistance;
}
