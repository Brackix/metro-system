import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
  
export default function TravelHistoryScreen({ navigation }: any) {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recharge' | 'trip'>('all');

  // Datos completos con tipo de transacción
  const allTransactions = [
    {
      id: '1',
      type: 'trip' as const,
      from: 'Centro Los Héroes',
      to: 'Villa Mella',
      date: 'Hoy, 8:30 AM',
      line: 'Línea 1',
      amount: 20,
      color: '#8B5CF6',
    },
    {
      id: '2',
      type: 'recharge' as const,
      amount: 100,
      date: 'Hoy, 8:00 AM',
      method: 'Tarjeta de Crédito',
      color: '#10B981',
    },
    {
      id: '3',
      type: 'trip' as const,
      from: 'Duarte',
      to: 'Mamá Tingó',
      date: 'Ayer, 5:45 PM',
      line: 'Línea 2',
      amount: 20,
      color: '#EF4444',
    },
    {
      id: '4',
      type: 'recharge' as const,
      amount: 50,
      date: 'Ayer, 3:15 PM',
      method: 'Pago Móvil',
      color: '#10B981',
    },
    {
      id: '5',
      type: 'trip' as const,
      from: 'Villa Mella',
      to: 'Centro Los Héroes',
      date: 'Hace 2 días, 2:20 PM',
      line: 'Línea 1',
      amount: 20,
      color: '#8B5CF6',
    },
  ];

  // Filtrar transacciones según el filtro seleccionado
  const filteredTransactions = allTransactions.filter((transaction) => {
    if (selectedFilter === 'all') return true;
    return transaction.type === selectedFilter;
  });

  // Aplicar filtro
  const handleSelectFilter = (filter: 'all' | 'recharge' | 'trip') => {
    setSelectedFilter(filter);
    setShowFilterModal(false);
  };

  // Arreglar navegación del botón atrás
  const handleGoBack = () => {
    // Siempre navegar a la pantalla principal de la cuenta
    navigation.navigate('AccountMain');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Icon name="filter" size={24} color="#3B82F6" />
          {selectedFilter !== 'all' && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      {selectedFilter !== 'all' && (
        <View style={styles.filterBadgeContainer}>
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>
              {selectedFilter === 'trip' ? 'Solo Viajes' : 'Solo Recargas'}
            </Text>
            <TouchableOpacity onPress={() => setSelectedFilter('all')}>
              <Icon name="close-circle" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Indicador de filtro activo */}
        {selectedFilter !== 'all' && (
          <View style={styles.filterIndicator}>
            <Text style={styles.filterIndicatorText}>
              Mostrando: {selectedFilter === 'recharge' ? 'Solo Recargas' : 'Solo Viajes'}
            </Text>
            <TouchableOpacity onPress={() => setSelectedFilter('all')}>
              <Icon name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de transacciones filtradas */}
        {filteredTransactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={[styles.transactionIcon, { backgroundColor: `${transaction.color}20` }]}>
              <Icon 
                name={transaction.type === 'trip' ? 'subway' : 'add-circle'} 
                size={24} 
                color={transaction.color} 
              />
            </View>
            <View style={styles.transactionInfo}>
              {transaction.type === 'trip' ? (
                <>
                  <Text style={styles.transactionLine}>{transaction.line}</Text>
                  <Text style={styles.transactionRoute}>
                    {transaction.from} → {transaction.to}
                  </Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.transactionLine}>Recarga</Text>
                  <Text style={styles.transactionRoute}>{transaction.method}</Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </>
              )}
            </View>
            <Text 
              style={[
                styles.transactionAmount, 
                { color: transaction.type === 'trip' ? '#EF4444' : '#10B981' }
              ]}
            >
              {transaction.type === 'trip' ? '-' : '+'}DOP {transaction.amount}
            </Text>
          </View>
        ))}

        {filteredTransactions.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="receipt-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>No hay transacciones</Text>
            <Text style={styles.emptySubtext}>
              {selectedFilter === 'recharge' 
                ? 'No tienes recargas registradas' 
                : 'No tienes viajes registrados'}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal de Filtros */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.filterMenu}>
            <TouchableOpacity
              style={[styles.filterOption, selectedFilter === 'all' && styles.filterOptionActive]}
              onPress={() => handleSelectFilter('all')}
            >
              <Icon 
                name="list" 
                size={22} 
                color={selectedFilter === 'all' ? '#3B82F6' : '#6B7280'} 
              />
              <Text style={[
                styles.filterOptionText,
                selectedFilter === 'all' && styles.filterOptionTextActive
              ]}>
                Todo
              </Text>
              {selectedFilter === 'all' && (
                <Icon name="checkmark" size={22} color="#3B82F6" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterOption, selectedFilter === 'recharge' && styles.filterOptionActive]}
              onPress={() => handleSelectFilter('recharge')}
            >
              <Icon 
                name="add-circle-outline" 
                size={22} 
                color={selectedFilter === 'recharge' ? '#10B981' : '#6B7280'} 
              />
              <Text style={[
                styles.filterOptionText,
                selectedFilter === 'recharge' && styles.filterOptionTextActive
              ]}>
                Solo Recargas
              </Text>
              {selectedFilter === 'recharge' && (
                <Icon name="checkmark" size={22} color="#10B981" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterOption, selectedFilter === 'trip' && styles.filterOptionActive]}
              onPress={() => handleSelectFilter('trip')}
            >
              <Icon 
                name="subway" 
                size={22} 
                color={selectedFilter === 'trip' ? '#8B5CF6' : '#6B7280'} 
              />
              <Text style={[
                styles.filterOptionText,
                selectedFilter === 'trip' && styles.filterOptionTextActive
              ]}>
                Solo Viajes
              </Text>
              {selectedFilter === 'trip' && (
                <Icon name="checkmark" size={22} color="#8B5CF6" />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  filterBadgeContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: -8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  filterIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F0FE',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  filterIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionLine: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  transactionRoute: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: 120,
    paddingHorizontal: 24,
  },
  filterMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  filterOptionActive: {
    backgroundColor: '#F3F4F6',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 12,
    flex: 1,
  },
  filterOptionTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  filterBadgeText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
});
