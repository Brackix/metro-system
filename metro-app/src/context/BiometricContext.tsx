import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';

interface BiometricContextType {
  isFingerprintAvailable: boolean;
  isFingerprintEnabled: boolean;
  isCheckingFingerprint: boolean;
  checkFingerprintAvailability: () => Promise<boolean>;
  enableFingerprintLogin: (identifier: string, password: string) => Promise<void>;
  disableFingerprintLogin: () => Promise<void>;
  loginWithFingerprint: () => Promise<void>;
}

const BiometricContext = createContext<BiometricContextType | undefined>(undefined);

export function BiometricProvider({ children }: { children: ReactNode }) {
  const [isFingerprintAvailable, setIsFingerprintAvailable] = useState(false);
  const [isFingerprintEnabled, setIsFingerprintEnabled] = useState(false);
  const [isCheckingFingerprint, setIsCheckingFingerprint] = useState(false);
  
  const { login } = useAuth();

  useEffect(() => {
    initializeFingerprint();
  }, []);

  const initializeFingerprint = async () => {
    try {
      await checkFingerprintAvailability();
      await checkFingerprintSettings();
    } catch (error) {
      console.error('❌ Error en inicialización de huella:', error);
    }
  };

  const checkFingerprintAvailability = async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      
      if (!hasHardware) {
        console.log('ℹ️ Este dispositivo no tiene hardware biométrico');
        setIsFingerprintAvailable(false);
        return false;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!isEnrolled) {
        console.log('ℹ️ No hay biometría registrada en el dispositivo');
        setIsFingerprintAvailable(false);
        return false;
      }

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      const hasFingerprintSupport = types.includes(
        LocalAuthentication.AuthenticationType.FINGERPRINT
      );

      if (!hasFingerprintSupport) {
        console.log('ℹ️ Este dispositivo no soporta huella digital');
        setIsFingerprintAvailable(false);
        return false;
      }

      setIsFingerprintAvailable(true);
      console.log('✅ Huella digital disponible');
      
      return true;
    } catch (error) {
      console.error('❌ Error al verificar huella:', error);
      setIsFingerprintAvailable(false);
      return false;
    }
  };

  const checkFingerprintSettings = async () => {
    try {
      const fingerprintEnabled = await AsyncStorage.getItem('@fingerprintEnabled');
      setIsFingerprintEnabled(fingerprintEnabled === 'true');
      
      if (fingerprintEnabled === 'true') {
        console.log('✅ Huella habilitada para este usuario');
      }
    } catch (error) {
      console.error('❌ Error al verificar configuración de huella:', error);
    }
  };

  const enableFingerprintLogin = async (identifier: string, password: string): Promise<void> => {
    try {
      if (!isFingerprintAvailable) {
        throw new Error('La huella digital no está disponible en este dispositivo');
      }

      console.log('🔵 Habilitando login con huella...');

      // Guardar credenciales de forma segura
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await SecureStore.setItemAsync('fingerprint_identifier', identifier);
        await SecureStore.setItemAsync('fingerprint_password', password);
      } else {
        await AsyncStorage.setItem('@fingerprint_identifier', identifier);
        await AsyncStorage.setItem('@fingerprint_password', password);
      }
      
      await AsyncStorage.setItem('@fingerprintEnabled', 'true');

      setIsFingerprintEnabled(true);
      console.log('✅ Login con huella habilitado correctamente');
    } catch (error: any) {
      console.error('❌ Error al habilitar huella:', error.message);
      throw error;
    }
  };

  const disableFingerprintLogin = async (): Promise<void> => {
    try {
      console.log('🔵 Deshabilitando login con huella...');

      // Limpiar credenciales guardadas
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await SecureStore.deleteItemAsync('fingerprint_identifier');
        await SecureStore.deleteItemAsync('fingerprint_password');
      } else {
        await AsyncStorage.multiRemove(['@fingerprint_identifier', '@fingerprint_password']);
      }
      
      await AsyncStorage.removeItem('@fingerprintEnabled');

      setIsFingerprintEnabled(false);
      console.log('✅ Login con huella deshabilitado');
    } catch (error: any) {
      console.error('❌ Error al deshabilitar huella:', error.message);
      throw error;
    }
  };

  const loginWithFingerprint = async (): Promise<void> => {
    try {
      setIsCheckingFingerprint(true);

      if (!isFingerprintAvailable) {
        throw new Error('La huella digital no está disponible');
      }

      if (!isFingerprintEnabled) {
        throw new Error('El login con huella no está habilitado');
      }

      console.log('🔵 Iniciando autenticación con huella...');

      const options: LocalAuthentication.LocalAuthenticationOptions = {
        promptMessage: 'Usa tu huella para iniciar sesión',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: true,
        fallbackLabel: '',
      };

      const result = await LocalAuthentication.authenticateAsync(options);

      if (!result.success) {
        // Manejo de errores según tipos válidos
        if (result.error === 'user_cancel' || result.error === 'system_cancel' || result.error === 'app_cancel') {
          throw new Error('Autenticación con huella cancelada');
        } else if (result.error === 'not_available') {
          throw new Error('Autenticación biométrica no disponible');
        } else if (result.error === 'not_enrolled') {
          throw new Error('No hay huellas registradas en el dispositivo');
        } else if (result.error === 'passcode_not_set') {
          throw new Error('No hay contraseña configurada en el dispositivo');
        } else if (result.error === 'authentication_failed') {
          throw new Error('Huella no reconocida. Intenta de nuevo.');
        } else if (result.error === 'unknown') {
          throw new Error('Biometría deshabilitada. Demasiados intentos fallidos.');
        } else {
          throw new Error('Error en autenticación con huella');
        }
      }

      console.log('✅ Autenticación con huella exitosa');

      // Recuperar credenciales guardadas
      let identifier: string | null = null;
      let password: string | null = null;

      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        identifier = await SecureStore.getItemAsync('fingerprint_identifier');
        password = await SecureStore.getItemAsync('fingerprint_password');
      } else {
        identifier = await AsyncStorage.getItem('@fingerprint_identifier');
        password = await AsyncStorage.getItem('@fingerprint_password');
      }

      if (!identifier || !password) {
        console.error('❌ No se encontraron credenciales guardadas');
        throw new Error('No se encontraron credenciales guardadas. Por favor, inicia sesión nuevamente.');
      }

      // Hacer login con las credenciales guardadas
      await login(identifier, password);

      console.log('✅ Login con huella completado exitosamente');
    } catch (error: any) {
      console.error('❌ Error en login con huella:', error.message);
      throw error;
    } finally {
      setIsCheckingFingerprint(false);
    }
  };

  return (
    <BiometricContext.Provider value={{ 
      isFingerprintAvailable,
      isFingerprintEnabled,
      isCheckingFingerprint,
      checkFingerprintAvailability,
      enableFingerprintLogin,
      disableFingerprintLogin,
      loginWithFingerprint
    }}>
      {children}
    </BiometricContext.Provider>
  );
}

export function useBiometric() {
  const context = useContext(BiometricContext);
  if (!context) {
    throw new Error('useBiometric debe usarse dentro de BiometricProvider');
  }
  return context;
}
