"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Filter, History, MapPin, RefreshCw, RouteIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from "next/dynamic"

// Importar o mapa dinamicamente para evitar problemas de SSR
const LocationMapWithNoSSR = dynamic(() => import("@/components/location-map"), {
  ssr: false,
})

export default function LocalizacaoPage() {
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [rfidData, setRfidData] = useState({})
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [filtroMotorista, setFiltroMotorista] = useState("todos")
  const [showRoutes, setShowRoutes] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const router = useRouter()

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

    return () => {
      unsubscribeVehicles()
      unsubscribeDrivers()
      unsubscribeRfid()
      unsubscribeRoutes()
    }
  }, [])

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

      // Aplicar filtros
      if (
        (filtroStatus !== "todos" && (filtroStatus === "em_movimento" ? !rfidInfo.is_moving : rfidInfo.is_moving)) ||
        (filtroMotorista !== "todos" && driver.id !== filtroMotorista) ||
        (!vehicle.placa.toLowerCase().includes(search.toLowerCase()) &&
          !vehicle.modelo.toLowerCase().includes(search.toLowerCase()) &&
          !driver.nome.toLowerCase().includes(search.toLowerCase()))
      ) {
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
        activeRoute: showRoutes ? activeRoute || null : null,
      }
    })
    .filter(Boolean) // Remover itens nulos

  const handleRefresh = () => {
    setLastUpdate(new Date())
    toast({
      title: "Atualizado",
      description: "Dados de localização atualizados com sucesso.",
    })
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Localização em Tempo Real</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-emerald-600">Atualizado: {lastUpdate.toLocaleTimeString("pt-BR")}</span>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-3">
          <div className="flex items-center mb-4 gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar veículo ou motorista..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setFiltroStatus("todos")}>
                    <span className={filtroStatus === "todos" ? "font-bold" : ""}>Todos</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroStatus("em_movimento")}>
                    <span className={filtroStatus === "em_movimento" ? "font-bold" : ""}>Em Movimento</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroStatus("parado")}>
                    <span className={filtroStatus === "parado" ? "font-bold" : ""}>Parado</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Rotas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setShowRoutes(!showRoutes)}>
                    <span>{showRoutes ? "✓ Mostrar Rotas" : "Mostrar Rotas"}</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="gap-2" onClick={() => router.push("/localizacao/historico")}>
              <History className="h-4 w-4" />
              Histórico
            </Button>
          </div>

          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              <LocationMapWithNoSSR vehicles={mapData} />
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="mb-4">
            <Label>Filtrar por Motorista</Label>
            <Select value={filtroMotorista} onValueChange={setFiltroMotorista}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um motorista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Motoristas</SelectItem>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MapPin className="mr-2 h-5 w-5 text-emerald-500" />
                Veículos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[480px] overflow-y-auto">
              {mapData.length > 0 ? (
                <div className="space-y-3">
                  {mapData.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/veiculos/${vehicle.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{vehicle.placa}</h3>
                          <p className="text-sm text-gray-500">{vehicle.modelo}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            vehicle.is_moving ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {vehicle.is_moving ? "Em movimento" : "Parado"}
                        </span>
                      </div>
                      <div className="mt-2 text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium">Motorista:</span> {vehicle.motorista}
                        </p>
                        {vehicle.activeRoute && (
                          <p className="text-emerald-600 flex items-center mt-1">
                            <RouteIcon className="h-3 w-3 mr-1" />
                            {vehicle.activeRoute.nome}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>Nenhum veículo encontrado com os filtros atuais.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

const Label = ({ children }) => <div className="text-sm font-medium mb-1.5">{children}</div>
