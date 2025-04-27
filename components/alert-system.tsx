"use client"

import { useState, useEffect, useRef } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue, push, set, remove } from "firebase/database"
import { Bell, X, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { filterHeartRate, checkHeartRateStatus } from "@/lib/kalman-filter"

export function AlertSystem() {
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [newAlertOpen, setNewAlertOpen] = useState(false)
  const [newAlert, setNewAlert] = useState({
    title: "",
    description: "",
    severity: "info",
    vehicleId: "",
  })
  const [vehicles, setVehicles] = useState([])

  // Usar refs para evitar dependências cíclicas no useEffect
  const alertsRef = useRef(alerts)
  const vehiclesRef = useRef(vehicles)

  // Atualizar as refs quando os estados mudarem
  useEffect(() => {
    alertsRef.current = alerts
  }, [alerts])

  useEffect(() => {
    vehiclesRef.current = vehicles
  }, [vehicles])

  // Função para criar alertas de forma segura
  const createAlert = (alertData) => {
    // Garantir que todos os campos tenham valores válidos
    const cleanData = Object.entries(alertData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {})

    const alertsDbRef = ref(database, "alerts")
    const newAlertRef = push(alertsDbRef)
    set(newAlertRef, cleanData)
  }

  useEffect(() => {
    // Buscar alertas
    const alertsDbRef = ref(database, "alerts")
    const unsubscribeAlerts = onValue(alertsDbRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const alertsList = Object.entries(data)
          .map(([id, alert]) => ({
            id,
            ...alert,
          }))
          .sort((a, b) => b.timestamp - a.timestamp)

        setAlerts(alertsList)
        setUnreadCount(alertsList.filter((alert) => !alert.read).length)
      } else {
        setAlerts([])
        setUnreadCount(0)
      }
    })

    // Buscar veículos para o formulário de novo alerta
    const vehiclesDbRef = ref(database, "vehicles")
    const unsubscribeVehicles = onValue(vehiclesDbRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const vehiclesList = Object.entries(data).map(([id, vehicle]) => ({
          id,
          ...vehicle,
        }))
        setVehicles(vehiclesList)
      } else {
        setVehicles([])
      }
    })

    return () => {
      unsubscribeAlerts()
      unsubscribeVehicles()
    }
  }, []) // Remover dependências para evitar loops

  // Separar os monitores em useEffects individuais
  useEffect(() => {
    // Monitorar frequência cardíaca dos motoristas (via RFID tags)
    const rfidDbRef = ref(database, "rfid_tag_info")
    const unsubscribeRfid = onValue(rfidDbRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) return

      // Para cada tag RFID, verificar a frequência cardíaca
      Object.entries(data).forEach(([tagId, tagInfo]: [string, any]) => {
        if (!tagInfo || typeof tagInfo.heart_rate === "undefined") return

        // Aplicar filtro de Kalman para reduzir ruído
        const filteredHeartRate = filterHeartRate(tagInfo.heart_rate)

        // Verificar status da frequência cardíaca
        const heartRateStatus = checkHeartRateStatus(filteredHeartRate)

        // Se for crítico ou alto, criar um alerta
        if (heartRateStatus.status === "critical" || heartRateStatus.status === "high") {
          // Encontrar o veículo associado a esta tag
          const vehicle = vehiclesRef.current.find((v) => v.rfid_tag === tagId)

          if (vehicle) {
            // Verificar se já existe um alerta recente para este veículo (últimos 10 minutos)
            const recentAlert = alertsRef.current.find(
              (a) => a.vehicleId === vehicle.id && a.type === "heart_rate" && Date.now() - a.timestamp < 10 * 60 * 1000,
            )

            if (!recentAlert) {
              // Criar novo alerta
              createAlert({
                title: `Frequência Cardíaca ${heartRateStatus.status === "critical" ? "Crítica" : "Elevada"}`,
                description: `Motorista do veículo ${vehicle.placa || "Sem placa"} com frequência cardíaca de ${Math.round(filteredHeartRate)} bpm`,
                severity: heartRateStatus.severity,
                timestamp: Date.now(),
                read: false,
                vehicleId: vehicle.id,
                type: "heart_rate",
              })
            }
          }
        }
      })
    })

    return () => {
      unsubscribeRfid()
    }
  }, []) // Sem dependências para evitar loops

  useEffect(() => {
    // Monitorar nível de combustível
    const fuelDbRef = ref(database, "fuel")
    const unsubscribeFuel = onValue(fuelDbRef, (snapshot) => {
      const fuelData = snapshot.val()
      if (!fuelData) return

      // Para cada veículo, verificar o último abastecimento
      vehiclesRef.current.forEach((vehicle) => {
        if (!vehicle || !vehicle.id) return

        // Encontrar o último abastecimento deste veículo
        const vehicleFuelEntries = Object.values(fuelData)
          .filter((entry: any) => entry && entry.veiculoId === vehicle.id)
          .sort((a: any, b: any) => b.data - a.data)

        if (vehicleFuelEntries.length === 0) return

        const lastEntry: any = vehicleFuelEntries[0]
        if (!lastEntry.kmAtual || !lastEntry.kmAnterior || !lastEntry.litros) return

        // Calcular consumo médio (km/l)
        const kmRun = lastEntry.kmAtual - lastEntry.kmAnterior
        if (kmRun <= 0 || lastEntry.litros <= 0) return

        const avgConsumption = kmRun / lastEntry.litros

        // Estimar combustível restante (baseado em um tanque médio de 60L)
        const estimatedTankSize = 60 // litros
        const estimatedRange = avgConsumption * estimatedTankSize // km
        const estimatedFuelLeft = (estimatedRange - ((Date.now() - lastEntry.data) / 86400000) * 100) / estimatedRange

        // Se o combustível estimado estiver abaixo de 20%, criar alerta
        if (estimatedFuelLeft < 0.2) {
          // Verificar se já existe um alerta recente para este veículo
          const recentAlert = alertsRef.current.find(
            (a) => a.vehicleId === vehicle.id && a.type === "fuel" && Date.now() - a.timestamp < 24 * 60 * 60 * 1000,
          )

          if (!recentAlert) {
            // Criar novo alerta
            createAlert({
              title: "Combustível Baixo",
              description: `Veículo ${vehicle.placa || "Sem placa"} com nível de combustível estimado abaixo de 20%`,
              severity: "warning",
              timestamp: Date.now(),
              read: false,
              vehicleId: vehicle.id,
              type: "fuel",
            })
          }
        }
      })
    })

    return () => {
      unsubscribeFuel()
    }
  }, []) // Sem dependências para evitar loops

  useEffect(() => {
    // Monitorar atrasos nas rotas
    const routesDbRef = ref(database, "routes")
    const unsubscribeRoutes = onValue(routesDbRef, (snapshot) => {
      const routesData = snapshot.val()
      if (!routesData) return

      // Para cada rota ativa, verificar se está atrasada
      Object.entries(routesData).forEach(([routeId, route]: [string, any]) => {
        if (route.status !== "Ativa") return

        // Calcular tempo estimado vs. tempo real
        const startTime = route.startTime || route.createdAt
        if (!startTime) return

        const estimatedDuration = Number.parseInt(route.duracao) || 0 // em minutos
        const estimatedArrival = startTime + estimatedDuration * 60 * 1000

        // Se já passou do tempo estimado de chegada, criar alerta
        if (Date.now() > estimatedArrival) {
          // Verificar se já existe um alerta recente para esta rota
          const recentAlert = alertsRef.current.find(
            (a) => a.routeId === routeId && a.type === "delay" && Date.now() - a.timestamp < 30 * 60 * 1000,
          )

          if (!recentAlert) {
            const delayMinutes = Math.floor((Date.now() - estimatedArrival) / (60 * 1000))

            // Criar novo alerta
            createAlert({
              title: "Atraso na Rota",
              description: `Rota ${route.nome || "Sem nome"} está atrasada em ${delayMinutes} minutos`,
              severity: delayMinutes > 30 ? "critical" : "warning",
              timestamp: Date.now(),
              read: false,
              vehicleId: route.veiculoId || null,
              routeId: routeId,
              type: "delay",
            })
          }
        }
      })
    })

    return () => {
      unsubscribeRoutes()
    }
  }, []) // Sem dependências para evitar loops

  useEffect(() => {
    // Monitorar manutenções pendentes
    const maintenanceDbRef = ref(database, "maintenance")
    const unsubscribeMaintenance = onValue(maintenanceDbRef, (snapshot) => {
      const maintenanceData = snapshot.val()
      if (!maintenanceData) return

      // Para cada manutenção agendada, verificar se está próxima
      Object.entries(maintenanceData).forEach(([maintenanceId, maintenance]: [string, any]) => {
        if (maintenance.status !== "Agendada") return

        const maintenanceDate = maintenance.dataAgendada
        if (!maintenanceDate) return

        const daysUntilMaintenance = (maintenanceDate - Date.now()) / (24 * 60 * 60 * 1000)

        // Se faltam menos de 2 dias para a manutenção, criar alerta
        if (daysUntilMaintenance < 2 && daysUntilMaintenance > 0) {
          // Verificar se já existe um alerta recente para esta manutenção
          const recentAlert = alertsRef.current.find(
            (a) =>
              a.maintenanceId === maintenanceId &&
              a.type === "maintenance" &&
              Date.now() - a.timestamp < 24 * 60 * 60 * 1000,
          )

          if (!recentAlert) {
            // Criar novo alerta
            createAlert({
              title: "Manutenção Próxima",
              description: `Manutenção ${maintenance.descricao || "Sem descrição"} agendada para ${new Date(maintenance.dataAgendada).toLocaleDateString("pt-BR")}`,
              severity: "info",
              timestamp: Date.now(),
              read: false,
              vehicleId: maintenance.veiculoId || null,
              maintenanceId: maintenanceId,
              type: "maintenance",
            })
          }
        }
      })
    })

    return () => {
      unsubscribeMaintenance()
    }
  }, []) // Sem dependências para evitar loops

  const handleMarkAsRead = async (alertId) => {
    try {
      const alert = alerts.find((a) => a.id === alertId)
      if (!alert) return

      // Criar um objeto limpo sem propriedades undefined
      const cleanAlert = Object.entries(alert).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {})

      const alertDbRef = ref(database, `alerts/${alertId}`)
      await set(alertDbRef, {
        ...cleanAlert,
        read: true,
      })
    } catch (error) {
      console.error("Erro ao marcar alerta como lido:", error)
    }
  }

  const handleDeleteAlert = async (alertId) => {
    try {
      const alertDbRef = ref(database, `alerts/${alertId}`)
      await remove(alertDbRef)
      toast({
        title: "Alerta removido",
        description: "O alerta foi removido com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao remover alerta:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover o alerta.",
      })
    }
  }

  const handleCreateAlert = async (e) => {
    e.preventDefault()

    try {
      createAlert({
        ...newAlert,
        timestamp: Date.now(),
        read: false,
      })

      setNewAlert({
        title: "",
        description: "",
        severity: "info",
        vehicleId: "",
      })

      setNewAlertOpen(false)

      toast({
        title: "Alerta criado",
        description: "O alerta foi criado com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao criar alerta:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar o alerta.",
      })
    }
  }

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

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md" style={{ zIndex: 9999 }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas do Sistema
            </DialogTitle>
            <DialogDescription>Alertas e notificações recentes do sistema.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {alerts.length > 0 ? (
              <div className="space-y-4 py-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 border rounded-lg ${!alert.read ? "bg-gray-50" : ""}`}
                    onClick={() => !alert.read && handleMarkAsRead(alert.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{alert.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityClass(alert.severity)}`}>
                            {alert.severity === "critical"
                              ? "Crítico"
                              : alert.severity === "warning"
                                ? "Atenção"
                                : "Informação"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString("pt-BR")}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteAlert(alert.id)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Não há alertas no momento.</p>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => setNewAlertOpen(true)}>Novo Alerta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newAlertOpen} onOpenChange={setNewAlertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Alerta</DialogTitle>
            <DialogDescription>Preencha os campos para criar um novo alerta no sistema.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAlert}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newAlert.description}
                  onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severidade</Label>
                <Select
                  value={newAlert.severity}
                  onValueChange={(value) => setNewAlert({ ...newAlert, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Informação</SelectItem>
                    <SelectItem value="warning">Atenção</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle">Veículo (opcional)</Label>
                <Select
                  value={newAlert.vehicleId}
                  onValueChange={(value) => setNewAlert({ ...newAlert, vehicleId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.placa} - {vehicle.modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setNewAlertOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Criar Alerta</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
