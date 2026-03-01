// constants/haversine.ts
export function calcularDistancia(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en kilómetros
}

export function encontrarEstacionCercana(
  ubicacion: { latitude: number; longitude: number },
  estaciones: any[]
) {
  let estacionCercana = estaciones[0];
  let distanciaMinima = Infinity;

  estaciones.forEach((estacion) => {
    const distancia = calcularDistancia(
      ubicacion.latitude,
      ubicacion.longitude,
      estacion.lat,
      estacion.lon
    );
    if (distancia < distanciaMinima) {
      distanciaMinima = distancia;
      estacionCercana = estacion;
    }
  });

  return estacionCercana;
}
