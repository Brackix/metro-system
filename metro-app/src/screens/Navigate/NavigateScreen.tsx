import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { calculateDistance, findNearestOmsaStops } from '../../components/map-components/haversineUtils';
import { generateOmsaStopsMarkers } from '../../components/map-components/OmsaStopsLayer';
import { getOmsaStops, OmsaStop } from '../../components/map-components/omsaStopsService';
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

type MultimodalRoute = {
  type: 'omsa-metro';
  omsaStop: OmsaStop;
  metroStation: Estacion;
};

const MapScreen: React.FC<MapScreenProps> = () => {
  const webViewRef = useRef<WebView>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [allOmsaStops, setAllOmsaStops] = useState<OmsaStop[]>([]);
  const [nearbyOmsaStops, setNearbyOmsaStops] = useState<OmsaStop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [estacionCercana, setEstacionCercana] = useState<Estacion | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Estacion | null>(null);
  const [selectedOmsaStop, setSelectedOmsaStop] = useState<OmsaStop | null>(null);
  const [multimodalRoute, setMultimodalRoute] = useState<MultimodalRoute | null>(null);
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
    const loadData = async () => {
      try {
        const stationsData = await getStations();
        setStations(stationsData);
        
        const omsaData = await getOmsaStops();
        setAllOmsaStops(omsaData);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load map data. Please try again later.');
        setIsLoading(false);
      }
    };
    loadData();
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
    if (location && allOmsaStops.length > 0) {
      const nearby = findNearestOmsaStops(location, allOmsaStops, 3, 5);
      setNearbyOmsaStops(nearby);
      
      const estaciones = stations.map(toEstacion);
      const cercana = encontrarEstacionCercana(location, estaciones);
      setEstacionCercana(cercana);
    }
  }, [location, stations, allOmsaStops]);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'stationClick') {
        const station = stations.find(s => s.id === data.stationId);
        if (station) {
          setSelectedStation(toEstacion(station));
          setSelectedOmsaStop(null);
          setMultimodalRoute(null);
          setModalVisible(true);
        }
      }
      
      if (data.type === 'omsaStopClick') {
        const omsaStop = nearbyOmsaStops.find(s => s.stopid === data.stopId);
        if (omsaStop) {
          setSelectedOmsaStop(omsaStop);
          setSelectedStation(null);
          setMultimodalRoute(null);
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

  /// ✅ Ruta a parada OMSA únicamente - CON PUNTO MORADO DE LLEGADA
const handleCalculateRoute = (mode: 'walking' | 'driving') => {
  if (!location || !selectedOmsaStop) return;

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
        L.latLng(${selectedOmsaStop.lat}, ${selectedOmsaStop.lng})
      ],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: '${profile}'
      }),
      lineOptions: {
        styles: [
          { color: '#F97316', weight: 4, opacity: 0.8, dashArray: '5, 5' }
        ]
      },
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false
    }).addTo(map);

    // ✅ Punto MORADO para OMSA seleccionada
    L.circleMarker([${selectedOmsaStop.lat}, ${selectedOmsaStop.lng}], {
      radius: 10,
      fillColor: '#A855F7',
      color: 'white',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map).bindPopup('<b style="color: #A855F7;">🎯 Parada OMSA</b>');

    window.routingControl.on('routesfound', function(e) {
      var route = e.routes[0];
      var distanceKm = route.summary.totalDistance / 1000;
      var adjustedTime = Math.ceil(distanceKm * 12);
      var timeDisplay = adjustedTime >= 60 
        ? Math.floor(adjustedTime / 60) + ' h ' + (adjustedTime % 60) + ' min'
        : adjustedTime + ' min';
      
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'routeInfo',
        distance: distanceKm.toFixed(2) + ' km',
        time: timeDisplay
      }));
    });
  `;

  webViewRef.current?.injectJavaScript(routeJS);
};


// ✅ Actualiza handleCalculateRouteMetro
const handleCalculateRouteMetro = (mode: 'walking' | 'driving') => {
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

    // ✅ Pin AZUL + Punto AZUL para Metro seleccionada
    L.circleMarker([${selectedStation.lat}, ${selectedStation.lon}], {
      radius: 10,
      fillColor: '#3B82F6',
      color: 'white',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map).bindPopup('<b style="color: #3B82F6;">🚇 Estación Metro</b>');

    window.routingControl.on('routesfound', function(e) {
      var route = e.routes[0];
      var distanceKm = route.summary.totalDistance / 1000;
      
      var adjustedTime;
      if ('${mode}' === 'walking') {
        adjustedTime = Math.ceil(distanceKm * 12);
      } else {
        adjustedTime = Math.ceil(distanceKm * 6);
      }
      
      var timeDisplay = adjustedTime >= 60 
        ? Math.floor(adjustedTime / 60) + ' h ' + (adjustedTime % 60) + ' min'
        : adjustedTime + ' min';
      
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'routeInfo',
        distance: distanceKm.toFixed(2) + ' km',
        time: timeDisplay
      }));
    });
  `;

  webViewRef.current?.injectJavaScript(routeJS);
};

