// src/models/station.model.ts
export interface Station {
  stationid: number;
  code: string;
  name: string;
  line: string;
  address: string | null;
  active: boolean | null;
  lat: number | null;
  lng: number | null;
}