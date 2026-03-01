import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, TextInput } from 'react-native';
import NfcManager, { Ndef, NfcEvents } from 'react-native-nfc-manager';

// Inicializa NFC Manager al arrancar la app
NfcManager.start();

interface Station {
  stationid: number;
  name: string;
}

export default function NfcReader() {
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [tagData, setTagData] = useState<string | null>(null);
  const [textURL, setTextURL] = useState('http://192.168.7.179:4000/api');

  // Encender NFC y registrar listener
  const turnNfcOn = async () => {
    try {
      const isEnabled = await NfcManager.isEnabled();
      if (!isEnabled) {
        Alert.alert('NFC', 'Por favor activa el NFC en tu dispositivo.');
        return;
      }
      setNfcEnabled(true);
      Alert.alert('NFC', 'NFC activado');

      NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: any) => {
        console.log('Tag detected:', tag);
        handleTag(tag);
      });

      await NfcManager.registerTagEvent();
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'No se pudo iniciar NFC');
    }
  };

  const turnNfcOff = async () => {
    try {
      await NfcManager.unregisterTagEvent();
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      setNfcEnabled(false);
      setTagData(null);
      Alert.alert('NFC', 'NFC desactivado');
    } catch (err) {
      console.warn('Error al apagar NFC', err);
    }
  };

  const handleTag = async (tag: any) => {
  try {
    const ndefRecords = tag.ndefMessage || [];
    if (ndefRecords.length > 0) {
      try {
        const nfcuid = tag.id;
          console.log(`💳 Request desde tarjeta (nfcuid: ${nfcuid})`);

          const response = await fetch(`${textURL}/cardusage/registerTap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nfcuid,
              reqType: 'card',
              stationid: 97, // ← Hardcodeado aquí
            })
          });

          const data = await response.json();
          console.log('Response data:', data);
      } catch (err) {
        console.warn('Error en fetch/decoding:', err);
      }
    }
  } catch (err) {
    console.warn('Error fetch/decoding tag:', err);
  } finally {
    NfcManager.setAlertMessageIOS('Tag leído');
  }
};

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Escribe la URL del backend"
        value={textURL}
        onChangeText={setTextURL}
      />

      <Button title="Encender NFC" onPress={turnNfcOn} disabled={nfcEnabled} />
      <Button title="Apagar NFC" onPress={turnNfcOff} disabled={!nfcEnabled} />

      <Text style={styles.info}>
        {nfcEnabled ? 'NFC Activado' : 'NFC Desactivado'}
      </Text>
      <Text style={styles.tag}>
        {tagData ? `Dato recibido:\n${tagData}` : 'Acerca una etiqueta NFC'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  info: { marginTop: 20, fontSize: 18 },
  tag: { marginTop: 10, fontSize: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', width: '80%', padding: 8, marginBottom: 20 },
});
