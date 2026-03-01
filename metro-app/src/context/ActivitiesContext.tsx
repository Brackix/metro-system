import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

export interface Activity {
  id: string;
  userId: string;
  type: 'trip' | 'recharge';
  title: string;
  subtitle: string;
  date: string;
  amount: number;
  icon: string;
  iconBg: string;
  iconColor: string;
  cardId?: string;
  stationId?: string;
}

interface ActivitiesContextType {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'userId'>) => Promise<void>;
  loadActivities: () => Promise<void>;
  clearActivities: () => void;
  isLoading: boolean;
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

// Using environment variable from @env
const API_BASE_URL = String(API_URL);

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useAuth();

  // ✅ Comentado para evitar errores automáticos
  // Descoméntalo cuando tengas el backend de actividades funcionando
  // useEffect(() => {
  //   if (userId) {
  //     loadActivities();
  //   }
  // }, [userId]);

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem('@token');
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  };

  const loadActivities = async () => {
    console.log('🔍 1. Iniciando loadActivities...');
    console.log('🔍 2. userId:', userId);
    
    if (!userId) {
      console.log('❌ NO HAY userId - loadActivities se detiene');
      return;
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      
      const response = await fetch(`${API_BASE_URL}/activities/user/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      console.log('🔍 Respuesta - Status:', response.status);

      const data = await response.json();
      console.log('🔍 Data:', data);

      if (response.ok) {
        setActivities(data);
        console.log('✅ Actividades cargadas:', data.length);
      } else {
        console.log('⚠️ Respuesta NO OK, actividades vacías');
        setActivities([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar actividades:', error);
      // ✅ NO rompe la app - solo deja el array vacío
      setActivities([]);
    } finally {
      setIsLoading(false);
      console.log('🔍 loadActivities finalizado');
    }
  };

  const addActivity = async (activityData: Omit<Activity, 'id' | 'userId'>) => {
    if (!userId) {
      console.log('⚠️ No hay userId, no se puede agregar actividad');
      return;
    }

    // ✅ Crear actividad localmente primero
    const newActivity: Activity = {
      id: Date.now().toString(),
      userId: userId,
      ...activityData,
    };

    // ✅ Actualizar el estado inmediatamente (funciona sin backend)
    setActivities([newActivity, ...activities]);
    console.log('✅ Actividad agregada localmente:', newActivity.type);

    // ✅ Intentar guardar en backend (opcional)
    try {
      const token = await getToken();
      
      const response = await fetch(`${API_BASE_URL}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(newActivity),
      });

      if (response.ok) {
        const savedActivity = await response.json();
        console.log('✅ Actividad guardada en backend:', savedActivity.id);
        
        // Actualizar con el ID del servidor si es diferente
        setActivities(prev => prev.map(a => 
          a.id === newActivity.id ? savedActivity : a
        ));
      } else {
        console.log('⚠️ No se pudo guardar en backend, pero está guardada localmente');
      }
    } catch (error: any) {
      console.log('⚠️ Error al guardar en backend:', error.message);
      // ✅ NO lanza el error - la actividad ya está guardada localmente
    }
  };

  const clearActivities = () => {
    setActivities([]);
    console.log('✅ Actividades limpiadas');
  };

  return (
    <ActivitiesContext.Provider value={{ 
      activities, 
      addActivity, 
      loadActivities, 
      clearActivities, 
      isLoading 
    }}>
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities() {
  const context = useContext(ActivitiesContext);
  if (!context) {
    throw new Error('useActivities debe usarse dentro de ActivitiesProvider');
  }
  return context;
}
