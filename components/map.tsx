"use client"

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect } from "react"
import { Heart } from "lucide-react"

// Adicionar o import do filtro de Kalman
import { filterHeartRate, checkHeartRateStatus } from "@/lib/kalman-filter"

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
const createCustomIcon = (isMoving: boolean) => {
  return new L.Icon({
    iconUrl: isMoving
      ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
      : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

const destinationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface Vehicle {
  id: string
  placa: string
  modelo: string
  ano: string
  status: string
  is_moving: boolean
  latitude: number
  longitude: number
  heart_rate: number
  temperature: number
  motorista: string
  motorista_status: string
  activeRoute?: {
    id: string
    nome: string
    destino: string
    pontos: Array<{
      latitude: number
      longitude: number
    }>
  }
}

interface MapProps {
  vehicles: Vehicle[]
}

export default function Map({ vehicles }: MapProps) {
  useEffect(() => {
    fixLeafletIcon()
  }, [])

  // Centralizar o mapa na média das coordenadas dos veículos
  const center = vehicles.length > 0 ? [vehicles[0].latitude, vehicles[0].longitude] : [2.836625333, -60.691402333]

  return (
    <MapContainer center={[center[0], center[1]]} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {vehicles.map((vehicle) => (
        <div key={vehicle.id}>
          <Marker position={[vehicle.latitude, vehicle.longitude]} icon={createCustomIcon(vehicle.is_moving)}>
            <Popup className="custom-popup">
              <div className="p-1">
                <h3 className="font-bold text-emerald-700">{vehicle.placa}</h3>
                <p className="text-sm">
                  {vehicle.modelo} ({vehicle.ano})
                </p>

                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Motorista:</span>
                    <span>{vehicle.motorista}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Status:</span>
                    <span className={vehicle.is_moving ? "text-emerald-600" : "text-gray-600"}>
                      {vehicle.is_moving ? "Em movimento" : "Parado"}
                    </span>
                  </div>

                  {vehicle.heart_rate && (
                    <div className="flex items-center gap-1 text-sm">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>
                        Freq. Cardíaca:
                        {(() => {
                          const filteredHeartRate = filterHeartRate(vehicle.heart_rate)
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

                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Temperatura:</span>
                    <span>{vehicle.temperature.toFixed(1)}°C</span>
                  </div>

                  {vehicle.activeRoute && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Rota Ativa:</span>
                      <span className="text-emerald-600">{vehicle.activeRoute.nome}</span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Exibir rota ativa se existir */}
          {vehicle.activeRoute && (
            <>
              {/* Linha da rota */}
              <Polyline
                positions={vehicle.activeRoute.pontos.map((p) => [p.latitude, p.longitude])}
                pathOptions={{ color: "blue", weight: 3, opacity: 0.7 }}
              />

              {/* Marcador de destino */}
              <Marker
                position={[
                  vehicle.activeRoute.pontos[vehicle.activeRoute.pontos.length - 1].latitude,
                  vehicle.activeRoute.pontos[vehicle.activeRoute.pontos.length - 1].longitude,
                ]}
                icon={destinationIcon}
              >
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-red-700">Destino</h3>
                    <p className="text-sm">{vehicle.activeRoute.destino}</p>
                  </div>
                </Popup>
              </Marker>
            </>
          )}
        </div>
      ))}
    </MapContainer>
  )
}
