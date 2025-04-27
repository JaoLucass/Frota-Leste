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

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState([])
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const veiculosRef = ref(database, "vehicles")

    const unsubscribe = onValue(veiculosRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const veiculosList = Object.entries(data).map(([id, veiculo]) => ({
          id,
          ...veiculo,
        }))
        setVeiculos(veiculosList)
      } else {
        setVeiculos([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleDelete = async () => {
    try {
      if (!deleteId) return

      const veiculoRef = ref(database, `vehicles/${deleteId}`)
      await remove(veiculoRef)

      toast({
        title: "Sucesso!",
        description: "Veículo excluído com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir veículo:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao excluir o veículo.",
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

  const filteredVeiculos = veiculos.filter(
    (veiculo) =>
      veiculo.modelo?.toLowerCase().includes(search.toLowerCase()) ||
      veiculo.placa?.toLowerCase().includes(search.toLowerCase()),
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
        <h1 className="text-2xl font-bold">Veículos</h1>
        <Button onClick={() => router.push("/veiculos/novo")} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Veículo
        </Button>
      </div>

      <div className="flex items-center mb-4">
        <Input
          type="text"
          placeholder="Buscar veículo..."
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
        <TableCaption>Lista de veículos cadastrados.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Ano</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredVeiculos.map((veiculo) => (
            <TableRow key={veiculo.id}>
              <TableCell className="font-medium">{veiculo.placa}</TableCell>
              <TableCell>{veiculo.modelo}</TableCell>
              <TableCell>{veiculo.ano}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    veiculo.status === "Ativo" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {veiculo.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/veiculos/${veiculo.id}`)}
                    className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/veiculos/editar/${veiculo.id}`)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteConfirm(veiculo.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredVeiculos.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                Nenhum veículo encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5}>Total de veículos: {veiculos.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá excluir o veículo permanentemente. Tem certeza que deseja continuar?
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
