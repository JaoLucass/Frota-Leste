"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, get, push, set } from "firebase/database"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, MapPin } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import dynamic from "next/dynamic"

// Importar o mapa dinamicamente para evitar problemas de SSR
const RouteMapSelectorWithNoSSR = dynamic(() => import("@/components/route-map-selector"), {
  ssr: false,
})

export default function NovaRota() {
  const [formData, setFormData] = useState({
    nome: "",
    origem: "",
    destino: "",
    veiculoId: "",
  })
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [routePoints, setRoutePoints] = useState([])
  const [distance, setDistance] = useState(0)
  const [duration, setDuration] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const vehiclesRef = ref(database, "vehicles")
        const snapshot = await get(vehiclesRef)

        if (snapshot.exists()) {
          const vehiclesData = snapshot.val()
          const vehiclesList = Object.entries(vehiclesData).map(([id, vehicle]) => ({
            id,
            ...vehicle,
          }))
          setVehicles(vehiclesList)
        }
      } catch (error) {
        console.error("Erro ao buscar veículos:", error)
        toast({
          variant: "destructive",
          title: "Erro!",
          description: "Falha ao buscar veículos.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRouteChange = (points, calculatedDistance, calculatedDuration) => {
    setRoutePoints(points)
    setDistance(calculatedDistance)
    setDuration(calculatedDuration)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (routePoints.length < 2) {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Por favor, selecione origem e destino no mapa.",
      })
      return
    }

    setSaving(true)

    try {
      const rotasRef = ref(database, "routes")
      const newRotaRef = push(rotasRef)

      await set(newRotaRef, {
        ...formData,
        distancia: `${distance.toFixed(1)} km`,
        duracao: `${Math.round(duration)} min`,
        status: "Ativa",
        pontos: routePoints,
        createdAt: Date.now(),
      })

      toast({
        title: "Sucesso!",
        description: "Rota adicionada com sucesso.",
      })

      router.push("/rotas")
    } catch (error) {
      console.error("Erro ao adicionar rota:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao adicionar a rota.",
      })
    } finally {
      setSaving(false)
    }
  }

  const selectedVehicle = vehicles.find((v) => v.id === formData.veiculoId)
  const vehicleRfidTag = selectedVehicle?.rfid_tag

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Nova Rota</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Rota</Label>
            <Input
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Entrega de Medicamentos"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="veiculoId">Veículo</Label>
            <Select value={formData.veiculoId} onValueChange={(value) => handleSelectChange("veiculoId", value)}>
              <SelectTrigger id="veiculoId">
                <SelectValue placeholder="Selecione um veículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.placa} - {vehicle.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="origem">Origem</Label>
            <Input
              id="origem"
              name="origem"
              value={formData.origem}
              onChange={handleChange}
              placeholder="Ex: Hospital Central"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destino">Destino</Label>
            <Input
              id="destino"
              name="destino"
              value={formData.destino}
              onChange={handleChange}
              placeholder="Ex: Hospital Regional Norte"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Selecione no Mapa
            </Label>
            {distance > 0 && (
              <div className="text-sm text-gray-500">
                Distância: <span className="font-medium">{distance.toFixed(1)} km</span> • Tempo estimado:{" "}
                <span className="font-medium">{Math.round(duration)} min</span>
              </div>
            )}
          </div>
          <div className="h-[400px] rounded-lg overflow-hidden border">
            <RouteMapSelectorWithNoSSR vehicleRfidTag={vehicleRfidTag} onRouteChange={handleRouteChange} />
          </div>
          <p className="text-xs text-gray-500">
            Clique no mapa para definir a origem e o destino da rota. O primeiro clique define a origem e o segundo o
            destino.
          </p>
        </div>

        <Button
          type="submit"
          disabled={saving || routePoints.length < 2}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Rota
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
