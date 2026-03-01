import { API_URL } from '@env';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivitiesProvider } from './src/context/ActivitiesContext';
import { AuthProvider } from './src/context/AuthContext';
import { BiometricProvider } from './src/context/BiometricContext';
import { CardsProvider } from './src/context/CardsContext';
import RootNavigator from './src/navigation/RootNavigator';

console.log('✅ API_URL:', API_URL);
console.log('✅ Tipo:', typeof API_URL);

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BiometricProvider>
          <CardsProvider>
            <ActivitiesProvider>
              <NavigationContainer>
                <StatusBar barStyle="dark-content" />
                <RootNavigator />
              </NavigationContainer>
            </ActivitiesProvider>
          </CardsProvider>
        </BiometricProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
