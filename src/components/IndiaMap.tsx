import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { useEffect } from "react"
import L from "leaflet"
import type { Disaster } from "../data/disasters"
import "leaflet/dist/leaflet.css"

const DISASTERS_META: Record<string, {
  lat: number
  lon: number
  color: string
}> = {
  "kurnool-2024": { lat: 15.83, lon: 78.04, color: "#3B82F6" },
  "wayanad-2025": { lat: 11.62, lon: 76.13, color: "#8B5CF6" },
  "assam-kamrup-2026": { lat: 26.18, lon: 91.74, color: "#22C55E" },
  "assam-cachar-2026": { lat: 24.82, lon: 92.79, color: "#EF4444" },
  "assam-dhubri-2026": { lat: 26.02, lon: 89.98, color: "#F59E0B" },
  "odisha-kendrapara-2024": { lat: 20.5, lon: 86.42, color: "#0EA5E9" },
  "sikkim-mangan-2025": { lat: 27.51, lon: 88.53, color: "#A855F7" },
  "bihar-gaya-2026": { lat: 24.8, lon: 85.0, color: "#F97316" },
  "tamil-nadu-cuddalore-2025": { lat: 11.75, lon: 79.76, color: "#14B8A6" },
  "maharashtra-kolhapur-2026": { lat: 16.7, lon: 74.24, color: "#EC4899" },
  "gujarat-kutch-2026": { lat: 23.73, lon: 68.72, color: "#EAB308" },
  "uttarakhand-rudraprayag-2025": { lat: 30.28, lon: 78.98, color: "#6366F1" },
}

// Custom marker icon creator
function createMarkerIcon(color: string, size: number = 30) {
  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      "></div>
    `,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

interface MapControlProps {
  activeId?: string
}

function MapControl({ activeId }: MapControlProps) {
  const map = useMap()

  useEffect(() => {
    if (activeId && DISASTERS_META[activeId]) {
      const meta = DISASTERS_META[activeId]
      map.flyTo([meta.lat, meta.lon], 8, {
        duration: 1.5,
      })
    }
  }, [activeId, map])

  return null
}

interface IndiaMapProps {
  disasters: Disaster[]
  activeId?: string
  onSelect?: (id: string) => void
  height?: number
}

export default function IndiaMap({
  disasters,
  activeId,
  onSelect,
  height = 480,
}: IndiaMapProps) {
  // India center coordinates
  const indiaCenter: [number, number] = [20.5937, 78.9629]
  const initialZoom = 5

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-gray-200"
      style={{ height: `${height}px`, width: "100%" }}
    >
      <MapContainer
        center={indiaCenter}
        zoom={initialZoom}
        style={{ height: "100%", width: "100%" }}
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Disaster markers */}
        {disasters.map((d) => {
          const meta = DISASTERS_META[d.id]
          if (!meta) return null

          const critical =
            d.distribution.find((r) => r.label.startsWith("Critical"))?.count ??
            0
          const isActive = d.id === activeId

          return (
            <Marker
              key={d.id}
              position={[meta.lat, meta.lon]}
              icon={createMarkerIcon(meta.color, isActive ? 40 : 30)}
              eventHandlers={{
                click: () => onSelect?.(d.id),
              }}
            >
              <Popup className="disaster-popup">
                <div className="text-sm">
                  <div className="font-bold mb-1">{d.shortName}</div>
                  <div className="text-xs space-y-1">
                    <div>Year: {d.year}</div>
                    <div>
                      Affected: {d.totalAffected.toLocaleString("en-IN")} HH
                    </div>
                    <div>Critical: {critical.toLocaleString("en-IN")}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Map control for flyTo active disaster */}
        <MapControl activeId={activeId} />
      </MapContainer>
    </div>
  )
}
