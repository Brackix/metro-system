import React from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function HelpScreen({ navigation }: any) {
  const faqs = [
    {
      id: '1',
      question: '¿Cómo recargar mi tarjeta?',
      answer: 'Puedes recargar en cualquier estación del metro o desde la app.',
    },
    {
      id: '2',
      question: '¿Cuánto cuesta el pasaje?',
      answer: 'El pasaje del metro cuesta DOP 20 por viaje.',
    },
    {
      id: '3',
      question: '¿Cómo reportar una tarjeta perdida?',
      answer: 'Contacta al servicio al cliente al 809-123-4567.',
    },
  ];

  const contactOptions = [
    {
      icon: 'call',
      title: 'Teléfono',
      subtitle: '809-123-4567',
      color: '#3B82F6',
      bg: '#DBEAFE',
      action: () => Linking.openURL('tel:8091234567'),
    },
    {
      icon: 'mail',
      title: 'Correo',
      subtitle: 'ayuda@metroapp.do',
      color: '#EF4444',
      bg: '#FEE2E2',
      action: () => Linking.openURL('mailto:ayuda@metroapp.do'),
    },
    {
      icon: 'chatbubbles',
      title: 'Chat en Vivo',
      subtitle: 'Disponible 24/7',
      color: '#10B981',
      bg: '#D1FAE5',
      action: () => {},
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayuda</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Contáctanos</Text>

        {contactOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.contactItem}
            onPress={option.action}
          >
            <View style={[styles.contactIcon, { backgroundColor: option.bg }]}>
              <Icon name={option.icon} size={24} color={option.color} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>{option.title}</Text>
              <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>

        {faqs.map((faq) => (
          <View key={faq.id} style={styles.faqItem}>
            <View style={styles.faqHeader}>
              <Icon name="help-circle" size={20} color="#3B82F6" />
              <Text style={styles.faqQuestion}>{faq.question}</Text>
            </View>
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          </View>
        ))}

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
  contactItem: {
    flexDirection: 'row',
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
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 24,
  },
  faqItem: {
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
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
});
