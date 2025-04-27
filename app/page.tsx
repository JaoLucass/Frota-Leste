"use client"

import { useState, useEffect } from "react"
import { Car, Bell, Wrench, Fuel, AlertTriangle, Users, RefreshCw, Calendar, BarChart2, Heart } from "lucide-react"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { Card } from "@/components/card"
import { AlertCard } from "@/components/alert-card"
import { MaintenanceCard } from "@/components/maintenance-card"
import { DriverCard } from "@/components/driver-card"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { HeartRateCard } from "@/components/heart-rate-card"

// Corrigindo o problema do Leaflet com SSR
const MapWithNoSSR = dynamic(() => import("@/components/map"), {
  ssr: false,
})

// Componente de estatísticas
const StatsChart = dynamic(() => import("@/components/stats-chart"), {
  ssr: false,
})

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [rfidData, setRfidData] = useState({})
  const [routes, setRoutes] = useState([])
  const [alerts, setAlerts] = useState([])
  const [maintenances, setMaintenances] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Buscar veículos
    const vehiclesRef = ref(database, "vehicles")
    const unsubscribeVehicles = onValue(vehiclesRef, (snapshot) => {
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

    // Buscar motoristas
    const driversRef = ref(database, "drivers")
    const unsubscribeDrivers = onValue(driversRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const driversList = Object.entries(data).map(([id, driver]) => ({
          id,
          ...driver,
        }))
        setDrivers(driversList)
      } else {
        setDrivers([])
      }
    })

    // Buscar rotas
    const routesRef = ref(database, "routes")
    const unsubscribeRoutes = onValue(routesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const routesList = Object.entries(data).map(([id, route]) => ({
          id,
          ...route,
        }))
        setRoutes(routesList.filter((route) => route.status === "Ativa"))
      } else {
        setRoutes([])
      }
    })

    // Buscar dados RFID
    const rfidRef = ref(database, "rfid_tag_info")
    const unsubscribeRfid = onValue(rfidRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setRfidData(data)
      } else {
        setRfidData({})
      }
      setLoading(false)
      setLastUpdate(new Date())
    })

    // Simular alertas (em um sistema real, isso viria do banco de dados)
    setAlerts([
      {
        id: "alert1",
        title: "Manutenção Urgente",
        description: "Ambulância 103 - Problema no sistema de freios",
        time: "Há 35 minutos",
        severity: "critical",
      },
      {
        id: "alert2",
        title: "Combustível Baixo",
        description: "Van 205 - Nível de combustível abaixo de 15%",
        time: "Há 1 hora",
        severity: "warning",
      },
      {
        id: "alert3",
        title: "Atraso na Rota",
        description: "Ambulância 107 - Atraso de 15 minutos na entrega",
        time: "Há 2 horas",
        severity: "critical",
      },
    ])

    // Simular manutenções programadas (em um sistema real, isso viria do banco de dados)
    setMaintenances([
      {
        id: "maint1",
        title: "Troca de Óleo",
        description: "Ambulância 101 - Manutenção preventiva",
        time: "Hoje, 14:30",
      },
      {
        id: "maint2",
        title: "Revisão Geral",
        description: "Van 202 - Verificação de sistemas",
        time: "Hoje, 16:00",
      },
      {
        id: "maint3",
        title: "Calibragem de Pneus",
        description: "Todos os veículos - Manutenção preventiva",
        time: "Amanhã, 09:00",
      },
    ])

    return () => {
      unsubscribeVehicles()
      unsubscribeDrivers()
      unsubscribeRfid()
      unsubscribeRoutes()
    }
  }, [])

  // Processar os dados para o dashboard
  const totalVehicles = vehicles.length
  const activeVehicles = vehicles.filter((v) => v.status === "Ativo").length
  const activeRoutes = routes.length

  // Combinar dados de veículos com tags RFID, motoristas e rotas para o mapa
  const mapData = vehicles
    .map((vehicle) => {
      const rfidTag = vehicle.rfid_tag
      const rfidInfo = rfidData[rfidTag]
      const driver = drivers.find((d) => d.id === vehicle.motorista_id)

      // Encontrar rota ativa para este veículo
      const activeRoute = routes.find((r) => r.veiculoId === vehicle.id)

      // Verificar se temos todos os dados necessários
      if (!rfidInfo || !driver) {
        return null
      }

      return {
        id: vehicle.id,
        placa: vehicle.placa,
        modelo: vehicle.modelo,
        ano: vehicle.ano,
        status: vehicle.status,
        is_moving: rfidInfo.is_moving,
        latitude: rfidInfo.latitude,
        longitude: rfidInfo.longitude,
        heart_rate: rfidInfo.heart_rate,
        temperature: rfidInfo.mpu_temperature,
        motorista: driver.nome,
        motorista_status: driver.status,
        activeRoute: activeRoute || null,
      }
    })
    .filter(Boolean) // Remover itens nulos

  // Dados para o gráfico de estatísticas
  const statsData = {
    consumo: [8.2, 8.5, 8.7, 8.3, 8.1, 7.9, 8.0],
    distancia: [120, 145, 135, 150, 160, 175, 165],
    labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>

        <Skeleton className="h-[400px] w-full mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Frota Leste - Monitoramento</h1>
          <p className="text-sm text-gray-500">
            {currentTime.toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            | {currentTime.toLocaleTimeString("pt-BR")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          Online
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card
          title="Veículos Ativos"
          value={`${activeVehicles}/${totalVehicles}`}
          description={`${Math.round((activeVehicles / totalVehicles) * 100)}% da frota em operação`}
          icon={<Car className="h-5 w-5 text-emerald-600" />}
          trend="+2 desde ontem"
          trendPositive={true}
          color="emerald"
        />

        <Card
          title="Rotas Ativas"
          value={activeRoutes.toString()}
          description="Rotas em andamento"
          icon={<Car className="h-5 w-5 text-blue-500" />}
          trend={activeRoutes > 0 ? `${activeRoutes} veículos em rota` : "Nenhuma rota ativa"}
          color="blue"
        />

        <Card
          title="Alertas"
          value={alerts.length.toString()}
          description={`${alerts.filter((a) => a.severity === "critical").length} críticos, ${
            alerts.filter((a) => a.severity === "warning").length
          } moderados`}
          icon={<Bell className="h-5 w-5 text-amber-500" />}
          trend="-1 desde ontem"
          trendPositive={true}
          color="amber"
        />

        <Card
          title="Consumo Médio"
          value="8.5 L/100km"
          description="Economia de 5% este mês"
          icon={<Fuel className="h-5 w-5 text-emerald-600" />}
          trend="-0.3 L desde o mês passado"
          trendPositive={true}
          color="emerald"
        />
      </div>

      <Tabs defaultValue="map" className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <TabsList>
            <TabsTrigger value="map" className="flex items-center gap-1">
              <Car className="h-4 w-4" />
              Mapa em Tempo Real
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Agenda
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <RefreshCw className="h-4 w-4" />
            <span>Atualizado: {lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
            <Button variant="outline" size="sm" className="ml-2" onClick={() => setLastUpdate(new Date())}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Atualizar
            </Button>
          </div>
        </div>

        <TabsContent value="map" className="mt-0">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-lg font-semibold">Monitoramento em Tempo Real</h2>
                <p className="text-sm text-gray-500">Localização e status dos veículos da frota hospitalar</p>
              </div>
            </div>

            <div className="h-[400px] rounded-lg overflow-hidden border">
              <MapWithNoSSR vehicles={mapData} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-0">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-lg font-semibold">Estatísticas da Frota</h2>
                <p className="text-sm text-gray-500">Consumo e distância percorrida na última semana</p>
              </div>
            </div>

            <div className="h-[400px] rounded-lg overflow-hidden border p-4">
              <StatsChart data={statsData} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="mt-0">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-lg font-semibold">Agenda de Manutenções</h2>
                <p className="text-sm text-gray-500">Próximas manutenções programadas</p>
              </div>
            </div>

            <div className="h-[400px] rounded-lg overflow-hidden border p-4">
              <div className="grid grid-cols-7 gap-2 h-full">
                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, index) => (
                  <div key={index} className="border rounded-md p-2">
                    <div className="text-center font-medium border-b pb-1 mb-2">{day}</div>
                    {index === 0 && (
                      <div className="bg-blue-100 text-blue-800 p-2 rounded-md text-xs mb-2">
                        <p className="font-medium">Troca de Óleo</p>
                        <p>Ambulância 101</p>
                        <p>14:30</p>
                      </div>
                    )}
                    {index === 0 && (
                      <div className="bg-blue-100 text-blue-800 p-2 rounded-md text-xs">
                        <p className="font-medium">Revisão Geral</p>
                        <p>Van 202</p>
                        <p>16:00</p>
                      </div>
                    )}
                    {index === 1 && (
                      <div className="bg-blue-100 text-blue-800 p-2 rounded-md text-xs">
                        <p className="font-medium">Calibragem de Pneus</p>
                        <p>Todos os veículos</p>
                        <p>09:00</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Alertas Recentes
          </h2>
          <p className="text-sm text-gray-500 mb-4">Últimos alertas registrados no sistema</p>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                title={alert.title}
                description={alert.description}
                time={alert.time}
                severity={alert.severity}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-500" />
            Próximas Manutenções
          </h2>
          <p className="text-sm text-gray-500 mb-4">Manutenções programadas para os próximos dias</p>

          <div className="space-y-4">
            {maintenances.map((maintenance) => (
              <MaintenanceCard
                key={maintenance.id}
                title={maintenance.title}
                description={maintenance.description}
                time={maintenance.time}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            Motoristas em Serviço
          </h2>
          <p className="text-sm text-gray-500 mb-4">Motoristas atualmente em operação</p>

          <div className="space-y-4">
            {drivers
              .filter((driver) => driver.status === "Ativo")
              .slice(0, 4)
              .map((driver) => {
                const driverVehicle = vehicles.find((v) => v.motorista_id === driver.id)
                let description = "Sem veículo atribuído"

                if (driverVehicle) {
                  description = `${driverVehicle.modelo} (${driverVehicle.placa})`
                  if (driverVehicle.status === "Ativo") {
                    description += " • Em serviço"
                  } else {
                    description += " • Em manutenção"
                  }
                }

                return (
                  <DriverCard
                    key={driver.id}
                    name={driver.nome}
                    description={description}
                    status={driver.status.toLowerCase()}
                  />
                )
              })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Monitoramento Cardíaco
          </h2>
          <p className="text-sm text-gray-500 mb-4">Batimentos cardíacos dos motoristas em serviço</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mapData
              .filter((vehicle) => vehicle.heart_rate && vehicle.motorista_status === "Ativo")
              .slice(0, 4)
              .map((vehicle) => (
                <HeartRateCard
                  key={`heart-${vehicle.id}`}
                  driverName={vehicle.motorista}
                  vehicleInfo={`${vehicle.modelo} (${vehicle.placa})`}
                  initialHeartRate={vehicle.heart_rate}
                  driverId={vehicle.id}
                />
              ))}
            {mapData.filter((vehicle) => vehicle.heart_rate && vehicle.motorista_status === "Ativo").length === 0 && (
              <p className="text-sm text-gray-500 col-span-2">
                Nenhum motorista com monitoramento cardíaco ativo no momento.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
