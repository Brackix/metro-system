import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';


export default function AccountScreen({ navigation }: any) {
  // ✅ OBTIENE LOS DATOS DEL USUARIO
  const { logout, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [showPhotoOptionsModal, setShowPhotoOptionsModal] = useState(false);
  const [showBackgroundOptionsModal, setShowBackgroundOptionsModal] = useState(false);
  const [showFullProfileImage, setShowFullProfileImage] = useState(false);
  const [showFullBackgroundImage, setShowFullBackgroundImage] = useState(false);


  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: logout },
      ]
    );
  };


  const pickImage = async (type: 'profile' | 'background') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (permissionResult.granted === false) {
      Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la galería');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [16, 9],
      quality: 0.8,
    });
  
    if (!result.canceled) {
      if (type === 'profile') {
        setProfileImage(result.assets[0].uri);
      } else {
        setBackgroundImage(result.assets[0].uri);
      }
    }
  };
  
  const handleProfilePress = () => {
    if (profileImage) {
      setShowPhotoOptionsModal(true);
    } else {
      pickImage('profile');
    }
  };


  const handleBackgroundPress = () => {
    if (backgroundImage) {
      setShowBackgroundOptionsModal(true);
    } else {
      pickImage('background');
    }
  };


  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Header con Imagen de Fondo */}
        <TouchableOpacity 
          style={styles.header}
          onPress={handleBackgroundPress}
          activeOpacity={0.8}
        >
          {backgroundImage ? (
            <Image source={{ uri: backgroundImage }} style={styles.backgroundImage} />
          ) : (
            <View style={styles.backgroundPlaceholder} />
          )}
          
          <View style={styles.headerOverlay}>
            <TouchableOpacity 
              style={styles.editBackgroundButton}
              onPress={handleBackgroundPress}
            >
              <Icon name="camera" size={20} color="#FFFFFF" />
            </TouchableOpacity>


            <View style={styles.profileSection}>
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={handleProfilePress}
                activeOpacity={0.8}
              >
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatar}>
                    <Icon name="person" size={40} color="#FFFFFF" />
                  </View>
                )}
                <View style={styles.editIconBadge}>
                  <Icon name="camera" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              
              {/* ✅ USA LOS DATOS REALES DEL USUARIO */}
              <Text style={styles.name}>{user?.name || 'Usuario'}</Text>
              <Text style={styles.email}>{user?.email || 'usuario@ejemplo.com'}</Text>
            </View>
          </View>
        </TouchableOpacity>


        {/* Opciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mi Cuenta</Text>


          <TouchableOpacity 
            style={styles.option}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconContainer, { backgroundColor: '#DBEAFE' }]}>
                <Icon name="person-outline" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.optionText}>Perfil</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>


          <TouchableOpacity 
            style={styles.option}
            onPress={() => navigation.navigate('MyCards')}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconContainer, { backgroundColor: '#EDE9FE' }]}>
                <Icon name="card-outline" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.optionText}>Mis Tarjetas</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>


          <TouchableOpacity 
            style={styles.option}
            onPress={() => navigation.navigate('TravelHistory')}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconContainer, { backgroundColor: '#D1FAE5' }]}>
                <Icon name="time-outline" size={24} color="#10B981" />
              </View>
              <Text style={styles.optionText}>Historial de Viajes</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>


          <TouchableOpacity 
            style={styles.option}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Icon name="notifications-outline" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.optionText}>Notificaciones</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>


          <TouchableOpacity 
            style={styles.option}
            onPress={() => navigation.navigate('Privacy')}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconContainer, { backgroundColor: '#FEE2E2' }]}>
                <Icon name="lock-closed-outline" size={24} color="#EF4444" />
              </View>
              <Text style={styles.optionText}>Privacidad</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>


          <TouchableOpacity 
            style={styles.option}
            onPress={() => navigation.navigate('Help')}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconContainer, { backgroundColor: '#E0E7FF' }]}>
                <Icon name="help-circle-outline" size={24} color="#6366F1" />
              </View>
              <Text style={styles.optionText}>Ayuda</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>


        {/* Botón Cerrar Sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color="#EF4444" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>


      {/* Modales... (sin cambios) */}
      {/* Modal de Opciones de Foto de Perfil */}
      <Modal
        visible={showPhotoOptionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPhotoOptionsModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowPhotoOptionsModal(false)}
        >
          <View style={styles.photoOptionsContainer}>
            <Text style={styles.photoOptionsTitle}>Foto de perfil</Text>
            
            <TouchableOpacity 
              style={styles.photoOption}
              onPress={() => {
                setShowPhotoOptionsModal(false);
                setShowFullProfileImage(true);
              }}
            >
              <Icon name="eye-outline" size={24} color="#3B82F6" />
              <Text style={styles.photoOptionText}>Ver foto</Text>
            </TouchableOpacity>


            <TouchableOpacity 
              style={styles.photoOption}
              onPress={() => {
                setShowPhotoOptionsModal(false);
                pickImage('profile');
              }}
            >
              <Icon name="camera-outline" size={24} color="#3B82F6" />
              <Text style={styles.photoOptionText}>Cambiar foto</Text>
            </TouchableOpacity>


            <TouchableOpacity 
              style={[styles.photoOption, styles.cancelOption]}
              onPress={() => setShowPhotoOptionsModal(false)}
            >
              <Text style={styles.cancelOptionText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>


      {/* Modal de Opciones de Imagen de Fondo */}
      <Modal
        visible={showBackgroundOptionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBackgroundOptionsModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowBackgroundOptionsModal(false)}
        >
          <View style={styles.photoOptionsContainer}>
            <Text style={styles.photoOptionsTitle}>Imagen de fondo</Text>
            
            <TouchableOpacity 
              style={styles.photoOption}
              onPress={() => {
                setShowBackgroundOptionsModal(false);
                setShowFullBackgroundImage(true);
              }}
            >
              <Icon name="eye-outline" size={24} color="#3B82F6" />
              <Text style={styles.photoOptionText}>Ver imagen</Text>
            </TouchableOpacity>


            <TouchableOpacity 
              style={styles.photoOption}
              onPress={() => {
                setShowBackgroundOptionsModal(false);
                pickImage('background');
              }}
            >
              <Icon name="camera-outline" size={24} color="#3B82F6" />
              <Text style={styles.photoOptionText}>Cambiar imagen</Text>
            </TouchableOpacity>


            <TouchableOpacity 
              style={[styles.photoOption, styles.cancelOption]}
              onPress={() => setShowBackgroundOptionsModal(false)}
            >
              <Text style={styles.cancelOptionText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>


      {/* Modal para Ver Foto de Perfil Completa */}
      <Modal
        visible={showFullProfileImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullProfileImage(false)}
      >
        <TouchableOpacity 
          style={styles.fullImageModalBackdrop}
          activeOpacity={1}
          onPress={() => setShowFullProfileImage(false)}
        >
          <View style={styles.fullImageContainer}>
            {profileImage && (
              <Image source={{ uri: profileImage }} style={styles.fullProfileImage} />
            )}
            <TouchableOpacity 
              style={styles.closeFullImageButton}
              onPress={() => setShowFullProfileImage(false)}
            >
              <Icon name="close" size={30} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>


      {/* Modal para Ver Imagen de Fondo Completa */}
      <Modal
        visible={showFullBackgroundImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullBackgroundImage(false)}
      >
        <TouchableOpacity 
          style={styles.fullImageModalBackdrop}
          activeOpacity={1}
          onPress={() => setShowFullBackgroundImage(false)}
        >
          <View style={styles.fullImageContainer}>
            {backgroundImage && (
              <Image source={{ uri: backgroundImage }} style={styles.fullBackgroundImage} />
            )}
            <TouchableOpacity 
              style={styles.closeFullImageButton}
              onPress={() => setShowFullBackgroundImage(false)}
            >
              <Icon name="close" size={30} color="#FFFFFF" />
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
  scrollView: {
    flex: 1,
  },
  header: {
    height: 280,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  backgroundPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#002D72',
    position: 'absolute',
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  editBackgroundButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },

  // Estilos del Modal de Opciones
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  photoOptionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: Platform.OS === 'android' ? 20 : 40,
  },
  photoOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  photoOptionText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
    fontWeight: '500',
  },
  cancelOption: {
    marginTop: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
  },
  cancelOptionText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Estilos para Ver Imagen Completa
  fullImageModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullProfileImage: {
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  fullBackgroundImage: {
    width: '90%',
    height: '50%',
    borderRadius: 20,
  },
  closeFullImageButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
