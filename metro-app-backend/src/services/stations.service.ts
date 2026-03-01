import prisma from "../config/prisma";
import { Station } from "../models/station.model";


function createCardCode(name: string, line: string): string {
  const normalize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  const initials = normalize(name)
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word[0]!.toUpperCase())
    .join("");
  const lineNumberMatch = line.match(/\d+/);
  const lineNumber = lineNumberMatch ? lineNumberMatch[0] : "0";

  // 3. Create a hash from the full normalized name for uniqueness
  const normalizedName = normalize(name).replace(/\s+/g, "").toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalizedName.length; i++) {
    hash = ((hash << 5) - hash) + normalizedName.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  const uniqueCode = Math.abs(hash).toString().slice(0, 3).padStart(3, "0");

  // 4. Combine: initials + line + hash
  return `${initials}${lineNumber}${uniqueCode}`;
}

/***
 * Get all stations
 */
export async function readStations(): Promise<Station[]> {
  return await prisma.stations.findMany();
}

/***
 * Create station
 */
export async function createStation(
   
  name: string, 
  line: string, 
  address: string | null, 
  lat: number | null, 
  lng: number | null
): Promise<Station> {
  return await prisma.stations.create({
    data: {
      code: createCardCode(name, line),
      name,
      line,
      address,
      lat,
      lng,
    },
  });
}

/***
 * Update station by ID
 */
export async function updateStation(
  stationid: number,
  data: Partial<Omit<Station, 'stationid'>>
): Promise<Station> {
  return await prisma.stations.update({
    where: { stationid },
    data,
  });
}

/***
 * Delete station by ID
 */
export async function deleteStation(stationid: number): Promise<Station> {
  return await prisma.stations.delete({
    where: { stationid },
  });
}

/***
 * Read single station by ID
 */
export async function readStationById(stationid: number): Promise<Station | null> {
  return await prisma.stations.findUnique({
    where: { stationid },
  });
}

/**
 * Search stations by name, code, or line (case-insensitive).
 */
export async function searchStations(query: string): Promise<Station[]> {
  return await prisma.stations.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { code: { contains: query, mode: 'insensitive' } },
        { line: { contains: query, mode: 'insensitive' } }
      ]
    }
  });
}