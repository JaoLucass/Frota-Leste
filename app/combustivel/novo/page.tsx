"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, get, push, set } from "firebase/database"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Calendar } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function NovoAbastecimento() {
  const [formData, setFormData] = useState({
    veiculoId: "",
    data: new Date(),
    posto: "",
    litros: "",
    valor: "",
    kmAtual: "",
    tipoCombustivel: "Gasolina",
    observacoes: "",
  })
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [kmAnterior, setKmAnterior] = useState(null)
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

  // Buscar quilometragem anterior quando o veículo é selecionado
  useEffect(() => {
    if (!formData.veiculoId) {
      setKmAnterior(null)
      return
    }

    const fetchLastFuel = async () => {
      try {
        const fuelRef = ref(database, "fuel")
        const snapshot = await get(fuelRef)

        if (snapshot.exists()) {
          const fuelData = snapshot.val()
          const fuelEntries = Object.values(fuelData) as any[]

          // Filtrar por veículo e ordenar por data (mais recente primeiro)
          const lastFuel = fuelEntries
            .filter((entry) => entry.veiculoId === formData.veiculoId)
            .sort((a, b) => b.data - a.data)[0]

          if (lastFuel) {
            setKmAnterior(lastFuel.kmAtual)
          } else {
            setKmAnterior(null)
          }
        }
      } catch (error) {
        console.error("Erro ao buscar último abastecimento:", error)
      }
    }

    fetchLastFuel()
  }, [formData.veiculoId])

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

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      data: date,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Validar quilometragem
      if (kmAnterior && Number.parseInt(formData.kmAtual) <= kmAnterior) {
        toast({
          variant: "destructive",
          title: "Erro!",
          description: `A quilometragem atual deve ser maior que a anterior (${kmAnterior} km).`,
        })
        setSaving(false)
        return
      }

      // Buscar dados do veículo selecionado
      const veiculoRef = ref(database, `vehicles/${formData.veiculoId}`)
      const veiculoSnapshot = await get(veiculoRef)

      if (!veiculoSnapshot.exists()) {
        throw new Error("Veículo não encontrado")
      }

      const veiculoData = veiculoSnapshot.val()

      const fuelRef = ref(database, "fuel")
      const newFuelRef = push(fuelRef)

      await set(newFuelRef, {
        ...formData,
        veiculo: {
          id: formData.veiculoId,
          placa: veiculoData.placa,
          modelo: veiculoData.modelo,
        },
        data: formData.data.getTime(),
        litros: Number.parseFloat(formData.litros),
        valor: Number.parseFloat(formData.valor),
        kmAtual: Number.parseInt(formData.kmAtual),
        kmAnterior: kmAnterior,
        dataCriacao: Date.now(),
      })

      toast({
        title: "Sucesso!",
        description: "Abastecimento registrado com sucesso.",
      })

      router.push("/combustivel")
    } catch (error) {
      console.error("Erro ao registrar abastecimento:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao registrar o abastecimento.",
      })
    } finally {
      setSaving(false)
    }
  }

  // Calcular consumo
  const calcularConsumo = () => {
    if (!kmAnterior || !formData.kmAtual || !formData.litros) return null

    const distancia = Number.parseInt(formData.kmAtual) - kmAnterior
    const consumo = distancia / Number.parseFloat(formData.litros)

    return consumo.toFixed(2)
  }

  // Calcular preço por litro
  const calcularPrecoLitro = () => {
    if (!formData.valor || !formData.litros) return null

    const preco = Number.parseFloat(formData.valor) / Number.parseFloat(formData.litros)

    return preco.toFixed(2)
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
        <h1 className="text-2xl font-bold">Novo Abastecimento</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="veiculoId">Veículo</Label>
            <Select
              value={formData.veiculoId}
              onValueChange={(value) => handleSelectChange("veiculoId", value)}
              required
            >
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
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.data ? format(formData.data, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={formData.data}
                  onSelect={handleDateChange}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="posto">Posto</Label>
            <Input
              id="posto"
              name="posto"
              value={formData.posto}
              onChange={handleChange}
              placeholder="Nome do posto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoCombustivel">Tipo de Combustível</Label>
            <Select
              value={formData.tipoCombustivel}
              onValueChange={(value) => handleSelectChange("tipoCombustivel", value)}
            >
              <SelectTrigger id="tipoCombustivel">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gasolina">Gasolina</SelectItem>
                <SelectItem value="Etanol">Etanol</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="GNV">GNV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="litros">Litros</Label>
            <Input
              id="litros"
              name="litros"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.litros}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor Total (R$)</Label>
            <Input
              id="valor"
              name="valor"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.valor}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kmAtual">Quilometragem Atual</Label>
            <Input
              id="kmAtual"
              name="kmAtual"
              type="number"
              min="0"
              value={formData.kmAtual}
              onChange={handleChange}
              placeholder="0"
              required
            />
            {kmAnterior && <p className="text-xs text-gray-500">Última quilometragem registrada: {kmAnterior} km</p>}
          </div>

          <div className="space-y-2">
            <Label>Cálculos</Label>
            <div className="p-2 border rounded-md bg-gray-50">
              <div className="flex justify-between text-sm">
                <span>Preço por litro:</span>
                <span className="font-medium">{calcularPrecoLitro() ? `R$ ${calcularPrecoLitro()}` : "-"}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Consumo:</span>
                <span className="font-medium">{calcularConsumo() ? `${calcularConsumo()} km/L` : "-"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Input
            id="observacoes"
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            placeholder="Observações adicionais"
          />
        </div>

        <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Abastecimento
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
