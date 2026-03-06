import { API_URL } from '@env';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import Icon from 'react-native-vector-icons/Ionicons';
import { StationSearchDropdown } from '../../components/map-components/BusquedaMetro';
import { COLORS } from '../../constants/colors';
import { useActivities } from '../../context/ActivitiesContext';
import { useCards } from '../../context/CardsContext';

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

const AnimatedCardBackground = () => {
  const moveAnim1 = useRef(new Animated.Value(0)).current;
  const moveAnim2 = useRef(new Animated.Value(0)).current;
  const moveAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(moveAnim1, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();

    setTimeout(() => {
      Animated.loop(
        Animated.timing(moveAnim2, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      ).start();
    }, 1000);

    setTimeout(() => {
      Animated.loop(
        Animated.timing(moveAnim3, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      ).start();
    }, 2000);
  }, []);

  const translateX1 = moveAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [-400, 400],
  });

  const translateX2 = moveAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [-400, 400],
  });

  const translateX3 = moveAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [-400, 400],
  });

  return (
    <View style={styles.cardAnimatedBackground}>
      <Animated.View
        style={[
          styles.animatedLine,
          {
            transform: [
              { translateX: translateX1 },
              { rotate: '45deg' }
            ]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.animatedLine,
          {
            transform: [
              { translateX: translateX2 },
              { rotate: '45deg' }
            ],
            top: '30%',
          }
        ]}
      />
      <Animated.View
        style={[
          styles.animatedLine,
          {
            transform: [
              { translateX: translateX3 },
              { rotate: '45deg' }
            ],
            top: '60%',
          }
        ]}
      />
    </View>
  );
};

