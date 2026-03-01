import { Stack } from 'expo-router';
import React from 'react';
import { ActivitiesProvider } from '../context/ActivitiesContext';
import { AuthProvider } from '../context/AuthContext';
import { BiometricProvider } from '../context/BiometricContext';
import { CardsProvider } from '../context/CardsContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <BiometricProvider>
        <CardsProvider>
          <ActivitiesProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
            </Stack>
          </ActivitiesProvider>
        </CardsProvider>
      </BiometricProvider>
    </AuthProvider>
  );
}

