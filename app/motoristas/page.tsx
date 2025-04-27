"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
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
import { toast } from "@/components/ui/use-toast"

export default function MotoristasPage() {
  const [motoristas, setMotoristas] = useState([])
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const motoristasRef = ref(database, "drivers")

    const unsubscribe = onValue(motoristasRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const motoristasList = Object.entries(data).map(([id, motorista]) => ({
          id,
          ...motorista,
        }))
        setMotoristas(motoristasList)
      } else {
        setMotoristas([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleDelete = async () => {
    try {
      if (!deleteId) return

      const motoristaRef = ref(database, `drivers/${deleteId}`)
      await remove(motoristaRef)

      toast({
        title: "Sucesso!",
        description: "Motorista excluído com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir motorista:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao excluir o motorista.",
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

  const filteredMotoristas = motoristas.filter(
    (motorista) =>
      motorista.nome?.toLowerCase().includes(search.toLowerCase()) ||
      motorista.cnh?.toLowerCase().includes(search.toLowerCase()) ||
      motorista.telefone?.toLowerCase().includes(search.toLowerCase()),
  )

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
        <h1 className="text-2xl font-bold">Motoristas</h1>
        <Button onClick={() => router.push("/motoristas/novo")} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Motorista
        </Button>
      </div>

      <div className="flex items-center mb-4">
        <Input
          type="text"
          placeholder="Buscar motorista..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm"
        />
        <Button variant="outline" className="ml-2">
          <Search className="mr-2 h-4 w-4" />
          Buscar
        </Button>
      </div>

      <Table>
        <TableCaption>Lista de motoristas cadastrados.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CNH</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMotoristas.map((motorista) => (
            <TableRow key={motorista.id}>
              <TableCell className="font-medium">{motorista.nome}</TableCell>
              <TableCell>{motorista.cnh}</TableCell>
              <TableCell>{motorista.telefone}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    motorista.status === "Ativo" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {motorista.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/motoristas/${motorista.id}`)}
                    className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/motoristas/editar/${motorista.id}`)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteConfirm(motorista.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredMotoristas.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                Nenhum motorista encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5}>Total de motoristas: {motoristas.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá excluir o motorista permanentemente. Tem certeza que deseja continuar?
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
