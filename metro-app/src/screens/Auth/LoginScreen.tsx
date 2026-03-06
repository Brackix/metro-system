import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { useBiometric } from '../../context/BiometricContext';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const {
    isFingerprintAvailable,
    isFingerprintEnabled,
    loginWithFingerprint,
    enableFingerprintLogin,
    isCheckingFingerprint
  } = useBiometric();

  // ✅ Cargar último email usado al iniciar
  useEffect(() => {
    loadLastEmail();
  }, []);

  const loadLastEmail = async () => {
    try {
      const lastEmail = await AsyncStorage.getItem('@lastEmail');
      if (lastEmail) {
        setEmail(lastEmail);
        console.log('✅ Email autocompletado:', lastEmail);
      }
    } catch (error) {
      console.error('❌ Error al cargar email:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);

      // ✅ Solo preguntar si NO tiene huella habilitada
      if (isFingerprintAvailable && !isFingerprintEnabled) {
        Alert.alert(
          'Habilitar Huella Digital',
          '¿Quieres usar tu huella para futuros inicios de sesión?',
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Sí',
              onPress: async () => {
                try {
                  await enableFingerprintLogin(email, password);
                  Alert.alert('¡Listo!', 'Ahora puedes usar tu huella para iniciar sesión');
                } catch (error: any) {
                  Alert.alert('Error', error.message);
                }
              }
            }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert('Próximamente', 'Esta función estará disponible pronto');
  };

  const handleBiometric = async () => {
    if (!isFingerprintAvailable) {
      Alert.alert('No disponible', 'Tu dispositivo no soporta autenticación con huella digital');
      return;
    }

    if (!isFingerprintEnabled) {
      Alert.alert(
        'Huella no configurada',
        'Primero debes iniciar sesión con tu email y contraseña para habilitar el login con huella'
      );
      return;
    }

    try {
      await loginWithFingerprint();
    } catch (error: any) {
      if (error.message !== 'Autenticación con huella cancelada') {
        Alert.alert('Error', error.message || 'No se pudo autenticar con huella');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ImageBackground
          source={require('../../assets/images/MetroFondo.jpg')}
          style={styles.header}
          imageStyle={styles.headerImage}
        >
          <View style={styles.headerOverlay}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/MontaoRD.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </ImageBackground>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading && !isCheckingFingerprint}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!isLoading && !isCheckingFingerprint}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading || isCheckingFingerprint}
            >
              <Icon
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={24}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* ✅ Botón de huella solo si está habilitada */}
          {isFingerprintAvailable && isFingerprintEnabled && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometric}
              disabled={isLoading || isCheckingFingerprint}
            >
              <Icon
                name="finger-print"
                size={24}
                color="#3B82F6"
              />
              <Text style={[styles.biometricText, { color: '#3B82F6' }]}>
                {isCheckingFingerprint ? 'Verificando huella...' : 'Usar huella'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.loginButton,
              (isLoading || isCheckingFingerprint) && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={isLoading || isCheckingFingerprint}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>O</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={isLoading || isCheckingFingerprint}
          >
            <Text style={styles.googleButtonText}>G  Continuar con Google</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              disabled={isLoading || isCheckingFingerprint}
            >
              <Text style={styles.registerLink}>Crear cuenta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1 },
  header: { height: 280, width: '100%' },
  headerImage: { resizeMode: 'cover' },
  headerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center' },
  logoImage: { width: 600, height: 250, tintColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 5 },
  formContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 32, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 8 },
  inputContainer: { marginBottom: 16, position: 'relative' },
  input: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#E5E7EB' },
  eyeIcon: { position: 'absolute', right: 16, top: 16 },
  biometricButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, marginBottom: 16 },
  biometricText: { fontSize: 16, marginLeft: 8 },
  loginButton: { backgroundColor: '#3B82F6', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 24 },
  loginButtonDisabled: { backgroundColor: '#9CA3AF' },
  loginButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  divider: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 16, color: '#9CA3AF', fontSize: 14 },
  googleButton: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 24 },
  googleButtonText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontSize: 14, color: '#6B7280' },
  registerLink: { fontSize: 14, color: '#3B82F6', fontWeight: '600' },
});
