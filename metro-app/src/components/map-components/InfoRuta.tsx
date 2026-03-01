import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  distancia: number;
  tiempo: number;
  nombreEstacion: string;
  modo?: 'walking' | 'driving'; // ✅ AGREGA ESTE PARÁMETRO
  pasos?: Array<{
    distance: number;
    duration: number;
    instruction: string;
    name?: string;
  }>;
  onCerrar: () => void;
};

export const InfoRuta = ({ distancia, tiempo, nombreEstacion, modo = 'walking', pasos, onCerrar }: Props) => {
  // Formatear el tiempo correctamente (recibe minutos)
  const formatearTiempo = (minutosTotales: number) => {
    const horas = Math.floor(minutosTotales / 60);
    const minutos = Math.floor(minutosTotales % 60);

    if (horas > 0) {
      return {
        valor: `${horas}:${minutos.toString().padStart(2, '0')}h`,
        unidad: ""
      };
    } else {
      return {
        valor: `${Math.round(minutosTotales)}`,
        unidad: "min"
      };
    }
  };

  const tiempoFormateado = formatearTiempo(tiempo);

  // ✅ SELECCIONA EL ICONO Y TEXTO SEGÚN EL MODO
  const modoInfo = modo === 'walking' 
    ? { icon: '🚶', text: 'Caminando' }
    : { icon: '🚗', text: 'En auto' };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.destinoText} numberOfLines={1}>Hacia: {nombreEstacion}</Text>
          <TouchableOpacity onPress={onCerrar} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{distancia.toFixed(2)}</Text>
            <Text style={styles.statLabel}>km</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{tiempoFormateado.valor}</Text>
            <Text style={styles.statLabel}>{tiempoFormateado.unidad}</Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerIcon}>{modoInfo.icon}</Text>
          <Text style={styles.footerText}>{modoInfo.text}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: 15,
    right: 15,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    maxHeight: 200,
  },
  content: {
    padding: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  destinoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    fontWeight: "500",
  },
  separator: {
    width: 1,
    height: 30,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 15,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  footerIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
});
