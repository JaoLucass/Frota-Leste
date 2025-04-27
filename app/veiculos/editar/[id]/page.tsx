"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, get, update } from "firebase/database"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function EditarVeiculo({ params }) {
  const [formData, setFormData] = useState({
    placa: "",
    modelo: "",
    ano: "",
    status: "",
    motorista_id: "",
    rfid_tag: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    const fetchVeiculo = async () => {
      try {
        const veiculoRef = ref(database, `vehicles/${id}`)
        const snapshot = await get(veiculoRef)

        if (snapshot.exists()) {
          const veiculoData = snapshot.val()
          setFormData({
            placa: veiculoData.placa || "",
            modelo: veiculoData.modelo || "",
            ano: veiculoData.ano || "",
            status: veiculoData.status || "Ativo",
            motorista_id: veiculoData.motorista_id || "",
            rfid_tag: veiculoData.rfid_tag || "",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Erro!",
            description: "Veículo não encontrado.",
          })
          router.push("/veiculos")
        }
      } catch (error) {
        console.error("Erro ao buscar veículo:", error)
        toast({
          variant: "destructive",
          title: "Erro!",
          description: "Falha ao buscar dados do veículo.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVeiculo()
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const veiculoRef = ref(database, `vehicles/${id}`)

      await update(veiculoRef, {
        ...formData,
        updatedAt: Date.now(),
      })

      toast({
        title: "Sucesso!",
        description: "Veículo atualizado com sucesso.",
      })

      router.push("/veiculos")
    } catch (error) {
      console.error("Erro ao atualizar veículo:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao atualizar o veículo.",
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
        <h1 className="text-2xl font-bold">Editar Veículo</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="placa">Placa</Label>
            <Input
              id="placa"
              name="placa"
              value={formData.placa}
              onChange={handleChange}
              placeholder="ABC1234"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelo">Modelo</Label>
            <Input
              id="modelo"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              placeholder="Ford Ranger"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ano">Ano</Label>
            <Input id="ano" name="ano" value={formData.ano} onChange={handleChange} placeholder="2023" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Manutenção">Manutenção</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfid_tag">RFID Tag</Label>
            <Input
              id="rfid_tag"
              name="rfid_tag"
              value={formData.rfid_tag}
              onChange={handleChange}
              placeholder="tag_id"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motorista_id">ID do Motorista</Label>
            <Input
              id="motorista_id"
              name="motorista_id"
              value={formData.motorista_id}
              onChange={handleChange}
              placeholder="id_do_motorista"
              required
            />
          </div>
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
