"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { FlagOff, CheckCircle } from "lucide-react"
import { database } from "@/lib/firebase"
import { ref, update } from "firebase/database"

interface EndTripDialogProps {
  routeId: string
  routeName: string
  vehicleId: string
  vehiclePlate: string
  onTripEnded: () => void
}

export function EndTripDialog({ routeId, routeName, vehicleId, vehiclePlate, onTripEnded }: EndTripDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    kmFinal: "",
    combustivelGasto: "",
    observacoes: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Atualizar status da rota para "Concluída"
      const rotaRef = ref(database, `routes/${routeId}`)
      await update(rotaRef, {
        status: "Concluída",
        dataFim: Date.now(),
        kmFinal: formData.kmFinal,
        combustivelGasto: formData.combustivelGasto,
        observacoes: formData.observacoes,
      })

      // Atualizar status do veículo para "Disponível"
      const veiculoRef = ref(database, `vehicles/${vehicleId}`)
      await update(veiculoRef, {
        status: "Ativo",
        is_moving: false,
      })

      toast({
        title: "Viagem encerrada com sucesso!",
        description: `A rota ${routeName} foi concluída.`,
      })

      // Fechar o diálogo
      setOpen(false)

      // Limpar o formulário
      setFormData({
        kmFinal: "",
        combustivelGasto: "",
        observacoes: "",
      })

      // Callback para atualizar a UI
      onTripEnded()
    } catch (error) {
      console.error("Erro ao encerrar viagem:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao encerrar a viagem. Tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200">
          <FlagOff className="mr-2 h-4 w-4" />
          Encerrar Viagem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Encerrar Viagem</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para encerrar a viagem da rota <span className="font-medium">{routeName}</span> com
            o veículo <span className="font-medium">{vehiclePlate}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="kmFinal" className="text-right">
                Km Final
              </Label>
              <Input
                id="kmFinal"
                name="kmFinal"
                type="number"
                value={formData.kmFinal}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="combustivelGasto" className="text-right">
                Combustível (L)
              </Label>
              <Input
                id="combustivelGasto"
                name="combustivelGasto"
                type="number"
                step="0.01"
                value={formData.combustivelGasto}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="observacoes" className="text-right">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Encerrando...
                </div>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
