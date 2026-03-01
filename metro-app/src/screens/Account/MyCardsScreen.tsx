import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Card, useCards } from '../../context/CardsContext';

export default function MyCardsScreen({ navigation }: any) {
  const { cards, addCard, updateCard } = useCards();
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [editName, setEditName] = useState('');

  // Agregar nueva tarjeta
  const handleAddCard = async () => {
  try {
    const alias = `Tarjeta •••• ${Math.floor(1000 + Math.random() * 9000)}`;
    await addCard(alias, 0, 'active');
    setShowAddCardModal(false);
    Alert.alert('¡Éxito!', 'Tarjeta agregada correctamente');
  } catch (error: any) {
    Alert.alert('Error', error.message || 'No se pudo agregar la tarjeta');
  }
};

  // Abrir modal de edición
  const handleOpenEdit = (card: Card) => {
    setSelectedCard(card);
    setEditName(card.alias || '');
    setShowEditModal(true);
  };

  // Guardar nombre editado
  const handleSaveEdit = async () => {
    if (!selectedCard) return;
    
    if (!editName.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    try {
      await updateCard(selectedCard.nfcuid, { alias: editName.trim() });
      setShowEditModal(false);
      Alert.alert('¡Éxito!', 'Nombre actualizado correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar la tarjeta');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Mis Tarjetas</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddCardModal(true)}
        >
          <Icon name="add" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {cards && cards.length > 0 ? (
          cards.map((card) => {
            // ✅ Extraer valores de forma segura
            const cardAlias = card?.alias || 'Sin nombre';
            const cardBalance = card?.balance || 0;
            const cardNfcuid = card?.nfcuid || 'N/A';
            const cardStatus = card?.status || 'unknown';
            const isActive = cardStatus === 'active';

            return (
              <View key={card.nfcuid} style={styles.cardItem}>
                <View style={styles.cardLeft}>
                  <View style={[styles.cardIcon, { backgroundColor: isActive ? '#DBEAFE' : '#F3F4F6' }]}>
                    <Icon name="card" size={24} color={isActive ? '#3B82F6' : '#9CA3AF'} />
                  </View>
                  <View>
                    <Text style={styles.cardType}>{cardAlias}</Text>
                    <Text style={styles.cardNumber}>NFCUID: {cardNfcuid}</Text>
                    <Text style={styles.cardBalance}>DOP {cardBalance}</Text>
                    <Text style={styles.cardNfcId}>Estado: {cardStatus}</Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <View style={[styles.statusBadge, { backgroundColor: isActive ? '#D1FAE5' : '#FEE2E2' }]}>
                    <Text style={[styles.statusText, { color: isActive ? '#10B981' : '#EF4444' }]}>
                      {isActive ? 'Activa' : 'Inactiva'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleOpenEdit(card)}>
                    <Icon name="ellipsis-horizontal" size={24} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Icon name="card-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No tienes tarjetas registradas</Text>
            <Text style={styles.emptyStateSubtext}>Agrega tu primera tarjeta</Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal Agregar Tarjeta */}
      <Modal
        visible={showAddCardModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddCardModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Nueva Tarjeta</Text>
              <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
                <Icon name="close" size={28} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text style={styles.modalSubtitle}>Selecciona cómo deseas agregar tu tarjeta</Text>

              <TouchableOpacity 
                style={styles.addCardOption}
                onPress={handleAddCard}
              >
                <View style={styles.addCardIconContainer}>
                  <Icon name="scan" size={32} color="#3B82F6" />
                </View>
                <View style={styles.addCardOptionInfo}>
                  <Text style={styles.addCardOptionTitle}>Escanear Código QR</Text>
                  <Text style={styles.addCardOptionSubtitle}>Usa la cámara para escanear el código</Text>
                </View>
                <Icon name="chevron-forward" size={24} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.addCardOption}
                onPress={handleAddCard}
              >
                <View style={styles.addCardIconContainer}>
                  <Icon name="keypad" size={32} color="#3B82F6" />
                </View>
                <View style={styles.addCardOptionInfo}>
                  <Text style={styles.addCardOptionTitle}>Ingresar Número</Text>
                  <Text style={styles.addCardOptionSubtitle}>Escribe el número de la tarjeta</Text>
                </View>
                <Icon name="chevron-forward" size={24} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.addCardOption}
                onPress={handleAddCard}
              >
                <View style={styles.addCardIconContainer}>
                  <Icon name="storefront" size={32} color="#3B82F6" />
                </View>
                <View style={styles.addCardOptionInfo}>
                  <Text style={styles.addCardOptionTitle}>Comprar Nueva</Text>
                  <Text style={styles.addCardOptionSubtitle}>Encuentra puntos de venta cercanos</Text>
                </View>
                <Icon name="chevron-forward" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Editar Nombre */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Tarjeta</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Icon name="close" size={28} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.editForm}>
              <Text style={styles.editLabel}>Nombre de la Tarjeta</Text>
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Ej: Tarjeta de Trabajo"
                placeholderTextColor="#9CA3AF"
                maxLength={30}
              />

              <View style={styles.cardPreview}>
                <Icon name="card" size={32} color="#3B82F6" />
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>{editName || 'Sin nombre'}</Text>
                  <Text style={styles.previewNumber}>{selectedCard?.nfcuid || 'N/A'}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' 
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
    borderBottomColor: '#E5E7EB' 
  },
  backButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#F3F4F6', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#111827' 
  },
  addButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#E8F0FE', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 24, 
    paddingTop: 24 
  },
  cardItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12, 
    elevation: 1, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 1.41 
  },
  cardLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  cardIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  cardType: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#111827', 
    marginBottom: 2 
  },
  cardNumber: { 
    fontSize: 12, 
    color: '#6B7280', 
    marginBottom: 2 
  },
  cardBalance: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#3B82F6' 
  },
  cardRight: { 
    alignItems: 'flex-end', 
    gap: 8 
  },
  statusBadge: { 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  statusText: { 
    fontSize: 12, 
    fontWeight: '600' 
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 24,
    paddingHorizontal: 24,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalScrollContent: {
    paddingBottom: 30,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  addCardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addCardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addCardOptionInfo: {
    flex: 1,
  },
  addCardOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  addCardOptionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  editForm: {
    paddingBottom: 30,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewInfo: {
    marginLeft: 12,
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  previewNumber: {
    fontSize: 14,
    color: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  cardNfcId: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
});
