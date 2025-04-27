"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Car, User, Tag, Calendar } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import dynamic from "next/dynamic"

// Importar o mapa dinamicamente para evitar problemas de SSR
const MapWithNoSSR = dynamic(() => import("@/components/vehicle-map"), {
  ssr: false,
})

export default function DetalhesVeiculo({ params }) {
  const [veiculo, setVeiculo] = useState(null)
  const [motorista, setMotorista] = useState(null)
  const [rfidData, setRfidData] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    const fetchVeiculoData = async () => {
      try {
        // Buscar dados do veículo
        const veiculoRef = ref(database, `vehicles/${id}`)
        const veiculoSnapshot = await get(veiculoRef)

        if (!veiculoSnapshot.exists()) {
          toast({
            variant: "destructive",
            title: "Erro!",
            description: "Veículo não encontrado.",
          })
          router.push("/veiculos")
          return
        }

        const veiculoData = veiculoSnapshot.val()
        setVeiculo({ id, ...veiculoData })

        // Buscar dados do motorista
        if (veiculoData.motorista_id) {
          const motoristaRef = ref(database, `drivers/${veiculoData.motorista_id}`)
          const motoristaSnapshot = await get(motoristaRef)

          if (motoristaSnapshot.exists()) {
            setMotorista(motoristaSnapshot.val())
          }
        }

        // Buscar dados do RFID
        if (veiculoData.rfid_tag) {
          const rfidRef = ref(database, `rfid_tag_info/${veiculoData.rfid_tag}`)
          const rfidSnapshot = await get(rfidRef)

          if (rfidSnapshot.exists()) {
            setRfidData(rfidSnapshot.val())
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        toast({
          variant: "destructive",
          title: "Erro!",
          description: "Falha ao buscar dados do veículo.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVeiculoData()
  }, [id, router])

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
        <h1 className="text-2xl font-bold">Detalhes do Veículo</h1>
        <Button variant="outline" onClick={() => router.push(`/veiculos/editar/${id}`)} className="ml-auto">
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="mr-2 h-5 w-5 text-emerald-500" />
              Informações do Veículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Placa</h3>
              <p className="font-semibold">{veiculo.placa}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Modelo</h3>
              <p>{veiculo.modelo}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Ano</h3>
              <p>{veiculo.ano}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  veiculo.status === "Ativo" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {veiculo.status}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">RFID Tag</h3>
              <p>{veiculo.rfid_tag}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Criado em</h3>
              <p>{new Date(veiculo.createdAt).toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>

        {motorista && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-blue-500" />
                Motorista Associado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nome</h3>
                <p className="font-semibold">{motorista.nome}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">CNH</h3>
                <p>{motorista.cnh}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Telefone</h3>
                <p>{motorista.telefone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    motorista.status === "Ativo" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {motorista.status}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {rfidData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="mr-2 h-5 w-5 text-amber-500" />
                Dados do RFID
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Em Movimento</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    rfidData.is_moving ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {rfidData.is_moving ? "Sim" : "Não"}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Frequência Cardíaca</h3>
                <p>{rfidData.heart_rate} bpm</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Temperatura</h3>
                <p>{rfidData.mpu_temperature.toFixed(1)}°C</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Coordenadas</h3>
                <p>
                  {rfidData.latitude.toFixed(6)}, {rfidData.longitude.toFixed(6)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {rfidData && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-emerald-500" />
              Localização no Mapa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] rounded-lg overflow-hidden border">
              <MapWithNoSSR
                vehicle={{
                  id: id,
                  placa: veiculo.placa,
                  modelo: veiculo.modelo,
                  ano: veiculo.ano,
                  status: veiculo.status,
                  is_moving: rfidData.is_moving,
                  latitude: rfidData.latitude,
                  longitude: rfidData.longitude,
                  heart_rate: rfidData.heart_rate,
                  temperature: rfidData.mpu_temperature,
                  motorista: motorista?.nome || "Não atribuído",
                  motorista_status: motorista?.status || "N/A",
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
