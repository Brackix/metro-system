// Polyline decoding function for OSRM
function decodePolyline(encoded: string): Array<{latitude: number, longitude: number}> {
  const coordinates: Array<{latitude: number, longitude: number}> = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    coordinates.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return coordinates;
}

export const obtenerRuta = async (
  origen: { latitude: number; longitude: number },
  destino: { latitude: number; longitude: number },
  mode: 'walking' | 'driving' = 'walking'
): Promise<{
  coordinates: Array<[number, number]>;
  distance: number;
  duration: number;
}> => {
  try {
    // ✅ OSRM con los perfiles correctos
    const profile = mode === 'walking' ? 'foot' : 'car';
    
    const url = `https://router.project-osrm.org/route/v1/${profile}/${origen.longitude},${origen.latitude};${destino.longitude},${destino.latitude}?overview=full&geometries=polyline&steps=false`;

    console.log(`🔗 Requesting ${mode} route from OSRM (profile: ${profile})`);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`OSRM HTTP error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.routes || !data.routes[0] || !data.routes[0].geometry) {
      throw new Error('Invalid response format from OSRM');
    }

    const route = data.routes[0];

    // Decode polyline
    const encodedPolyline = route.geometry;
    const decodedCoords = decodePolyline(encodedPolyline);

    if (decodedCoords.length === 0) {
      throw new Error('No route coordinates returned from OSRM');
    }

    const coordinates: Array<[number, number]> = decodedCoords.map(coord => [coord.latitude, coord.longitude]);

    const distanceKm = (route.distance / 1000).toFixed(2);
    const durationMin = Math.ceil(route.duration / 60);

    console.log(`✅ ${mode.toUpperCase()} route calculated:`);
    console.log(`   📏 Distance: ${distanceKm} km`);
    console.log(`   ⏱️  Duration: ${durationMin} min`);
    console.log(`   📍 Points: ${coordinates.length}`);

    // ✅ Ajusta la duración según el modo
    let finalDistance = route.distance;
    let finalDuration = route.duration;

    if (mode === 'walking') {
      // ✅ CAMINANDO: MANTIENE EL CÁLCULO ORIGINAL (ESTÁ PERFECTO)
      finalDuration = finalDistance / 1.4;
    } else {
      // ✅ AUTO: Velocidad más lenta considerando tráfico urbano
      // 25 km/h = 6.94 m/s (realista en ciudad con tráfico)
      const urbanSpeed = 6.94;
      const baseDuration = finalDistance / urbanSpeed;
      // +30% por semáforos, tráfico, buscar estacionamiento
      finalDuration = baseDuration * 1.3;
    }

    console.log(`   🔧 Adjusted duration: ${Math.ceil(finalDuration / 60)} min`);

    return {
      coordinates,
      distance: finalDistance,
      duration: finalDuration,
    };
  } catch (error) {
    console.error('❌ Error with OSRM, using fallback:', error);

    // Fallback con cálculo manual
    console.log('🔄 Using straight-line fallback');

    const R = 6371e3;
    const φ1 = origen.latitude * Math.PI/180;
    const φ2 = destino.latitude * Math.PI/180;
    const Δφ = (destino.latitude-origen.latitude) * Math.PI/180;
    const Δλ = (destino.longitude-origen.longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    // ✅ VELOCIDADES AJUSTADAS
    let speed: number;
    let finalDuration: number;
    
    if (mode === 'walking') {
      // Caminando: 1.4 m/s = ~5 km/h
      speed = 1.4;
      finalDuration = distance / speed;
    } else {
      // Auto: 6.94 m/s = ~25 km/h en ciudad con tráfico
      speed = 6.94;
      const baseDuration = distance / speed;
      finalDuration = baseDuration * 1.3; // +30% por tráfico
    }

    console.log(`⚠️ Fallback: ${(distance/1000).toFixed(2)}km = ${Math.ceil(finalDuration/60)}min`);

    return {
      coordinates: [
        [origen.latitude, origen.longitude],
        [destino.latitude, destino.longitude],
      ] as Array<[number, number]>,
      distance: Math.round(distance),
      duration: Math.round(finalDuration),
    };
  }
};
