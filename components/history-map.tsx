"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
// Adicionar o import do filtro de Kalman
import { filterHeartRate, checkHeartRateStatus } from "@/lib/kalman-filter"
import { Heart } from "lucide-react"

// Corrigir os ícones do Leaflet
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  })
}

// Ícones personalizados
const startIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const endIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Componente para ajustar o centro e zoom do mapa
function MapBoundsAdjuster({ history }) {
  const map = useMap()

  useEffect(() => {
    if (history.length > 0) {
      const points = history.map((point) => [point.latitude, point.longitude])
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [history, map])

  return null
}

interface HistoryMapProps {
  history: Array<{
    id: string
    timestamp: number
    latitude: number
    longitude: number
    is_moving: boolean
    speed?: number
    heart_rate?: number
  }>
  vehiclePlaca: string
}

export default function HistoryMap({ history, vehiclePlaca }: HistoryMapProps) {
  useEffect(() => {
    fixLeafletIcon()
  }, [])

  // Centro padrão (Boa Vista, RR)
  const defaultCenter = [2.836625333, -60.691402333]

  // Preparar pontos para a polyline
  const routePoints = history.map((point) => [point.latitude, point.longitude])

  // Obter primeiro e último ponto
  const firstPoint = history[0]
  const lastPoint = history[history.length - 1]

  return (
    <MapContainer center={defaultCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBoundsAdjuster history={history} />

      {/* Linha do trajeto */}
      <Polyline positions={routePoints} pathOptions={{ color: "blue", weight: 4, opacity: 0.7 }} />

      {/* Marcador de início */}
      <Marker position={[firstPoint.latitude, firstPoint.longitude]} icon={startIcon}>
        <Popup>
          <div className="p-1">
            <h3 className="font-bold text-emerald-700">Início do Trajeto</h3>
            <p className="text-sm">Veículo: {vehiclePlaca}</p>
            <p className="text-sm">{new Date(firstPoint.timestamp).toLocaleString("pt-BR")}</p>
          </div>
        </Popup>
      </Marker>

      {/* Marcador de fim */}
      <Marker position={[lastPoint.latitude, lastPoint.longitude]} icon={endIcon}>
        <Popup>
          <div className="p-1">
            <h3 className="font-bold text-red-700">Fim do Trajeto</h3>
            <p className="text-sm">Veículo: {vehiclePlaca}</p>
            <p className="text-sm">{new Date(lastPoint.timestamp).toLocaleString("pt-BR")}</p>
          </div>
        </Popup>
      </Marker>

      {/* Pontos intermediários (opcional) */}
      {history.slice(1, -1).map((point, index) => (
        <Marker key={index} position={[point.latitude, point.longitude]} opacity={0.7}>
          <Popup>
            <div className="p-1">
              <h3 className="font-bold">Ponto de Passagem</h3>
              <p className="text-sm">Veículo: {vehiclePlaca}</p>
              <p className="text-sm">{new Date(point.timestamp).toLocaleString("pt-BR")}</p>
              <p className="text-sm">Velocidade: {point.speed || 0} km/h</p>
              <p className="text-sm">Status: {point.is_moving ? "Em movimento" : "Parado"}</p>
              {point.heart_rate && (
                <div className="flex items-center gap-1 text-sm">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>
                    Freq. Cardíaca:
                    {(() => {
                      const filteredHeartRate = filterHeartRate(point.heart_rate)
                      const status = checkHeartRateStatus(filteredHeartRate)
                      return (
                        <span
                          className={
                            status.severity === "critical"
                              ? "text-red-600 font-bold"
                              : status.severity === "warning"
                                ? "text-amber-600 font-bold"
                                : "text-gray-700"
                          }
                        >
                          {filteredHeartRate} bpm
                        </span>
                      )
                    })()}
                  </span>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
