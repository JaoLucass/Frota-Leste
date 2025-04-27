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
import { FileText, Download, Upload, Search, Filter, Car, Calendar, Clock } from "lucide-react"

export default function Documentos() {
  const [loading, setLoading] = useState(true)
  const [documentos, setDocumentos] = useState([])
  const [filtro, setFiltro] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState("todos")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simular busca de documentos
        const documentosSimulados = [
          {
            id: "doc1",
            titulo: "Relatório de Manutenção - Abril 2023",
            tipo: "manutencao",
            data: "2023-04-15",
            tamanho: "2.4 MB",
            autor: "Carlos Silva",
            status: "aprovado",
            veiculoId: "-OOIuDQy4plJvCSDnHLF",
            placa: "ABC-1234",
          },
          {
            id: "doc2",
            titulo: "Checklist de Inspeção Diária",
            tipo: "checklist",
            data: "2023-05-10",
            tamanho: "1.1 MB",
            autor: "Ana Oliveira",
            status: "pendente",
            veiculoId: "-OOIuDQy4plJvCSDnHL1",
            placa: "DEF-5678",
          },
          {
            id: "doc3",
            titulo: "Relatório de Consumo de Combustível - Q1 2023",
            tipo: "combustivel",
            data: "2023-03-31",
            tamanho: "3.7 MB",
            autor: "Roberto Almeida",
            status: "aprovado",
            veiculoId: null,
            placa: null,
          },
          {
            id: "doc4",
            titulo: "Manual do Motorista",
            tipo: "manual",
            data: "2023-01-15",
            tamanho: "5.2 MB",
            autor: "Departamento de RH",
            status: "aprovado",
            veiculoId: null,
            placa: null,
          },
          {
            id: "doc5",
            titulo: "Relatório de Incidentes - Março 2023",
            tipo: "incidente",
            data: "2023-03-28",
            tamanho: "1.8 MB",
            autor: "Comitê de Segurança",
            status: "aprovado",
            veiculoId: null,
            placa: null,
          },
          {
            id: "doc6",
            titulo: "Cronograma de Manutenção Preventiva",
            tipo: "manutencao",
            data: "2023-05-05",
            tamanho: "1.5 MB",
            autor: "Departamento de Manutenção",
            status: "pendente",
            veiculoId: null,
            placa: null,
          },
          {
            id: "doc7",
            titulo: "Relatório de Rotas - Abril 2023",
            tipo: "rota",
            data: "2023-05-02",
            tamanho: "4.3 MB",
            autor: "Sistema de Monitoramento",
            status: "aprovado",
            veiculoId: null,
            placa: null,
          },
          {
            id: "doc8",
            titulo: "Ficha Técnica - Ambulância UTI",
            tipo: "ficha",
            data: "2023-02-10",
            tamanho: "2.1 MB",
            autor: "Departamento Técnico",
            status: "aprovado",
            veiculoId: "-OOIuDQy4plJvCSDnHLF",
            placa: "ABC-1234",
          },
        ]

        // Buscar informações adicionais dos veículos
        const veiculosRef = ref(database, "vehicles")
        const veiculosSnapshot = await get(veiculosRef)

        if (veiculosSnapshot.exists()) {
          const veiculosData = veiculosSnapshot.val()

          // Atualizar documentos com informações dos veículos
          const documentosAtualizados = documentosSimulados.map((doc) => {
            if (doc.veiculoId && veiculosData[doc.veiculoId]) {
              return {
                ...doc,
                placa: veiculosData[doc.veiculoId].placa,
                modelo: veiculosData[doc.veiculoId].modelo,
              }
            }
            return doc
          })

          setDocumentos(documentosAtualizados)
        } else {
          setDocumentos(documentosSimulados)
        }
      } catch (error) {
        console.error("Erro ao buscar documentos:", error)
        setDocumentos([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filtrarDocumentos = () => {
    if (!filtro && tipoFiltro === "todos") {
      return documentos
    }

    return documentos.filter((doc) => {
      const matchesFiltro = filtro
        ? doc.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
          (doc.autor && doc.autor.toLowerCase().includes(filtro.toLowerCase())) ||
          (doc.placa && doc.placa.toLowerCase().includes(filtro.toLowerCase()))
        : true

      const matchesTipo = tipoFiltro !== "todos" ? doc.tipo === tipoFiltro : true

      return matchesFiltro && matchesTipo
    })
  }

  const documentosFiltrados = filtrarDocumentos()

  const getStatusColor = (status) => {
    switch (status) {
      case "aprovado":
        return "bg-emerald-100 text-emerald-800"
      case "pendente":
        return "bg-amber-100 text-amber-800"
      case "rejeitado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case "manutencao":
        return <Clock className="h-4 w-4" />
      case "checklist":
        return <FileText className="h-4 w-4" />
      case "combustivel":
        return <Calendar className="h-4 w-4" />
      case "manual":
        return <FileText className="h-4 w-4" />
      case "incidente":
        return <FileText className="h-4 w-4" />
      case "rota":
        return <FileText className="h-4 w-4" />
      case "ficha":
        return <Car className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
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
      <h1 className="text-2xl font-bold mb-6">Documentos</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Buscar documentos..."
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
              <SelectItem value="manutencao">Manutenção</SelectItem>
              <SelectItem value="checklist">Checklist</SelectItem>
              <SelectItem value="combustivel">Combustível</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="incidente">Incidente</SelectItem>
              <SelectItem value="rota">Rota</SelectItem>
              <SelectItem value="ficha">Ficha Técnica</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Upload className="mr-2 h-4 w-4" />
          Novo Documento
        </Button>
      </div>

      <Tabs defaultValue="todos">
        <TabsList className="mb-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="recentes">Recentes</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="aprovados">Aprovados</TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentosFiltrados.length > 0 ? (
              documentosFiltrados.map((doc) => (
                <Card key={doc.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                      <span className="text-xs text-gray-500">{new Date(doc.data).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <CardTitle className="text-lg mt-2">{doc.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-col space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Autor:</span>
                        <span>{doc.autor}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Tipo:</span>
                        <div className="flex items-center">
                          {getTipoIcon(doc.tipo)}
                          <span className="ml-1 capitalize">{doc.tipo}</span>
                        </div>
                      </div>
                      {doc.placa && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Veículo:</span>
                          <span>
                            {doc.placa} {doc.modelo ? `- ${doc.modelo}` : ""}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Tamanho:</span>
                        <span>{doc.tamanho}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex justify-center items-center py-10">
                <p className="text-gray-500">Nenhum documento encontrado.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recentes">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentosFiltrados
              .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
              .slice(0, 6)
              .map((doc) => (
                <Card key={doc.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                      <span className="text-xs text-gray-500">{new Date(doc.data).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <CardTitle className="text-lg mt-2">{doc.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-col space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Autor:</span>
                        <span>{doc.autor}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Tipo:</span>
                        <div className="flex items-center">
                          {getTipoIcon(doc.tipo)}
                          <span className="ml-1 capitalize">{doc.tipo}</span>
                        </div>
                      </div>
                      {doc.placa && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Veículo:</span>
                          <span>
                            {doc.placa} {doc.modelo ? `- ${doc.modelo}` : ""}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Tamanho:</span>
                        <span>{doc.tamanho}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="pendentes">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentosFiltrados
              .filter((doc) => doc.status === "pendente")
              .map((doc) => (
                <Card key={doc.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                      <span className="text-xs text-gray-500">{new Date(doc.data).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <CardTitle className="text-lg mt-2">{doc.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-col space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Autor:</span>
                        <span>{doc.autor}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Tipo:</span>
                        <div className="flex items-center">
                          {getTipoIcon(doc.tipo)}
                          <span className="ml-1 capitalize">{doc.tipo}</span>
                        </div>
                      </div>
                      {doc.placa && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Veículo:</span>
                          <span>
                            {doc.placa} {doc.modelo ? `- ${doc.modelo}` : ""}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Tamanho:</span>
                        <span>{doc.tamanho}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="aprovados">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentosFiltrados
              .filter((doc) => doc.status === "aprovado")
              .map((doc) => (
                <Card key={doc.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                      <span className="text-xs text-gray-500">{new Date(doc.data).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <CardTitle className="text-lg mt-2">{doc.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-col space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Autor:</span>
                        <span>{doc.autor}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Tipo:</span>
                        <div className="flex items-center">
                          {getTipoIcon(doc.tipo)}
                          <span className="ml-1 capitalize">{doc.tipo}</span>
                        </div>
                      </div>
                      {doc.placa && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Veículo:</span>
                          <span>
                            {doc.placa} {doc.modelo ? `- ${doc.modelo}` : ""}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Tamanho:</span>
                        <span>{doc.tamanho}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
