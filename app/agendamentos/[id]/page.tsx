"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Calendar, Car, User, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

export default function DetalhesAgendamento({ params }) {
  const [agendamento, setAgendamento] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    const fetchAgendamento = async () => {
      try {
        const agendamentoRef = ref(database, `schedules/${id}`)
        const snapshot = await get(agendamentoRef)

        if (!snapshot.exists()) {
          toast({
            variant: "destructive",
            title: "Erro!",
            description: "Agendamento não encontrado.",
          })
          router.push("/agendamentos")
          return
        }

        const agendamentoData = snapshot.val()
        setAgendamento({ id, ...agendamentoData })
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        toast({
          variant: "destructive",
          title: "Erro!",
          description: "Falha ao buscar dados do agendamento.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAgendamento()
  }, [id, router])

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "agendado":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Agendado</Badge>
      case "em andamento":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Em Andamento</Badge>
      case "concluído":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Concluído</Badge>
      case "cancelado":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>
    }
  }

  const getTipoBadge = (tipo) => {
    switch (tipo.toLowerCase()) {
      case "entrega":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Entrega</Badge>
      case "transporte":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Transporte</Badge>
      case "manutenção":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Manutenção</Badge>
      case "emergência":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Emergência</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{tipo}</Badge>
    }
  }

  const getPrioridadeBadge = (prioridade) => {
    switch (prioridade.toLowerCase()) {
      case "baixa":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Baixa</Badge>
      case "normal":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Normal</Badge>
      case "alta":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Alta</Badge>
      case "urgente":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Urgente</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{prioridade}</Badge>
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
        <h1 className="text-2xl font-bold">Detalhes do Agendamento</h1>
        <Button variant="outline" onClick={() => router.push(`/agendamentos/editar/${id}`)} className="ml-auto">
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-emerald-500" />
              Informações do Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Título</h3>
              <p className="font-semibold text-lg">{agendamento.titulo}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tipo</h3>
                <div className="mt-1">{getTipoBadge(agendamento.tipo)}</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <div className="mt-1">{getStatusBadge(agendamento.status)}</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Prioridade</h3>
                <div className="mt-1">{getPrioridadeBadge(agendamento.prioridade)}</div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Data e Hora</h3>
              <p>
                {new Date(agendamento.dataHora).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Local</h3>
              <p>{agendamento.local}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
              <p className="text-gray-700 whitespace-pre-line">{agendamento.descricao}</p>
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
              onClick={() => router.push(`/veiculos/${agendamento.veiculo.id}`)}
            >
              <div>
                <h3 className="text-sm font-medium text-gray-500">Placa</h3>
                <p className="font-semibold">{agendamento.veiculo.placa}</p>
              </div>
              <div className="mt-2">
                <h3 className="text-sm font-medium text-gray-500">Modelo</h3>
                <p>{agendamento.veiculo.modelo}</p>
              </div>
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
              <p className="font-semibold">{agendamento.responsavel}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-amber-500" />
              Informações Adicionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Data de Criação</h3>
              <p>
                {new Date(agendamento.dataCriacao).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {agendamento.dataAtualizacao && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Última Atualização</h3>
                <p>
                  {new Date(agendamento.dataAtualizacao).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
