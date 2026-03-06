import { API_URL } from '@env';

export interface OmsaStop {
  stopid: number;
  code: string;
  name: string;
  corridor: string | null;
  address: string;
  active: boolean;
  lat: number | null;
  lng: number | null;
}

export async function getOmsaStops(): Promise<OmsaStop[]> {
  try {
    console.log(`🔍 Fetching OMSA stops from: ${API_URL}/omsastops`);
    
    const response = await fetch(`${API_URL}/omsastops`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ OMSA stops received: ${data.length} paradas`);
    
    // Filtrar solo las activas y con coordenadas
    const validStops = data.filter((stop: OmsaStop) => 
      stop.active && stop.lat !== null && stop.lng !== null
    );
    
    console.log(`✅ Valid OMSA stops: ${validStops.length} paradas`);
    return validStops;
  } catch (error) {
    console.error('❌ Error fetching OMSA stops:', error);
    throw error;
  }
}

export async function searchOmsaStops(query: string): Promise<OmsaStop[]> {
  try {
    const response = await fetch(`${API_URL}/omsastops/search?q=${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching OMSA stops:', error);
    throw error;
  }
}
