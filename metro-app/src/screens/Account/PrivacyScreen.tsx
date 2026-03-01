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

export default function PrivacyScreen({ navigation }: any) {
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [advertisingEnabled, setAdvertisingEnabled] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacidad</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Permisos</Text>

        <View style={styles.privacyItem}>
          <View style={styles.privacyLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
              <Icon name="location" size={24} color="#3B82F6" />
            </View>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyTitle}>Ubicación</Text>
              <Text style={styles.privacySubtitle}>Permite acceso a tu ubicación</Text>
            </View>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.privacyItem}>
          <View style={styles.privacyLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#EDE9FE' }]}>
              <Icon name="analytics" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyTitle}>Análisis de Datos</Text>
              <Text style={styles.privacySubtitle}>Ayuda a mejorar la app</Text>
            </View>
          </View>
          <Switch
            value={analyticsEnabled}
            onValueChange={setAnalyticsEnabled}
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.privacyItem}>
          <View style={styles.privacyLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Icon name="megaphone" size={24} color="#F59E0B" />
            </View>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyTitle}>Publicidad Personalizada</Text>
              <Text style={styles.privacySubtitle}>Anuncios basados en tus intereses</Text>
            </View>
          </View>
          <Switch
            value={advertisingEnabled}
            onValueChange={setAdvertisingEnabled}
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Documentos</Text>

        <TouchableOpacity style={styles.documentItem}>
          <View style={styles.documentLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
              <Icon name="document-text" size={24} color="#10B981" />
            </View>
            <Text style={styles.documentText}>Términos y Condiciones</Text>
          </View>
          <Icon name="chevron-forward" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.documentItem}>
          <View style={styles.documentLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
              <Icon name="shield-checkmark" size={24} color="#EF4444" />
            </View>
            <Text style={styles.documentText}>Política de Privacidad</Text>
          </View>
          <Icon name="chevron-forward" size={24} color="#9CA3AF" />
        </TouchableOpacity>

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
  privacyItem: {
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
  privacyLeft: {
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
  privacyInfo: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  privacySubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 24,
  },
  documentItem: {
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
  documentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});
