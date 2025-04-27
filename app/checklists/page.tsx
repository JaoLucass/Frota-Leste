"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { CheckSquare, Plus, Car, Calendar, Filter, Search } from "lucide-react"

export default function Checklists() {
  const [loading, setLoading] = useState(true)
  const [checklists, setChecklists] = useState([])
  const [veiculos, setVeiculos] = useState([])
  const [filtro, setFiltro] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState("todos")
  const [veiculoFiltro, setVeiculoFiltro] = useState("todos")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar veículos
        const veiculosRef = ref(database, "vehicles")
        const veiculosSnapshot = await get(veiculosRef)

        let veiculosData = []
        if (veiculosSnapshot.exists()) {
          const data = veiculosSnapshot.val()
          veiculosData = Object.entries(data).map(([id, veiculo]) => ({
            id,
            ...veiculo,
          }))
          setVeiculos(veiculosData)
        }

        // Simular busca de checklists
        const checklistsSimulados = [
          {
            id: "check1",
            titulo: "Checklist Diário - Ambulância 01",
            tipo: "diario",
            data: "2023-05-15",
            veiculoId: "-OOIuDQy4plJvCSDnHLF",
            status: "completo",
            responsavel: "Carlos Silva",
            itens: [
              { id: "item1", descricao: "Verificar nível de óleo", concluido: true },
              { id: "item2", descricao: "Verificar pressão dos pneus", concluido: true },
              { id: "item3", descricao: "Verificar luzes e sinalização", concluido: true },
              { id: "item4", descricao: "Verificar equipamentos médicos", concluido: true },
              { id: "item5", descricao: "Verificar nível de combustível", concluido: true },
            ],
          },
          {
            id: "check2",
            titulo: "Checklist Semanal - Van 02",
            tipo: "semanal",
            data: "2023-05-12",
            veiculoId: "-OOIuDQy4plJvCSDnHL1",
            status: "pendente",
            responsavel: "Ana Oliveira",
            itens: [
              { id: "item1", descricao: "Verificar nível de óleo", concluido: true },
              { id: "item2", descricao: "Verificar pressão dos pneus", concluido: true },
              { id: "item3", descricao: "Verificar luzes e sinalização", concluido: false },
              { id: "item4", descricao: "Verificar sistema de freios", concluido: false },
              { id: "item5", descricao: "Verificar nível de combustível", concluido: true },
              { id: "item6", descricao: "Verificar filtro de ar", concluido: false },
            ],
          },
          {
            id: "check3",
            titulo: "Checklist Mensal - Ambulância 01",
            tipo: "mensal",
            data: "2023-05-01",
            veiculoId: "-OOIuDQy4plJvCSDnHLF",
            status: "completo",
            responsavel: "Roberto Almeida",
            itens: [
              { id: "item1", descricao: "Verificar sistema de refrigeração", concluido: true },
              { id: "item2", descricao: "Verificar sistema elétrico", concluido: true },
              { id: "item3", descricao: "Verificar suspensão", concluido: true },
              { id: "item4", descricao: "Verificar alinhamento e balanceamento", concluido: true },
              { id: "item5", descricao: "Verificar sistema de oxigênio", concluido: true },
              { id: "item6", descricao: "Verificar equipamentos de emergência", concluido: true },
              { id: "item7", descricao: "Verificar documentação do veículo", concluido: true },
            ],
          },
          {
            id: "check4",
            titulo: "Checklist Diário - Van 02",
            tipo: "diario",
            data: "2023-05-15",
            veiculoId: "-OOIuDQy4plJvCSDnHL1",
            status: "incompleto",
            responsavel: "Juliana Mendes",
            itens: [
              { id: "item1", descricao: "Verificar nível de óleo", concluido: true },
              { id: "item2", descricao: "Verificar pressão dos pneus", concluido: false },
              { id: "item3", descricao: "Verificar luzes e sinalização", concluido: true },
              { id: "item4", descricao: "Verificar nível de combustível", concluido: true },
            ],
          },
          {
            id: "check5",
            titulo: "Checklist Pré-Viagem - Ambulância 03",
            tipo: "pre-viagem",
            data: "2023-05-14",
            veiculoId: "-OOIuDQy4plJvCSDnHL2",
            status: "completo",
            responsavel: "Pedro Santos",
            itens: [
              { id: "item1", descricao: "Verificar nível de óleo", concluido: true },
              { id: "item2", descricao: "Verificar pressão dos pneus", concluido: true },
              { id: "item3", descricao: "Verificar luzes e sinalização", concluido: true },
              { id: "item4", descricao: "Verificar equipamentos médicos", concluido: true },
              { id: "item5", descricao: "Verificar nível de combustível", concluido: true },
              { id: "item6", descricao: "Verificar sistema de comunicação", concluido: true },
              { id: "item7", descricao: "Verificar documentação do veículo", concluido: true },
              { id: "item8", descricao: "Verificar rota planejada", concluido: true },
            ],
          },
        ]

        // Atualizar checklists com informações dos veículos
        const checklistsAtualizados = checklistsSimulados.map((checklist) => {
          const veiculo = veiculosData.find((v) => v.id === checklist.veiculoId)
          return {
            ...checklist,
            placa: veiculo ? veiculo.placa : "N/A",
            modelo: veiculo ? veiculo.modelo : "N/A",
          }
        })

        setChecklists(checklistsAtualizados)
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        toast({
          variant: "destructive",
          title: "Erro!",
          description: "Falha ao buscar dados.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCheckItem = async (checklistId, itemId, checked) => {
    try {
      // Atualizar estado local
      setChecklists((prevChecklists) =>
        prevChecklists.map((checklist) => {
          if (checklist.id === checklistId) {
            const itensAtualizados = checklist.itens.map((item) => {
              if (item.id === itemId) {
                return { ...item, concluido: checked }
              }
              return item
            })

            // Verificar se todos os itens estão concluídos
            const todosItensCompletos = itensAtualizados.every((item) => item.concluido)
            const algumItemCompleto = itensAtualizados.some((item) => item.concluido)

            let novoStatus = checklist.status
            if (todosItensCompletos) {
              novoStatus = "completo"
            } else if (algumItemCompleto) {
              novoStatus = "incompleto"
            } else {
              novoStatus = "pendente"
            }

            return {
              ...checklist,
              itens: itensAtualizados,
              status: novoStatus,
            }
          }
          return checklist
        }),
      )

      // Aqui seria a atualização no Firebase
      // const checklistRef = ref(database, `checklists/${checklistId}/itens/${itemId}`)
      // await update(checklistRef, { concluido: checked })

      toast({
        title: "Item atualizado",
        description: "O item do checklist foi atualizado com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao atualizar item:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao atualizar item do checklist.",
      })
    }
  }

  const filtrarChecklists = () => {
    if (!filtro && tipoFiltro === "todos" && veiculoFiltro === "todos") {
      return checklists
    }

    return checklists.filter((checklist) => {
      const matchesFiltro = filtro
        ? checklist.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
          (checklist.responsavel && checklist.responsavel.toLowerCase().includes(filtro.toLowerCase())) ||
          (checklist.placa && checklist.placa.toLowerCase().includes(filtro.toLowerCase()))
        : true

      const matchesTipo = tipoFiltro !== "todos" ? checklist.tipo === tipoFiltro : true
      const matchesVeiculo = veiculoFiltro !== "todos" ? checklist.veiculoId === veiculoFiltro : true

      return matchesFiltro && matchesTipo && matchesVeiculo
    })
  }

  const checklistsFiltrados = filtrarChecklists()

  const getStatusColor = (status) => {
    switch (status) {
      case "completo":
        return "bg-emerald-100 text-emerald-800"
      case "incompleto":
        return "bg-amber-100 text-amber-800"
      case "pendente":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case "diario":
        return <Calendar className="h-4 w-4" />
      case "semanal":
        return <Calendar className="h-4 w-4" />
      case "mensal":
        return <Calendar className="h-4 w-4" />
      case "pre-viagem":
        return <Car className="h-4 w-4" />
      default:
        return <CheckSquare className="h-4 w-4" />
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
      <h1 className="text-2xl font-bold mb-6">Checklists</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Buscar checklists..."
            className="pl-10"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por tipo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="diario">Diário</SelectItem>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="pre-viagem">Pré-Viagem</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-64">
          <Select value={veiculoFiltro} onValueChange={setVeiculoFiltro}>
            <SelectTrigger>
              <div className="flex items-center">
                <Car className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por veículo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os veículos</SelectItem>
              {veiculos.map((veiculo) => (
                <SelectItem key={veiculo.id} value={veiculo.id}>
                  {veiculo.placa} - {veiculo.modelo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Checklist
        </Button>
      </div>

      <Tabs defaultValue="todos">
        <TabsList className="mb-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="incompletos">Incompletos</TabsTrigger>
          <TabsTrigger value="completos">Completos</TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {checklistsFiltrados.length > 0 ? (
              checklistsFiltrados.map((checklist) => (
                <Card key={checklist.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge className={getStatusColor(checklist.status)}>{checklist.status}</Badge>
                      <div className="flex items-center gap-2">
                        {getTipoIcon(checklist.tipo)}
                        <span className="text-xs text-gray-500 capitalize">{checklist.tipo}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">{checklist.titulo}</CardTitle>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>Veículo: {checklist.placa}</span>
                      <span>{new Date(checklist.data).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm mb-2">
                      <span className="text-gray-500">Responsável: </span>
                      <span>{checklist.responsavel}</span>
                    </div>
                    <div className="space-y-2">
                      {checklist.itens.map((item) => (
                        <div key={item.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`${checklist.id}-${item.id}`}
                            checked={item.concluido}
                            onCheckedChange={(checked) => handleCheckItem(checklist.id, item.id, checked)}
                          />
                          <Label
                            htmlFor={`${checklist.id}-${item.id}`}
                            className={`text-sm ${item.concluido ? "line-through text-gray-500" : ""}`}
                          >
                            {item.descricao}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="w-full text-xs text-gray-500 flex justify-between">
                      <span>
                        {checklist.itens.filter((item) => item.concluido).length} de {checklist.itens.length} itens
                        concluídos
                      </span>
                      <span>
                        {Math.round(
                          (checklist.itens.filter((item) => item.concluido).length / checklist.itens.length) * 100,
                        )}
                        % completo
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex justify-center items-center py-10">
                <p className="text-gray-500">Nenhum checklist encontrado.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pendentes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {checklistsFiltrados
              .filter((checklist) => checklist.status === "pendente")
              .map((checklist) => (
                <Card key={checklist.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge className={getStatusColor(checklist.status)}>{checklist.status}</Badge>
                      <div className="flex items-center gap-2">
                        {getTipoIcon(checklist.tipo)}
                        <span className="text-xs text-gray-500 capitalize">{checklist.tipo}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">{checklist.titulo}</CardTitle>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>Veículo: {checklist.placa}</span>
                      <span>{new Date(checklist.data).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm mb-2">
                      <span className="text-gray-500">Responsável: </span>
                      <span>{checklist.responsavel}</span>
                    </div>
                    <div className="space-y-2">
                      {checklist.itens.map((item) => (
                        <div key={item.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`${checklist.id}-${item.id}`}
                            checked={item.concluido}
                            onCheckedChange={(checked) => handleCheckItem(checklist.id, item.id, checked)}
                          />
                          <Label
                            htmlFor={`${checklist.id}-${item.id}`}
                            className={`text-sm ${item.concluido ? "line-through text-gray-500" : ""}`}
                          >
                            {item.descricao}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="w-full text-xs text-gray-500 flex justify-between">
                      <span>
                        {checklist.itens.filter((item) => item.concluido).length} de {checklist.itens.length} itens
                        concluídos
                      </span>
                      <span>
                        {Math.round(
                          (checklist.itens.filter((item) => item.concluido).length / checklist.itens.length) * 100,
                        )}
                        % completo
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="incompletos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {checklistsFiltrados
              .filter((checklist) => checklist.status === "incompleto")
              .map((checklist) => (
                <Card key={checklist.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge className={getStatusColor(checklist.status)}>{checklist.status}</Badge>
                      <div className="flex items-center gap-2">
                        {getTipoIcon(checklist.tipo)}
                        <span className="text-xs text-gray-500 capitalize">{checklist.tipo}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">{checklist.titulo}</CardTitle>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>Veículo: {checklist.placa}</span>
                      <span>{new Date(checklist.data).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm mb-2">
                      <span className="text-gray-500">Responsável: </span>
                      <span>{checklist.responsavel}</span>
                    </div>
                    <div className="space-y-2">
                      {checklist.itens.map((item) => (
                        <div key={item.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`${checklist.id}-${item.id}`}
                            checked={item.concluido}
                            onCheckedChange={(checked) => handleCheckItem(checklist.id, item.id, checked)}
                          />
                          <Label
                            htmlFor={`${checklist.id}-${item.id}`}
                            className={`text-sm ${item.concluido ? "line-through text-gray-500" : ""}`}
                          >
                            {item.descricao}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="w-full text-xs text-gray-500 flex justify-between">
                      <span>
                        {checklist.itens.filter((item) => item.concluido).length} de {checklist.itens.length} itens
                        concluídos
                      </span>
                      <span>
                        {Math.round(
                          (checklist.itens.filter((item) => item.concluido).length / checklist.itens.length) * 100,
                        )}
                        % completo
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {checklistsFiltrados
              .filter((checklist) => checklist.status === "completo")
              .map((checklist) => (
                <Card key={checklist.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge className={getStatusColor(checklist.status)}>{checklist.status}</Badge>
                      <div className="flex items-center gap-2">
                        {getTipoIcon(checklist.tipo)}
                        <span className="text-xs text-gray-500 capitalize">{checklist.tipo}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">{checklist.titulo}</CardTitle>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>Veículo: {checklist.placa}</span>
                      <span>{new Date(checklist.data).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm mb-2">
                      <span className="text-gray-500">Responsável: </span>
                      <span>{checklist.responsavel}</span>
                    </div>
                    <div className="space-y-2">
                      {checklist.itens.map((item) => (
                        <div key={item.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`${checklist.id}-${item.id}`}
                            checked={item.concluido}
                            onCheckedChange={(checked) => handleCheckItem(checklist.id, item.id, checked)}
                          />
                          <Label
                            htmlFor={`${checklist.id}-${item.id}`}
                            className={`text-sm ${item.concluido ? "line-through text-gray-500" : ""}`}
                          >
                            {item.descricao}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="w-full text-xs text-gray-500 flex justify-between">
                      <span>
                        {checklist.itens.filter((item) => item.concluido).length} de {checklist.itens.length} itens
                        concluídos
                      </span>
                      <span>
                        {Math.round(
                          (checklist.itens.filter((item) => item.concluido).length / checklist.itens.length) * 100,
                        )}
                        % completo
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
