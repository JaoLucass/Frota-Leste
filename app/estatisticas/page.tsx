"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { BarChart2, PieChartIcon, TrendingUp, Calendar, Clock, Fuel, Wrench } from "lucide-react"

export default function Estatisticas() {
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState("mes")
  const [veiculoId, setVeiculoId] = useState("todos")
  const [veiculos, setVeiculos] = useState([])
  const [dadosCombustivel, setDadosCombustivel] = useState([])
  const [dadosManutencao, setDadosManutencao] = useState([])
  const [dadosUtilizacao, setDadosUtilizacao] = useState([])
  const [dadosDistribuicao, setDadosDistribuicao] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar veículos
        const veiculosRef = ref(database, "vehicles")
        const veiculosSnapshot = await get(veiculosRef)

        if (veiculosSnapshot.exists()) {
          const veiculosData = veiculosSnapshot.val()
          const veiculosList = Object.entries(veiculosData).map(([id, data]) => ({
            id,
            ...data,
          }))
          setVeiculos(veiculosList)
        }

        // Buscar dados de combustível
        const combustivelRef = ref(database, "fuel")
        const combustivelSnapshot = await get(combustivelRef)

        if (combustivelSnapshot.exists()) {
          const combustivelData = combustivelSnapshot.val()
          processarDadosCombustivel(combustivelData)
        }

        // Buscar dados de manutenção
        const manutencaoRef = ref(database, "maintenance")
        const manutencaoSnapshot = await get(manutencaoRef)

        if (manutencaoSnapshot.exists()) {
          const manutencaoData = manutencaoSnapshot.val()
          processarDadosManutencao(manutencaoData)
        }

        // Buscar dados de agendamentos
        const agendamentosRef = ref(database, "schedules")
        const agendamentosSnapshot = await get(agendamentosRef)

        if (agendamentosSnapshot.exists()) {
          const agendamentosData = agendamentosSnapshot.val()
          processarDadosUtilizacao(agendamentosData)
        }

        // Processar dados de distribuição
        processarDadosDistribuicao()
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    // Reprocessar dados quando o período ou veículo mudar
    const fetchFilteredData = async () => {
      try {
        // Buscar dados de combustível
        const combustivelRef = ref(database, "fuel")
        const combustivelSnapshot = await get(combustivelRef)

        if (combustivelSnapshot.exists()) {
          const combustivelData = combustivelSnapshot.val()
          processarDadosCombustivel(combustivelData)
        }

        // Buscar dados de manutenção
        const manutencaoRef = ref(database, "maintenance")
        const manutencaoSnapshot = await get(manutencaoRef)

        if (manutencaoSnapshot.exists()) {
          const manutencaoData = manutencaoSnapshot.val()
          processarDadosManutencao(manutencaoData)
        }

        // Buscar dados de agendamentos
        const agendamentosRef = ref(database, "schedules")
        const agendamentosSnapshot = await get(agendamentosRef)

        if (agendamentosSnapshot.exists()) {
          const agendamentosData = agendamentosSnapshot.val()
          processarDadosUtilizacao(agendamentosData)
        }
      } catch (error) {
        console.error("Erro ao buscar dados filtrados:", error)
      }
    }

    if (!loading) {
      fetchFilteredData()
    }
  }, [periodo, veiculoId, loading])

  const processarDadosCombustivel = (data) => {
    // Filtrar por período e veículo
    const dataAtual = new Date()
    const dataLimite = new Date()

    switch (periodo) {
      case "semana":
        dataLimite.setDate(dataLimite.getDate() - 7)
        break
      case "mes":
        dataLimite.setMonth(dataLimite.getMonth() - 1)
        break
      case "trimestre":
        dataLimite.setMonth(dataLimite.getMonth() - 3)
        break
      case "ano":
        dataLimite.setFullYear(dataLimite.getFullYear() - 1)
        break
    }

    // Processar dados de combustível
    const registros = Object.values(data || {}).filter((registro: any) => {
      const dataRegistro = new Date(registro.data)
      const filtroVeiculo = veiculoId === "todos" || registro.veiculoId === veiculoId
      return dataRegistro >= dataLimite && dataRegistro <= dataAtual && filtroVeiculo
    })

    // Agrupar por mês ou semana
    const dadosAgrupados = {}

    registros.forEach((registro: any) => {
      const data = new Date(registro.data)
      let chave

      if (periodo === "semana") {
        // Agrupar por dia da semana
        chave = data.toLocaleDateString("pt-BR", { weekday: "short" })
      } else if (periodo === "mes") {
        // Agrupar por dia do mês
        chave = data.getDate().toString()
      } else if (periodo === "trimestre") {
        // Agrupar por semana
        const semana = Math.ceil((data.getDate() + new Date(data.getFullYear(), data.getMonth(), 1).getDay()) / 7)
        chave = `Sem ${semana}`
      } else {
        // Agrupar por mês
        chave = data.toLocaleDateString("pt-BR", { month: "short" })
      }

      if (!dadosAgrupados[chave]) {
        dadosAgrupados[chave] = {
          periodo: chave,
          consumo: 0,
          custo: 0,
          quantidade: 0,
        }
      }

      dadosAgrupados[chave].consumo += Number.parseFloat(registro.consumo || 0)
      dadosAgrupados[chave].custo += Number.parseFloat(registro.valor || 0)
      dadosAgrupados[chave].quantidade += Number.parseFloat(registro.litros || 0)
    })

    // Converter para array e ordenar
    const dadosProcessados = Object.values(dadosAgrupados)

    // Ordenar por período
    if (periodo === "semana") {
      const ordemDias = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]
      dadosProcessados.sort((a: any, b: any) => ordemDias.indexOf(a.periodo) - ordemDias.indexOf(b.periodo))
    } else if (periodo === "mes" || periodo === "trimestre") {
      dadosProcessados.sort(
        (a: any, b: any) =>
          Number.parseInt(a.periodo.replace(/\D/g, "")) - Number.parseInt(b.periodo.replace(/\D/g, "")),
      )
    } else {
      const ordemMeses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
      dadosProcessados.sort((a: any, b: any) => ordemMeses.indexOf(a.periodo) - ordemMeses.indexOf(b.periodo))
    }

    setDadosCombustivel(dadosProcessados)
  }

  const processarDadosManutencao = (data) => {
    // Filtrar por período e veículo
    const dataAtual = new Date()
    const dataLimite = new Date()

    switch (periodo) {
      case "semana":
        dataLimite.setDate(dataLimite.getDate() - 7)
        break
      case "mes":
        dataLimite.setMonth(dataLimite.getMonth() - 1)
        break
      case "trimestre":
        dataLimite.setMonth(dataLimite.getMonth() - 3)
        break
      case "ano":
        dataLimite.setFullYear(dataLimite.getFullYear() - 1)
        break
    }

    // Processar dados de manutenção
    const registros = Object.values(data || {}).filter((registro: any) => {
      const dataRegistro = new Date(registro.data)
      const filtroVeiculo = veiculoId === "todos" || registro.veiculoId === veiculoId
      return dataRegistro >= dataLimite && dataRegistro <= dataAtual && filtroVeiculo
    })

    // Agrupar por tipo de manutenção
    const dadosPorTipo = {}

    registros.forEach((registro: any) => {
      const tipo = registro.tipo || "Outros"

      if (!dadosPorTipo[tipo]) {
        dadosPorTipo[tipo] = {
          tipo,
          quantidade: 0,
          custo: 0,
        }
      }

      dadosPorTipo[tipo].quantidade += 1
      dadosPorTipo[tipo].custo += Number.parseFloat(registro.custo || 0)
    })

    // Converter para array
    const dadosProcessados = Object.values(dadosPorTipo)

    setDadosManutencao(dadosProcessados)
  }

  const processarDadosUtilizacao = (data) => {
    // Filtrar por período e veículo
    const dataAtual = new Date()
    const dataLimite = new Date()

    switch (periodo) {
      case "semana":
        dataLimite.setDate(dataLimite.getDate() - 7)
        break
      case "mes":
        dataLimite.setMonth(dataLimite.getMonth() - 1)
        break
      case "trimestre":
        dataLimite.setMonth(dataLimite.getMonth() - 3)
        break
      case "ano":
        dataLimite.setFullYear(dataLimite.getFullYear() - 1)
        break
    }

    // Processar dados de utilização
    const registros = Object.values(data || {}).filter((registro: any) => {
      const dataRegistro = new Date(registro.dataInicio)
      const filtroVeiculo = veiculoId === "todos" || registro.veiculoId === veiculoId
      return dataRegistro >= dataLimite && dataRegistro <= dataAtual && filtroVeiculo
    })

    // Agrupar por período
    const dadosAgrupados = {}

    registros.forEach((registro: any) => {
      const data = new Date(registro.dataInicio)
      let chave

      if (periodo === "semana") {
        // Agrupar por dia da semana
        chave = data.toLocaleDateString("pt-BR", { weekday: "short" })
      } else if (periodo === "mes") {
        // Agrupar por dia do mês
        chave = data.getDate().toString()
      } else if (periodo === "trimestre") {
        // Agrupar por semana
        const semana = Math.ceil((data.getDate() + new Date(data.getFullYear(), data.getMonth(), 1).getDay()) / 7)
        chave = `Sem ${semana}`
      } else {
        // Agrupar por mês
        chave = data.toLocaleDateString("pt-BR", { month: "short" })
      }

      if (!dadosAgrupados[chave]) {
        dadosAgrupados[chave] = {
          periodo: chave,
          quantidade: 0,
          horas: 0,
        }
      }

      dadosAgrupados[chave].quantidade += 1

      // Calcular horas de utilização
      if (registro.dataInicio && registro.dataFim) {
        const inicio = new Date(registro.dataInicio)
        const fim = new Date(registro.dataFim)
        const horasUtilizacao = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60)
        dadosAgrupados[chave].horas += horasUtilizacao
      }
    })

    // Converter para array e ordenar
    const dadosProcessados = Object.values(dadosAgrupados)

    // Ordenar por período
    if (periodo === "semana") {
      const ordemDias = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]
      dadosProcessados.sort((a: any, b: any) => ordemDias.indexOf(a.periodo) - ordemDias.indexOf(b.periodo))
    } else if (periodo === "mes" || periodo === "trimestre") {
      dadosProcessados.sort(
        (a: any, b: any) =>
          Number.parseInt(a.periodo.replace(/\D/g, "")) - Number.parseInt(b.periodo.replace(/\D/g, "")),
      )
    } else {
      const ordemMeses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
      dadosProcessados.sort((a: any, b: any) => ordemMeses.indexOf(a.periodo) - ordemMeses.indexOf(b.periodo))
    }

    setDadosUtilizacao(dadosProcessados)
  }

  const processarDadosDistribuicao = () => {
    // Dados de distribuição por tipo de veículo
    const distribuicaoPorTipo = [
      { name: "Ambulância", value: 8 },
      { name: "Van", value: 5 },
      { name: "Carro", value: 10 },
      { name: "Caminhão", value: 3 },
    ]

    // Dados de distribuição por status
    const distribuicaoPorStatus = [
      { name: "Ativo", value: 18 },
      { name: "Em manutenção", value: 4 },
      { name: "Inativo", value: 2 },
      { name: "Em rota", value: 2 },
    ]

    setDadosDistribuicao({
      porTipo: distribuicaoPorTipo,
      porStatus: distribuicaoPorStatus,
    })
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Estatísticas da Frota</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Última semana</SelectItem>
              <SelectItem value="mes">Último mês</SelectItem>
              <SelectItem value="trimestre">Último trimestre</SelectItem>
              <SelectItem value="ano">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Veículo</label>
          <Select value={veiculoId} onValueChange={setVeiculoId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o veículo" />
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
      </div>

      <Tabs defaultValue="consumo">
        <TabsList className="mb-4">
          <TabsTrigger value="consumo" className="flex items-center gap-2">
            <Fuel className="h-4 w-4" />
            Consumo de Combustível
          </TabsTrigger>
          <TabsTrigger value="manutencao" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Manutenção
          </TabsTrigger>
          <TabsTrigger value="utilizacao" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Utilização
          </TabsTrigger>
          <TabsTrigger value="distribuicao" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Distribuição
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consumo">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-emerald-500" />
                  Consumo de Combustível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosCombustivel}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="consumo" name="Consumo (km/l)" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Custo de Combustível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosCombustivel}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="custo" name="Custo (R$)" fill="#0ea5e9" />
                      <Bar dataKey="quantidade" name="Quantidade (L)" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manutencao">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-emerald-500" />
                  Manutenções por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosManutencao}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tipo" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantidade" name="Quantidade" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Custo de Manutenção por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosManutencao}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tipo" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="custo" name="Custo (R$)" fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="utilizacao">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-500" />
                  Quantidade de Viagens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosUtilizacao}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantidade" name="Quantidade" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-500" />
                  Horas de Utilização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosUtilizacao}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="horas" name="Horas" fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribuicao">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-emerald-500" />
                  Distribuição por Tipo de Veículo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosDistribuicao?.porTipo || []}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dadosDistribuicao?.porTipo?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-emerald-500" />
                  Distribuição por Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosDistribuicao?.porStatus || []}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dadosDistribuicao?.porStatus?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
