// Try to import from @env, fallback to manual env reading
import { API_URL } from "@env";
let api_variable: string;
try {
  // This will work if @env is properly configured
  api_variable = API_URL;
} catch (error) {
  // Fallback for when @env is not available
  console.warn('Could not load @env, using fallback:', error);
  api_variable = 'https://api.example.com'; // Replace with your actual API URL from .env
}

export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  line?: string; // If your API includes line information
}

// Fallback data for when API is not available
const FALLBACK_STATIONS: Station[] = [
  {
    id: "1",
    name: "Estación Central",
    latitude: 18.4861,
    longitude: -69.9312,
    line: "1"
  },
  {
    id: "2",
    name: "Estación Norte",
    latitude: 18.4961,
    longitude: -69.9312,
    line: "1"
  },
  {
    id: "3",
    name: "Estación Sur",
    latitude: 18.4761,
    longitude: -69.9312,
    line: "1"
  },
  {
    id: "4",
    name: "Estación Este",
    latitude: 18.4861,
    longitude: -69.9212,
    line: "2"
  },
  {
    id: "5",
    name: "Estación Oeste",
    latitude: 18.4861,
    longitude: -69.9412,
    line: "2"
  }
];

export async function getStations(): Promise<Station[]> {
  try {
    console.log('Fetching stations from:', `${api_variable}/stations`);
    const response = await fetch(`${api_variable}/stations`);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.get('content-type'));

    if (!response.ok) {
      throw new Error(`Failed to fetch stations: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response data type:', typeof data);
    console.log('API response is array:', Array.isArray(data));
    console.log('First item keys:', data.length > 0 ? Object.keys(data[0]) : 'No data');

    // Ensure the response matches our expected format
    if (!Array.isArray(data)) {
      throw new Error('API response is not an array');
    }

    // Transform API response to match our expected Station interface
    const transformedStations: Station[] = data.map((station: any) => ({
      id: station.stationid?.toString() || station.id?.toString() || 'unknown',
      name: station.name,
      latitude: station.lat || station.latitude || 0,
      longitude: station.lng || station.longitude || 0,
      line: station.line
    }));

    console.log('Transformed station sample:', transformedStations[0]);
    return transformedStations;
  } catch (error) {
    console.warn('API not available, using fallback data:', error);
    return FALLBACK_STATIONS;
  }
}