import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Callout, Marker } from "react-native-maps";

type Estacion = {
  id: string;
  nombre: string;
  lat: number;
  lon: number;
};

type Props = {
  estaciones: Estacion[];
  color?: string;
  onComoLlegar?: (estacion: Estacion) => void;
};

export const EstacionesMarkers = ({ estaciones, color = "red", onComoLlegar }: Props) => {
  if (Platform.OS === 'android') {
    const pinColor = color === "blue" ? "#2196F3" : "#F44336";
    
    return (
      <>
        {estaciones.map((estacion) => (
          <Marker
            key={estacion.id}
            coordinate={{ latitude: estacion.lat, longitude: estacion.lon }}
            pinColor={pinColor}
            title={estacion.nombre}
            description="Toca para ver ruta"
            onCalloutPress={() => onComoLlegar?.(estacion)}
          />
        ))}
      </>
    );
  }

  // iOS - Funcionalidad completa
  return (
    <>
      {estaciones.map((estacion) => (
        <Marker
          key={estacion.id}
          coordinate={{ latitude: estacion.lat, longitude: estacion.lon }}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <View style={styles.markerWrapper}>
            <View style={[styles.circle, { borderColor: color }]} />
          </View>

          <Callout tooltip onPress={() => onComoLlegar?.(estacion)}>
            <View style={styles.calloutIOS}>
              <Text style={styles.title}>{estacion.nombre}</Text>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => onComoLlegar?.(estacion)}
              >
                <Text style={styles.buttonText}>¿Cómo llegar?</Text>
              </TouchableOpacity>
            </View>
          </Callout>
        </Marker>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  markerWrapper: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 5,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  calloutIOS: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    minWidth: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
});
