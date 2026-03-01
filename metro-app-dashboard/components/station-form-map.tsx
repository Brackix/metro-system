"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface StationFormMapProps {
  lat: number
  lng: number
  onLocationChange: (lat: number, lng: number) => void
}

export function StationFormMap({ lat, lng, onLocationChange }: StationFormMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (mapRef.current) return // Map already initialized

    // Initialize map
    const map = L.map("station-form-map").setView([lat, lng], 13)

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Create custom draggable marker icon
    const customIcon = L.divIcon({
      className: "custom-form-marker",
      html: `<div style="background-color: #10b981; width: 32px; height: 32px; border-radius: 50%; border: 4px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4); cursor: move;"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })

    // Add draggable marker
    const marker = L.marker([lat, lng], {
      icon: customIcon,
      draggable: true,
    }).addTo(map)

    // Update coordinates when marker is dragged
    marker.on("dragend", (e: L.DragEndEvent) => {
      const position = (e.target as L.Marker).getLatLng()
      onLocationChange(position.lat, position.lng)
    })

    // Allow clicking on map to move marker
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat: newLat, lng: newLng } = e.latlng
      marker.setLatLng([newLat, newLng])
      onLocationChange(newLat, newLng)
    })

    mapRef.current = map
    markerRef.current = marker

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  // Update marker position when coordinates change externally
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([lat, lng])
      mapRef.current.setView([lat, lng], mapRef.current.getZoom())
    }
  }, [lat, lng])

  return (
    <>
      <style>{`
        .custom-form-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          z-index: 1;
        }
      `}</style>
      <div id="station-form-map" className="w-full h-full rounded-md" />
    </>
  )
}
