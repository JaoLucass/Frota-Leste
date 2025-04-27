"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye, Filter, CalendarIcon } from "lucide-react"
import { database } from "@/lib/firebase"
import { ref, onValue, remove } from "firebase/database"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

// Importar o calendário dinamicamente para evitar problemas de SSR
const ScheduleCalendarWithNoSSR = dynamic(() => import("@/components/schedule-calendar"), {
  ssr: false,
})

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState([])
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const router = useRouter()

  useEffect(() => {
    const agendamentosRef = ref(database, "schedules")

    const unsubscribe = onValue(agendamentosRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const agendamentosList = Object.entries(data).map(([id, agendamento]) => ({
          id,
          ...agendamento,
        }))
        setAgendamentos(agendamentosList)
      } else {
        setAgendamentos([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleDelete = async () => {
    try {
      if (!deleteId) return

      const agendamentoRef = ref(database, `schedules/${deleteId}`)
      await remove(agendamentoRef)

      toast({
        title: "Sucesso!",
        description: "Agendamento excluído com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao excluir o agendamento.",
      })
    } finally {
      setDeleteId(null)
    }
  }

  const handleDeleteConfirm = (id) => {
    setDeleteId(id)
  }

  const handleDeleteCancel = () => {
    setDeleteId(null)
  }

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

  const filteredAgendamentos = agendamentos
    .filter(
      (agendamento) =>
        agendamento.titulo?.toLowerCase().includes(search.toLowerCase()) ||
        agendamento.veiculo?.placa?.toLowerCase().includes(search.toLowerCase()) ||
        agendamento.responsavel?.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((agendamento) => {
      if (filtroTipo === "todos") return true
      return agendamento.tipo.toLowerCase() === filtroTipo.toLowerCase()
    })
    .filter((agendamento) => {
      if (filtroStatus === "todos") return true
      return agendamento.status.toLowerCase() === filtroStatus.toLowerCase()
    })

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
        <h1 className="text-2xl font-bold">Agendamentos</h1>
        <Button onClick={() => router.push("/agendamentos/novo")} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <Tabs defaultValue="lista" className="mb-6">
        <TabsList>
          <TabsTrigger value="lista" className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="calendario" className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            Calendário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="mt-4">
          <div className="flex items-center mb-4 gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar agendamento..."
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
                <DropdownMenuLabel>Tipo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setFiltroTipo("todos")}>
                    <span className={filtroTipo === "todos" ? "font-bold" : ""}>Todos</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroTipo("entrega")}>
                    <span className={filtroTipo === "entrega" ? "font-bold" : ""}>Entrega</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroTipo("transporte")}>
                    <span className={filtroTipo === "transporte" ? "font-bold" : ""}>Transporte</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroTipo("manutenção")}>
                    <span className={filtroTipo === "manutenção" ? "font-bold" : ""}>Manutenção</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroTipo("emergência")}>
                    <span className={filtroTipo === "emergência" ? "font-bold" : ""}>Emergência</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setFiltroStatus("todos")}>
                    <span className={filtroStatus === "todos" ? "font-bold" : ""}>Todos</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroStatus("agendado")}>
                    <span className={filtroStatus === "agendado" ? "font-bold" : ""}>Agendado</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroStatus("em andamento")}>
                    <span className={filtroStatus === "em andamento" ? "font-bold" : ""}>Em Andamento</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroStatus("concluído")}>
                    <span className={filtroStatus === "concluído" ? "font-bold" : ""}>Concluído</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroStatus("cancelado")}>
                    <span className={filtroStatus === "cancelado" ? "font-bold" : ""}>Cancelado</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Table>
            <TableCaption>Lista de agendamentos cadastrados.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgendamentos.map((agendamento) => (
                <TableRow key={agendamento.id}>
                  <TableCell className="font-medium">{agendamento.titulo}</TableCell>
                  <TableCell>{agendamento.veiculo.placa}</TableCell>
                  <TableCell>{getTipoBadge(agendamento.tipo)}</TableCell>
                  <TableCell>
                    {new Date(agendamento.dataHora).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>{agendamento.responsavel}</TableCell>
                  <TableCell>{getStatusBadge(agendamento.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/agendamentos/${agendamento.id}`)}
                        className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/agendamentos/editar/${agendamento.id}`)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteConfirm(agendamento.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAgendamentos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Nenhum agendamento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={7}>Total de agendamentos: {filteredAgendamentos.length}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TabsContent>

        <TabsContent value="calendario" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5 text-emerald-500" />
                Calendário de Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[600px]">
                <ScheduleCalendarWithNoSSR
                  agendamentos={agendamentos}
                  onEventClick={(id) => router.push(`/agendamentos/${id}`)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá excluir o agendamento permanentemente. Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
