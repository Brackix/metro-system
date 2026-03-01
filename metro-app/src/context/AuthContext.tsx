import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useState } from 'react';

const API_BASE_URL = String(API_URL);
var UserID = 0;

interface User {
  userId: string;
  email: string;
  name: string;
  phone?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userId: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, email: string, phone: string) => Promise<void>;
  isLoading: boolean;
}

console.log('API_URL:', API_BASE_URL);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // ✅ Cambiado a false

  // ❌ ELIMINADO: useEffect con checkStoredAuth - NO hay auto-login

  const login = async (identifier: string, password: string): Promise<void> => {
    try {
      console.log('🔵 Iniciando login...');
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();
      
      console.log('📦 RESPUESTA COMPLETA DEL BACKEND:', JSON.stringify(data, null, 2));

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Email/usuario o contraseña incorrectos');
      }

      if (!data.user?.userid) {
        console.error('❌ ERROR: No se recibió userid del backend');
        throw new Error('No user ID received from server');
      }

      const userId = data.user.userid.toString();
      console.log('✅ userId (variable):', userId);
      UserID = Number(userId);

      const userData: User = {
        userId: userId,
        email: data.user.email,
        name: `${data.user.firstname} ${data.user.lastname}`,
        phone: data.user.phone,
      };

      console.log('✅ userData completo:', userData);

      // ✅ Guardar email para autocompletado (pero NO sesión activa)
      await AsyncStorage.setItem('@lastEmail', identifier);

      setUser(userData);
      setUserId(userId);
      setIsAuthenticated(true);

      console.log('✅ Login exitoso');
    } catch (error: any) {
      console.error('❌ Error en login:', error.message);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<void> => {
    try {
      const nameParts = name.trim().split(' ');
      const firstname = nameParts[0];
      const lastname = nameParts.slice(1).join(' ') || '';
      const username = email.split('@')[0];

      console.log('🔵 Iniciando registro...');
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username,
          firstname, 
          lastname, 
          email, 
          phone: phone || '',
          passwordhash: password
        }),
      });

      const data = await response.json();
      
      console.log('📦 RESPUESTA DEL REGISTRO:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }

      if (!data.userid) {
        throw new Error('No user ID received from server');
      }

      const userId = data.userid.toString();
      
      const userData: User = {
        userId: userId,
        email: data.email,
        name: `${data.firstname} ${data.lastname}`.trim(),
        phone: data.phone,
      };

      await AsyncStorage.setItem('@lastEmail', email);
      
      setUser(userData);
      setUserId(userId);
      setIsAuthenticated(true);
      UserID = Number(userId);

      console.log('✅ Registro exitoso:', userData);
    } catch (error: any) {
      console.error('❌ Error en registro:', error.message);
      throw error;
    }
  };

  const updateProfile = async (name: string, email: string, phone: string): Promise<void> => {
    try {
      if (!userId) throw new Error('No user ID found');

      const nameParts = name.trim().split(' ');
      const firstname = nameParts[0];
      const lastname = nameParts.slice(1).join(' ') || '';

      console.log('🔄 Actualizando perfil:', { userId, firstname, lastname, email, phone });

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstname, lastname, email, phone }),
      });

      const textResponse = await response.text();
      let data;

      try {
        data = JSON.parse(textResponse);
      } catch (parseError) {
        throw new Error(`El servidor respondió con HTML en vez de JSON. Status: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar perfil');
      }

      const updatedUser: User = {
        userId: data.userid?.toString() || userId,
        email: data.email || email,
        name: `${data.firstname} ${data.lastname}`.trim(),
        phone: data.phone || phone,
      };

      setUser(updatedUser);
      console.log('✅ Perfil actualizado:', updatedUser);
    } catch (error: any) {
      console.error('❌ Error al actualizar perfil:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // ✅ Limpiar sesión Y credenciales de huella (pero mantener @lastEmail)
      await AsyncStorage.multiRemove([
        '@fingerprintEnabled',
        'fingerprint_identifier',
        'fingerprint_password'
      ]);
      
      setUser(null);
      setUserId(null);
      setIsAuthenticated(false);
      
      console.log('✅ Sesión cerrada (email guardado para autocompletado)');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      userId, 
      login, 
      register, 
      logout, 
      updateProfile, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
