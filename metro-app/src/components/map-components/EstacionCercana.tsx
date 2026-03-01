import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Callout, Circle, Marker } from "react-native-maps";

type Estacion = {
  id: string;
  nombre: string;
  lat: number;
  lon: number;
};

type Props = {
  estacion: Estacion;
  onComoLlegar?: (estacion: Estacion) => void;
};

export const EstacionCercana = ({ estacion, onComoLlegar }: Props) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blinkAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    blinkAnimation.start();
    return () => blinkAnimation.stop();
  }, []);

  if (Platform.OS === 'android') {
    // ANDROID - Simple con texto descriptivo
    return (
      <>
        <Circle
          center={{ latitude: estacion.lat, longitude: estacion.lon }}
          radius={50}
          strokeColor="rgba(0, 206, 209, 0.8)"
          strokeWidth={3}
          fillColor="rgba(0, 206, 209, 0.1)"
        />
        
        <Marker
          key={`nearby-${estacion.id}-${estacion.nombre}`}
          coordinate={{ latitude: estacion.lat, longitude: estacion.lon }}
          pinColor="#00CED1"
          title={estacion.nombre}
          description="⭐ Más cercana - Toca para ver ruta"
          onCalloutPress={() => onComoLlegar?.(estacion)}
        />
      </>
    );
  }

  // iOS - Con animación completa
  return (
    <Marker
      key={`nearby-${estacion.id}-${estacion.nombre}`}
      coordinate={{ latitude: estacion.lat, longitude: estacion.lon }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.pulseCircle,
            {
              transform: [{ scale: pulseAnim }],
              opacity: opacityAnim,
            },
          ]}
        />
        <View style={styles.circle} />
      </View>
      
      <Callout tooltip onPress={() => onComoLlegar?.(estacion)}>
        <View style={styles.calloutIOS}>
          <Text style={styles.title}>{estacion.nombre}</Text>
          <Text style={styles.subtitle}>Estación más cercana</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => onComoLlegar?.(estacion)}
          >
            <Text style={styles.buttonText}>¿Cómo llegar?</Text>
          </TouchableOpacity>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 6,
    borderColor: "cyan",
    backgroundColor: "white",
    shadowColor: "cyan",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  pulseCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 3,
    borderColor: "cyan",
    backgroundColor: "transparent",
    position: "absolute",
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
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
