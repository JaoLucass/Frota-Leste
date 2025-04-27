"use client"

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useRef } from "react"

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
const vehicleIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const originIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const destinationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface LiveTrackingProps {
  route: {
    id: string
    nome: string
    origem: string
    destino: string
    pontos: Array<{
      latitude: number
      longitude: number
    }>
  }
  currentPosition: number
  vehicle: {
    heart_rate: number | null
  }
}

// Corrigir o componente LiveTracking para lidar com a propriedade vehicle que pode ser null

export default function LiveTracking({ route, currentPosition, vehicle }: LiveTrackingProps) {
  const mapRef = useRef(null)

  useEffect(() => {
    fixLeafletIcon()
  }, [])

  useEffect(() => {
    // Centralizar o mapa na posição atual do veículo
    if (mapRef.current && route.pontos && route.pontos[currentPosition]) {
      const { latitude, longitude } = route.pontos[currentPosition]
      mapRef.current.setView([latitude, longitude], 15)
    }
  }, [currentPosition, route.pontos])

  // Verificar se há pontos de rota
  if (!route.pontos || route.pontos.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Não há pontos para mostrar a rota.</p>
      </div>
    )
  }

  // Converter pontos para o formato do Leaflet
  const polylinePoints = route.pontos.slice(0, currentPosition + 1).map((ponto) => [ponto.latitude, ponto.longitude])

  // Pegar o primeiro e último pontos para origem e destino
  const origemPonto = [route.pontos[0].latitude, route.pontos[0].longitude]
  const destinoPonto = [route.pontos[route.pontos.length - 1].latitude, route.pontos[route.pontos.length - 1].longitude]

  // Posição atual do veículo
  const currentPoint = [route.pontos[currentPosition].latitude, route.pontos[currentPosition].longitude]

  return (
    <MapContainer
      center={[currentPoint[0], currentPoint[1]]}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Origem */}
      <Marker position={[origemPonto[0], origemPonto[1]]} icon={originIcon}>
        <Popup>
          <div className="p-1">
            <h3 className="font-bold text-blue-700">Origem</h3>
            <p className="text-sm">{route.origem}</p>
          </div>
        </Popup>
      </Marker>

      {/* Destino */}
      <Marker position={[destinoPonto[0], destinoPonto[1]]} icon={destinationIcon}>
        <Popup>
          <div className="p-1">
            <h3 className="font-bold text-red-700">Destino</h3>
            <p className="text-sm">{route.destino}</p>
          </div>
        </Popup>
      </Marker>

      {/* Veículo */}
      <Marker position={[currentPoint[0], currentPoint[1]]} icon={vehicleIcon}>
        <Popup>
          <div className="p-1">
            <h3 className="font-bold text-emerald-700">Veículo em Trânsito</h3>
            <p className="text-sm">
              Posição {currentPosition + 1} de {route.pontos.length}
            </p>
            {vehicle && vehicle.heart_rate && (
              <div className="flex items-center gap-1 mb-1">
                <Heart
                  className={`h-4 w-4 ${
                    checkHeartRateStatus(filterHeartRate(vehicle.heart_rate)).severity === "critical"
                      ? "text-red-500"
                      : checkHeartRateStatus(filterHeartRate(vehicle.heart_rate)).severity === "warning"
                        ? "text-amber-500"
                        : "text-emerald-500"
                  }`}
                />
                <span className="text-sm">
                  Freq. Cardíaca:
                  <span
                    className={`font-medium ${
                      checkHeartRateStatus(filterHeartRate(vehicle.heart_rate)).severity === "critical"
                        ? "text-red-600"
                        : checkHeartRateStatus(filterHeartRate(vehicle.heart_rate)).severity === "warning"
                          ? "text-amber-600"
                          : "text-emerald-600"
                    }`}
                  >
                    {filterHeartRate(vehicle.heart_rate)} bpm
                  </span>
                </span>
              </div>
            )}
          </div>
        </Popup>
      </Marker>

      {/* Linha da rota percorrida */}
      <Polyline positions={polylinePoints} pathOptions={{ color: "green", weight: 4, opacity: 0.7 }} />

      {/* Linha da rota restante */}
      <Polyline
        positions={route.pontos.slice(currentPosition).map((ponto) => [ponto.latitude, ponto.longitude])}
        pathOptions={{ color: "gray", weight: 4, opacity: 0.4, dashArray: "5, 10" }}
      />
    </MapContainer>
  )
}
