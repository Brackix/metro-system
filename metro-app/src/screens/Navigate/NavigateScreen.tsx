import * as Location from 'expo-location';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import { getStations, Station } from '../../constants/map-constants/estaciones';
import { encontrarEstacionCercana } from '../../constants/map-constants/haversine';

interface MapScreenProps {}

interface LocationType {
  latitude: number;
  longitude: number;
}

type Estacion = {
  id: string;
  nombre: string;
  lat: number;
  lon: number;
  line?: string;
};

const MapScreen: React.FC<MapScreenProps> = () => {
  const webViewRef = useRef<WebView>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [estacionCercana, setEstacionCercana] = useState<Estacion | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Estacion | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; time: string } | null>(null);
  const [transportMode, setTransportMode] = useState<'walking' | 'driving'>('walking');

  const toEstacion = (station: Station): Estacion => ({
    id: station.id,
    nombre: station.name,
    lat: station.latitude,
    lon: station.longitude,
    line: station.line
  });

  useEffect(() => {
    const loadStations = async () => {
      try {
        const data = await getStations();
        setStations(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading stations:', err);
        setError('Failed to load stations. Please try again later.');
        setIsLoading(false);
      }
    };
    loadStations();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      } catch (err) {
        console.error('Error getting location:', err);
        setError('Could not get your location');
      }
    })();
  }, []);

  useEffect(() => {
    if (location && stations.length > 0) {
      const estaciones = stations.map(toEstacion);
      const cercana = encontrarEstacionCercana(location, estaciones);
      setEstacionCercana(cercana);
    }
  }, [location, stations]);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'stationClick') {
        const station = stations.find(s => s.id === data.stationId);
        if (station) {
          setSelectedStation(toEstacion(station));
          setModalVisible(true);
        }
      }
      
      if (data.type === 'routeInfo') {
        setRouteInfo({
          distance: data.distance,
          time: data.time
        });
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

 const handleCalculateRoute = (mode: 'walking' | 'driving') => {
  if (!location || !selectedStation) return;

  setModalVisible(false);
  setShowRoute(true);
  setTransportMode(mode);

  const profile = mode === 'walking' ? 'foot' : 'car';

  const routeJS = `
    if (window.routingControl) {
      map.removeControl(window.routingControl);
    }

    window.routingControl = L.Routing.control({
      waypoints: [
        L.latLng(${location.latitude}, ${location.longitude}),
        L.latLng(${selectedStation.lat}, ${selectedStation.lon})
      ],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: '${profile}'
      }),
      lineOptions: {
        styles: [{ color: '#1E88E5', weight: 6, opacity: 0.8 }]
      },
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false
    }).addTo(map);

    window.routingControl.on('routesfound', function(e) {
      var route = e.routes[0];
      var distanceKm = route.summary.totalDistance / 1000;
      
      // ✅ CÁLCULO REALISTA DE TIEMPO
      var adjustedTime;
      var timeDisplay;
      
      if ('${mode}' === 'walking') {
        // Caminando: 4 km/h = 12 min/km
        adjustedTime = Math.ceil(distanceKm * 12);
      } else {
        // En auto: 30 km/h promedio en ciudad = 6 min/km (tráfico moderado)
        adjustedTime = Math.ceil(distanceKm * 6);
      }
      
      // ✅ CONVERTIR A HORAS SI ES MÁS DE 60 MIN
      if (adjustedTime >= 60) {
        var hours = Math.floor(adjustedTime / 60);
        var minutes = adjustedTime % 60;
        if (minutes === 0) {
          timeDisplay = hours + ' h';
        } else {
          timeDisplay = hours + ' h ' + minutes + ' min';
        }
      } else {
        timeDisplay = adjustedTime + ' min';
      }
      
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'routeInfo',
        distance: distanceKm.toFixed(2) + ' km',
        time: timeDisplay
      }));
    });
  `;

  webViewRef.current?.injectJavaScript(routeJS);
};



  const handleCloseRoute = () => {
    setShowRoute(false);
    setRouteInfo(null);

    webViewRef.current?.injectJavaScript(`
      if (window.routingControl) {
        map.removeControl(window.routingControl);
        window.routingControl = null;
      }
    `);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  const lat = location?.latitude || 18.4861;
  const lon = location?.longitude || -69.9312;

  // ✅ PINS EN LUGAR DE CÍRCULOS
  const stationsMarkers = stations.map(station => {
    const color = station.line === 'Línea 1' ? '#4A90E2' : '#EF4444';
    const isNearby = estacionCercana?.id === station.id;
    
    return `
      var icon = L.divIcon({
        className: 'station-pin',
        html: '<div style="position: relative; width: 30px; height: 40px;">' +
              '<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">' +
              '<path d="M15 0C8.373 0 3 5.373 3 12c0 9 12 28 12 28s12-19 12-28c0-6.627-5.373-12-12-12z" ' +
              'fill="${isNearby ? '#00CED1' : color}" stroke="white" stroke-width="2"/>' +
              '<circle cx="15" cy="12" r="5" fill="white"/>' +
              '</svg></div>',
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40]
      });
      
      L.marker([${station.latitude}, ${station.longitude}], { icon: icon })
        .addTo(map)
        .bindPopup('<b>${station.name}</b><br>${station.line}')
        .on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'stationClick',
            stationId: '${station.id}'
          }));
        });
    `;
  }).join('\n');

  const line1Stations = stations.filter(s => s.line === 'Línea 1');
  const line2Stations = stations.filter(s => s.line === 'Línea 2');

  const line1Coords = line1Stations.map(s => `[${s.latitude}, ${s.longitude}]`).join(',');
  const line2Coords = line2Stations.map(s => `[${s.latitude}, ${s.longitude}]`).join(',');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100vw; height: 100vh; }
        .leaflet-routing-container { display: none !important; }
        .station-pin { background: none !important; border: none !important; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map', {
          zoomControl: true,
          attributionControl: false
        }).setView([${lat}, ${lon}], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);
        
        ${line1Coords ? `L.polyline([${line1Coords}], {
          color: '#4A90E2',
          weight: 4,
          opacity: 0.7
        }).addTo(map);` : ''}
        
        ${line2Coords ? `L.polyline([${line2Coords}], {
          color: '#EF4444',
          weight: 4,
          opacity: 0.7
        }).addTo(map);` : ''}
        
        ${stationsMarkers}
        
        L.marker([${lat}, ${lon}], {
          icon: L.divIcon({
            className: 'user-location',
            html: '<div style="background: #3B82F6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
            iconSize: [16, 16]
          })
        }).addTo(map).bindPopup('<b>Tu ubicación</b>');
        
        window.routingControl = null;
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleWebViewMessage}
      />
      
      <SafeAreaView style={styles.safeOverlay} edges={['top', 'bottom']}>
        {estacionCercana && !showRoute && (
          <View style={styles.nearbyCard}>
            <Icon name="location" size={24} color="#00CED1" />
            <View style={styles.nearbyInfo}>
              <Text style={styles.nearbyLabel}>Estación más cercana</Text>
              <Text style={styles.nearbyName}>{estacionCercana.nombre}</Text>
              <Text style={styles.nearbyLine}>{estacionCercana.line}</Text>
            </View>
          </View>
        )}

        {showRoute && routeInfo && selectedStation && (
          <View style={styles.routeInfoCard}>
            <TouchableOpacity onPress={handleCloseRoute} style={styles.closeButtonTop}>
              <Icon name="close-circle" size={28} color="#EF4444" />
            </TouchableOpacity>
            
            <View style={styles.routeInfoContent}>
              <View style={styles.modeIconContainer}>
                <Icon 
                  name={transportMode === 'walking' ? 'walk' : 'car'} 
                  size={32} 
                  color={transportMode === 'walking' ? '#34C759' : '#007AFF'} 
                />
              </View>
              
              <View style={styles.routeInfoDetails}>
                <Text style={styles.routeDestination}>{selectedStation.nombre}</Text>
                <View style={styles.routeStats}>
                  <View style={styles.statItem}>
                    <Icon name="navigate" size={18} color="#6B7280" />
                    <Text style={styles.statText}>{routeInfo.distance}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Icon name="time" size={18} color="#6B7280" />
                    <Text style={styles.statText}>{routeInfo.time}</Text>
                  </View>
                </View>
                <Text style={styles.routeMode}>
                  {transportMode === 'walking' ? '🚶 Caminando' : '🚗 En auto'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedStation?.nombre}</Text>
            <Text style={styles.modalLine}>{selectedStation?.line}</Text>

            <TouchableOpacity
              style={[styles.modalButton, styles.walkingButton]}
              onPress={() => handleCalculateRoute('walking')}
            >
              <Icon name="walk" size={20} color="#FFFFFF" />
              <Text style={styles.modalButtonText}>Caminando</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.drivingButton]}
              onPress={() => handleCalculateRoute('driving')}
            >
              <Icon name="car" size={20} color="#FFFFFF" />
              <Text style={styles.modalButtonText}>En auto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 16, color: '#6B7280', fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F9FAFB' },
  errorText: { color: '#EF4444', textAlign: 'center', fontSize: 16, marginTop: 16 },
  safeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
    justifyContent: 'space-between',
    padding: 16,
  },
  nearbyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  nearbyInfo: { marginLeft: 12, flex: 1 },
  nearbyLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  nearbyName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  nearbyLine: { fontSize: 14, color: '#00CED1', marginTop: 2 },
  routeInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  closeButtonTop: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  routeInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  modeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  routeInfoDetails: {
    flex: 1,
  },
  routeDestination: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  routeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 12,
  },
  routeMode: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxWidth: 380,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', color: '#1a1a1a' },
  modalLine: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 25,
    marginBottom: 10,
    minWidth: 200,
    elevation: 5,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  walkingButton: { backgroundColor: '#34C759', shadowColor: '#34C759' },
  drivingButton: { backgroundColor: '#007AFF', shadowColor: '#007AFF' },
  modalButtonText: { color: 'white', fontSize: 15, fontWeight: '600' },
  modalCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButtonText: { color: '#666', fontSize: 16, fontWeight: 'bold' },
});

export default MapScreen;
