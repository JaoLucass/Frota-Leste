"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, get, push, set } from "firebase/database"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Calendar, Clock } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { TimePickerDemo } from "@/components/time-picker"

export default function NovoAgendamento() {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo: "Transporte",
    status: "Agendado",
    veiculoId: "",
    data: new Date(),
    hora: "08:00",
    responsavel: "",
    local: "",
    prioridade: "Normal",
  })
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  const handleTimeChange = (time) => {
    setFormData((prev) => ({
      ...prev,
      hora: time,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Buscar dados do veículo selecionado
      const veiculoRef = ref(database, `vehicles/${formData.veiculoId}`)
      const veiculoSnapshot = await get(veiculoRef)

      if (!veiculoSnapshot.exists()) {
        throw new Error("Veículo não encontrado")
      }

      const veiculoData = veiculoSnapshot.val()

      // Converter data e hora para timestamp
      const [hours, minutes] = formData.hora.split(":").map(Number)
      const dataHora = new Date(formData.data)
      dataHora.setHours(hours, minutes, 0, 0)

      const agendamentosRef = ref(database, "schedules")
      const newAgendamentoRef = push(agendamentosRef)

      await set(newAgendamentoRef, {
        ...formData,
        veiculo: {
          id: formData.veiculoId,
          placa: veiculoData.placa,
          modelo: veiculoData.modelo,
        },
        dataHora: dataHora.getTime(),
        dataCriacao: Date.now(),
      })

      toast({
        title: "Sucesso!",
        description: "Agendamento adicionado com sucesso.",
      })

      router.push("/agendamentos")
    } catch (error) {
      console.error("Erro ao adicionar agendamento:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao adicionar o agendamento.",
      })
    } finally {
      setSaving(false)
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
        <h1 className="text-2xl font-bold">Novo Agendamento</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Título do agendamento"
              required
            />
          </div>

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
            <Label htmlFor="tipo">Tipo</Label>
            <Select value={formData.tipo} onValueChange={(value) => handleSelectChange("tipo", value)}>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Transporte">Transporte</SelectItem>
                <SelectItem value="Entrega">Entrega</SelectItem>
                <SelectItem value="Manutenção">Manutenção</SelectItem>
                <SelectItem value="Emergência">Emergência</SelectItem>
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
            <Label>Hora</Label>
            <div className="flex items-center">
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Clock className="mr-2 h-4 w-4" />
                {formData.hora}
              </Button>
              <TimePickerDemo value={formData.hora} onChange={handleTimeChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável</Label>
            <Input
              id="responsavel"
              name="responsavel"
              value={formData.responsavel}
              onChange={handleChange}
              placeholder="Nome do responsável"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="local">Local</Label>
            <Input
              id="local"
              name="local"
              value={formData.local}
              onChange={handleChange}
              placeholder="Local do agendamento"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Agendado">Agendado</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prioridade">Prioridade</Label>
            <Select value={formData.prioridade} onValueChange={(value) => handleSelectChange("prioridade", value)}>
              <SelectTrigger id="prioridade">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Baixa">Baixa</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descrição detalhada do agendamento"
            rows={4}
            required
          />
        </div>

        <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Agendamento
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
