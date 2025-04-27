"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
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
}

interface MapProps {
  vehicle: Vehicle
}

export default function VehicleMap({ vehicle }: MapProps) {
  useEffect(() => {
    fixLeafletIcon()
  }, [])

  return (
    <MapContainer center={[vehicle.latitude, vehicle.longitude]} zoom={15} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

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

              <div className="flex justify-between text-sm">
                <span className="font-medium">Freq. Cardíaca:</span>
                <span>{vehicle.heart_rate} bpm</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="font-medium">Temperatura:</span>
                <span>{vehicle.temperature.toFixed(1)}°C</span>
              </div>
            </div>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  )
}
