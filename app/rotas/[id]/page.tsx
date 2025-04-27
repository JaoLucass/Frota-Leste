"use client"

import { useState, useEffect, useRef } from "react"
import { database } from "@/lib/firebase"
import { ref, get, onValue } from "firebase/database"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, MapPin, Car, Clock, Route, Play, Pause, RotateCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

// Importar o componente EndTripDialog
import { EndTripDialog } from "@/components/end-trip-dialog"

// Importar o mapa dinamicamente para evitar problemas de SSR
const MapWithNoSSR = dynamic(() => import("@/components/route-map"), {
  ssr: false,
})

// Componente para simular o rastreamento em tempo real
const LiveTracking = dynamic(() => import("@/components/live-tracking"), {
  ssr: false,
})

export default function DetalhesRota({ params }) {
  const [rota, setRota] = useState(null)
  const [veiculo, setVeiculo] = useState(null)
  const [rfidData, setRfidData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [simulationActive, setSimulationActive] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [routeProgress, setRouteProgress] = useState(0)
  const simulationRef = useRef(null)
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    // Modificar a função fetchRotaData para lidar melhor com rotas não encontradas
    // e adicionar a rota com ID -OOIuDQy4plJvCSDnHL5

    const fetchRotaData = async () => {
      try {
        // Simular busca de dados da rota
        const rotasSimuladas = {
          route1: {
            nome: "Rota Hospitalar Norte",
            origem: "Hospital Central",
            destino: "Hospital Regional Norte",
            distancia: "12.5 km",
            duracao: "25 min",
            status: "Ativa",
            veiculoId: "-OOIuDQy4plJvCSDnHLF",
            pontos: [
              { latitude: 2.836625333, longitude: -60.691402333 },
              { latitude: 2.840625333, longitude: -60.686402333 },
              { latitude: 2.844625333, longitude: -60.681402333 },
              { latitude: 2.848625333, longitude: -60.676402333 },
              { latitude: 2.852625333, longitude: -60.671402333 },
              { latitude: 2.856625333, longitude: -60.671402333 },
            ],
            createdAt: 1745164494862,
          },
          route2: {
            nome: "Transporte de Equipamentos",
            origem: "Almoxarifado Central",
            destino: "Hospital São Lucas",
            distancia: "8.2 km",
            duracao: "15 min",
            status: "Ativa",
            veiculoId: "-OOIuDQy4plJvCSDnHL1",
            pontos: [
              { latitude: 2.836625333, longitude: -60.691402333 },
              { latitude: 2.832625333, longitude: -60.686402333 },
              { latitude: 2.828625333, longitude: -60.681402333 },
              { latitude: 2.824625333, longitude: -60.676402333 },
              { latitude: 2.820625333, longitude: -60.671402333 },
              { latitude: 2.816625333, longitude: -60.671402333 },
            ],
            createdAt: 1745164494862,
          },
          route3: {
            nome: "Rota Emergencial Sul",
            origem: "Hospital Regional Sul",
            destino: "Centro de Trauma",
            distancia: "5.7 km",
            duracao: "10 min",
            status: "Inativa",
            veiculoId: "-OOIuDQy4plJvCSDnHLF",
            pontos: [
              { latitude: 2.836625333, longitude: -60.691402333 },
              { latitude: 2.836625333, longitude: -60.686402333 },
              { latitude: 2.836625333, longitude: -60.681402333 },
              { latitude: 2.836625333, longitude: -60.676402333 },
              { latitude: 2.836625333, longitude: -60.671402333 },
            ],
            createdAt: 1745164494862,
          },
          "-OOIuDQy4plJvCSDnHL5": {
            nome: "Rota de Transferência de Pacientes",
            origem: "Hospital Municipal",
            destino: "Hospital Especializado",
            distancia: "15.3 km",
            duracao: "30 min",
            status: "Ativa",
            veiculoId: "-OOIuDQy4plJvCSDnHLF",
            pontos: [
              { latitude: 2.836625333, longitude: -60.691402333 },
              { latitude: 2.846625333, longitude: -60.681402333 },
              { latitude: 2.856625333, longitude: -60.671402333 },
              { latitude: 2.866625333, longitude: -60.661402333 },
              { latitude: 2.876625333, longitude: -60.651402333 },
            ],
            createdAt: 1745164494862,
          },
        }

        // Tentar obter a rota pelo ID
        let rotaData = rotasSimuladas[id]

        // Se não encontrar pelo ID direto, verificar se é um dos IDs simulados
        if (!rotaData) {
          // Verificar se o ID está no formato -OOIuDQy4plJvCSDnHL5
          if (id.startsWith("-")) {
            // Tentar encontrar a rota pelo ID
            rotaData = rotasSimuladas[id]
          } else {
            // Tentar encontrar a rota pelo ID simulado (route1, route2, etc.)
            rotaData = rotasSimuladas[id]
          }
        }

        if (!rotaData) {
          toast({
            variant: "destructive",
            title: "Erro!",
            description: "Rota não encontrada.",
          })
          router.push("/rotas")
          return
        }

        setRota({ id, ...rotaData })

        // Buscar dados do veículo associado
        if (rotaData.veiculoId) {
          const veiculoRef = ref(database, `vehicles/${rotaData.veiculoId}`)
          const veiculoSnapshot = await get(veiculoRef)

          if (veiculoSnapshot.exists()) {
            const veiculoData = veiculoSnapshot.val()
            setVeiculo({ id: rotaData.veiculoId, ...veiculoData })

            // Buscar dados RFID do veículo
            if (veiculoData.rfid_tag) {
              const rfidRef = ref(database, `rfid_tag_info/${veiculoData.rfid_tag}`)
              const unsubscribeRfid = onValue(rfidRef, (snapshot) => {
                if (snapshot.exists()) {
                  setRfidData(snapshot.val())
                }
              })

              // Cleanup
              return () => unsubscribeRfid()
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        toast({
          variant: "destructive",
          title: "Erro!",
          description: "Falha ao buscar dados da rota.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRotaData()
  }, [id, router])

  // Simulação de rastreamento em tempo real
  useEffect(() => {
    if (simulationActive && rota?.pontos?.length > 0) {
      simulationRef.current = setInterval(() => {
        setCurrentPosition((prev) => {
          const next = prev + 1
          if (next >= rota.pontos.length) {
            clearInterval(simulationRef.current)
            setSimulationActive(false)
            setRouteProgress(100)
            return prev
          }

          const progress = Math.round((next / (rota.pontos.length - 1)) * 100)
          setRouteProgress(progress)
          return next
        })
      }, 2000) // Atualiza a cada 2 segundos
    }

    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current)
      }
    }
  }, [simulationActive, rota])

  const handleStartSimulation = () => {
    setCurrentPosition(0)
    setRouteProgress(0)
    setSimulationActive(true)
  }

  const handleStopSimulation = () => {
    setSimulationActive(false)
    if (simulationRef.current) {
      clearInterval(simulationRef.current)
    }
  }

  const handleResetSimulation = () => {
    setCurrentPosition(0)
    setRouteProgress(0)
    setSimulationActive(false)
    if (simulationRef.current) {
      clearInterval(simulationRef.current)
    }
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
        <h1 className="text-2xl font-bold">Detalhes da Rota</h1>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/rotas/editar/${id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          {rota.status === "Ativa" && (
            <EndTripDialog
              routeId={id}
              routeName={rota.nome}
              vehicleId={rota.veiculoId}
              vehiclePlate={veiculo?.placa || ""}
              onTripEnded={() => {
                // Atualizar o estado local
                setRota((prev) => ({ ...prev, status: "Concluída" }))
                // Mostrar toast
                toast({
                  title: "Viagem encerrada",
                  description: "A rota foi concluída com sucesso.",
                })
              }}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Route className="mr-2 h-5 w-5 text-emerald-500" />
              Informações da Rota
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Nome</h3>
              <p className="font-semibold">{rota.nome}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Origem</h3>
              <p>{rota.origem}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Destino</h3>
              <p>{rota.destino}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Distância</h3>
              <p>{rota.distancia}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Duração Estimada</h3>
              <p>{rota.duracao}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  rota.status === "Ativa" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {rota.status}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Criada em</h3>
              <p>{new Date(rota.createdAt).toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>

        {veiculo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="mr-2 h-5 w-5 text-blue-500" />
                Veículo Associado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/veiculos/${veiculo.id}`)}
              >
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Placa</h3>
                  <p className="font-semibold">{veiculo.placa}</p>
                </div>
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-500">Modelo</h3>
                  <p>
                    {veiculo.modelo} ({veiculo.ano})
                  </p>
                </div>
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      veiculo.status === "Ativo" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {veiculo.status}
                  </span>
                </div>
                {rfidData && (
                  <>
                    <div className="mt-2">
                      <h3 className="text-sm font-medium text-gray-500">Em Movimento</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          rfidData.is_moving ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {rfidData.is_moving ? "Sim" : "Não"}
                      </span>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-sm font-medium text-gray-500">Última Atualização</h3>
                      <p className="text-xs text-gray-500">Agora</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-amber-500" />
              Simulação de Rota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Progresso da Rota</h3>
                <Progress value={routeProgress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1 text-right">{routeProgress}% concluído</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Controles de Simulação</h3>
                <div className="flex gap-2">
                  {!simulationActive ? (
                    <Button onClick={handleStartSimulation} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      <Play className="mr-2 h-4 w-4" />
                      Iniciar
                    </Button>
                  ) : (
                    <Button onClick={handleStopSimulation} className="flex-1 bg-amber-600 hover:bg-amber-700">
                      <Pause className="mr-2 h-4 w-4" />
                      Pausar
                    </Button>
                  )}
                  <Button onClick={handleResetSimulation} variant="outline" className="flex-1">
                    <RotateCw className="mr-2 h-4 w-4" />
                    Reiniciar
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Informações</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Posição atual:</span>
                    <span>
                      {currentPosition + 1} de {rota.pontos.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tempo estimado:</span>
                    <span>
                      {Math.round(
                        (Number.parseInt(rota.duracao) * (rota.pontos.length - currentPosition - 1)) /
                          rota.pontos.length,
                      )}{" "}
                      min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distância restante:</span>
                    <span>
                      {(
                        Number.parseFloat(rota.distancia) *
                        ((rota.pontos.length - currentPosition - 1) / rota.pontos.length)
                      ).toFixed(1)}{" "}
                      km
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="map" className="mt-6">
        <TabsList>
          <TabsTrigger value="map">Mapa da Rota</TabsTrigger>
          <TabsTrigger value="live">Rastreamento em Tempo Real</TabsTrigger>
        </TabsList>
        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-emerald-500" />
                Mapa da Rota Completa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] rounded-lg overflow-hidden border">
                <MapWithNoSSR route={rota} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="live">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="mr-2 h-5 w-5 text-emerald-500" />
                Rastreamento em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] rounded-lg overflow-hidden border">
                <LiveTracking
                  route={rota}
                  currentPosition={currentPosition}
                  vehicle={rfidData ? { heart_rate: rfidData.heart_rate } : { heart_rate: null }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
