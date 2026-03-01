"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface Station {
  stationid: number
  code: number
  name: string
  line: string
  address: string | null
  active: boolean
  lat: number | null
  lng: number | null
}

interface InteractiveMapProps {
  stations: Station[]
  onEditStation: (station: Station) => void
  onDeleteStation: (station: Station) => void
  onCreateStation: (lat: number, lng: number) => void
}

export function InteractiveMap({ 
  stations, 
  onEditStation, 
  onDeleteStation,
  onCreateStation 
}: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  const getMarkerColor = (line: string) => {
    if (line.includes("1")) return "#ef4444"
    if (line.includes("2")) return "#3b82f6"
    return "#6b7280"
  }

  useEffect(() => {
    if (mapRef.current) return // Map already initialized

    // Initialize map
    const map = L.map("interactive-map").setView([18.4861, -69.9312], 12)

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Click to create new station
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      if (confirm("¿Deseas crear una nueva estación en esta ubicación?")) {
        onCreateStation(lat, lng)
      }
    })

    mapRef.current = map

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update markers when stations change
  useEffect(() => {
    if (!mapRef.current) return

    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Add new markers
    stations.forEach((station) => {
      if (station.lat && station.lng && mapRef.current) {
        const markerColor = getMarkerColor(station.line)

        // Create custom icon
        const customIcon = L.divIcon({
          html: `<div style="background-color: ${markerColor}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); cursor: pointer;"></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })

        const marker = L.marker([station.lat, station.lng], { icon: customIcon })
          .addTo(mapRef.current)
          .bindPopup(
            `
            <div style="min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <h3 style="font-weight: 600; margin: 0; font-size: 16px; color: #1f2937;">${station.name}</h3>
                <span style="padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; ${
                  station.active 
                    ? 'background: #10b981; color: white;' 
                    : 'background: #9ca3af; color: white;'
                }">
                  ${station.active ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px;">
                <p style="margin: 0; font-size: 13px; color: #4b5563;">
                  <strong style="color: #1f2937;">Código:</strong> ${station.code}
                </p>
                <p style="margin: 0; font-size: 13px; color: #4b5563;">
                  <strong style="color: #1f2937;">Línea:</strong> ${station.line}
                </p>
                ${
                  station.address
                    ? `<p style="margin: 0; font-size: 13px; color: #4b5563;">
                        <strong style="color: #1f2937;">Dirección:</strong> ${station.address}
                      </p>`
                    : ""
                }
                <p style="margin: 0; font-size: 12px; color: #6b7280;">
                  <strong style="color: #1f2937;">Coordenadas:</strong> ${station.lat.toFixed(4)}, ${station.lng.toFixed(4)}
                </p>
              </div>
            <div style="display: flex; gap: 8px; margin-top: 12px;">
              <button 
                onclick="window.editStationFromMap(${station.stationid})" 
                style="flex: 1; padding: 8px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: background 0.2s;"
                onmouseover="this.style.background='#2563eb'"
                onmouseout="this.style.background='#3b82f6'"
                >
                  ✏️ Editar
                </button>
                <button 
                  onclick="window.deleteStationFromMap(${station.stationid})" 
                  style="flex: 1; padding: 8px 12px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: background 0.2s;"
                  onmouseover="this.style.background='#dc2626'"
                  onmouseout="this.style.background='#ef4444'"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          `,
            {
              maxWidth: 300,
              className: "custom-popup",
            }
          )

        markersRef.current.push(marker)
      }
    })
  }, [stations])

  // Setup global functions for popup interactions
  useEffect(() => {
    ;(window as any).editStationFromMap = (stationId: number) => {
      const station = stations.find((s) => s.stationid === stationId)
      if (station) {
        onEditStation(station)
      }
    }

    ;(window as any).deleteStationFromMap = (stationId: number) => {
      const station = stations.find((s) => s.stationid === stationId)
      if (station) {
        onDeleteStation(station)
      }
    }

    return () => {
      delete (window as any).editStationFromMap
      delete (window as any).deleteStationFromMap
    }
  }, [stations, onEditStation, onDeleteStation])

  return (
    <>
      <style>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .leaflet-popup-content {
          margin: 16px;
        }
        .leaflet-popup-tip {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .custom-popup .leaflet-popup-close-button {
          font-size: 20px;
          padding: 8px;
        }
      `}</style>
      <div id="interactive-map" className="w-full h-full" />
    </>
  )
}
