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

export default function RotasPage() {
  const [rotas, setRotas] = useState([])
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const rotasRef = ref(database, "routes")

    const unsubscribe = onValue(rotasRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const rotasList = Object.entries(data).map(([id, rota]) => ({
          id,
          ...rota,
        }))
        setRotas(rotasList)
      } else {
        setRotas([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleDelete = async () => {
    try {
      if (!deleteId) return

      const rotaRef = ref(database, `routes/${deleteId}`)
      await remove(rotaRef)

      toast({
        title: "Sucesso!",
        description: "Rota excluída com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir rota:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao excluir a rota.",
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

  const filteredRotas = rotas.filter(
    (rota) =>
      rota.nome?.toLowerCase().includes(search.toLowerCase()) ||
      rota.origem?.toLowerCase().includes(search.toLowerCase()) ||
      rota.destino?.toLowerCase().includes(search.toLowerCase()),
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
        <h1 className="text-2xl font-bold">Rotas</h1>
        <Button onClick={() => router.push("/rotas/nova")} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Nova Rota
        </Button>
      </div>

      <div className="flex items-center mb-4">
        <Input
          type="text"
          placeholder="Buscar rota..."
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
        <TableCaption>Lista de rotas cadastradas.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Distância</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRotas.map((rota) => (
            <TableRow key={rota.id}>
              <TableCell className="font-medium">{rota.nome}</TableCell>
              <TableCell>{rota.origem}</TableCell>
              <TableCell>{rota.destino}</TableCell>
              <TableCell>{rota.distancia}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    rota.status === "Ativa" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {rota.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/rotas/${rota.id}`)}
                    className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/rotas/editar/${rota.id}`)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteConfirm(rota.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredRotas.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                Nenhuma rota encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>Total de rotas: {rotas.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá excluir a rota permanentemente. Tem certeza que deseja continuar?
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
