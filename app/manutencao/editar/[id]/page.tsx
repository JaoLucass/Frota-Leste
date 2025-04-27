"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, get, update } from "firebase/database"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Calendar } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function EditarManutencao({ params }) {
  const [formData, setFormData] = useState({
    descricao: "",
    tipo: "",
    status: "",
    veiculoId: "",
    dataAgendada: new Date(),
    custo: "",
    observacoes: "",
    responsavel: "",
  })
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar dados da manutenção
        const manutencaoRef = ref(database, `maintenance/${id}`)
        const manutencaoSnapshot = await get(manutencaoRef)

        if (!manutencaoSnapshot.exists()) {
          toast({
            variant: "destructive",
            title: "Erro!",
            description: "Manutenção não encontrada.",
          })
          router.push("/manutencao")
          return
        }

        const manutencaoData = manutencaoSnapshot.val()

        // Buscar veículos
        const vehiclesRef = ref(database, "vehicles")
        const vehiclesSnapshot = await get(vehiclesRef)

        if (vehiclesSnapshot.exists()) {
          const vehiclesData = vehiclesSnapshot.val()
          const vehiclesList = Object.entries(vehiclesData).map(([id, vehicle]) => ({
            id,
            ...vehicle,
          }))
          setVehicles(vehiclesList)
        }

        // Preencher o formulário
        setFormData({
          descricao: manutencaoData.descricao || "",
          tipo: manutencaoData.tipo || "Preventiva",
          status: manutencaoData.status || "Agendada",
          veiculoId: manutencaoData.veiculoId || "",
          dataAgendada: manutencaoData.dataAgendada ? new Date(manutencaoData.dataAgendada) : new Date(),
          custo: manutencaoData.custo || "",
          observacoes: manutencaoData.observacoes || "",
          responsavel: manutencaoData.responsavel || "",
        })
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
  }, [id, router])

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
      dataAgendada: date,
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

      const manutencaoRef = ref(database, `maintenance/${id}`)

      await update(manutencaoRef, {
        ...formData,
        veiculo: {
          id: formData.veiculoId,
          placa: veiculoData.placa,
          modelo: veiculoData.modelo,
        },
        dataAgendada: formData.dataAgendada.getTime(),
        dataAtualizacao: Date.now(),
      })

      toast({
        title: "Sucesso!",
        description: "Manutenção atualizada com sucesso.",
      })

      router.push("/manutencao")
    } catch (error) {
      console.error("Erro ao atualizar manutenção:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao atualizar a manutenção.",
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
        <h1 className="text-2xl font-bold">Editar Manutenção</h1>
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
            <Label htmlFor="tipo">Tipo de Manutenção</Label>
            <Select value={formData.tipo} onValueChange={(value) => handleSelectChange("tipo", value)}>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Preventiva">Preventiva</SelectItem>
                <SelectItem value="Corretiva">Corretiva</SelectItem>
                <SelectItem value="Revisão">Revisão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Agendada">Agendada</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Concluída">Concluída</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data Agendada</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.dataAgendada ? (
                    format(formData.dataAgendada, "dd/MM/yyyy")
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={formData.dataAgendada}
                  onSelect={handleDateChange}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custo">Custo Estimado (R$)</Label>
            <Input id="custo" name="custo" value={formData.custo} onChange={handleChange} placeholder="0,00" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável</Label>
            <Input
              id="responsavel"
              name="responsavel"
              value={formData.responsavel}
              onChange={handleChange}
              placeholder="Nome do responsável"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Input
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descrição da manutenção"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            placeholder="Observações adicionais"
            rows={4}
          />
        </div>

        <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
