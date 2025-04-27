"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, get, update, remove } from "firebase/database"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Bell, Heart, Fuel, Wrench, Clock, CheckCircle, X, Search, Filter, Car, User } from "lucide-react"

export default function Alertas() {
  const [loading, setLoading] = useState(true)
  const [alertas, setAlertas] = useState([])
  const [veiculos, setVeiculos] = useState([])
  const [motoristas, setMotoristas] = useState([])
  const [filtro, setFiltro] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState("todos")
  const [statusFiltro, setStatusFiltro] = useState("todos")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar veículos
        const veiculosRef = ref(database, "vehicles")
        const veiculosSnapshot = await get(veiculosRef)

        let veiculosData = []
        if (veiculosSnapshot.exists()) {
          const data = veiculosSnapshot.val()
          veiculosData = Object.entries(data).map(([id, veiculo]) => ({
            id,
            ...veiculo,
          }))
          setVeiculos(veiculosData)
        }

        // Buscar motoristas
        const motoristasRef = ref(database, "drivers")
        const motoristasSnapshot = await get(motoristasRef)

        let motoristasData = []
        if (motoristasSnapshot.exists()) {
          const data = motoristasSnapshot.val()
          motoristasData = Object.entries(data).map(([id, motorista]) => ({
            id,
            ...motorista,
          }))
          setMotoristas(motoristasData)
        }

        // Buscar alertas
        const alertasRef = ref(database, "alerts")
        const alertasSnapshot = await get(alertasRef)

        if (alertasSnapshot.exists()) {
          const data = alertasSnapshot.val()
          const alertasData = Object.entries(data).map(([id, alerta]) => ({
            id,
            ...alerta,
          }))

          // Enriquecer alertas com informações de veículos e motoristas
          const alertasEnriquecidos = alertasData.map((alerta) => {
            const alertaEnriquecido = { ...alerta }

            if (alerta.veiculoId) {
              const veiculo = veiculosData.find((v) => v.id === alerta.veiculoId)
              if (veiculo) {
                alertaEnriquecido.veiculoPlaca = veiculo.placa
                alertaEnriquecido.veiculoModelo = veiculo.modelo
              }
            }

            if (alerta.motoristaId) {
              const motorista = motoristasData.find((m) => m.id === alerta.motoristaId)
              if (motorista) {
                alertaEnriquecido.motoristaNome = motorista.nome
              }
            }

            return alertaEnriquecido
          })

          // Ordenar por data (mais recentes primeiro)
          alertasEnriquecidos.sort((a, b) => b.timestamp - a.timestamp)

          setAlertas(alertasEnriquecidos)
        } else {
          // Simular alertas para demonstração
          const alertasSimulados = [
            {
              id: "alert1",
              tipo: "frequencia_cardiaca",
              titulo: "Frequência Cardíaca Elevada",
              descricao: "O motorista apresenta frequência cardíaca acima do limite (110 bpm)",
              motoristaId: "driver1",
              motoristaNome: "João Silva",
              valor: 110,
              timestamp: Date.now() - 1000 * 60 * 5, // 5 minutos atrás
              lido: false,
              prioridade: "alta",
            },
            {
              id: "alert2",
              tipo: "combustivel",
              titulo: "Nível de Combustível Baixo",
              descricao: "O veículo está com nível de combustível abaixo de 15%",
              veiculoId: "vehicle1",
              veiculoPlaca: "ABC-1234",
              veiculoModelo: "Ambulância UTI",
              valor: 12,
              timestamp: Date.now() - 1000 * 60 * 30, // 30 minutos atrás
              lido: true,
              prioridade: "media",
            },
            {
              id: "alert3",
              tipo: "manutencao",
              titulo: "Manutenção Preventiva Pendente",
              descricao: "Veículo com manutenção programada para amanhã",
              veiculoId: "vehicle2",
              veiculoPlaca: "DEF-5678",
              veiculoModelo: "Van de Transporte",
              timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 horas atrás
              lido: false,
              prioridade: "baixa",
            },
            {
              id: "alert4",
              tipo: "atraso",
              titulo: "Atraso em Rota",
              descricao: "Veículo com atraso de 25 minutos na rota programada",
              veiculoId: "vehicle3",
              veiculoPlaca: "GHI-9012",
              veiculoModelo: "Ambulância Básica",
              motoristaId: "driver2",
              motoristaNome: "Maria Oliveira",
              valor: 25,
              timestamp: Date.now() - 1000 * 60 * 15, // 15 minutos atrás
              lido: false,
              prioridade: "alta",
            },
            {
              id: "alert5",
              tipo: "frequencia_cardiaca",
              titulo: "Frequência Cardíaca Crítica",
              descricao: "O motorista apresenta frequência cardíaca em nível crítico (130 bpm)",
              motoristaId: "driver3",
              motoristaNome: "Carlos Santos",
              valor: 130,
              timestamp: Date.now() - 1000 * 60 * 2, // 2 minutos atrás
              lido: false,
              prioridade: "critica",
            },
          ]

          setAlertas(alertasSimulados)
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
  }, [])

  const handleMarkAsRead = async (alertaId) => {
    try {
      // Atualizar estado local
      setAlertas((prevAlertas) =>
        prevAlertas.map((alerta) => (alerta.id === alertaId ? { ...alerta, lido: true } : alerta)),
      )

      // Atualizar no Firebase
      const alertaRef = ref(database, `alerts/${alertaId}`)
      await update(alertaRef, { lido: true })

      toast({
        title: "Alerta marcado como lido",
        description: "O alerta foi marcado como lido com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao marcar alerta como lido:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao marcar alerta como lido.",
      })
    }
  }

  const handleDismissAlert = async (alertaId) => {
    try {
      // Atualizar estado local
      setAlertas((prevAlertas) => prevAlertas.filter((alerta) => alerta.id !== alertaId))

      // Remover do Firebase
      const alertaRef = ref(database, `alerts/${alertaId}`)
      await remove(alertaRef)

      toast({
        title: "Alerta descartado",
        description: "O alerta foi descartado com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao descartar alerta:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao descartar alerta.",
      })
    }
  }

  const filtrarAlertas = () => {
    if (!filtro && tipoFiltro === "todos" && statusFiltro === "todos") {
      return alertas
    }

    return alertas.filter((alerta) => {
      const matchesFiltro = filtro
        ? alerta.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
          alerta.descricao.toLowerCase().includes(filtro.toLowerCase()) ||
          (alerta.veiculoPlaca && alerta.veiculoPlaca.toLowerCase().includes(filtro.toLowerCase())) ||
          (alerta.motoristaNome && alerta.motoristaNome.toLowerCase().includes(filtro.toLowerCase()))
        : true

      const matchesTipo = tipoFiltro !== "todos" ? alerta.tipo === tipoFiltro : true
      const matchesStatus = statusFiltro !== "todos" ? (statusFiltro === "lidos" ? alerta.lido : !alerta.lido) : true

      return matchesFiltro && matchesTipo && matchesStatus
    })
  }

  const alertasFiltrados = filtrarAlertas()

  const getAlertIcon = (tipo) => {
    switch (tipo) {
      case "frequencia_cardiaca":
        return <Heart className="h-5 w-5 text-red-500" />
      case "combustivel":
        return <Fuel className="h-5 w-5 text-amber-500" />
      case "manutencao":
        return <Wrench className="h-5 w-5 text-blue-500" />
      case "atraso":
        return <Clock className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (prioridade) => {
    switch (prioridade) {
      case "critica":
        return "bg-red-100 text-red-800"
      case "alta":
        return "bg-orange-100 text-orange-800"
      case "media":
        return "bg-amber-100 text-amber-800"
      case "baixa":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
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
      <h1 className="text-2xl font-bold mb-6">Alertas do Sistema</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Buscar alertas..."
            className="pl-10"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por tipo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="frequencia_cardiaca">Frequência Cardíaca</SelectItem>
              <SelectItem value="combustivel">Combustível</SelectItem>
              <SelectItem value="manutencao">Manutenção</SelectItem>
              <SelectItem value="atraso">Atraso</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-64">
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="nao_lidos">Não lidos</SelectItem>
              <SelectItem value="lidos">Lidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="todos">
        <TabsList className="mb-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="criticos">Críticos</TabsTrigger>
          <TabsTrigger value="frequencia_cardiaca">Freq. Cardíaca</TabsTrigger>
          <TabsTrigger value="combustivel">Combustível</TabsTrigger>
          <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
          <TabsTrigger value="atraso">Atrasos</TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <div className="space-y-4">
            {alertasFiltrados.length > 0 ? (
              alertasFiltrados.map((alerta) => (
                <Card key={alerta.id} className={`overflow-hidden ${alerta.lido ? "bg-gray-50" : "bg-white"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="mt-1">{getAlertIcon(alerta.tipo)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{alerta.titulo}</h3>
                            {!alerta.lido && <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>}
                            <Badge className={getPriorityColor(alerta.prioridade)}>{alerta.prioridade}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alerta.descricao}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {alerta.veiculoPlaca && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Car className="h-3 w-3 mr-1" />
                                {alerta.veiculoPlaca} - {alerta.veiculoModelo}
                              </div>
                            )}
                            {alerta.motoristaNome && (
                              <div className="flex items-center text-xs text-gray-500">
                                <User className="h-3 w-3 mr-1" />
                                {alerta.motoristaNome}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {new Date(alerta.timestamp).toLocaleString("pt-BR")}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!alerta.lido && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(alerta.id)}
                            className="h-8"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Marcar como lido
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismissAlert(alerta.id)}
                          className="h-8 text-gray-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Nenhum alerta encontrado</h3>
                <p className="text-gray-500 mt-1">Não há alertas correspondentes aos filtros selecionados.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="criticos">
          <div className="space-y-4">
            {alertasFiltrados
              .filter((alerta) => alerta.prioridade === "critica")
              .map((alerta) => (
                <Card key={alerta.id} className={`overflow-hidden ${alerta.lido ? "bg-gray-50" : "bg-white"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="mt-1">{getAlertIcon(alerta.tipo)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{alerta.titulo}</h3>
                            {!alerta.lido && <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>}
                            <Badge className={getPriorityColor(alerta.prioridade)}>{alerta.prioridade}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alerta.descricao}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {alerta.veiculoPlaca && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Car className="h-3 w-3 mr-1" />
                                {alerta.veiculoPlaca} - {alerta.veiculoModelo}
                              </div>
                            )}
                            {alerta.motoristaNome && (
                              <div className="flex items-center text-xs text-gray-500">
                                <User className="h-3 w-3 mr-1" />
                                {alerta.motoristaNome}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {new Date(alerta.timestamp).toLocaleString("pt-BR")}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!alerta.lido && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(alerta.id)}
                            className="h-8"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Marcar como lido
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismissAlert(alerta.id)}
                          className="h-8 text-gray-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="frequencia_cardiaca">
          <div className="space-y-4">
            {alertasFiltrados
              .filter((alerta) => alerta.tipo === "frequencia_cardiaca")
              .map((alerta) => (
                <Card key={alerta.id} className={`overflow-hidden ${alerta.lido ? "bg-gray-50" : "bg-white"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="mt-1">{getAlertIcon(alerta.tipo)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{alerta.titulo}</h3>
                            {!alerta.lido && <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>}
                            <Badge className={getPriorityColor(alerta.prioridade)}>{alerta.prioridade}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alerta.descricao}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {alerta.veiculoPlaca && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Car className="h-3 w-3 mr-1" />
                                {alerta.veiculoPlaca} - {alerta.veiculoModelo}
                              </div>
                            )}
                            {alerta.motoristaNome && (
                              <div className="flex items-center text-xs text-gray-500">
                                <User className="h-3 w-3 mr-1" />
                                {alerta.motoristaNome}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {new Date(alerta.timestamp).toLocaleString("pt-BR")}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!alerta.lido && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(alerta.id)}
                            className="h-8"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Marcar como lido
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismissAlert(alerta.id)}
                          className="h-8 text-gray-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="combustivel">
          <div className="space-y-4">
            {alertasFiltrados
              .filter((alerta) => alerta.tipo === "combustivel")
              .map((alerta) => (
                <Card key={alerta.id} className={`overflow-hidden ${alerta.lido ? "bg-gray-50" : "bg-white"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="mt-1">{getAlertIcon(alerta.tipo)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{alerta.titulo}</h3>
                            {!alerta.lido && <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>}
                            <Badge className={getPriorityColor(alerta.prioridade)}>{alerta.prioridade}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alerta.descricao}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {alerta.veiculoPlaca && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Car className="h-3 w-3 mr-1" />
                                {alerta.veiculoPlaca} - {alerta.veiculoModelo}
                              </div>
                            )}
                            {alerta.motoristaNome && (
                              <div className="flex items-center text-xs text-gray-500">
                                <User className="h-3 w-3 mr-1" />
                                {alerta.motoristaNome}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {new Date(alerta.timestamp).toLocaleString("pt-BR")}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!alerta.lido && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(alerta.id)}
                            className="h-8"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Marcar como lido
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismissAlert(alerta.id)}
                          className="h-8 text-gray-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="manutencao">
          <div className="space-y-4">
            {alertasFiltrados
              .filter((alerta) => alerta.tipo === "manutencao")
              .map((alerta) => (
                <Card key={alerta.id} className={`overflow-hidden ${alerta.lido ? "bg-gray-50" : "bg-white"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="mt-1">{getAlertIcon(alerta.tipo)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{alerta.titulo}</h3>
                            {!alerta.lido && <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>}
                            <Badge className={getPriorityColor(alerta.prioridade)}>{alerta.prioridade}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alerta.descricao}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {alerta.veiculoPlaca && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Car className="h-3 w-3 mr-1" />
                                {alerta.veiculoPlaca} - {alerta.veiculoModelo}
                              </div>
                            )}
                            {alerta.motoristaNome && (
                              <div className="flex items-center text-xs text-gray-500">
                                <User className="h-3 w-3 mr-1" />
                                {alerta.motoristaNome}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {new Date(alerta.timestamp).toLocaleString("pt-BR")}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!alerta.lido && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(alerta.id)}
                            className="h-8"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Marcar como lido
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismissAlert(alerta.id)}
                          className="h-8 text-gray-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="atraso">
          <div className="space-y-4">
            {alertasFiltrados
              .filter((alerta) => alerta.tipo === "atraso")
              .map((alerta) => (
                <Card key={alerta.id} className={`overflow-hidden ${alerta.lido ? "bg-gray-50" : "bg-white"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="mt-1">{getAlertIcon(alerta.tipo)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{alerta.titulo}</h3>
                            {!alerta.lido && <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>}
                            <Badge className={getPriorityColor(alerta.prioridade)}>{alerta.prioridade}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alerta.descricao}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {alerta.veiculoPlaca && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Car className="h-3 w-3 mr-1" />
                                {alerta.veiculoPlaca} - {alerta.veiculoModelo}
                              </div>
                            )}
                            {alerta.motoristaNome && (
                              <div className="flex items-center text-xs text-gray-500">
                                <User className="h-3 w-3 mr-1" />
                                {alerta.motoristaNome}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {new Date(alerta.timestamp).toLocaleString("pt-BR")}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!alerta.lido && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(alerta.id)}
                            className="h-8"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Marcar como lido
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismissAlert(alerta.id)}
                          className="h-8 text-gray-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
