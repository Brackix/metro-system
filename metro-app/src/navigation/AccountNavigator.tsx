import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AccountScreen from '../screens/Account/AccountScreen';
import HelpScreen from '../screens/Account/HelpScreen';
import MyCardsScreen from '../screens/Account/MyCardsScreen';
import NotificationsScreen from '../screens/Account/NotificationsScreen';
import PrivacyScreen from '../screens/Account/PrivacyScreen';
import ProfileScreen from '../screens/Account/ProfileScreen';
import TravelHistoryScreen from '../screens/Account/TravelHistoryScreen';

const Stack = createNativeStackNavigator();

export default function AccountNavigator() {
  return (

    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AccountMain" component={AccountScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="MyCards" component={MyCardsScreen} />
      <Stack.Screen name="TravelHistory" component={TravelHistoryScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
    </Stack.Navigator>
  );
}
