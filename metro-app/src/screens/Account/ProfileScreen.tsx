import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen({ navigation }: any) {
  const { user, updateProfile } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSaveChanges = async () => {
    if (!firstName.trim() || !email.trim()) {
      Alert.alert('Error', 'El nombre y el correo son obligatorios');
      return;
    }

    try {
      setIsLoading(true);
      
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      
      await updateProfile(fullName, email.trim(), phone.trim());
      
      Alert.alert('¡Éxito!', 'Perfil actualizado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Nombres</Text>
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Tus nombres"
              editable={!isLoading}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Apellidos</Text>
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Tus apellidos"
              editable={!isLoading}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={styles.inputContainer}>
            <Icon name="mail-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Teléfono</Text>
          <View style={styles.inputContainer}>
            <Icon name="call-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 (809) 555-1234"
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSaveChanges}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 24, 
    paddingTop: 60, 
    paddingBottom: 20, 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB' 
  },
  backButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#F3F4F6', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  section: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    borderWidth: 1, 
    borderColor: '#E5E7EB' 
  },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#111827' },
  saveButton: { 
    backgroundColor: '#3B82F6', 
    borderRadius: 12, 
    padding: 16, 
    alignItems: 'center', 
    marginTop: 24 
  },
  saveButtonDisabled: { backgroundColor: '#9CA3AF' },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
