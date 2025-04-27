"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Wrench, Car, DollarSign, User, ClipboardList } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

export default function DetalhesManutencao({ params }) {
  const [manutencao, setManutencao] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    const fetchManutencao = async () => {
      try {
        const manutencaoRef = ref(database, `maintenance/${id}`)
        const snapshot = await get(manutencaoRef)

        if (!snapshot.exists()) {
          toast({
            variant: "destructive",
            title: "Erro!",
            description: "Manutenção não encontrada.",
          })
          router.push("/manutencao")
          return
        }

        const manutencaoData = snapshot.val()
        setManutencao({ id, ...manutencaoData })
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        toast({
          variant: "destructive",
          title: "Erro!",
          description: "Falha ao buscar dados da manutenção.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchManutencao()
  }, [id, router])

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "agendada":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Agendada</Badge>
      case "em andamento":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Em Andamento</Badge>
      case "concluída":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Concluída</Badge>
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelada</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>
    }
  }

  const getTipoBadge = (tipo) => {
    switch (tipo.toLowerCase()) {
      case "preventiva":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Preventiva</Badge>
      case "corretiva":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Corretiva</Badge>
      case "revisão":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Revisão</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{tipo}</Badge>
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
        <h1 className="text-2xl font-bold">Detalhes da Manutenção</h1>
        <Button variant="outline" onClick={() => router.push(`/manutencao/editar/${id}`)} className="ml-auto">
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="mr-2 h-5 w-5 text-emerald-500" />
              Informações da Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
              <p className="font-semibold">{manutencao.descricao}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Tipo</h3>
              <div className="mt-1">{getTipoBadge(manutencao.tipo)}</div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <div className="mt-1">{getStatusBadge(manutencao.status)}</div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Data Agendada</h3>
              <p>
                {new Date(manutencao.dataAgendada).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Data de Criação</h3>
              <p>
                {new Date(manutencao.dataCriacao).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="mr-2 h-5 w-5 text-blue-500" />
              Veículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => router.push(`/veiculos/${manutencao.veiculo.id}`)}
            >
              <div>
                <h3 className="text-sm font-medium text-gray-500">Placa</h3>
                <p className="font-semibold">{manutencao.veiculo.placa}</p>
              </div>
              <div className="mt-2">
                <h3 className="text-sm font-medium text-gray-500">Modelo</h3>
                <p>{manutencao.veiculo.modelo}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-amber-500" />
              Informações Financeiras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Custo Estimado</h3>
              <p className="font-semibold">{manutencao.custo ? `R$ ${manutencao.custo}` : "Não informado"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-purple-500" />
              Responsável
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Nome</h3>
              <p className="font-semibold">{manutencao.responsavel || "Não informado"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5 text-emerald-500" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-line">
              {manutencao.observacoes || "Nenhuma observação registrada."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
