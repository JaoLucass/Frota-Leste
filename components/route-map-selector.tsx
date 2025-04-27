"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"

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

const vehicleIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Componente para capturar cliques no mapa
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: onMapClick,
  })
  return null
}

// Função para calcular a distância entre dois pontos (em km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Função para calcular o tempo estimado (em minutos)
function calculateDuration(distance) {
  // Assumindo uma velocidade média de 40 km/h em ambiente urbano
  const averageSpeed = 40 // km/h
  return (distance / averageSpeed) * 60 // Converter para minutos
}

// Função para gerar pontos intermediários entre origem e destino
function generateIntermediatePoints(origin, destination, numPoints = 5) {
  const points = []
  points.push(origin)

  for (let i = 1; i < numPoints - 1; i++) {
    const ratio = i / numPoints
    const lat = origin.latitude + (destination.latitude - origin.latitude) * ratio
    const lng = origin.longitude + (destination.longitude - origin.longitude) * ratio

    // Adicionar uma pequena variação para simular uma rota real
    const latVariation = (Math.random() - 0.5) * 0.002
    const lngVariation = (Math.random() - 0.5) * 0.002

    points.push({
      latitude: lat + latVariation,
      longitude: lng + lngVariation,
    })
  }

  points.push(destination)
  return points
}

interface RouteMapSelectorProps {
  vehicleRfidTag?: string
  onRouteChange?: (points: any[], distance: number, duration: number) => void
}

export default function RouteMapSelector({ vehicleRfidTag, onRouteChange }: RouteMapSelectorProps) {
  const [origin, setOrigin] = useState(null)
  const [destination, setDestination] = useState(null)
  const [routePoints, setRoutePoints] = useState([])
  const [distance, setDistance] = useState(0)
  const [duration, setDuration] = useState(0)
  const [vehiclePosition, setVehiclePosition] = useState(null)
  const mapRef = useRef(null)

  useEffect(() => {
    fixLeafletIcon()
  }, [])

  // Buscar a posição do veículo se o RFID tag for fornecido
  useEffect(() => {
    if (!vehicleRfidTag) {
      setVehiclePosition(null)
      return
    }

    const rfidRef = ref(database, `rfid_tag_info/${vehicleRfidTag}`)
    const unsubscribe = onValue(rfidRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        setVehiclePosition({
          latitude: data.latitude,
          longitude: data.longitude,
        })

        // Se tivermos a posição do veículo e não tivermos uma origem, use a posição do veículo como origem
        if (!origin) {
          setOrigin({
            latitude: data.latitude,
            longitude: data.longitude,
          })
        }

        // Centralizar o mapa na posição do veículo
        if (mapRef.current && !origin && !destination) {
          mapRef.current.setView([data.latitude, data.longitude], 13)
        }
      }
    })

    return () => unsubscribe()
  }, [vehicleRfidTag, origin])

  // Calcular a rota quando origem e destino são definidos
  useEffect(() => {
    if (origin && destination) {
      // Calcular a distância direta
      const dist = calculateDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude)

      // Calcular o tempo estimado
      const dur = calculateDuration(dist)

      // Gerar pontos intermediários para simular uma rota
      const points = generateIntermediatePoints(origin, destination)

      setRoutePoints(points)
      setDistance(dist)
      setDuration(dur)

      // Notificar o componente pai sobre a mudança na rota
      if (onRouteChange) {
        onRouteChange(points, dist, dur)
      }
    }
  }, [origin, destination, onRouteChange])

  const handleMapClick = useCallback(
    (e) => {
      const { lat, lng } = e.latlng

      if (!origin) {
        setOrigin({ latitude: lat, longitude: lng })
      } else if (!destination) {
        setDestination({ latitude: lat, longitude: lng })
      } else {
        // Resetar e começar uma nova rota
        setOrigin({ latitude: lat, longitude: lng })
        setDestination(null)
        setRoutePoints([])
        setDistance(0)
        setDuration(0)
      }
    },
    [origin, destination],
  )

  // Converter pontos para o formato do Leaflet
  const polylinePoints = routePoints.map((point) => [point.latitude, point.longitude])

  // Centro inicial do mapa (Boa Vista, RR como padrão)
  const defaultCenter = [2.836625333, -60.691402333]

  return (
    <MapContainer
      center={vehiclePosition ? [vehiclePosition.latitude, vehiclePosition.longitude] : defaultCenter}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onMapClick={handleMapClick} />

      {vehiclePosition && (
        <Marker position={[vehiclePosition.latitude, vehiclePosition.longitude]} icon={vehicleIcon}>
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-blue-700">Veículo</h3>
              <p className="text-sm">Posição atual</p>
            </div>
          </Popup>
        </Marker>
      )}

      {origin && (
        <Marker position={[origin.latitude, origin.longitude]} icon={originIcon}>
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-emerald-700">Origem</h3>
              <p className="text-sm">Ponto de partida</p>
            </div>
          </Popup>
        </Marker>
      )}

      {destination && (
        <Marker position={[destination.latitude, destination.longitude]} icon={destinationIcon}>
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-red-700">Destino</h3>
              <p className="text-sm">Ponto de chegada</p>
            </div>
          </Popup>
        </Marker>
      )}

      {routePoints.length > 1 && (
        <Polyline positions={polylinePoints} pathOptions={{ color: "blue", weight: 4, opacity: 0.7 }} />
      )}
    </MapContainer>
  )
}
