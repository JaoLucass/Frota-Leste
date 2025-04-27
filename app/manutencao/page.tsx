"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, Calendar, Filter } from "lucide-react"
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

export default function ManutencaoPage() {
  const [manutencoes, setManutencoes] = useState([])
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const router = useRouter()

  useEffect(() => {
    const manutencoesRef = ref(database, "maintenance")

    const unsubscribe = onValue(manutencoesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const manutencoesList = Object.entries(data).map(([id, manutencao]) => ({
          id,
          ...manutencao,
        }))
        setManutencoes(manutencoesList)
      } else {
        setManutencoes([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleDelete = async () => {
    try {
      if (!deleteId) return

      const manutencaoRef = ref(database, `maintenance/${deleteId}`)
      await remove(manutencaoRef)

      toast({
        title: "Sucesso!",
        description: "Manutenção excluída com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir manutenção:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao excluir a manutenção.",
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

  const filteredManutencoes = manutencoes
    .filter(
      (manutencao) =>
        manutencao.descricao?.toLowerCase().includes(search.toLowerCase()) ||
        manutencao.veiculo?.placa?.toLowerCase().includes(search.toLowerCase()) ||
        manutencao.tipo?.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((manutencao) => {
      if (filtroStatus === "todos") return true
      return manutencao.status.toLowerCase() === filtroStatus.toLowerCase()
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
        <h1 className="text-2xl font-bold">Manutenções</h1>
        <Button onClick={() => router.push("/manutencao/nova")} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Nova Manutenção
        </Button>
      </div>

      <div className="flex items-center mb-4 gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Buscar manutenção..."
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
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setFiltroStatus("todos")}>
                <span className={filtroStatus === "todos" ? "font-bold" : ""}>Todos</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFiltroStatus("agendada")}>
                <span className={filtroStatus === "agendada" ? "font-bold" : ""}>Agendada</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFiltroStatus("em andamento")}>
                <span className={filtroStatus === "em andamento" ? "font-bold" : ""}>Em Andamento</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFiltroStatus("concluída")}>
                <span className={filtroStatus === "concluída" ? "font-bold" : ""}>Concluída</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFiltroStatus("cancelada")}>
                <span className={filtroStatus === "cancelada" ? "font-bold" : ""}>Cancelada</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Calendário
        </Button>
      </div>

      <Table>
        <TableCaption>Lista de manutenções cadastradas.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Veículo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Data Agendada</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredManutencoes.map((manutencao) => (
            <TableRow key={manutencao.id}>
              <TableCell className="font-medium">{manutencao.veiculo.placa}</TableCell>
              <TableCell>{manutencao.descricao}</TableCell>
              <TableCell>{getTipoBadge(manutencao.tipo)}</TableCell>
              <TableCell>
                {new Date(manutencao.dataAgendada).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>{getStatusBadge(manutencao.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/manutencao/${manutencao.id}`)}
                    className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/manutencao/editar/${manutencao.id}`)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteConfirm(manutencao.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredManutencoes.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                Nenhuma manutenção encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>Total de manutenções: {filteredManutencoes.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá excluir a manutenção permanentemente. Tem certeza que deseja continuar?
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
