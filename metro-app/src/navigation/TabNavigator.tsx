import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/Home/HomeScreen';
import NavigateScreen from '../screens/Navigate/NavigateScreen';
import PassScreen from '../screens/Passcreen/PassScreen';
import AccountNavigator from './AccountNavigator';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#002D72",
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
          elevation: 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: "rgba(255,255,255,0.5)",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          
          if (route.name === 'Inicio') iconName = 'home-outline';
          else if (route.name === 'Tarjeta') iconName = 'card-outline';
          else if (route.name === 'Navegar') iconName = 'navigate-outline';
          else if (route.name === 'Cuenta') iconName = 'person-outline';
          
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Tarjeta" component={PassScreen} />
      <Tab.Screen name="Navegar" component={NavigateScreen} />
      <Tab.Screen name="Cuenta" component={AccountNavigator} />
    </Tab.Navigator>
  );
}
