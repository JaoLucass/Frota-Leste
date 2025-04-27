"use client"

import { useState } from "react"
import { database } from "@/lib/firebase"
import { ref, push, set } from "firebase/database"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function NovoMotorista() {
  const [formData, setFormData] = useState({
    nome: "",
    cnh: "",
    telefone: "",
    status: "Ativo",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
    setLoading(true)

    try {
      const motoristasRef = ref(database, "drivers")
      const newMotoristaRef = push(motoristasRef)

      await set(newMotoristaRef, {
        ...formData,
        createdAt: Date.now(),
        is_moving: false,
      })

      toast({
        title: "Sucesso!",
        description: "Motorista adicionado com sucesso.",
      })

      router.push("/motoristas")
    } catch (error) {
      console.error("Erro ao adicionar motorista:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao adicionar o motorista.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Novo Motorista</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnh">CNH</Label>
            <Input
              id="cnh"
              name="cnh"
              value={formData.cnh}
              onChange={handleChange}
              placeholder="Número da CNH"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
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
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
                <SelectItem value="Férias">Férias</SelectItem>
                <SelectItem value="Afastado">Afastado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Motorista
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
