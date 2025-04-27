"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue, update } from "firebase/database"
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronDown,
  Filter,
  Heart,
  Info,
  RefreshCw,
  Search,
  Wrench,
  Fuel,
  Clock,
  Car,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

export default function AlertasPage() {
  const [alerts, setAlerts] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const fetchData = () => {
      setLoading(true)

      // Buscar alertas
      const alertsRef = ref(database, "alerts")
      const unsubscribeAlerts = onValue(alertsRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const alertsList = Object.entries(data)
            .map(([id, alert]) => ({
              id,
              ...alert,
            }))
            .sort((a, b) => b.timestamp - a.timestamp)

          setAlerts(alertsList)
        } else {
          setAlerts([])
        }
      })

      // Buscar veículos para referência
      const vehiclesRef = ref(database, "vehicles")
      const unsubscribeVehicles = onValue(vehiclesRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const vehiclesList = Object.entries(data).map(([id, vehicle]) => ({
            id,
            ...vehicle,
          }))
          setVehicles(vehiclesList)
          setLoading(false)
          setLastUpdate(new Date())
        } else {
          setVehicles([])
          setLoading(false)
          setLastUpdate(new Date())
        }
      })

      return () => {
        unsubscribeAlerts()
        unsubscribeVehicles()
      }
    }

    fetchData()
  }, [])

  const handleMarkAsRead = async (alertId) => {
    try {
      const alertRef = ref(database, `alerts/${alertId}`)
      await update(alertRef, { read: true })
      toast({
        title: "Alerta atualizado",
        description: "O alerta foi marcado como lido.",
      })
    } catch (error) {
      console.error("Erro ao marcar alerta como lido:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o alerta.",
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const updates = {}
      alerts
        .filter((alert) => !alert.read)
        .forEach((alert) => {
          updates[`alerts/${alert.id}`] = { ...alert, read: true }
        })

      await update(ref(database), updates)
      toast({
        title: "Alertas atualizados",
        description: "Todos os alertas foram marcados como lidos.",
      })
    } catch (error) {
      console.error("Erro ao marcar alertas como lidos:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar os alertas.",
      })
    }
  }

  const refreshData = () => {
    setLastUpdate(new Date())
    // Os dados já são atualizados automaticamente pelo Firebase
    toast({
      title: "Dados atualizados",
      description: "Os dados foram atualizados com sucesso.",
    })
  }

  // Filtrar alertas
  const filteredAlerts = alerts.filter((alert) => {
    // Filtro de pesquisa
    const searchMatch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro de tipo
    const typeMatch =
      filterType === "all" ||
      (filterType === "heart_rate" && alert.type === "heart_rate") ||
      (filterType === "fuel" && alert.type === "fuel") ||
      (filterType === "delay" && alert.type === "delay") ||
      (filterType === "maintenance" && alert.type === "maintenance") ||
      (filterType === "other" && (!alert.type || !["heart_rate", "fuel", "delay", "maintenance"].includes(alert.type)))

    // Filtro de severidade
    const severityMatch =
      filterSeverity === "all" ||
      (filterSeverity === "critical" && alert.severity === "critical") ||
      (filterSeverity === "warning" && alert.severity === "warning") ||
      (filterSeverity === "info" && alert.severity === "info")

    // Filtro de status
    const statusMatch =
      filterStatus === "all" || (filterStatus === "unread" && !alert.read) || (filterStatus === "read" && alert.read)

    return searchMatch && typeMatch && severityMatch && statusMatch
  })

  // Estatísticas de alertas
  const alertStats = {
    total: alerts.length,
    unread: alerts.filter((alert) => !alert.read).length,
    critical: alerts.filter((alert) => alert.severity === "critical").length,
    warning: alerts.filter((alert) => alert.severity === "warning").length,
    info: alerts.filter((alert) => alert.severity === "info").length,
    heartRate: alerts.filter((alert) => alert.type === "heart_rate").length,
    fuel: alerts.filter((alert) => alert.type === "fuel").length,
    delay: alerts.filter((alert) => alert.type === "delay").length,
    maintenance: alerts.filter((alert) => alert.type === "maintenance").length,
  }

  // Função para obter o ícone do tipo de alerta
  const getAlertTypeIcon = (type) => {
    switch (type) {
      case "heart_rate":
        return <Heart className="h-5 w-5 text-red-500" />
      case "fuel":
        return <Fuel className="h-5 w-5 text-amber-500" />
      case "delay":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "maintenance":
        return <Wrench className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  // Função para obter o ícone de severidade
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  // Função para obter a classe de severidade
  const getSeverityClass = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "warning":
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  // Função para obter o texto de severidade
  const getSeverityText = (severity) => {
    switch (severity) {
      case "critical":
        return "Crítico"
      case "warning":
        return "Atenção"
      default:
        return "Informação"
    }
  }

  // Função para obter o texto do tipo de alerta
  const getAlertTypeText = (type) => {
    switch (type) {
      case "heart_rate":
        return "Frequência Cardíaca"
      case "fuel":
        return "Combustível"
      case "delay":
        return "Atraso"
      case "maintenance":
        return "Manutenção"
      default:
        return "Outro"
    }
  }

  // Função para obter o veículo associado ao alerta
  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    return vehicle ? `${vehicle.modelo} (${vehicle.placa})` : "Veículo não encontrado"
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Alertas do Sistema</h1>
          <p className="text-sm text-gray-500">Monitoramento de alertas críticos e notificações</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Atualizado: {lastUpdate.toLocaleTimeString("pt-BR")}</span>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Alertas Críticos
            </CardTitle>
            <CardDescription>Requerem atenção imediata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{alertStats.critical}</div>
            <p className="text-sm text-gray-500">
              {alertStats.critical > 0
                ? `${Math.round((alertStats.critical / alertStats.total) * 100)}% do total`
                : "Nenhum alerta crítico"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Freq. Cardíaca
            </CardTitle>
            <CardDescription>Monitoramento de saúde</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{alertStats.heartRate}</div>
            <p className="text-sm text-gray-500">
              {alertStats.heartRate > 0
                ? `${Math.round((alertStats.heartRate / alertStats.total) * 100)}% do total`
                : "Nenhum alerta de frequência cardíaca"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Fuel className="h-5 w-5 text-amber-500" />
              Combustível
            </CardTitle>
            <CardDescription>Níveis baixos de combustível</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{alertStats.fuel}</div>
            <p className="text-sm text-gray-500">
              {alertStats.fuel > 0
                ? `${Math.round((alertStats.fuel / alertStats.total) * 100)}% do total`
                : "Nenhum alerta de combustível"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Atrasos
            </CardTitle>
            <CardDescription>Atrasos em rotas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{alertStats.delay}</div>
            <p className="text-sm text-gray-500">
              {alertStats.delay > 0
                ? `${Math.round((alertStats.delay / alertStats.total) * 100)}% do total`
                : "Nenhum alerta de atraso"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar alertas..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="heart_rate">Frequência Cardíaca</SelectItem>
                  <SelectItem value="fuel">Combustível</SelectItem>
                  <SelectItem value="delay">Atrasos</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Severidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas severidades</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="warning">Atenção</SelectItem>
                  <SelectItem value="info">Informação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="unread">Não lidos</SelectItem>
                <SelectItem value="read">Lidos</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Ações
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações em Lote</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={handleMarkAllAsRead}>
                    <Check className="h-4 w-4 mr-2" />
                    Marcar todos como lidos
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              Todos
              <Badge variant="outline" className="ml-1">
                {alerts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Não lidos
              <Badge variant="outline" className="ml-1">
                {alerts.filter((a) => !a.read).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="critical" className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Críticos
              <Badge variant="outline" className="ml-1">
                {alerts.filter((a) => a.severity === "critical").length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg ${!alert.read ? "bg-gray-50" : ""} transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getAlertTypeIcon(alert.type)}</div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            {alert.title}
                            <Badge className={`${getSeverityClass(alert.severity)}`}>
                              {getSeverityText(alert.severity)}
                            </Badge>
                            <Badge variant="outline">{getAlertTypeText(alert.type)}</Badge>
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          {alert.vehicleId && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Car className="h-3 w-3" />
                              {getVehicleInfo(alert.vehicleId)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(alert.timestamp).toLocaleString("pt-BR")}
                          </p>
                          {!alert.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              onClick={() => handleMarkAsRead(alert.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Marcar como lido
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-lg font-medium">Nenhum alerta encontrado</p>
                <p className="text-sm">Não há alertas que correspondam aos filtros selecionados.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            {filteredAlerts.filter((a) => !a.read).length > 0 ? (
              filteredAlerts
                .filter((a) => !a.read)
                .map((alert) => (
                  <div key={alert.id} className="p-4 border rounded-lg bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getAlertTypeIcon(alert.type)}</div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                          <div>
                            <h3 className="font-medium flex items-center gap-2">
                              {alert.title}
                              <Badge className={`${getSeverityClass(alert.severity)}`}>
                                {getSeverityText(alert.severity)}
                              </Badge>
                              <Badge variant="outline">{getAlertTypeText(alert.type)}</Badge>
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                            {alert.vehicleId && (
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Car className="h-3 w-3" />
                                {getVehicleInfo(alert.vehicleId)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500 whitespace-nowrap">
                              {new Date(alert.timestamp).toLocaleString("pt-BR")}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              onClick={() => handleMarkAsRead(alert.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Marcar como lido
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Check className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-lg font-medium">Nenhum alerta não lido</p>
                <p className="text-sm">Todos os alertas foram lidos.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="critical" className="space-y-4">
            {filteredAlerts.filter((a) => a.severity === "critical").length > 0 ? (
              filteredAlerts
                .filter((a) => a.severity === "critical")
                .map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border rounded-lg ${!alert.read ? "bg-gray-50" : ""} transition-colors`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getAlertTypeIcon(alert.type)}</div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                          <div>
                            <h3 className="font-medium flex items-center gap-2">
                              {alert.title}
                              <Badge className="bg-red-100 text-red-800 border-red-200">Crítico</Badge>
                              <Badge variant="outline">{getAlertTypeText(alert.type)}</Badge>
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                            {alert.vehicleId && (
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Car className="h-3 w-3" />
                                {getVehicleInfo(alert.vehicleId)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500 whitespace-nowrap">
                              {new Date(alert.timestamp).toLocaleString("pt-BR")}
                            </p>
                            {!alert.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8"
                                onClick={() => handleMarkAsRead(alert.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Marcar como lido
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Check className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-lg font-medium">Nenhum alerta crítico</p>
                <p className="text-sm">Não há alertas críticos no momento.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
