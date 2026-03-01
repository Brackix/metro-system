// src/context/CardsContext.tsx

import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';
import { useAuth } from './AuthContext';

const API_BASE_URL = String(API_URL);

export interface Card {
  cardid: number;
  userid: number;
  nfcuid: string;
  alias: string;
  balance: number;
  status: string;
  lastrecharge?: string;
  lastuse?: string;
}

interface CardsContextType {
  cards: Card[];
  addCard: (alias: string, balance?: number, status?: string) => Promise<void>;
  updateCard: (nfcuid: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (nfcuid: string, targetCardId?: number) => Promise<any>;
  rechargeCard: (
    nfcuid: string, 
    amount: number, 
    paymentmethod: string,
    deviceip?: string,
    devicemodel?: string
  ) => Promise<void>;
  useCard: (nfcuid: string, stationId: string) => Promise<void>;
  loadCards: () => Promise<void>;
  isLoading: boolean;
}

const CardsContext = createContext<CardsContextType | undefined>(undefined);

// Helpers
function authHeaders(token: string | null, contentJson = true): Record<string, string> {
  const h: Record<string, string> = {};
  if (contentJson) h['Content-Type'] = 'application/json';
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('token');
  } catch {
    return null;
  }
}

// Helper: Leer NDEF y extraer { nfcuid, reqType }
async function readNdefTag(): Promise<{ nfcuid: string; reqType: string } | null> {
  try {
    const supported = await NfcManager.isSupported();
    if (!supported) {
      console.log('[readNdefTag] NFC no soportado');
      return null;
    }

    await NfcManager.start();
    
    await NfcManager.requestTechnology(NfcTech.Ndef, {
      alertMessage: 'Acerca tu tarjeta al teléfono',
    });

    const tag = await NfcManager.getTag();
    console.log('[readNdefTag] tag completo:', JSON.stringify(tag, null, 2));

    const ndefRecords = tag?.ndefMessage || [];
    if (ndefRecords.length === 0) {
      console.warn('[readNdefTag] No NDEF records found');
      return null;
    }

    const firstRecord = ndefRecords[0];
    console.log('[readNdefTag] primer record:', JSON.stringify(firstRecord, null, 2));

    const payload = firstRecord.payload;
    
    let decodedText: string;
    
    try {
      const payloadBytes = new Uint8Array(payload);
      decodedText = Ndef.text.decodePayload(payloadBytes);
    } catch (decodeErr) {
      console.warn('[readNdefTag] Error con Ndef.text.decodePayload, intentando decodificación manual');
      
      const languageCodeLength = payload[0] & 0x3F;
      const textBytes = payload.slice(1 + languageCodeLength);
      decodedText = String.fromCharCode.apply(null, textBytes as any);
    }

    console.log('[readNdefTag] decodedText:', decodedText);

    try {
      const parsed = JSON.parse(decodedText);
      const { nfcuid, reqType } = parsed;
      
      if (!nfcuid || !reqType) {
        console.warn('[readNdefTag] JSON sin nfcuid/reqType:', parsed);
        return null;
      }
      
      console.log('[readNdefTag] ✅ Parsed exitosamente:', { nfcuid, reqType });
      return { nfcuid, reqType };
    } catch (jsonErr: any) {
      console.error('[readNdefTag] Payload no es JSON válido:', decodedText);
      console.error('[readNdefTag] JSON error:', jsonErr.message);
      return null;
    }
  } catch (err: any) {
    console.error('[readNdefTag] ❌ Error completo:', err);
    console.error('[readNdefTag] Error message:', err.message);
    return null;
  } finally {
    try {
      await NfcManager.cancelTechnologyRequest();
      if (Platform.OS === 'ios') {
        NfcManager.setAlertMessageIOS('Tag leído exitosamente');
      }
    } catch (cleanupErr) {
      console.warn('[readNdefTag] Error en cleanup:', cleanupErr);
    }
  }
}