// ✅ NUEVA: Ruta multimodal (Usuario → OMSA → OMSA → Metro) - CON COLORES VERDE Y AZUL
const handleCalculateRouteViaOmsa = async (metroStation: Estacion) => {
  if (!location) return;

  // 1️⃣ Encontrar OMSA más cercana a tu ubicación
  const nearestOmsaFromUser = allOmsaStops
    .map(stop => ({
      ...stop,
      distance: calculateDistance(location, { lat: stop.lat, lng: stop.lng })
    }))
    .filter(stop => stop.lat !== null && stop.lng !== null && stop.distance !== Infinity)
    .sort((a, b) => a.distance - b.distance)[0];

  if (!nearestOmsaFromUser) {
    console.error('No OMSA stop found near user');
    return;
  }

  // 2️⃣ Encontrar OMSA más cercana a la estación de metro
  const nearestOmsaToMetro = allOmsaStops
    .map(stop => ({
      ...stop,
      distance: calculateDistance(
        { latitude: metroStation.lat, longitude: metroStation.lon },
        { lat: stop.lat, lng: stop.lng }
      )
    }))
    .filter(stop => stop.lat !== null && stop.lng !== null && stop.distance !== Infinity)
    .sort((a, b) => a.distance - b.distance)[0];

  if (!nearestOmsaToMetro) {
    console.error('No OMSA stop found near metro station');
    return;
  }

  setModalVisible(false);
  setShowRoute(true);
  setTransportMode('walking');

  const routeJS = `
    if (window.routingControl1) {
      map.removeControl(window.routingControl1);
    }
    if (window.routingControl2) {
      map.removeControl(window.routingControl2);
    }
    if (window.routingControl3) {
      map.removeControl(window.routingControl3);
    }

    // 🚶 RUTA 1: Tu ubicación → OMSA más cercana (naranja punteada)
    window.routingControl1 = L.Routing.control({
      waypoints: [
        L.latLng(${location.latitude}, ${location.longitude}),
        L.latLng(${nearestOmsaFromUser.lat}, ${nearestOmsaFromUser.lng})
      ],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'foot'
      }),
      lineOptions: {
        styles: [
          { color: '#F97316', weight: 4, opacity: 0.8, dashArray: '5, 5' }
        ]
      },
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false
    }).addTo(map);

    // 🚌 RUTA 2: OMSA cercana usuario → OMSA cercana metro (naranja sólida)
    window.routingControl2 = L.Routing.control({
      waypoints: [
        L.latLng(${nearestOmsaFromUser.lat}, ${nearestOmsaFromUser.lng}),
        L.latLng(${nearestOmsaToMetro.lat}, ${nearestOmsaToMetro.lng})
      ],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'foot'
      }),
      lineOptions: {
        styles: [
          { color: '#F97316', weight: 4, opacity: 0.8, dashArray: null }
        ]
      },
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false
    }).addTo(map);

    // 🚇 RUTA 3: OMSA cercana metro → Estación Metro (naranja sólida)
    window.routingControl3 = L.Routing.control({
      waypoints: [
        L.latLng(${nearestOmsaToMetro.lat}, ${nearestOmsaToMetro.lng}),
        L.latLng(${metroStation.lat}, ${metroStation.lon})
      ],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'foot'
      }),
      lineOptions: {
        styles: [
          { color: '#F97316', weight: 4, opacity: 0.8, dashArray: null }
        ]
      },
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false
    }).addTo(map);

    // ✅ PIN Y PUNTO VERDE en OMSA cercana al metro
    L.circleMarker([${nearestOmsaToMetro.lat}, ${nearestOmsaToMetro.lng}], {
      radius: 10,
      fillColor: '#A855F7',
      color: 'white',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map).bindPopup('<b style="color: #A855F7;">🎯 Parada OMSA</b>');

    // ✅ PIN Y PUNTO AZUL en Metro de llegada
    L.circleMarker([${metroStation.lat}, ${metroStation.lon}], {
      radius: 10,
      fillColor: '#3B82F6',
      color: 'white',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map).bindPopup('<b style="color: #3B82F6;">🚇 Estación Metro</b>');

    window.routingControl1.on('routesfound', function(e) {
      var route = e.routes[0];
      var distanceKm = route.summary.totalDistance / 1000;
      var adjustedTime = Math.ceil(distanceKm * 12);
      var timeDisplay = adjustedTime >= 60 
        ? Math.floor(adjustedTime / 60) + ' h ' + (adjustedTime % 60) + ' min'
        : adjustedTime + ' min';
      
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
  setMultimodalRoute(null);

  webViewRef.current?.injectJavaScript(`
    if (window.routingControl) {
      map.removeControl(window.routingControl);
      window.routingControl = null;
    }
    if (window.routingControl1) {
      map.removeControl(window.routingControl1);
      window.routingControl1 = null;
    }
    if (window.routingControl2) {
      map.removeControl(window.routingControl2);
      window.routingControl2 = null;
    }
    if (window.routingControl3) {
      map.removeControl(window.routingControl3);
      window.routingControl3 = null;
    }
    
    // ✅ NUEVO: Eliminar los círculos morados/azules de llegada
    map.eachLayer(function(layer) {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });
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
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  const lat = location?.latitude || 18.4861;
  const lon = location?.longitude || -69.9312;

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
        .addTo(stationsLayer)
        .bindPopup('<b>${station.name}</b><br>${station.line}')
        .on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'stationClick',
            stationId: '${station.id}'
          }));
        });
    `;
  }).join('\n');


// ✅ Nueva función para cambiar color del pin seleccionado a VERDE
const changeOmsaPinColor = (stopId: number, color: string) => {
  const changeColorJS = `
    var greenColor = '${color}';
    omsaStopsLayer.eachLayer(function(layer) {
      if (layer.stopId === ${stopId}) {
        var newIcon = L.divIcon({
          className: 'omsa-stop-marker',
          html: '<div style="position: relative; width: 28px; height: 38px;">' +
                '<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3))">' +
                '<path d="M14 0C8.477 0 4 4.477 4 10c0 8.5 10 25 10 25s10-16.5 10-25c0-5.523-4.477-10-10-10z" ' +
                'fill="' + greenColor + '" stroke="white" stroke-width="1.5"/>' +
                '<circle cx="14" cy="10" r="4.5" fill="white" stroke="' + greenColor + '" stroke-width="1"/>' +
                '</svg>' +
                '<div style="position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); background: white; padding: 2px 6px; border-radius: 3px; font-size: 9px; white-space: nowrap; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"></div></div>',
          iconSize: [28, 38],
          iconAnchor: [14, 38],
          popupAnchor: [0, -38],
          className: 'omsa-marker'
        });
        layer.setIcon(newIcon);
      }
    });
  `;
  webViewRef.current?.injectJavaScript(changeColorJS);
};


const nearbyOmsaMarkersJS = generateOmsaStopsMarkers(nearbyOmsaStops, selectedOmsaStop?.stopid);

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
        .omsa-marker { background: none !important; border: none !important; }
        .leaflet-control-layers { background: white !important; border-radius: 8px !important; box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important; }
        .leaflet-control-layers-list { padding: 8px !important; }
        .leaflet-control-layers label { font-size: 13px !important; margin-bottom: 6px !important; }
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
        
        var stationsLayer = L.featureGroup();
        var omsaStopsLayer = L.featureGroup();
        
        stationsLayer.addTo(map);
        omsaStopsLayer.addTo(map);
        
        ${line1Coords ? `L.polyline([${line1Coords}], {
          color: '#4A90E2',
          weight: 5,
          opacity: 0.8
        }).addTo(stationsLayer);` : ''}
        
        ${line2Coords ? `L.polyline([${line2Coords}], {
          color: '#EF4444',
          weight: 5,
          opacity: 0.8
        }).addTo(stationsLayer);` : ''}
        
        ${stationsMarkers}
        ${nearbyOmsaMarkersJS}
        
        L.marker([${lat}, ${lon}], {
          icon: L.divIcon({
            className: 'user-location',
            html: '<div style="background: #3B82F6; width: 18px; height: 18px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          })
        }).addTo(map).bindPopup('<b>📍 Tu ubicación</b>');
        
        window.routingControl = null;
        window.routingControl1 = null;
        window.routingControl2 = null;
        window.routingControl3 = null;
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
            <Ionicons name="location" size={24} color="#00CED1" />
            <View style={styles.nearbyInfo}>
              <Text style={styles.nearbyLabel}>Estación más cercana</Text>
              <Text style={styles.nearbyName}>{estacionCercana.nombre}</Text>
              <Text style={styles.nearbyLine}>{estacionCercana.line}</Text>
            </View>
          </View>
        )}

        {showRoute && routeInfo && (
          <View style={styles.routeInfoCard}>
            <TouchableOpacity onPress={handleCloseRoute} style={styles.closeButtonTop}>
              <Ionicons name="close-circle" size={28} color="#EF4444" />
            </TouchableOpacity>
            
            <View style={styles.routeInfoContent}>
              <View style={styles.modeIconContainer}>
                <Ionicons 
                  name={transportMode === 'walking' ? 'walk' : 'car'} 
                  size={32} 
                  color={transportMode === 'walking' ? '#34C759' : '#007AFF'} 
                />
              </View>
              
              <View style={styles.routeInfoDetails}>
                <Text style={styles.routeDestination}>
                  {selectedStation?.nombre || selectedOmsaStop?.name}
                </Text>
                <View style={styles.routeStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="navigate" size={18} color="#6B7280" />
                    <Text style={styles.statText}>{routeInfo.distance}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Ionicons name="time" size={18} color="#6B7280" />
                    <Text style={styles.statText}>{routeInfo.time}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>

      {/* Modal para Estaciones de Metro */}
      <Modal visible={modalVisible && !!selectedStation} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedStation?.nombre}</Text>
            <Text style={styles.modalLine}>{selectedStation?.line}</Text>

            <TouchableOpacity
              style={[styles.modalButton, styles.walkingButton]}
              onPress={() => handleCalculateRouteMetro('walking')}
            >
              <Ionicons name="walk" size={20} color="#FFFFFF" />
              <Text style={styles.modalButtonText}>🚶 Caminando</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.drivingButton]}
              onPress={() => handleCalculateRouteMetro('driving')}
            >
              <Ionicons name="car" size={20} color="#FFFFFF" />
              <Text style={styles.modalButtonText}>🚗 En auto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.omsaModalButton]}
              onPress={() => handleCalculateRouteViaOmsa(selectedStation!)}
            >
              <Ionicons name="bus" size={20} color="#FFFFFF" />
              <Text style={styles.modalButtonText}>🚌 Ir en OMSA</Text>
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

      {/* Modal para Paradas OMSA */}
      <Modal visible={modalVisible && !!selectedOmsaStop} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedOmsaStop?.name}</Text>
            <Text style={styles.modalLine}>Corredor {selectedOmsaStop?.corridor}</Text>
            <Text style={styles.modalAddress}>{selectedOmsaStop?.address}</Text>
            <Text style={styles.modalCode}>📍 {selectedOmsaStop?.code}</Text>

            <TouchableOpacity
              style={[styles.modalButton, styles.walkingButton]}
              onPress={() => handleCalculateRoute('walking')}
            >
              <Ionicons name="walk" size={20} color="#FFFFFF" />
              <Text style={styles.modalButtonText}>🚶 Caminando a Parada</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.drivingButton]}
              onPress={() => handleCalculateRoute('driving')}
            >
              <Ionicons name="car" size={20} color="#FFFFFF" />
              <Text style={styles.modalButtonText}>🚗 En auto a Parada</Text>
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
  safeOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'box-none', justifyContent: 'space-between', padding: 16 },
  nearbyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6 },
  nearbyInfo: { marginLeft: 12, flex: 1 },
  nearbyLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  nearbyName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  nearbyLine: { fontSize: 14, color: '#00CED1', marginTop: 2 },
  routeInfoCard: { backgroundColor: '#FFFFFF', borderRadius: 20, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, overflow: 'hidden' },
  closeButtonTop: { position: 'absolute', top: 12, right: 12, zIndex: 10, padding: 4 },
  routeInfoContent: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  modeIconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  routeInfoDetails: { flex: 1 },
  routeDestination: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  routeStats: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  statDivider: { width: 1, height: 16, backgroundColor: '#D1D5DB', marginHorizontal: 12 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 25, width: '90%', maxWidth: 380, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', color: '#1a1a1a' },
  modalLine: { fontSize: 14, color: '#007AFF', marginBottom: 8, textAlign: 'center', fontWeight: '600', backgroundColor: 'rgba(0, 122, 255, 0.1)', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 15 },
  modalAddress: { fontSize: 12, color: '#6B7280', marginBottom: 8, textAlign: 'center' },
  modalCode: { fontSize: 12, color: '#9CA3AF', marginBottom: 16, textAlign: 'center', fontWeight: 'bold' },
  modalButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 35, borderRadius: 25, marginBottom: 10, minWidth: 200, elevation: 5, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
  walkingButton: { backgroundColor: '#34C759', shadowColor: '#34C759' },
  drivingButton: { backgroundColor: '#007AFF', shadowColor: '#007AFF' },
  omsaModalButton: { backgroundColor: '#F97316', shadowColor: '#F97316' },
  modalButtonText: { color: 'white', fontSize: 15, fontWeight: '600' },
  modalCloseButton: { position: 'absolute', top: 15, right: 15, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0, 0, 0, 0.08)', alignItems: 'center', justifyContent: 'center' },
  modalCloseButtonText: { color: '#666', fontSize: 16, fontWeight: 'bold' },
});

export default MapScreen;
