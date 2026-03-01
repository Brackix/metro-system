// components/LineaMetro.tsx
import React from "react";
import { Polyline } from "react-native-maps";

type Estacion = {
  id: string;
  nombre: string;
  lat: number;
  lon: number;
};

type Props = {
  estaciones: Estacion[];
  color: string;
  width?: number;
};

export const LineaMetro = ({ estaciones, color, width = 3 }: Props) => {
  const coordinates = estaciones.map(e => ({
    latitude: e.lat,
    longitude: e.lon,
  }));

  return (
    <Polyline
      coordinates={coordinates}
      strokeColor={color}
      strokeWidth={width}
    />
  );
};
