import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { getStations, Station } from '../../constants/map-constants/estaciones';

interface StationSearchDropdownProps {
  searchQuery: string;
  onStationSelect: (station: Station) => void;
  visible: boolean;
}

export const StationSearchDropdown: React.FC<StationSearchDropdownProps> = ({ 
  searchQuery, 
  onStationSelect, 
  visible 
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar estaciones desde la API
  useEffect(() => {
    const loadStations = async () => {
      try {
        setIsLoading(true);
        const data = await getStations();
        setStations(data);
        setError(null);
      } catch (err) {
        console.error('Error loading stations for dropdown:', err);
        setError('No se pudieron cargar las estaciones');
      } finally {
        setIsLoading(false);
      }
    };

    loadStations();
  }, []);

  // Filtrar estaciones según la búsqueda
  const filteredStations = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    
    return stations.filter(station => {
      const stationName = station.name.toLowerCase();
      return stationName.includes(query);
    }).slice(0, 10); // Limita a 10 resultados
  }, [searchQuery, stations]);

  if (!visible) return null;

  // Estado de carga
  if (isLoading) {
    return (
      <View style={styles.dropdownContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.line1} />
          <Text style={styles.loadingText}>Cargando estaciones...</Text>
        </View>
      </View>
    );
  }

  // Estado de error
  if (error) {
    return (
      <View style={styles.dropdownContainer}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={24} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  // Sin resultados
  if (filteredStations.length === 0 && searchQuery.trim()) {
    return (
      <View style={styles.dropdownContainer}>
        <View style={styles.emptyContainer}>
          <Icon name="search-outline" size={32} color="#9CA3AF" />
          <Text style={styles.emptyText}>No se encontraron estaciones</Text>
          <Text style={styles.emptySubtext}>Intenta con otro término de búsqueda</Text>
        </View>
      </View>
    );
  }

  // Lista de estaciones filtradas
  return (
    <View style={styles.dropdownContainer}>
      <ScrollView 
        style={styles.scrollView}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {filteredStations.map((station) => {
          // Extraer el número de línea desde el string "Línea 1" o "Línea 2"
          const lineNumber = station.line ? parseInt(station.line.replace('Línea ', '')) : 1;
          const lineColor = lineNumber === 1 ? COLORS.line1 : COLORS.line2;
          
          return (
            <TouchableOpacity 
              key={station.id}
              style={styles.stationItem} 
              onPress={() => onStationSelect(station)} 
              activeOpacity={0.7}
            >
              <View style={styles.stationIconContainer}>
                <View style={[
                  styles.lineIndicator, 
                  { backgroundColor: lineColor }
                ]}>
                  <Icon name="subway" size={20} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.stationInfo}>
                <Text style={styles.stationName}>{station.name}</Text>
                <Text style={styles.stationArea}>
                  {station.line || 'Línea 1'} • Santo Domingo
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: { 
    position: 'absolute', 
    top: 70, 
    left: 0, 
    right: 0, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    maxHeight: 300, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 12, 
    elevation: 8, 
    zIndex: 1000,
    overflow: 'hidden',
  },
  scrollView: { 
    flex: 1,
  },
  stationItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6',
  },
  stationIconContainer: { 
    marginRight: 12,
  },
  lineIndicator: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  stationInfo: { 
    flex: 1,
  },
  stationName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#111827', 
    marginBottom: 2,
  },
  stationArea: { 
    fontSize: 13, 
    color: '#6B7280',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
});