// Helper: Leer UID de cualquier tipo de tag NFC
async function readNfcUid(): Promise<string | null> {
  try {
    const supported = await NfcManager.isSupported();
    if (!supported) {
      console.log('[readNfcUid] NFC no soportado');
      throw new Error('Tu dispositivo no soporta NFC');
    }

    await NfcManager.start();

    if (Platform.OS === 'android') {
      const technologies = [
        NfcTech.NfcA,
        NfcTech.IsoDep,
        NfcTech.MifareUltralight,
        NfcTech.MifareClassic,
        NfcTech.NfcB,
        NfcTech.NfcF,
        NfcTech.NfcV,
      ];

      let tag = null;

      for (const tech of technologies) {
        try {
          console.log(`[readNfcUid] Intentando ${tech}...`);
          
          await NfcManager.requestTechnology(tech, {
            alertMessage: 'Acerca tu tarjeta NFC al teléfono',
          });
          
          tag = await NfcManager.getTag();
          console.log(`[readNfcUid] ✅ Conectado con ${tech}`);
          break;
        } catch (techErr: any) {
          console.log(`[readNfcUid] ${tech} no disponible`);
          try {
            await NfcManager.cancelTechnologyRequest();
          } catch {}
          continue;
        }
      }

      if (!tag || !tag.id) {
        throw new Error('No se pudo leer el ID de la tarjeta NFC');
      }

      console.log('[readNfcUid] Tag completo:', JSON.stringify(tag, null, 2));
      
      const uid = tag.id;
      let uidString: string;
      
      if (Array.isArray(uid)) {
        uidString = uid
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join('')
          .toUpperCase();
      } else {
        uidString = String(uid);
      }

      console.log('[readNfcUid] ✅ UID obtenido:', uidString);
      return uidString;
      
    } else {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      
      if (!tag?.id) {
        throw new Error('No se pudo leer el ID de la tarjeta NFC');
      }

      const uidString = Array.isArray(tag.id) 
        ? tag.id.map(byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase()
        : String(tag.id);
        
      console.log('[readNfcUid] ✅ iOS UID:', uidString);
      return uidString;
    }
  } catch (err: any) {
    console.error('[readNfcUid] ❌ Error:', err.message);
    throw err;
  } finally {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch {}
  }
}

export function CardsProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // ✅ Nuevo: forzar refresh
  const { userId } = useAuth();

  const loadCards = async (): Promise<void> => {
    if (!userId) return;
    
    const timestamp = Date.now();
    console.log('🔄 [loadCards] Iniciando carga #' + refreshKey, 'timestamp:', timestamp);
    
    try {
      setIsLoading(true);
      const token = await getToken();
      
      // ✅ Agregar timestamp para evitar caché
      const url = `${API_BASE_URL}/cards/user/${userId}?t=${timestamp}`;
      console.log('🔄 [loadCards] URL:', url);
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          ...authHeaders(token),
          'Cache-Control': 'no-cache, no-store, must-revalidate', // ✅ Forzar no-cache
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });
      
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        console.error('❌ [loadCards] Error HTTP:', res.status, t);
        throw new Error(t || `HTTP ${res.status}`);
      }
      
      const data: Card[] = await res.json();
      console.log('✅ [loadCards] Tarjetas recibidas del servidor:', data.length);
      console.log('📊 [loadCards] Datos completos:', JSON.stringify(data, null, 2));
      
      // ✅ Forzar actualización creando un nuevo array
      setCards([...data]);
      
      console.log('✅ [loadCards] Estado actualizado');
    } catch (error) {
      console.error('❌ [loadCards] Error:', error);
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      console.log('🎯 [useEffect] Cargando tarjetas inicial...');
      loadCards();
    }
  }, [userId, refreshKey]); // ✅ Añadir refreshKey como dependencia

  const addCard = async (
    alias: string, 
    balance: number = 0, 
    status: string = 'active'
  ): Promise<void> => {
    if (!userId) throw new Error('Usuario no autenticado');

    try {
      console.log('[addCard] 📖 Leyendo UID de la tarjeta NFC...');
      const nfcuid = await readNfcUid();
      
      if (!nfcuid) {
        throw new Error('No se pudo obtener el ID de la tarjeta');
      }

      console.log(`[addCard] ✅ UID leído: ${nfcuid}`);

      console.log('[addCard] 💾 Creando tarjeta en el servidor...');
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/cards`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ 
          userid: userId, 
          nfcuid, 
          alias,
          balance,
          status
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Error del servidor (${res.status}): ${errText}`);
      }

      const newCard: Card = await res.json();
      
      console.log('[addCard] ✅ Tarjeta creada exitosamente:', newCard);
      
      setCards((prev: Card[]) => [...prev, newCard]);
      
    } catch (error: any) {
      console.error('[addCard] ❌ Error:', error.message);
      throw error;
    }
  };

  const updateCard = async (nfcuid: string, updates: Partial<Card>): Promise<void> => {
    const token = await getToken();
    const res = await fetch(`${API_BASE_URL}/cards/${encodeURIComponent(nfcuid)}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(updates),
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (result as any)?.error || 'Error al actualizar tarjeta';
      throw new Error(msg);
    }

    setCards((prev: Card[]) =>
      prev.map(card => (card.nfcuid === nfcuid ? { ...card, ...result } as Card : card))
    );
  };

  const deleteCard = async (nfcuid: string, targetCardId?: number): Promise<any> => {
    const token = await getToken();

    if (targetCardId && targetCardId > 0) {
      const res = await fetch(`${API_BASE_URL}/cards/delete-with-transfer`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          cardIdToDelete: cards.find(c => c.nfcuid === nfcuid)?.cardid,
          targetCardId,
        }),
      });

      const text = await res.text().catch(() => '');
      if (!res.ok) throw new Error(text || 'Error al transferir/eliminar');
      
      // ✅ Forzar refresh
      setRefreshKey(prev => prev + 1);
      
      return text ? JSON.parse(text) : {};
    } else {
      const res = await fetch(`${API_BASE_URL}/cards/${encodeURIComponent(nfcuid)}`, {
        method: 'DELETE',
        headers: authHeaders(token, false),
      });

      const text = await res.text().catch(() => '');
      if (!res.ok) throw new Error(text || 'Error al eliminar tarjeta');
      
      // ✅ Forzar refresh
      setRefreshKey(prev => prev + 1);
      
      return text ? JSON.parse(text) : {};
    }
  };

  const rechargeCard = async (
    nfcuid: string, 
    amount: number,
    paymentmethod: string,
    deviceip?: string,
    devicemodel?: string
  ): Promise<void> => {
    console.log('💰 [rechargeCard] Recargando tarjeta:', nfcuid, 'monto:', amount);
    
    const token = await getToken();
    
    const res = await fetch(`${API_BASE_URL}/cards/${encodeURIComponent(nfcuid)}/recharge`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ 
        amount,
        paymentmethod,
        deviceip,
        devicemodel
      }),
    });

    const result = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      const msg = (result as any)?.error || 'Error al recargar tarjeta';
      throw new Error(msg);
    }

    console.log('✅ [rechargeCard] Recarga exitosa, forzando refresh...');
    
    // ✅ Forzar refresh completo
    setRefreshKey(prev => prev + 1);
  };

  const useCard = async (nfcuid: string, stationId: string): Promise<void> => {
    try {
      console.log('🎫 [useCard] === INICIO ===');
      console.log('🎫 [useCard] nfcuid:', nfcuid);
      console.log('🎫 [useCard] stationId:', stationId);

      const token = await getToken();
      console.log('🎫 [useCard] Token:', token ? 'presente' : 'ausente');
      
      const url = `${API_BASE_URL}/cards/${encodeURIComponent(nfcuid)}/use`;
      console.log('🎫 [useCard] URL completa:', url);
      
      const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ stationId, amount: 20 }),
      });

      console.log('🎫 [useCard] Status:', res.status);
      
      const resultText = await res.text();
      console.log('🎫 [useCard] Response text:', resultText);
      
      let result;
      try {
        result = JSON.parse(resultText);
      } catch {
        result = {};
      }

      if (!res.ok) {
        const msg = result?.error || 'Error al usar tarjeta';
        console.error('❌ [useCard] Error del servidor:', msg);
        throw new Error(msg);
      }

      console.log('✅ [useCard] Respuesta exitosa:', result);
      console.log('🔄 [useCard] Forzando refresh completo...');
      
      // ✅ Forzar refresh incrementando el key
      setRefreshKey(prev => prev + 1);
      
      console.log('✅ [useCard] === FIN ===');
    } catch (error: any) {
      console.error('❌ [useCard] Error capturado:', error.message);
      throw error;
    }
  };

  return (
    <CardsContext.Provider
      value={{
        cards,
        addCard,
        updateCard,
        deleteCard,
        rechargeCard,
        useCard,
        loadCards,
        isLoading,
      }}
    >
      {children}
    </CardsContext.Provider>
  );
}

export function useCards() {
  const context = useContext(CardsContext);
  if (!context) throw new Error('useCards debe usarse dentro de CardsProvider');
  return context;
}
