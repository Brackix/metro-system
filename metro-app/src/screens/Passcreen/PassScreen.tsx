import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal, Platform, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { useActivities } from '../../context/ActivitiesContext';
import { useAuth } from '../../context/AuthContext';
import { useCards } from '../../context/CardsContext';

const API_BASE_URL = String(API_URL);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_HEIGHT = 220;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<any>);

const getRelativeTime = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Nunca';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    return 'Hace más de un mes';
  } catch {
    return 'Nunca';
  }
};

const PulseRing = ({ delay }: { delay: number }) => {
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(ring, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(ring, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, delay);
  }, []);

  const opacity = ring.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.7, 0.5, 0],
  });

  const scale = ring.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3.5],
  });

  return (
    <Animated.View
      style={[
        styles.pulseRing,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
};

export default function PassScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef<FlatList>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showCardOptionsModal, setShowCardOptionsModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showNFCModal, setShowNFCModal] = useState(false);
  const [isNFCScanning, setIsNFCScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [selectedTransferCard, setSelectedTransferCard] = useState<any>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const { cards, rechargeCard, updateCard, deleteCard, isLoading, loadCards } = useCards();
  const { userId } = useAuth();
  const { addActivity } = useActivities();

  useFocusEffect(
    React.useCallback(() => {
      console.log('🎯 [PassScreen] Pantalla enfocada, recargando tarjetas...');
      loadCards();
    }, [])
  );

  useEffect(() => {
    const checkNFC = async () => {
      try {
        const supported = await NfcManager.isSupported();
        setNfcSupported(supported);
        if (supported) {
          await NfcManager.start();
        }
      } catch (error) {
        setNfcSupported(false);
      }
    };
    checkNFC();
  }, []);

  if (isLoading && cards.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: '#6B7280' }}>Cargando tarjetas...</Text>
      </View>
    );
  }

  const currentCard = cards.length > 0 ? cards[currentCardIndex] : null;
  const hasCards = cards.length > 0;

  const availableCardsForTransfer = cards.filter(
    (card: any) => card.nfcuid !== currentCard?.nfcuid && card.status === 'active'
  );

  const handleRecharge = async (amount: number) => {
    if (!currentCard) return;
    
    try {
      const deviceModel = Platform.OS === 'android'
        ? `${Platform.constants.Brand || 'Android'} ${Platform.constants.Model || 'Unknown'}`
        : `iOS ${Platform.Version}`;
      
      await rechargeCard(
        currentCard.nfcuid, 
        amount,
        'card',
        undefined,
        deviceModel
      );
      
      await addActivity({
        type: 'recharge',
        title: 'Recarga',
        subtitle: `Tarjeta Metro ${currentCard.alias || 'Sin nombre'}`,
        date: new Date().toISOString(),
        amount: amount,
        icon: 'add-circle',
        iconBg: '#D1FAE5',
        iconColor: '#10B981',
        cardId: currentCard.nfcuid,
      });
      
      setShowRechargeModal(false);
      
      Alert.alert(
        '¡Recarga Exitosa!', 
        `Se agregaron DOP ${amount} a tu tarjeta`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo recargar la tarjeta');
    }
  };

  const handleAddCardWithNFC = async () => {
    if (!nfcSupported) {
      Alert.alert('Error', 'Tu dispositivo no soporta NFC');
      return;
    }

    try {
      const enabled = await NfcManager.isEnabled();
      if (!enabled) {
        Alert.alert(
          'NFC Deshabilitado',
          'Por favor habilita NFC en la configuración',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Abrir Configuración',
              onPress: async () => await NfcManager.goToNfcSetting(),
            },
          ]
        );
        return;
      }

      setShowAddCardModal(false);
      setShowNFCModal(true);
      setIsNFCScanning(true);

      await NfcManager.requestTechnology([NfcTech.Ndef, NfcTech.NfcA, NfcTech.IsoDep]);
      const tag = await NfcManager.getTag();
      
      await NfcManager.cancelTechnologyRequest();
      setIsNFCScanning(false);
      
      if (tag && tag.id) {
        let nfcuid: string;
        if (Array.isArray(tag.id)) {
          nfcuid = tag.id
            .map((byte: number) => byte.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase();
        } else {
          nfcuid = String(tag.id);
        }

        console.log('✅ [handleAddCardWithNFC] UID obtenido:', nfcuid);

        const token = await AsyncStorage.getItem('token');
        
        const res = await fetch(`${API_BASE_URL}/cards`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ 
            userid: userId, 
            nfcuid, 
            alias: `Tarjeta ${nfcuid.substring(0, 8)}`,
            balance: 0,
            status: 'active'
          }),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          throw new Error(`Error del servidor (${res.status}): ${errText}`);
        }

        const newCard = await res.json();
        console.log('✅ Tarjeta creada:', newCard);
        
        await loadCards();
        
        setShowNFCModal(false);
        Alert.alert('¡Tarjeta Agregada!', 'Tu tarjeta NFC ha sido registrada exitosamente');
        
        setTimeout(() => {
          carouselRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        throw new Error('No se pudo leer el ID de la tarjeta');
      }
    } catch (error: any) {
      setIsNFCScanning(false);
      await NfcManager.cancelTechnologyRequest().catch(() => {});
      
      if (!error.message?.includes('cancelled')) {
        Alert.alert('Error', error.message || 'No se pudo leer la tarjeta NFC');
      }
      setShowNFCModal(false);
    }
  };

  const handleCloseNFCModal = async () => {
    setIsNFCScanning(false);
    setShowNFCModal(false);
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (error) {
      console.log('Error cancelando NFC:', error);
    }
  };

  const handleGoToMyCards = () => {
    navigation.navigate('Cuenta', { screen: 'MyCards' });
  };

  const handleGoToHistory = () => {
    setShowCardOptionsModal(false);
    navigation.navigate('Cuenta');
    setTimeout(() => {
      navigation.navigate('Cuenta', { screen: 'TravelHistory' });
    }, 100);
  };

  const handleDeactivateCard = () => {
    if (!currentCard) return;
    
    Alert.alert(
      'Reportar Tarjeta Perdida',
      '¿Estás seguro de que quieres desactivar esta tarjeta? No podrás usarla hasta que la reactives.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateCard(currentCard.nfcuid, { status: 'not-active' });
              setShowCardOptionsModal(false);
              Alert.alert('Tarjeta Desactivada', 'Tu tarjeta ha sido reportada como perdida.');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo desactivar la tarjeta');
            }
          },
        },
      ]
    );
  };

  const handleReactivateCard = async () => {
    if (!currentCard) return;
    
    try {
      await updateCard(currentCard.nfcuid, { status: 'active' });
      setShowCardOptionsModal(false);
      Alert.alert('Tarjeta Activada', 'Tu tarjeta está activa nuevamente.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo activar la tarjeta');
    }
  };

  const handleConfirmDeleteWithoutTransfer = async () => {
    if (!currentCard) return;

    Alert.alert(
      'Confirmar Eliminación',
      'Esta tarjeta no tiene saldo. ¿Deseas eliminarla permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const otherCard = cards.find((c: any) => c.nfcuid !== currentCard.nfcuid);

              if (otherCard) {
                await deleteCard(currentCard.nfcuid, otherCard.cardid);
                setShowCardOptionsModal(false);
                Alert.alert('Tarjeta Eliminada', 'Tu tarjeta ha sido eliminada correctamente.');
              } else {
                await deleteCard(currentCard.nfcuid, 0);
                setShowCardOptionsModal(false);
                Alert.alert('Tarjeta Eliminada', 'Tu tarjeta ha sido eliminada correctamente.');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo eliminar la tarjeta');
            }
          },
        },
      ]
    );
  };

  const handleInitiateDelete = () => {
    if (!currentCard) return;
    
    const currentBalance = typeof currentCard.balance === 'number' 
      ? currentCard.balance 
      : parseFloat(currentCard.balance || '0');
    
    if (currentBalance <= 0) {
      handleConfirmDeleteWithoutTransfer();
      return;
    }

    if (availableCardsForTransfer.length === 0) {
      Alert.alert(
        'No hay tarjetas disponibles',
        'No tienes otras tarjetas activas para transferir el saldo. ¿Deseas eliminar esta tarjeta y perder el saldo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar de todos modos',
            style: 'destructive',
            onPress: handleConfirmDeleteWithoutTransfer,
          },
        ]
      );
      return;
    }

    setShowCardOptionsModal(false);
    setShowTransferModal(true);
  };

  const handleConfirmTransfer = () => {
    if (!currentCard || !selectedTransferCard) return;

    const currentBalance = typeof currentCard.balance === 'number' 
      ? currentCard.balance 
      : parseFloat(currentCard.balance || '0');

    Alert.alert(
      'Confirmar Transferencia',
      `¿Transferir DOP ${currentBalance} de "${currentCard.alias}" a "${selectedTransferCard.alias}" y eliminar la tarjeta?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const result = await deleteCard(currentCard.nfcuid, selectedTransferCard.cardid);

              setShowTransferModal(false);
              setSelectedTransferCard(null);
              
              Alert.alert(
                '¡Transferencia Exitosa!',
                `El saldo de DOP ${result.balanceTransferred} ha sido transferido a "${selectedTransferCard.alias}".\n\nNuevo saldo: DOP ${result.newBalanceInTarget}`
              );
              
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo completar la transferencia');
            }
          },
        },
      ]
    );
  };

  const renderCard = ({ item, index }: { item: any; index: number }) => {
    if (!item) return null;
    
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    const itemStatus = item.status || 'unknown';
    const itemBalance = item.balance || 0;
    const itemAlias = item.alias || 'Sin nombre';
    const cardColor = itemStatus === 'active' ? '#10B981' : '#EF4444';
    const statusText = itemStatus.toUpperCase();

    return (
      <Animated.View 
        style={[
          styles.cardContainer,
          {
            transform: [{ scale }],
            opacity,
          }
        ]}
      >
        <TouchableOpacity 
          onPress={() => setShowRechargeModal(true)}
          activeOpacity={0.9}
          style={styles.cardTouchable}
        >
          <View style={styles.card}>
            <Image
              source={{ uri: 'https://www.opret.gob.do/Images/Opret%202023%20-%20Banner%20Tarjeta%20de%20Carga%20%C3%9Anica-02.jpg' }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <View style={[styles.cardOverlay, { backgroundColor: cardColor }]} />

            <View style={styles.cardContent}>
              <View>
                <Text style={styles.cardLabel}>Saldo Disponible</Text>
                <Text style={styles.cardBalance}>DOP {itemBalance}</Text>
                <Text style={styles.cardNumber}>{itemAlias}</Text>
                <Text style={styles.cardType}>{statusText}</Text>
              </View>
              <View style={styles.cardLogo}>
                <Icon name="subway" size={40} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.cardHint}>Toca para recargar</Text>
              <Icon name="add-circle" size={20} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderTransferCard = ({ item }: { item: any }) => {
    const isSelected = selectedTransferCard?.nfcuid === item.nfcuid;
      
    return (
      <TouchableOpacity
        style={[
          styles.transferCardOption,
          isSelected && styles.transferCardOptionSelected
        ]}
        onPress={() => setSelectedTransferCard(item)}
        activeOpacity={0.7}
      >
        <View style={styles.transferCardLeft}>
          <View style={[
            styles.transferCardIcon,
            { backgroundColor: isSelected ? '#3B82F6' : '#E5E7EB' }
          ]}>
            <Icon 
              name={isSelected ? 'checkmark-circle' : 'card'} 
              size={24} 
              color={isSelected ? '#FFFFFF' : '#6B7280'} 
            />
          </View>
          <View style={styles.transferCardInfo}>
            <Text style={styles.transferCardAlias}>{item.alias || 'Sin nombre'}</Text>
            <Text style={styles.transferCardBalance}>Saldo actual: DOP {item.balance || 0}</Text>
            <Text style={styles.transferCardNfc}>NFC: {item.nfcuid}</Text>
          </View>
        </View>
        {isSelected && (
          <Icon name="checkmark-circle" size={28} color="#3B82F6" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis Tarjetas</Text>
          <Text style={styles.headerSubtitle}>{cards.length} {cards.length === 1 ? 'tarjeta' : 'tarjetas'}</Text>
        </View>

        {hasCards ? (
          <View style={styles.carouselContainer}>
            <AnimatedFlatList
              ref={carouselRef}
              data={cards}
              renderItem={renderCard}
              keyExtractor={(item: any) => item?.nfcuid || Math.random().toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              getItemLayout={(data, index) => ({
                length: CARD_WIDTH,
                offset: CARD_WIDTH * index,
                index,
              })}
              onScrollToIndexFailed={(info) => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  carouselRef.current?.scrollToIndex({ index: info.index, animated: true });
                });
              }}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / CARD_WIDTH
                );
                const safeIndex = Math.max(0, Math.min(index, cards.length - 1));
                setCurrentCardIndex(safeIndex);
              }}
            />

            <View style={styles.pagination}>
              {cards.map((_: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    currentCardIndex === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyCardsContainer}>
            <Icon name="card-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyCardsText}>No tienes tarjetas registradas</Text>
            <Text style={styles.emptyCardsSubtext}>Agrega tu primera tarjeta para comenzar</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addCardButton}
          onPress={() => setShowAddCardModal(true)}
        >
          <Icon name="add-circle-outline" size={28} color="#3B82F6" />
          <Text style={styles.addCardButtonText}>Agregar Nueva Tarjeta</Text>
        </TouchableOpacity>

        {hasCards && currentCard ? (
          <View style={styles.accountSection}>
            <Text style={styles.sectionTitle}>Información de la Tarjeta</Text>
            
            <TouchableOpacity 
              style={styles.accountItem}
              onPress={handleGoToMyCards}
            >
              <View style={styles.accountItemLeft}>
                <Icon name="create-outline" size={24} color="#3B82F6" />
                <Text style={styles.accountItemText}>Nombre de la Tarjeta</Text>
              </View>
              <View style={styles.accountItemRight}>
                <Text style={styles.accountItemValue}>{currentCard.alias || 'N/A'}</Text>
                <Icon name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.accountItem}>
              <View style={styles.accountItemLeft}>
                <Icon name="time-outline" size={24} color="#8B5CF6" />
                <Text style={styles.accountItemText}>Última Recarga</Text>
              </View>
              <View style={styles.accountItemRight}>
                <Text style={styles.accountItemValue}>
                  {getRelativeTime(currentCard.lastrecharge)}
                </Text>
                <Icon name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.accountItem}
              onPress={() => setShowCardOptionsModal(true)}
            >
              <View style={styles.accountItemLeft}>
                <Icon name="shield-checkmark" size={24} color="#10B981" />
                <Text style={styles.accountItemText}>Estado y Opciones</Text>
              </View>
              <View style={styles.accountItemRight}>
                <Text style={[
                  styles.accountItemValue, 
                  currentCard.status === 'active' ? styles.statusActive : styles.statusInactive
                ]}>
                  {currentCard.status === 'active' ? 'Activa' : 'Inactiva'}
                </Text>
                <Icon name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      {/* TODOS LOS MODALES A PARTIR DE ESTE MENSAJE */}


      {/* Modal Recarga */}
      <Modal visible={showRechargeModal} transparent animationType="slide" onRequestClose={() => setShowRechargeModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recargar Tarjeta</Text>
              <TouchableOpacity onPress={() => setShowRechargeModal(false)}>
                <Icon name="close" size={28} color="#111827" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
              {currentCard ? (
                <Text style={styles.modalSubtitle}>Tarjeta: {currentCard.alias || 'N/A'}</Text>
              ) : null}
              <Text style={styles.modalSubtitle}>Selecciona el monto a recargar</Text>
              <TouchableOpacity style={styles.amountButton} onPress={() => handleRecharge(50)}>
                <Text style={styles.amountButtonText}>DOP 50</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.amountButton} onPress={() => handleRecharge(100)}>
                <Text style={styles.amountButtonText}>DOP 100</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.amountButton} onPress={() => handleRecharge(200)}>
                <Text style={styles.amountButtonText}>DOP 200</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.amountButton} onPress={() => handleRecharge(500)}>
                <Text style={styles.amountButtonText}>DOP 500</Text>
              </TouchableOpacity>
              <Text style={styles.paymentMethodTitle}>Método de Pago</Text>
              <TouchableOpacity style={styles.paymentMethod}>
                <Icon name="card" size={24} color="#3B82F6" />
                <Text style={styles.paymentMethodText}>Tarjeta de Crédito/Débito</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.paymentMethod}>
                <Icon name="phone-portrait" size={24} color="#3B82F6" />
                <Text style={styles.paymentMethodText}>Pago Móvil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.paymentMethod}>
                <Icon name="wallet" size={24} color="#3B82F6" />
                <Text style={styles.paymentMethodText}>Billetera Digital</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Opciones */}
      <Modal visible={showCardOptionsModal} transparent animationType="slide" onRequestClose={() => setShowCardOptionsModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Opciones de Tarjeta</Text>
              <TouchableOpacity onPress={() => setShowCardOptionsModal(false)}>
                <Icon name="close" size={28} color="#111827" />
              </TouchableOpacity>
            </View>
            <View style={styles.optionsContainer}>
              {currentCard ? (
                <>
                  <Text style={styles.optionsSubtitle}>
                    {currentCard.alias || 'N/A'} - {currentCard.nfcuid || 'N/A'}
                  </Text>
                  {currentCard.status === 'active' ? (
                    <TouchableOpacity style={styles.optionButton} onPress={handleDeactivateCard}>
                      <View style={[styles.optionIconContainer, { backgroundColor: '#FEE2E2' }]}>
                        <Icon name="alert-circle" size={28} color="#EF4444" />
                      </View>
                      <View style={styles.optionInfo}>
                        <Text style={styles.optionTitle}>Reportar Perdida</Text>
                        <Text style={styles.optionDescription}>Desactiva temporalmente tu tarjeta</Text>
                      </View>
                      <Icon name="chevron-forward" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.optionButton} onPress={handleReactivateCard}>
                      <View style={[styles.optionIconContainer, { backgroundColor: '#D1FAE5' }]}>
                        <Icon name="checkmark-circle" size={28} color="#10B981" />
                      </View>
                      <View style={styles.optionInfo}>
                        <Text style={styles.optionTitle}>Reactivar Tarjeta</Text>
                        <Text style={styles.optionDescription}>Volver a activar tu tarjeta</Text>
                      </View>
                      <Icon name="chevron-forward" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.optionButton} onPress={handleInitiateDelete}>
                    <View style={[styles.optionIconContainer, { backgroundColor: '#FEE2E2' }]}>
                      <Icon name="trash" size={28} color="#EF4444" />
                    </View>
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionTitle}>Eliminar de Billetera</Text>
                      <Text style={styles.optionDescription}>Remover esta tarjeta permanentemente</Text>
                    </View>
                    <Icon name="chevron-forward" size={24} color="#9CA3AF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.optionButton} onPress={handleGoToHistory}>
                    <View style={[styles.optionIconContainer, { backgroundColor: '#DBEAFE' }]}>
                      <Icon name="receipt-outline" size={28} color="#3B82F6" />
                    </View>
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionTitle}>Ver Historial</Text>
                      <Text style={styles.optionDescription}>Consulta tus movimientos</Text>
                    </View>
                    <Icon name="chevron-forward" size={24} color="#9CA3AF" />
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Transferencia de Saldo */}
      <Modal visible={showTransferModal} transparent animationType="slide" onRequestClose={() => setShowTransferModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transferir Saldo</Text>
              <TouchableOpacity onPress={() => {
                setShowTransferModal(false);
                setSelectedTransferCard(null);
              }}>
                <Icon name="close" size={28} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.transferInfoCard}>
              <Icon name="information-circle" size={24} color="#3B82F6" />
              <View style={styles.transferInfoText}>
                <Text style={styles.transferInfoTitle}>Saldo a transferir</Text>
                <Text style={styles.transferInfoAmount}>DOP {currentCard?.balance || 0}</Text>
              </View>
            </View>

            <Text style={styles.transferSubtitle}>
              Selecciona la tarjeta a la que deseas transferir el saldo de "{currentCard?.alias || 'esta tarjeta'}"
            </Text>

            {availableCardsForTransfer.length > 0 ? (
              <FlatList
                data={availableCardsForTransfer}
                renderItem={renderTransferCard}
                keyExtractor={(item: any) => item.nfcuid}
                style={styles.transferCardsList}
                showsVerticalScrollIndicator={true}
              />
            ) : (
              <View style={styles.emptyTransferCards}>
                <Icon name="card-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyTransferText}>No hay tarjetas disponibles</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.confirmTransferButton,
                !selectedTransferCard && styles.confirmTransferButtonDisabled
              ]}
              onPress={handleConfirmTransfer}
              disabled={!selectedTransferCard}
            >
              <Text style={styles.confirmTransferButtonText}>
                Confirmar Transferencia y Eliminar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Agregar Tarjeta */}
      <Modal visible={showAddCardModal} transparent animationType="slide" onRequestClose={() => setShowAddCardModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Nueva Tarjeta</Text>
              <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
                <Icon name="close" size={28} color="#111827" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
              <Text style={styles.modalSubtitle}>Selecciona cómo deseas agregar tu tarjeta</Text>
              <TouchableOpacity style={styles.addCardOption} onPress={handleAddCardWithNFC}>
                <View style={styles.addCardIconContainer}>
                  <Icon name="scan" size={32} color="#3B82F6" />
                </View>
                <View style={styles.addCardOptionInfo}>
                  <Text style={styles.addCardOptionTitle}>Agregar con NFC</Text>
                  <Text style={styles.addCardOptionSubtitle}>Acerca tu teléfono a la tarjeta</Text>
                </View>
                <Icon name="chevron-forward" size={24} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.addCardOption}>
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

      {/* Modal NFC Animado */}
      <Modal visible={showNFCModal} transparent animationType="slide" onRequestClose={handleCloseNFCModal}>
        <View style={styles.scanModalContainer}>
          <View style={styles.scanModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Tarjeta NFC</Text>
              <TouchableOpacity onPress={handleCloseNFCModal}>
                <Icon name="close" size={28} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.nfcAnimationContainer}>
              <View style={styles.pulseContainer}>
                <PulseRing delay={0} />
                <PulseRing delay={400} />
                <PulseRing delay={800} />
                <PulseRing delay={1200} />
                
                <View style={styles.nfcIconContainer}>
                  <Icon name="radio-button-on" size={70} color="#FFFFFF" />
                </View>
              </View>

              <Text style={styles.scanText}>
                {isNFCScanning ? 'Acerca tu tarjeta al lector NFC...' : 'Preparando lector NFC...'}
              </Text>
            </View>

            <TouchableOpacity style={styles.cancelButton} onPress={handleCloseNFCModal}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollView: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  carouselContainer: { marginTop: 10, marginBottom: 20 },
  carouselContent: { paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 },
  cardContainer: { width: CARD_WIDTH, alignItems: 'center' },
  cardTouchable: { width: '100%' },
  card: { height: CARD_HEIGHT, borderRadius: 20, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  cardOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.85, zIndex: 1 },
  cardContent: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 24, zIndex: 2 },
  cardLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  cardBalance: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  cardNumber: { fontSize: 14, color: 'rgba(255,255,255,0.9)', letterSpacing: 2, marginBottom: 4 },
  cardType: { fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' },
  cardLogo: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 50, padding: 12 },
  cardFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 20, gap: 8, zIndex: 2 },
  cardHint: { fontSize: 14, color: '#FFFFFF', fontWeight: '500' },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 8 },
  paginationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB' },
  paginationDotActive: { width: 24, backgroundColor: '#3B82F6' },
  emptyCardsContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyCardsText: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginTop: 16 },
  emptyCardsSubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
  addCardButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, marginHorizontal: 24, marginTop: 20, padding: 18, borderRadius: 16, borderWidth: 2, borderColor: '#3B82F6', borderStyle: 'dashed' },
  addCardButtonText: { fontSize: 16, fontWeight: '600', color: '#3B82F6', marginLeft: 8 },
  accountSection: { paddingHorizontal: 24, marginTop: 30 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  accountItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  accountItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  accountItemText: { fontSize: 16, color: '#111827', marginLeft: 12 },
  accountItemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accountItemValue: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  statusActive: { color: '#10B981' },
  statusInactive: { color: '#EF4444' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingTop: 24, paddingHorizontal: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  modalScrollContent: { paddingBottom: 30 },
  modalSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  amountButton: { backgroundColor: '#F3F4F6', padding: 18, borderRadius: 12, marginBottom: 12, alignItems: 'center', borderWidth: 2, borderColor: '#E5E7EB' },
  amountButtonText: { fontSize: 18, fontWeight: '600', color: '#111827' },
  paymentMethodTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginTop: 24, marginBottom: 16 },
  paymentMethod: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, marginBottom: 12 },
  paymentMethodText: { fontSize: 16, color: '#111827', marginLeft: 12 },
  addCardOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  addCardIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E8F0FE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  addCardOptionInfo: { flex: 1 },
  addCardOptionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  addCardOptionSubtitle: { fontSize: 14, color: '#6B7280' },
  optionsContainer: { paddingBottom: 30 },
  optionsSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  optionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  optionIconContainer: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  optionDescription: { fontSize: 14, color: '#6B7280' },
  transferInfoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F0FE', padding: 16, borderRadius: 12, marginBottom: 20, gap: 12 },
  transferInfoText: { flex: 1 },
  transferInfoTitle: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  transferInfoAmount: { fontSize: 24, fontWeight: 'bold', color: '#3B82F6' },
  transferSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 20 },
  transferCardsList: { maxHeight: 350, marginBottom: 20 },
  transferCardOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: '#E5E7EB' },
  transferCardOptionSelected: { borderColor: '#3B82F6', backgroundColor: '#E8F0FE' },
  transferCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  transferCardIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  transferCardInfo: { flex: 1 },
  transferCardAlias: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  transferCardBalance: { fontSize: 14, color: '#6B7280', marginBottom: 2 },
  transferCardNfc: { fontSize: 12, color: '#9CA3AF' },
  emptyTransferCards: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyTransferText: { fontSize: 14, color: '#9CA3AF', marginTop: 12 },
  confirmTransferButton: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  confirmTransferButtonDisabled: { backgroundColor: '#D1D5DB' },
  confirmTransferButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  scanModalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  scanModalContent: { backgroundColor: '#FFFFFF', borderRadius: 25, paddingTop: 24, paddingHorizontal: 24, paddingBottom: 30, width: '100%', maxWidth: 400 },
  nfcAnimationContainer: { alignItems: 'center', paddingVertical: 60 },
  pulseContainer: { alignItems: 'center', justifyContent: 'center', width: 200, height: 200, marginBottom: 40 },
  pulseRing: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  nfcIconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', zIndex: 10, elevation: 10 },
  scanText: { fontSize: 16, fontWeight: '600', color: '#111827', textAlign: 'center', marginBottom: 30, paddingHorizontal: 24 },
  cancelButton: { backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
});
