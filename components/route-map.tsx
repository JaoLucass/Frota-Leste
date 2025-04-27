"use client"

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect } from "react"

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
const originIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
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

interface MapProps {
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
}

export default function RouteMap({ route }: MapProps) {
  useEffect(() => {
    fixLeafletIcon()
  }, [])

  // Verificar se há pontos de rota
  if (!route.pontos || route.pontos.length < 2) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Não há pontos suficientes para mostrar a rota.</p>
      </div>
    )
  }

  // Converter pontos para o formato do Leaflet
  const polylinePoints = route.pontos.map((ponto) => [ponto.latitude, ponto.longitude])

  // Pegar o primeiro e último pontos para origem e destino
  const origemPonto = polylinePoints[0]
  const destinoPonto = polylinePoints[polylinePoints.length - 1]

  return (
    <MapContainer center={[origemPonto[0], origemPonto[1]]} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Origem */}
      <Marker position={[origemPonto[0], origemPonto[1]]} icon={originIcon}>
        <Popup>
          <div className="p-1">
            <h3 className="font-bold text-emerald-700">Origem</h3>
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

      {/* Linha da rota */}
      <Polyline positions={polylinePoints} pathOptions={{ color: "blue", weight: 4, opacity: 0.7 }} />
    </MapContainer>
  )
}
