"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { database } from "@/lib/firebase"
import { ref, get, update } from "firebase/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import dynamic from "next/dynamic"

// Importar o mapa dinamicamente para evitar problemas de SSR
const RouteMapSelector = dynamic(() => import("@/components/route-map-selector"), {
  ssr: false,
})

export default function EditarRota({ params }) {
  const [rota, setRota] = useState({
    nome: "",
    origem: "",
    destino: "",
    distancia: "",
    duracao: "",
    status: "Ativa",
    veiculoId: "",
    pontos: [],
    createdAt: Date.now(),
  })
  const [veiculos, setVeiculos] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar dados da rota
        const rotaRef = ref(database, `routes/${id}`)
        const rotaSnapshot = await get(rotaRef)

        if (rotaSnapshot.exists()) {
          const rotaData = rotaSnapshot.val()
          setRota({
            nome: rotaData.nome || "",
            origem: rotaData.origem || "",
            destino: rotaData.destino || "",
            distancia: rotaData.distancia || "",
            duracao: rotaData.duracao || "",
            status: rotaData.status || "Ativa",
            veiculoId: rotaData.veiculoId || "",
            pontos: rotaData.pontos || [],
            createdAt: rotaData.createdAt || Date.now(),
          })
        } else {
          toast({
            variant: "destructive",
            title: "Erro!",
            description: "Rota não encontrada.",
          })
          router.push("/rotas")
          return
        }

        // Buscar veículos disponíveis
        const veiculosRef = ref(database, "vehicles")
        const veiculosSnapshot = await get(veiculosRef)

        if (veiculosSnapshot.exists()) {
          const veiculosData = veiculosSnapshot.val()
          const veiculosList = Object.entries(veiculosData).map(([id, data]) => ({
            id,
            ...data,
          }))
          setVeiculos(veiculosList)
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        toast({
          variant: "destructive",
          title: "Erro!",
          description: "Falha ao buscar dados.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setRota((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setRota((prev) => ({ ...prev, [name]: value }))
  }

  const handlePointsChange = (pontos) => {
    setRota((prev) => ({ ...prev, pontos }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Calcular distância e duração com base nos pontos
      if (rota.pontos.length >= 2) {
        // Cálculo simplificado de distância (em linha reta)
        let distanciaTotal = 0
        for (let i = 0; i < rota.pontos.length - 1; i++) {
          const p1 = rota.pontos[i]
          const p2 = rota.pontos[i + 1]
          const dist = calcularDistancia(p1.latitude, p1.longitude, p2.latitude, p2.longitude)
          distanciaTotal += dist
        }

        // Estimar duração (assumindo velocidade média de 40 km/h)
        const duracaoEstimada = Math.round((distanciaTotal / 40) * 60)

        setRota((prev) => ({
          ...prev,
          distancia: `${distanciaTotal.toFixed(1)} km`,
          duracao: `${duracaoEstimada} min`,
        }))

        // Atualizar rota no banco de dados
        const rotaRef = ref(database, `routes/${id}`)
        await update(rotaRef, {
          ...rota,
          distancia: `${distanciaTotal.toFixed(1)} km`,
          duracao: `${duracaoEstimada} min`,
          updatedAt: Date.now(),
        })
      } else {
        // Atualizar rota no banco de dados sem recalcular distância/duração
        const rotaRef = ref(database, `routes/${id}`)
        await update(rotaRef, {
          ...rota,
          updatedAt: Date.now(),
        })
      }

      toast({
        title: "Sucesso!",
        description: "Rota atualizada com sucesso.",
      })
      router.push(`/rotas/${id}`)
    } catch (error) {
      console.error("Erro ao salvar rota:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao atualizar rota.",
      })
    } finally {
      setSaving(false)
    }
  }

  // Função para calcular distância entre dois pontos (fórmula de Haversine)
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c
    return d
  }

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
        <h1 className="text-2xl font-bold">Editar Rota</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Rota</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Rota</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={rota.nome}
                  onChange={handleInputChange}
                  placeholder="Ex: Rota Hospitalar Norte"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origem">Origem</Label>
                <Input
                  id="origem"
                  name="origem"
                  value={rota.origem}
                  onChange={handleInputChange}
                  placeholder="Ex: Hospital Central"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destino">Destino</Label>
                <Input
                  id="destino"
                  name="destino"
                  value={rota.destino}
                  onChange={handleInputChange}
                  placeholder="Ex: Hospital Regional Norte"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  value={rota.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativa">Ativa</SelectItem>
                    <SelectItem value="Inativa">Inativa</SelectItem>
                    <SelectItem value="Em manutenção">Em manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="veiculoId">Veículo</Label>
                <Select
                  name="veiculoId"
                  value={rota.veiculoId}
                  onValueChange={(value) => handleSelectChange("veiculoId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {veiculos.map((veiculo) => (
                      <SelectItem key={veiculo.id} value={veiculo.id}>
                        {veiculo.placa} - {veiculo.modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Definir Pontos da Rota</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] rounded-lg overflow-hidden border mb-4">
                <RouteMapSelector pontos={rota.pontos} onChange={handlePointsChange} />
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Clique no mapa para adicionar pontos. Arraste os marcadores para ajustar a posição. A distância e
                duração serão calculadas automaticamente.
              </p>
              <div className="flex justify-between text-sm">
                <span>Pontos adicionados: {rota.pontos.length}</span>
                <span>
                  {rota.distancia && rota.duracao
                    ? `${rota.distancia} / ${rota.duracao}`
                    : "Adicione pontos para calcular"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
