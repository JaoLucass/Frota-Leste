"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, Filter, Calendar } from "lucide-react"
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
import { toast } from "@/components/ui/use-toast"
import { Card } from "@/components/card"
import { Fuel, TrendingUp, DollarSign, BarChart2 } from "lucide-react"
import dynamic from "next/dynamic"

// Importar o gráfico dinamicamente para evitar problemas de SSR
const FuelChartWithNoSSR = dynamic(() => import("@/components/fuel-chart"), {
  ssr: false,
})

export default function CombustivelPage() {
  const [abastecimentos, setAbastecimentos] = useState([])
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filtroVeiculo, setFiltroVeiculo] = useState("todos")
  const [veiculos, setVeiculos] = useState([])
  const router = useRouter()

  useEffect(() => {
    // Buscar abastecimentos
    const abastecimentosRef = ref(database, "fuel")
    const unsubscribeAbastecimentos = onValue(abastecimentosRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const abastecimentosList = Object.entries(data).map(([id, abastecimento]) => ({
          id,
          ...abastecimento,
        }))
        setAbastecimentos(abastecimentosList.sort((a, b) => b.data - a.data))
      } else {
        setAbastecimentos([])
      }
    })

    // Buscar veículos
    const veiculosRef = ref(database, "vehicles")
    const unsubscribeVeiculos = onValue(veiculosRef, (snapshot) => {
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

    return () => {
      unsubscribeAbastecimentos()
      unsubscribeVeiculos()
    }
  }, [])

  const handleDelete = async () => {
    try {
      if (!deleteId) return

      const abastecimentoRef = ref(database, `fuel/${deleteId}`)
      await remove(abastecimentoRef)

      toast({
        title: "Sucesso!",
        description: "Abastecimento excluído com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir abastecimento:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao excluir o abastecimento.",
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

  // Calcular estatísticas
  const totalLitros = abastecimentos.reduce((total, item) => total + Number.parseFloat(item.litros || 0), 0)
  const totalValor = abastecimentos.reduce((total, item) => total + Number.parseFloat(item.valor || 0), 0)

  // Calcular consumo médio (km/l)
  const consumoMedio =
    abastecimentos.length > 0
      ? abastecimentos.reduce(
          (total, item) => total + Number.parseFloat(item.kmAtual || 0) / Number.parseFloat(item.litros || 1),
          0,
        ) / abastecimentos.length
      : 0

  // Filtrar abastecimentos
  const filteredAbastecimentos = abastecimentos
    .filter(
      (abastecimento) =>
        abastecimento.veiculo?.placa?.toLowerCase().includes(search.toLowerCase()) ||
        abastecimento.posto?.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((abastecimento) => {
      if (filtroVeiculo === "todos") return true
      return abastecimento.veiculoId === filtroVeiculo
    })

  // Preparar dados para o gráfico
  const chartData = {
    labels: abastecimentos
      .slice(0, 7)
      .map((item) => new Date(item.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }))
      .reverse(),
    consumo: abastecimentos
      .slice(0, 7)
      .map((item) => Number.parseFloat((Number.parseFloat(item.kmAtual) / Number.parseFloat(item.litros)).toFixed(2)))
      .reverse(),
    preco: abastecimentos
      .slice(0, 7)
      .map((item) => Number.parseFloat((Number.parseFloat(item.valor) / Number.parseFloat(item.litros)).toFixed(2)))
      .reverse(),
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Controle de Combustível</h1>
        <Button onClick={() => router.push("/combustivel/novo")} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Abastecimento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card
          title="Total Abastecido"
          value={`${totalLitros.toFixed(2)} L`}
          description={`${abastecimentos.length} abastecimentos registrados`}
          icon={<Fuel className="h-5 w-5 text-emerald-600" />}
          color="emerald"
        />

        <Card
          title="Consumo Médio"
          value={`${consumoMedio.toFixed(2)} km/L`}
          description="Média de todos os veículos"
          icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
          color="blue"
        />

        <Card
          title="Custo Total"
          value={`R$ ${totalValor.toFixed(2)}`}
          description="Valor total em combustível"
          icon={<DollarSign className="h-5 w-5 text-amber-500" />}
          color="amber"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-emerald-600" />
            Histórico de Consumo
          </h2>
        </div>
        <div className="h-[300px]">
          <FuelChartWithNoSSR data={chartData} />
        </div>
      </div>

      <div className="flex items-center mb-4 gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Buscar abastecimento..."
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
            <DropdownMenuLabel>Veículo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setFiltroVeiculo("todos")}>
                <span className={filtroVeiculo === "todos" ? "font-bold" : ""}>Todos</span>
              </DropdownMenuItem>
              {veiculos.map((veiculo) => (
                <DropdownMenuItem key={veiculo.id} onClick={() => setFiltroVeiculo(veiculo.id)}>
                  <span className={filtroVeiculo === veiculo.id ? "font-bold" : ""}>
                    {veiculo.placa} - {veiculo.modelo}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Período
        </Button>
      </div>

      <Table>
        <TableCaption>Lista de abastecimentos registrados.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Veículo</TableHead>
            <TableHead>Posto</TableHead>
            <TableHead>Litros</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Km Atual</TableHead>
            <TableHead>Consumo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAbastecimentos.map((abastecimento) => (
            <TableRow key={abastecimento.id}>
              <TableCell>{new Date(abastecimento.data).toLocaleDateString("pt-BR")}</TableCell>
              <TableCell className="font-medium">{abastecimento.veiculo.placa}</TableCell>
              <TableCell>{abastecimento.posto}</TableCell>
              <TableCell>{Number.parseFloat(abastecimento.litros).toFixed(2)} L</TableCell>
              <TableCell>R$ {Number.parseFloat(abastecimento.valor).toFixed(2)}</TableCell>
              <TableCell>{abastecimento.kmAtual} km</TableCell>
              <TableCell>
                {abastecimento.kmAnterior
                  ? `${(
                      (abastecimento.kmAtual - abastecimento.kmAnterior) / Number.parseFloat(abastecimento.litros)
                    ).toFixed(2)} km/L`
                  : "-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/combustivel/${abastecimento.id}`)}
                    className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/combustivel/editar/${abastecimento.id}`)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteConfirm(abastecimento.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredAbastecimentos.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                Nenhum abastecimento encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={8}>Total de abastecimentos: {filteredAbastecimentos.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá excluir o abastecimento permanentemente. Tem certeza que deseja continuar?
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
