"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, get, query, orderByChild, limitToLast } from "firebase/database"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Search, Calendar, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import dynamic from "next/dynamic"

// Importar o mapa dinamicamente para evitar problemas de SSR
const HistoryMapWithNoSSR = dynamic(() => import("@/components/history-map"), {
  ssr: false,
})

export default function HistoricoLocalizacaoPage() {
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [locationHistory, setLocationHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
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

  const fetchLocationHistory = async () => {
    if (!selectedVehicle) {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Selecione um veículo para visualizar o histórico.",
      })
      return
    }

    setLoadingHistory(true)

    try {
      // Buscar o RFID tag do veículo selecionado
      const vehicle = vehicles.find((v) => v.id === selectedVehicle)
      if (!vehicle || !vehicle.rfid_tag) {
        throw new Error("Veículo não encontrado ou sem tag RFID")
      }

      // Calcular o início e fim do dia selecionado
      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)

      // Buscar histórico de localização
      const historyRef = ref(database, `location_history/${vehicle.rfid_tag}`)
      const historyQuery = query(
        historyRef,
        orderByChild("timestamp"),
        // Na prática, você usaria startAt e endAt com os timestamps
        // Mas para este exemplo, vamos apenas limitar os resultados
        limitToLast(50),
      )
      const snapshot = await get(historyQuery)

      if (snapshot.exists()) {
        const historyData = snapshot.val()
        const historyList = Object.entries(historyData)
          .map(([id, entry]) => ({
            id,
            ...entry,
          }))
          .filter((entry) => {
            const entryDate = new Date(entry.timestamp)
            return entryDate >= startOfDay && entryDate <= endOfDay
          })
          .sort((a, b) => a.timestamp - b.timestamp)

        setLocationHistory(historyList)

        if (historyList.length === 0) {
          toast({
            title: "Sem dados",
            description: "Não há registros de localização para esta data.",
          })
        }
      } else {
        setLocationHistory([])
        toast({
          title: "Sem dados",
          description: "Não há registros de localização para este veículo.",
        })
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao buscar histórico de localização.",
      })
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleExportCSV = () => {
    if (locationHistory.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Não há dados para exportar.",
      })
      return
    }

    // Criar conteúdo CSV
    const headers = ["Data/Hora", "Latitude", "Longitude", "Velocidade", "Em Movimento"]
    const csvContent = [
      headers.join(","),
      ...locationHistory.map((entry) =>
        [
          new Date(entry.timestamp).toLocaleString("pt-BR"),
          entry.latitude,
          entry.longitude,
          entry.speed || "0",
          entry.is_moving ? "Sim" : "Não",
        ].join(","),
      ),
    ].join("\n")

    // Criar blob e link para download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `historico_${format(selectedDate, "dd-MM-yyyy")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
        <h1 className="text-2xl font-bold">Histórico de Localização</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Veículo</Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger>
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
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              onClick={fetchLocationHistory}
              disabled={!selectedVehicle || loadingHistory}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {loadingHistory ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar Histórico
                </>
              )}
            </Button>

            {locationHistory.length > 0 && (
              <Button onClick={handleExportCSV} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            )}

            {locationHistory.length > 0 && (
              <div className="p-3 border rounded-md bg-gray-50">
                <h3 className="font-medium text-sm mb-2">Resumo</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Registros:</span>
                    <span className="font-medium">{locationHistory.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Primeiro registro:</span>
                    <span className="font-medium">
                      {new Date(locationHistory[0].timestamp).toLocaleTimeString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Último registro:</span>
                    <span className="font-medium">
                      {new Date(locationHistory[locationHistory.length - 1].timestamp).toLocaleTimeString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardContent className="p-0 h-[600px]">
            {locationHistory.length > 0 ? (
              <HistoryMapWithNoSSR
                history={locationHistory}
                vehiclePlaca={vehicles.find((v) => v.id === selectedVehicle)?.placa || ""}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium">Sem dados de histórico</p>
                  <p className="max-w-md mt-1">
                    Selecione um veículo e uma data, depois clique em "Buscar Histórico" para visualizar o trajeto.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const Label = ({ children }) => <div className="text-sm font-medium mb-1.5">{children}</div>