export default function HomeScreen({ navigation }: any) {
  const [showMapModal, setShowMapModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStationDropdown, setShowStationDropdown] = useState(false);

  const { cards, rechargeCard, useCard } = useCards();
  const { activities, addActivity } = useActivities();

  const receipts = [
    {
      id: '1',
      type: 'Recarga',
      amount: 200,
      date: 'Hoy, 6:15 PM',
      card: '•••• 4532',
      method: 'Tarjeta de Crédito',
      transactionId: 'TRX-2024-001',
    },
    {
      id: '2',
      type: 'Recarga',
      amount: 100,
      date: 'Ayer, 2:30 PM',
      card: '•••• 7891',
      method: 'Pago Móvil',
      transactionId: 'TRX-2024-002',
    },
    {
      id: '3',
      type: 'Recarga',
      amount: 50,
      date: 'Hace 2 días, 10:00 AM',
      card: '•••• 4532',
      method: 'Billetera Digital',
      transactionId: 'TRX-2024-003',
    },
  ];

  useEffect(() => {
    checkNFCAvailability();

    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => { });
    };
  }, []);

  const handleStationSelect = (station: any) => {
    console.log('🎯 Estación seleccionada:', station);

    setSearchQuery('');
    setShowStationDropdown(false);

    navigation.navigate('Navegar', {
      destinationStation: station,
      executeRoute: true,
    });
  };

  const checkNFCAvailability = async () => {
    try {
      const supported = await NfcManager.isSupported();

      if (!supported) {
        setNfcSupported(false);
        return;
      }

      setNfcSupported(true);

      try {
        await NfcManager.start();
        const enabled = await NfcManager.isEnabled();
        console.log('🔌 NFC habilitado:', enabled);
      } catch (startError) {
        console.log('⚠️ Error iniciando NFC Manager:', startError);
      }
    } catch (error) {
      setNfcSupported(false);
    }
  };

  useEffect(() => {
    if (selectedCard && showScanModal) {
      startNFCScan();
    }
    return () => {
      stopNFCScan();
    };
  }, [selectedCard, showScanModal]);

  const startNFCScan = async () => {
    if (!nfcSupported) {
      Alert.alert('Error', 'Tu dispositivo no soporta NFC');
      return;
    }

    try {
      const enabled = await NfcManager.isEnabled();
      if (!enabled) {
        Alert.alert(
          'NFC Deshabilitado',
          'Por favor habilita NFC en la configuración de tu dispositivo',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Abrir Configuración',
              onPress: async () => {
                await NfcManager.goToNfcSetting();
              },
            },
          ]
        );
        return;
      }

      setIsScanning(true);

      await NfcManager.requestTechnology([NfcTech.Ndef, NfcTech.NfcA, NfcTech.IsoDep]);

      const tag = await NfcManager.getTag();

      if (tag) {
        const serialNumber = tag.id;
        console.log('📱 NFC Tag detected:', serialNumber);

        await NfcManager.cancelTechnologyRequest();
        setIsScanning(false);

        if (serialNumber === '057E0968B864E9') {
          console.log('🎯 Special card detected! Sending registration...');

          const payload = {
            nfcuid: selectedCard.nfcuid,
            reqType: 'phone',
            stationid: 1,
          };

          console.log('📤 Payload:', payload);
          console.log('🌐 API URL:', `${API_URL}/cardusage/registerTap`);

          try {
            const response = await fetch(`${API_URL}/cardusage/registerTap`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });

            console.log('📥 Response status:', response.status);
            console.log('📥 Response ok:', response.ok);

            const responseText = await response.text();
            console.log('📥 Response body:', responseText);

            let responseData;
            try {
              responseData = JSON.parse(responseText);
            } catch (parseError) {
              responseData = { error: responseText };
            }

            if (response.ok && responseData.success) {
              Alert.alert('Éxito', 'Pase completado exitosamente');

            } else {
              const errorMessage = responseData.error || responseData.message || 'No se pudo completar el pase';
              Alert.alert('Error', errorMessage);
            }
          } catch (fetchError) {
            console.error('❌ Fetch error:', fetchError);
            Alert.alert('Error', 'Error de conexión al servidor');
          }
          return;
        }

        console.log('💳 Normal card flow - showing payment confirmation');

        Alert.alert(
          'Tarjeta Detectada',
          `Número de Serie: ${serialNumber}\n\n¿Proceder con el pago?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Confirmar',
              onPress: () => handleNFCCardDetected(serialNumber ?? ''),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('❌ NFC Scan error:', error);
      setIsScanning(false);
      await NfcManager.cancelTechnologyRequest().catch(() => { });

      if (error.message && !error.message.includes('cancelled')) {
        Alert.alert('Error', `No se pudo leer la tarjeta NFC\n\n${error.message}`);
      }
    }
  };

  const handleNFCCardDetected = async (serialNumber: string) => {
    try {
      await useCard(selectedCard.nfcuid, 'STATION_001');

      await addActivity({
        type: 'trip',
        title: 'Viaje - Línea 1',
        subtitle: 'Centro Los Héroes',
        date: new Date().toISOString(),
        amount: -20,
        icon: 'subway',
        iconBg: '#EDE9FE',
        iconColor: '#8B5CF6',
        cardId: selectedCard.nfcuid,
        stationId: 'STATION_001',
      });

      setShowScanModal(false);
      setSelectedCard(null);

      Alert.alert(
        '¡Viaje Exitoso!',
        `Pasaste con la tarjeta ${selectedCard.alias || 'Sin nombre'}\nNuevo balance: DOP ${selectedCard.balance - 20}`
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo procesar el pago');
    }
  };

  const stopNFCScan = async () => {
    setIsScanning(false);
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (error) {
      console.log('Error deteniendo NFC:', error);
    }
  };

  const handleSelectCard = (card: any) => {
    setSelectedCard(card);
  };

  const handleGoToHistory = () => {
    setShowHistoryModal(true);
  };

  const handleSelectCardToRecharge = (card: any) => {
    setSelectedCard(card);
    setShowRechargeModal(false);
    navigation.navigate('Tarjeta');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        accessible={false}
      >
        {/* Header con accesibilidad */}
        <View
          style={styles.headerImage}
          accessible={true}
          accessibilityLabel="Bienvenido a MontaoRD, Tu App de Metro"
          accessibilityRole="header"
        >
          <Image
            source={require('../../assets/images/MetroFondo.jpg')}
            style={styles.backgroundImage}
            contentFit="cover"
            cachePolicy="disk"
            placeholder={{ blurhash: 'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH' }}
            accessible={false}
          />
          <View style={styles.headerOverlay}>
            <Text
              style={styles.welcomeText}
              accessible={false}
            >
              Bienvenido a
            </Text>
            <Text
              style={styles.stationName}
              accessible={false}
            >
              MontaoRD
            </Text>
            <Text
              style={styles.stationName}
              accessible={false}
            >
              Tu App de Metro
            </Text>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => setShowMapModal(true)}
              accessible={true}
              accessibilityLabel="Abrir mapa del metro"
              accessibilityHint="Abre el mapa completo de la red del Metro y Teleférico"
              accessibilityRole="button"
            >
              <Icon name="map-outline" size={20} color="#FFFFFF" />
              <Text style={styles.mapButtonText}>Mapa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Barra de búsqueda con accesibilidad */}
        <View
          style={styles.searchContainer}
          accessible={false}
        >
          <View
            style={styles.searchBox}
            accessible={false}
          >
            <Icon
              name="subway"
              size={24}
              color="#3B82F6"
              accessible={false}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="¿Donde vas?"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setShowStationDropdown(text.length > 0);
              }}
              onFocus={() => {
                if (searchQuery.length > 0) {
                  setShowStationDropdown(true);
                }
              }}
              autoCorrect={false}
              autoCapitalize="words"
              accessible={true}
              accessibilityLabel="Buscar estación de destino"
              accessibilityHint="Escribe el nombre de la estación a la que quieres ir"
              accessibilityRole="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setShowStationDropdown(false);
                }}
                style={styles.clearButton}
                accessible={true}
                accessibilityLabel="Limpiar búsqueda"
                accessibilityHint="Borra el texto de búsqueda"
                accessibilityRole="button"
              >
                <Icon name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <StationSearchDropdown
            searchQuery={searchQuery}
            onStationSelect={handleStationSelect}
            visible={showStationDropdown}
          />
        </View>

        {/* Botones de acciones con accesibilidad */}
        <View
          style={styles.actionsContainer}
          accessible={false}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowRechargeModal(true)}
            accessible={true}
            accessibilityLabel="Recarga de tarjeta"
            accessibilityHint="Abre el menú para recargar saldo en tus tarjetas de metro"
            accessibilityRole="button"
          >
            <View
              style={styles.actionIconContainer}
              accessible={false}
            >
              <Icon name="add-circle" size={28} color="#3B82F6" />
            </View>
            <Text style={styles.actionText}>Recarga</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleGoToHistory}
            accessible={true}
            accessibilityLabel="Historial de viajes"
            accessibilityHint="Ver tu historial completo de viajes y actividades"
            accessibilityRole="button"
          >
            <View
              style={styles.actionIconContainer}
              accessible={false}
            >
              <Icon name="time" size={28} color="#3B82F6" />
            </View>
            <Text style={styles.actionText}>Historial</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowScanModal(true)}
            accessible={true}
            accessibilityLabel="Pasar por torniquete"
            accessibilityHint="Usa NFC para pasar por el torniquete del metro"
            accessibilityRole="button"
          >
            <View
              style={styles.actionIconContainer}
              accessible={false}
            >
              <Icon name="qr-code" size={28} color="#3B82F6" />
            </View>
            <Text style={styles.actionText}>Pasar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowReceiptsModal(true)}
            accessible={true}
            accessibilityLabel="Recibos de recarga"
            accessibilityHint="Consulta tus recibos de recargas anteriores"
            accessibilityRole="button"
          >
            <View
              style={styles.actionIconContainer}
              accessible={false}
            >
              <Icon name="receipt" size={28} color="#3B82F6" />
            </View>
            <Text style={styles.actionText}>Recibos</Text>
          </TouchableOpacity>
        </View>

        {/* Sección de actividad reciente con accesibilidad */}
        <View
          style={styles.section}
          accessible={false}
        >
          <Text
            style={styles.sectionTitle}
            accessible={true}
            accessibilityRole="header"
          >
            Actividad Reciente
          </Text>
          <Text
            style={styles.sectionSubtitle}
            accessible={true}
          >
            Tus últimos movimientos
          </Text>

          {activities.slice(0, 4).map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityCard}
              accessible={true}
              accessibilityLabel={`${activity.title}, ${activity.subtitle}, ${activity.date}, ${activity.amount > 0 ? 'Recarga de' : 'Gasto de'} ${Math.abs(activity.amount)} pesos dominicanos`}
              accessibilityHint="Toca para ver más detalles de esta actividad"
              accessibilityRole="button"
            >
              <View
                style={[styles.activityIcon, { backgroundColor: activity.iconBg }]}
                accessible={false}
              >
                <Icon name={activity.icon} size={24} color={activity.iconColor} />
              </View>
              <View
                style={styles.activityInfo}
                accessible={false}
              >
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                <Text style={styles.activityTime}>{activity.date}</Text>
              </View>
              <Text
                style={[styles.activityAmount, activity.amount > 0 && styles.activityAmountPositive]}
                accessible={false}
              >
                {activity.amount > 0 ? '+' : ''}DOP {Math.abs(activity.amount)}
              </Text>
            </TouchableOpacity>
          ))}

          {activities.length === 0 && (
            <View
              style={styles.emptyState}
              accessible={true}
              accessibilityLabel="No hay actividad reciente"
              accessibilityRole="text"
            >
              <Icon name="document-text-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No hay actividad reciente</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal del Mapa con accesibilidad */}
      <Modal
        visible={showMapModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
        accessible={true}
        accessibilityViewIsModal={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text
                style={styles.modalTitle}
                accessible={true}
                accessibilityRole="header"
              >
                Mapa del Metro
              </Text>
              <TouchableOpacity
                onPress={() => setShowMapModal(false)}
                accessible={true}
                accessibilityLabel="Cerrar mapa"
                accessibilityHint="Cierra la ventana del mapa"
                accessibilityRole="button"
              >
                <Icon name="close" size={28} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text
              style={styles.modalSubtitle}
              accessible={true}
            >
              Red del Metro y Teleférico de Santo Domingo
            </Text>

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              accessible={false}
            >
              <Image
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Mapa_de_Red_del_Metro_y_Telef%C3%A9rico_de_Santo_Domingo.jpg' }}
                style={styles.mapImage}
                contentFit="contain"
                cachePolicy="memory-disk"
                accessible={true}
                accessibilityLabel="Mapa de la red del Metro y Teleférico de Santo Domingo mostrando las líneas 1, 2 y Teleférico con todas sus estaciones"
              />
            </ScrollView>

            <View
              style={styles.legend}
              accessible={false}
            >
              <View
                style={styles.legendItem}
                accessible={true}
                accessibilityLabel="Línea 1 de color azul"
                accessibilityRole="text"
              >
                <View style={[styles.legendColor, { backgroundColor: COLORS.line1 }]} />
                <Text style={styles.legendText}>Línea 1</Text>
              </View>
              <View
                style={styles.legendItem}
                accessible={true}
                accessibilityLabel="Línea 2 de color rojo"
                accessibilityRole="text"
              >
                <View style={[styles.legendColor, { backgroundColor: COLORS.line2 }]} />
                <Text style={styles.legendText}>Línea 2</Text>
              </View>
              <View
                style={styles.legendItem}
                accessible={true}
                accessibilityLabel="Teleférico de color verde"
                accessibilityRole="text"
              >
                <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>Teleférico</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Pasar con NFC con accesibilidad */}
      <Modal
        visible={showScanModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          stopNFCScan();
          setShowScanModal(false);
          setSelectedCard(null);
        }}
        accessible={true}
        accessibilityViewIsModal={true}
      >
        <View style={styles.scanModalContainer}>
          <View style={styles.scanModalContent}>
            <View style={styles.modalHeader}>
              <Text
                style={styles.modalTitle}
                accessible={true}
                accessibilityRole="header"
              >
                Selecciona tu Tarjeta
              </Text>
              <TouchableOpacity
                onPress={() => {
                  stopNFCScan();
                  setShowScanModal(false);
                  setSelectedCard(null);
                }}
                accessible={true}
                accessibilityLabel="Cerrar selección de tarjeta"
                accessibilityHint="Cancela la selección de tarjeta y cierra la ventana"
                accessibilityRole="button"
              >
                <Icon name="close" size={28} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text
              style={styles.scanInstructions}
              accessible={true}
            >
              Selecciona la tarjeta que usarás para pasar por el torniquete
            </Text>

            {!selectedCard ? (
              <ScrollView
                style={styles.cardsScrollView}
                showsVerticalScrollIndicator={false}
                accessible={false}
              >
                {cards && cards.length > 0 ? (
                  cards.filter(card => card?.status === 'active').map((card) => {
                    const cardStatus = card?.status || 'unknown';
                    const cardBalance = card?.balance || 0;
                    const cardAlias = card?.alias || 'Sin nombre';
                    const statusText = cardStatus.toUpperCase();

                    return (
                      <TouchableOpacity
                        key={card.nfcuid}
                        style={styles.cardSelectOption}
                        onPress={() => handleSelectCard(card)}
                        activeOpacity={0.8}
                        accessible={true}
                        accessibilityLabel={`Tarjeta ${cardAlias}, estado ${statusText}, saldo ${cardBalance} pesos dominicanos`}
                        accessibilityHint="Selecciona esta tarjeta para pasar por el torniquete"
                        accessibilityRole="button"
                      >
                        <Image
                          source={{ uri: 'https://www.opret.gob.do/Images/Opret%202023%20-%20Banner%20Tarjeta%20de%20Carga%20%C3%9Anica-02.jpg' }}
                          style={StyleSheet.absoluteFill}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          accessible={false}
                        />
                        <View style={styles.miniCardOverlay} />
                        <View
                          style={styles.miniCardContent}
                          accessible={false}
                        >
                          <View>
                            <Text style={styles.miniCardType}>{statusText}</Text>
                            <Text style={styles.miniCardBalance}>DOP {cardBalance}</Text>
                            <Text style={styles.miniCardNumber}>{cardAlias}</Text>
                          </View>
                          <Icon name="subway" size={40} color={COLORS.white} />
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View
                    style={styles.emptyState}
                    accessible={true}
                    accessibilityLabel="No hay tarjetas activas"
                    accessibilityRole="text"
                  >
                    <Text style={styles.emptyStateText}>No hay tarjetas activas</Text>
                  </View>
                )}
              </ScrollView>
            ) : (
              <View style={styles.selectedCardPreview}>
                <View
                  style={styles.bigCard}
                  accessible={true}
                  accessibilityLabel={`Tarjeta seleccionada ${selectedCard?.alias || 'Sin nombre'}, saldo ${selectedCard?.balance || 0} pesos dominicanos`}
                  accessibilityRole="text"
                >
                  <AnimatedCardBackground />
                  <View style={styles.bigCardOverlay} />
                  <View
                    style={styles.bigCardContent}
                    accessible={false}
                  >
                    <View>
                      <Text style={styles.bigCardLabel}>Tarjeta Seleccionada</Text>
                      <Text style={styles.bigCardBalance}>DOP {selectedCard?.balance || 0}</Text>
                      <Text style={styles.bigCardNumber}>{selectedCard?.alias || 'Sin nombre'}</Text>
                    </View>
                    <View style={styles.bigCardLogo}>
                      <Icon name="subway" size={48} color={COLORS.white} />
                    </View>
                  </View>
                </View>

                <View
                  style={styles.pulseContainer}
                  accessible={true}
                  accessibilityLabel={isScanning ? 'Esperando lectura NFC' : 'Preparando lector NFC'}
                  accessibilityRole="progressbar"
                >
                  <PulseRing delay={0} />
                  <PulseRing delay={400} />
                  <PulseRing delay={800} />
                  <PulseRing delay={1200} />

                  <View style={styles.nfcIconContainer}>
                    <Icon name="radio-button-on" size={70} color={COLORS.white} />
                  </View>
                </View>

                <Text
                  style={styles.scanText}
                  accessible={true}
                >
                  {isScanning
                    ? 'Acerca tu tarjeta al lector NFC...'
                    : 'Preparando lector NFC...'}
                </Text>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    stopNFCScan();
                    setSelectedCard(null);
                    setShowScanModal(false);
                  }}
                  accessible={true}
                  accessibilityLabel="Cancelar"
                  accessibilityHint="Cancela el escaneo NFC y regresa"
                  accessibilityRole="button"
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Recarga con accesibilidad */}
      <Modal
        visible={showRechargeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRechargeModal(false)}
        accessible={true}
        accessibilityViewIsModal={true}
      >
        <View style={styles.scanModalContainer}>
          <View style={styles.scanModalContent}>
            <View style={styles.modalHeader}>
              <Text
                style={styles.modalTitle}
                accessible={true}
                accessibilityRole="header"
              >
                Selecciona tu Tarjeta
              </Text>
              <TouchableOpacity
                onPress={() => setShowRechargeModal(false)}
                accessible={true}
                accessibilityLabel="Cerrar recarga"
                accessibilityHint="Cierra la ventana de recarga de tarjeta"
                accessibilityRole="button"
              >
                <Icon name="close" size={28} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text
              style={styles.scanInstructions}
              accessible={true}
            >
              Elige la tarjeta que deseas recargar
            </Text>

            <ScrollView
              style={styles.cardsScrollView}
              showsVerticalScrollIndicator={false}
              accessible={false}
            >
              {cards && cards.length > 0 ? (
                cards.map((card) => {
                  const cardStatus = card?.status || 'unknown';
                  const cardBalance = card?.balance || 0;
                  const cardAlias = card?.alias || 'Sin nombre';
                  const statusText = cardStatus.toUpperCase();

                  return (
                    <TouchableOpacity
                      key={card.nfcuid}
                      style={styles.cardSelectOption}
                      onPress={() => handleSelectCardToRecharge(card)}
                      activeOpacity={0.8}
                      accessible={true}
                      accessibilityLabel={`Recargar tarjeta ${cardAlias}, estado ${statusText}, saldo actual ${cardBalance} pesos dominicanos`}
                      accessibilityHint="Selecciona esta tarjeta para recargar saldo"
                      accessibilityRole="button"
                    >
                      <Image
                        source={{ uri: 'https://www.opret.gob.do/Images/Opret%202023%20-%20Banner%20Tarjeta%20de%20Carga%20%C3%9Anica-02.jpg' }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        accessible={false}
                      />
                      <View style={styles.miniCardOverlay} />
                      <View
                        style={styles.miniCardContent}
                        accessible={false}
                      >
                        <View>
                          <Text style={styles.miniCardType}>{statusText}</Text>
                          <Text style={styles.miniCardBalance}>DOP {cardBalance}</Text>
                          <Text style={styles.miniCardNumber}>{cardAlias}</Text>
                        </View>
                        <Icon name="add-circle" size={40} color={COLORS.white} />
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View
                  style={styles.emptyState}
                  accessible={true}
                  accessibilityLabel="No hay tarjetas registradas"
                  accessibilityRole="text"
                >
                  <Text style={styles.emptyStateText}>No hay tarjetas registradas</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Recibos con accesibilidad */}
      <Modal
        visible={showReceiptsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReceiptsModal(false)}
        accessible={true}
        accessibilityViewIsModal={true}
      >
        <View style={styles.scanModalContainer}>
          <View style={styles.scanModalContent}>
            <View style={styles.modalHeader}>
              <Text
                style={styles.modalTitle}
                accessible={true}
                accessibilityRole="header"
              >
                Recibos de Recarga
              </Text>
              <TouchableOpacity
                onPress={() => setShowReceiptsModal(false)}
                accessible={true}
                accessibilityLabel="Cerrar recibos"
                accessibilityHint="Cierra la ventana de recibos"
                accessibilityRole="button"
              >
                <Icon name="close" size={28} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text
              style={styles.scanInstructions}
              accessible={true}
            >
              Historial de todas tus recargas
            </Text>

            <ScrollView
              style={styles.receiptsScrollView}
              showsVerticalScrollIndicator={false}
              accessible={false}
            >
              {receipts.map((receipt) => (
                <View
                  key={receipt.id}
                  style={styles.receiptCard}
                  accessible={true}
                  accessibilityLabel={`${receipt.type} de ${receipt.amount} pesos dominicanos, ${receipt.date}, tarjeta ${receipt.card}, método ${receipt.method}, ID de transacción ${receipt.transactionId}`}
                  accessibilityRole="summary"
                >
                  <View
                    style={styles.receiptHeader}
                    accessible={false}
                  >
                    <View style={styles.receiptIconContainer}>
                      <Icon name="checkmark-circle" size={24} color="#10B981" />
                    </View>
                    <View style={styles.receiptHeaderInfo}>
                      <Text style={styles.receiptType}>{receipt.type}</Text>
                      <Text style={styles.receiptDate}>{receipt.date}</Text>
                    </View>
                    <Text style={styles.receiptAmount}>+DOP {receipt.amount}</Text>
                  </View>

                  <View style={styles.receiptDivider} />

                  <View
                    style={styles.receiptDetails}
                    accessible={false}
                  >
                    <View style={styles.receiptDetailRow}>
                      <Text style={styles.receiptDetailLabel}>Tarjeta:</Text>
                      <Text style={styles.receiptDetailValue}>{receipt.card}</Text>
                    </View>
                    <View style={styles.receiptDetailRow}>
                      <Text style={styles.receiptDetailLabel}>Método:</Text>
                      <Text style={styles.receiptDetailValue}>{receipt.method}</Text>
                    </View>
                    <View style={styles.receiptDetailRow}>
                      <Text style={styles.receiptDetailLabel}>ID:</Text>
                      <Text style={styles.receiptDetailValue}>{receipt.transactionId}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.downloadButton}
                    accessible={true}
                    accessibilityLabel="Descargar recibo"
                    accessibilityHint="Descarga una copia de este recibo"
                    accessibilityRole="button"
                  >
                    <Icon name="download-outline" size={18} color="#3B82F6" />
                    <Text style={styles.downloadButtonText}>Descargar Recibo</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Historial con accesibilidad */}
      <Modal
        visible={showHistoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHistoryModal(false)}
        accessible={true}
        accessibilityViewIsModal={true}
      >
        <View style={styles.scanModalContainer}>
          <View style={styles.scanModalContent}>
            <View style={styles.modalHeader}>
              <Text
                style={styles.modalTitle}
                accessible={true}
                accessibilityRole="header"
              >
                Historial de Viajes
              </Text>
              <TouchableOpacity
                onPress={() => setShowHistoryModal(false)}
                accessible={true}
                accessibilityLabel="Cerrar historial"
                accessibilityHint="Cierra la ventana del historial de viajes"
                accessibilityRole="button"
              >
                <Icon name="close" size={28} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text
              style={styles.scanInstructions}
              accessible={true}
            >
              Información de viajes y actividades recientes
            </Text>

            <ScrollView
              style={styles.receiptsScrollView}
              showsVerticalScrollIndicator={false}
              accessible={false}
            >
              {[
                {
                  id: '1',
                  type: 'Viaje',
                  line: 'Línea 1',
                  from: 'Centro Los Héroes',
                  to: 'Villa Mella',
                  date: 'Hoy, 8:30 AM',
                  amount: -20,
                  card: '•••• 4532',
                },
                {
                  id: '2',
                  type: 'Recarga',
                  amount: 100,
                  date: 'Hoy, 8:00 AM',
                  method: 'Tarjeta de Crédito',
                  card: '•••• 4532',
                },
                {
                  id: '3',
                  type: 'Viaje',
                  line: 'Línea 2',
                  from: 'Duarte',
                  to: 'Mamá Tingó',
                  date: 'Ayer, 5:45 PM',
                  amount: -20,
                  card: '•••• 7891',
                },
                {
                  id: '4',
                  type: 'Recarga',
                  amount: 50,
                  date: 'Ayer, 3:15 PM',
                  method: 'Pago Móvil',
                  card: '•••• 7891',
                },
              ].map((item) => {
                const accessibilityText = item.type === 'Viaje'
                  ? `${item.type} en ${item.line}, desde ${item.from} hasta ${item.to}, ${item.date}, ${Math.abs(item.amount)} pesos dominicanos, tarjeta ${item.card}`
                  : `${item.type} de ${item.amount} pesos dominicanos, ${item.date}, método ${item.method}, tarjeta ${item.card}`;

                return (
                  <View
                    key={item.id}
                    style={styles.receiptCard}
                    accessible={true}
                    accessibilityLabel={accessibilityText}
                    accessibilityRole="summary"
                  >
                    <View
                      style={styles.receiptHeader}
                      accessible={false}
                    >
                      <View style={styles.receiptIconContainer}>
                        <Icon
                          name={item.type === 'Viaje' ? 'subway' : 'add-circle'}
                          size={24}
                          color={item.type === 'Viaje' ? '#8B5CF6' : '#10B981'}
                        />
                      </View>
                      <View style={styles.receiptHeaderInfo}>
                        <Text style={styles.receiptType}>{item.type}</Text>
                        <Text style={styles.receiptDate}>{item.date}</Text>
                      </View>
                      <Text style={[styles.receiptAmount, item.amount > 0 ? styles.receiptAmountPositive : styles.receiptAmountNegative]}>
                        {item.amount > 0 ? '+' : ''}DOP {Math.abs(item.amount)}
                      </Text>
                    </View>

                    <View style={styles.receiptDivider} />

                    <View
                      style={styles.receiptDetails}
                      accessible={false}
                    >
                      {item.type === 'Viaje' ? (
                        <>
                          <View style={styles.receiptDetailRow}>
                            <Text style={styles.receiptDetailLabel}>Línea:</Text>
                            <Text style={styles.receiptDetailValue}>{item.line}</Text>
                          </View>
                          <View style={styles.receiptDetailRow}>
                            <Text style={styles.receiptDetailLabel}>De:</Text>
                            <Text style={styles.receiptDetailValue}>{item.from}</Text>
                          </View>
                          <View style={styles.receiptDetailRow}>
                            <Text style={styles.receiptDetailLabel}>A:</Text>
                            <Text style={styles.receiptDetailValue}>{item.to}</Text>
                          </View>
                        </>
                      ) : (
                        <>
                          <View style={styles.receiptDetailRow}>
                            <Text style={styles.receiptDetailLabel}>Método:</Text>
                            <Text style={styles.receiptDetailValue}>{item.method}</Text>
                          </View>
                        </>
                      )}
                      <View style={styles.receiptDetailRow}>
                        <Text style={styles.receiptDetailLabel}>Tarjeta:</Text>
                        <Text style={styles.receiptDetailValue}>{item.card}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1 },
  headerImage: { height: 280, position: 'relative' },
  backgroundImage: { width: '100%', height: '100%' },
  headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', padding: 24, justifyContent: 'flex-end', paddingBottom: 40 },
  welcomeText: { fontSize: 20, color: '#FFFFFF', fontWeight: '400' },
  stationName: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  mapButton: { position: 'absolute', top: 50, right: 24, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  mapButtonText: { color: '#FFFFFF', marginLeft: 6, fontSize: 16, fontWeight: '600' },
  searchContainer: { paddingHorizontal: 24, marginTop: -20, marginBottom: 20, position: 'relative', zIndex: 1000 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5, zIndex: 1001 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: COLORS.textPrimary },
  clearButton: { padding: 4, marginLeft: 8 },
  actionsContainer: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 8, justifyContent: 'space-between', marginBottom: 24 },
  actionButton: { alignItems: 'center', flex: 1 },
  actionIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E8F0FE', justifyContent: 'center', alignItems: 'center', marginBottom: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  actionText: { fontSize: 12, color: '#111827', fontWeight: '500' },
  section: { paddingHorizontal: 24, marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  activityCard: { flexDirection: 'row', backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  activityIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 },
  activitySubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  activityTime: { fontSize: 12, color: '#9CA3AF' },
  activityAmount: { fontSize: 14, fontWeight: 'bold', color: COLORS.secondary, alignSelf: 'flex-start' },
  activityAmountPositive: { color: '#10B981' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyStateText: { fontSize: 14, color: '#9CA3AF', marginTop: 12 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 24 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
  modalSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 },
  mapScrollView: { maxHeight: 450, marginBottom: 16 },
  mapScrollContent: { alignItems: 'center' },
  mapImage: { width: 350, height: 450, borderRadius: 12 },
  legend: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendColor: { width: 24, height: 24, borderRadius: 4, marginRight: 8 },
  legendText: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  scanModalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  scanModalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingTop: 24, paddingBottom: 40, paddingHorizontal: 0, maxHeight: '85%' },
  scanInstructions: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20, textAlign: 'center', paddingHorizontal: 24 },
  cardsScrollView: { maxHeight: 450, paddingHorizontal: 24 },
  cardSelectOption: { height: 120, backgroundColor: '#3B82F6', borderRadius: 16, overflow: 'hidden', marginBottom: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  miniCardOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#002D72', opacity: 0.85, zIndex: 1 },
  miniCardContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, zIndex: 1 },
  miniCardType: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginBottom: 6, letterSpacing: 1 },
  miniCardBalance: { fontSize: 28, fontWeight: 'bold', color: COLORS.white, marginBottom: 6 },
  miniCardNumber: { fontSize: 14, color: 'rgba(255,255,255,0.9)', letterSpacing: 3 },
  selectedCardPreview: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20, alignItems: 'center' },
  cardAnimatedBackground: { position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' },
  animatedLine: { position: 'absolute', width: 800, height: 3, backgroundColor: '#60A5FA', opacity: 0.6, top: 0, left: -400 },
  bigCard: { width: '100%', height: 200, backgroundColor: '#1E3A8A', borderRadius: 20, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, marginBottom: 60 },
  bigCardOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#002D72', opacity: 0.75 },
  bigCardContent: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 24, zIndex: 2 },
  bigCardLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', marginBottom: 8 },
  bigCardBalance: { fontSize: 32, fontWeight: 'bold', color: COLORS.white, marginBottom: 6 },
  bigCardNumber: { fontSize: 16, color: 'rgba(255,255,255,0.9)', letterSpacing: 2 },
  bigCardLogo: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 50, padding: 12 },
  pulseContainer: { alignItems: 'center', justifyContent: 'center', width: 200, height: 200, marginBottom: 40 },
  pulseRing: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  nfcIconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', zIndex: 10, elevation: 10 },
  scanText: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 30 },
  cancelButton: { backgroundColor: COLORS.background, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.textLight, width: '100%' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  receiptsScrollView: { paddingHorizontal: 24, maxHeight: 550 },
  receiptCard: { backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  receiptHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  receiptIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  receiptHeaderInfo: { flex: 1 },
  receiptType: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 },
  receiptDate: { fontSize: 12, color: '#6B7280' },
  receiptAmount: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  receiptAmountPositive: { color: '#10B981' },
  receiptAmountNegative: { color: '#EF4444' },
  receiptDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  receiptDetails: { marginBottom: 12 },
  receiptDetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  receiptDetailLabel: { fontSize: 14, color: '#6B7280' },
  receiptDetailValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  downloadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F0FE', paddingVertical: 10, borderRadius: 8 },
  downloadButtonText: { fontSize: 14, fontWeight: '600', color: '#3B82F6', marginLeft: 6 },
});