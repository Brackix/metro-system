import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function NotificationsScreen({ navigation }: any) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [promotions, setPromotions] = useState(true);
  const [updates, setUpdates] = useState(true);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Canales de Notificación</Text>

        <View style={styles.notificationItem}>
          <View style={styles.notificationLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
              <Icon name="notifications" size={24} color="#3B82F6" />
            </View>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>Notificaciones Push</Text>
              <Text style={styles.notificationSubtitle}>Recibe alertas en tu dispositivo</Text>
            </View>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.notificationLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
              <Icon name="mail" size={24} color="#EF4444" />
            </View>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>Correo Electrónico</Text>
              <Text style={styles.notificationSubtitle}>Recibe actualizaciones por email</Text>
            </View>
          </View>
          <Switch
            value={emailEnabled}
            onValueChange={setEmailEnabled}
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.notificationLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
              <Icon name="chatbubble" size={24} color="#10B981" />
            </View>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>SMS</Text>
              <Text style={styles.notificationSubtitle}>Recibe mensajes de texto</Text>
            </View>
          </View>
          <Switch
            value={smsEnabled}
            onValueChange={setSmsEnabled}
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Preferencias</Text>

        <View style={styles.notificationItem}>
          <View style={styles.notificationLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#EDE9FE' }]}>
              <Icon name="pricetag" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>Promociones</Text>
              <Text style={styles.notificationSubtitle}>Ofertas y descuentos especiales</Text>
            </View>
          </View>
          <Switch
            value={promotions}
            onValueChange={setPromotions}
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.notificationLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Icon name="information-circle" size={24} color="#F59E0B" />
            </View>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>Actualizaciones del Sistema</Text>
              <Text style={styles.notificationSubtitle}>Noticias y cambios importantes</Text>
            </View>
          </View>
          <Switch
            value={updates}
            onValueChange={setUpdates}
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  notificationSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 24,
  },
});
