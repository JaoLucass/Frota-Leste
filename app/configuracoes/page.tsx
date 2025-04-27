"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  Bell,
  Shield,
  Users,
  Mail,
  Smartphone,
  Save,
  RefreshCw,
  Heart,
  Fuel,
  Clock,
  Wrench,
  Upload,
  Download,
} from "lucide-react"

export default function Configuracoes() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [configGeral, setConfigGeral] = useState({
    nomeEmpresa: "Hospital Regional Leste",
    endereco: "Av. Principal, 1000 - Centro",
    telefone: "(95) 3333-4444",
    email: "contato@hospitalregionalleste.com.br",
    logoUrl: "/assets/maloca.png",
  })
  const [configNotificacoes, setConfigNotificacoes] = useState({
    emailAtivo: true,
    smsAtivo: false,
    pushAtivo: true,
    frequenciaCardiaca: true,
    combustivelBaixo: true,
    manutencaoPendente: true,
    atrasoViagem: true,
    limiteFrequenciaCardiaca: 100,
    limiteCombustivelBaixo: 20,
    diasAntesManutencao: 3,
    minutosAtrasoViagem: 15,
  })
  const [configSeguranca, setConfigSeguranca] = useState({
    autenticacaoDoisFatores: false,
    tempoSessao: "30",
    nivelAcesso: "admin",
    registroAtividades: true,
  })
  const [configIntegracoes, setConfigIntegracoes] = useState({
    apiKey: "sk_test_abcdefghijklmnopqrstuvwxyz",
    webhookUrl: "https://api.hospitalregionalleste.com.br/webhook",
    integracaoAtiva: true,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simular busca de configurações
        // Na implementação real, buscar do Firebase

        // const configRef = ref(database, "config")
        // const configSnapshot = await get(configRef)

        // if (configSnapshot.exists()) {
        //   const configData = configSnapshot.val()
        //   setConfigGeral(configData.geral || configGeral)
        //   setConfigNotificacoes(configData.notificacoes || configNotificacoes)
        //   setConfigSeguranca(configData.seguranca || configSeguranca)
        //   setConfigIntegracoes(configData.integracoes || configIntegracoes)
        // }

        // Simulação apenas para demonstração
        setTimeout(() => {
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Erro ao buscar configurações:", error)
        toast({
          variant: "destructive",
          title: "Erro!",
          description: "Falha ao buscar configurações.",
        })
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      // Simular salvamento de configurações
      // Na implementação real, salvar no Firebase

      // const configRef = ref(database, "config")
      // await update(configRef, {
      //   geral: configGeral,
      //   notificacoes: configNotificacoes,
      //   seguranca: configSeguranca,
      //   integracoes: configIntegracoes,
      //   updatedAt: Date.now()
      // })

      // Simulação apenas para demonstração
      setTimeout(() => {
        toast({
          title: "Sucesso!",
          description: "Configurações salvas com sucesso.",
        })
        setSaving(false)
      }, 1000)
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Falha ao salvar configurações.",
      })
      setSaving(false)
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
        <Settings className="mr-2 h-6 w-6 text-emerald-600" />
        <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
      </div>

      <Tabs defaultValue="geral">
        <TabsList className="mb-6">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Configure as informações básicas da sua organização.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nomeEmpresa">Nome da Organização</Label>
                  <Input
                    id="nomeEmpresa"
                    value={configGeral.nomeEmpresa}
                    onChange={(e) => setConfigGeral({ ...configGeral, nomeEmpresa: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email de Contato</Label>
                  <Input
                    id="email"
                    type="email"
                    value={configGeral.email}
                    onChange={(e) => setConfigGeral({ ...configGeral, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={configGeral.telefone}
                    onChange={(e) => setConfigGeral({ ...configGeral, telefone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={configGeral.endereco}
                    onChange={(e) => setConfigGeral({ ...configGeral, endereco: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Logo da Organização</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border rounded-md overflow-hidden flex items-center justify-center bg-white">
                    <img
                      src={configGeral.logoUrl || "/placeholder.svg"}
                      alt="Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Alterar Logo
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveConfig} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>Configure como e quando você deseja receber notificações do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Canais de Notificação</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-5 w-5 text-emerald-600" />
                      <Label htmlFor="emailAtivo">Email</Label>
                    </div>
                    <Switch
                      id="emailAtivo"
                      checked={configNotificacoes.emailAtivo}
                      onCheckedChange={(checked) =>
                        setConfigNotificacoes({ ...configNotificacoes, emailAtivo: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-5 w-5 text-emerald-600" />
                      <Label htmlFor="smsAtivo">SMS</Label>
                    </div>
                    <Switch
                      id="smsAtivo"
                      checked={configNotificacoes.smsAtivo}
                      onCheckedChange={(checked) => setConfigNotificacoes({ ...configNotificacoes, smsAtivo: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-5 w-5 text-emerald-600" />
                      <Label htmlFor="pushAtivo">Notificações Push</Label>
                    </div>
                    <Switch
                      id="pushAtivo"
                      checked={configNotificacoes.pushAtivo}
                      onCheckedChange={(checked) =>
                        setConfigNotificacoes({ ...configNotificacoes, pushAtivo: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tipos de Alertas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-red-600" />
                      <Label htmlFor="frequenciaCardiaca">Frequência Cardíaca Alta</Label>
                    </div>
                    <Switch
                      id="frequenciaCardiaca"
                      checked={configNotificacoes.frequenciaCardiaca}
                      onCheckedChange={(checked) =>
                        setConfigNotificacoes({ ...configNotificacoes, frequenciaCardiaca: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                    <div className="flex items-center space-x-2">
                      <Fuel className="h-5 w-5 text-amber-600" />
                      <Label htmlFor="combustivelBaixo">Combustível Baixo</Label>
                    </div>
                    <Switch
                      id="combustivelBaixo"
                      checked={configNotificacoes.combustivelBaixo}
                      onCheckedChange={(checked) =>
                        setConfigNotificacoes({ ...configNotificacoes, combustivelBaixo: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                    <div className="flex items-center space-x-2">
                      <Wrench className="h-5 w-5 text-blue-600" />
                      <Label htmlFor="manutencaoPendente">Manutenção Pendente</Label>
                    </div>
                    <Switch
                      id="manutencaoPendente"
                      checked={configNotificacoes.manutencaoPendente}
                      onCheckedChange={(checked) =>
                        setConfigNotificacoes({ ...configNotificacoes, manutencaoPendente: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <Label htmlFor="atrasoViagem">Atraso em Viagem</Label>
                    </div>
                    <Switch
                      id="atrasoViagem"
                      checked={configNotificacoes.atrasoViagem}
                      onCheckedChange={(checked) =>
                        setConfigNotificacoes({ ...configNotificacoes, atrasoViagem: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Limites para Alertas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="limiteFrequenciaCardiaca">Limite de Frequência Cardíaca (bpm)</Label>
                    <Input
                      id="limiteFrequenciaCardiaca"
                      type="number"
                      value={configNotificacoes.limiteFrequenciaCardiaca}
                      onChange={(e) =>
                        setConfigNotificacoes({
                          ...configNotificacoes,
                          limiteFrequenciaCardiaca: Number.parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="limiteCombustivelBaixo">Limite de Combustível Baixo (%)</Label>
                    <Input
                      id="limiteCombustivelBaixo"
                      type="number"
                      value={configNotificacoes.limiteCombustivelBaixo}
                      onChange={(e) =>
                        setConfigNotificacoes({
                          ...configNotificacoes,
                          limiteCombustivelBaixo: Number.parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diasAntesManutencao">Dias de Antecedência para Alerta de Manutenção</Label>
                    <Input
                      id="diasAntesManutencao"
                      type="number"
                      value={configNotificacoes.diasAntesManutencao}
                      onChange={(e) =>
                        setConfigNotificacoes({
                          ...configNotificacoes,
                          diasAntesManutencao: Number.parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minutosAtrasoViagem">Minutos de Atraso para Alerta de Viagem</Label>
                    <Input
                      id="minutosAtrasoViagem"
                      type="number"
                      value={configNotificacoes.minutosAtrasoViagem}
                      onChange={(e) =>
                        setConfigNotificacoes({
                          ...configNotificacoes,
                          minutosAtrasoViagem: Number.parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveConfig} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
              <CardDescription>Configure as opções de segurança e acesso ao sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                <div>
                  <Label htmlFor="autenticacaoDoisFatores" className="text-base font-medium">
                    Autenticação de Dois Fatores
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Adicione uma camada extra de segurança exigindo um código além da senha.
                  </p>
                </div>
                <Switch
                  id="autenticacaoDoisFatores"
                  checked={configSeguranca.autenticacaoDoisFatores}
                  onCheckedChange={(checked) =>
                    setConfigSeguranca({ ...configSeguranca, autenticacaoDoisFatores: checked })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tempoSessao">Tempo de Sessão (minutos)</Label>
                  <Select
                    value={configSeguranca.tempoSessao}
                    onValueChange={(value) => setConfigSeguranca({ ...configSeguranca, tempoSessao: value })}
                  >
                    <SelectTrigger id="tempoSessao">
                      <SelectValue placeholder="Selecione o tempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                      <SelectItem value="240">4 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nivelAcesso">Nível de Acesso Padrão</Label>
                  <Select
                    value={configSeguranca.nivelAcesso}
                    onValueChange={(value) => setConfigSeguranca({ ...configSeguranca, nivelAcesso: value })}
                  >
                    <SelectTrigger id="nivelAcesso">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="gerente">Gerente</SelectItem>
                      <SelectItem value="operador">Operador</SelectItem>
                      <SelectItem value="visualizador">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                <div>
                  <Label htmlFor="registroAtividades" className="text-base font-medium">
                    Registro de Atividades
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Registrar todas as ações dos usuários no sistema para auditoria.
                  </p>
                </div>
                <Switch
                  id="registroAtividades"
                  checked={configSeguranca.registroAtividades}
                  onCheckedChange={(checked) => setConfigSeguranca({ ...configSeguranca, registroAtividades: checked })}
                />
              </div>

              <div className="p-4 border rounded-md bg-amber-50">
                <h3 className="text-base font-medium text-amber-800 mb-2">Ações de Segurança</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Redefinir Todas as Senhas
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Logs de Segurança
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveConfig} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Integrações</CardTitle>
              <CardDescription>Configure integrações com sistemas externos e APIs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                <div>
                  <Label htmlFor="integracaoAtiva" className="text-base font-medium">
                    Integração com APIs Externas
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">Ativar integração com sistemas externos via API.</p>
                </div>
                <Switch
                  id="integracaoAtiva"
                  checked={configIntegracoes.integracaoAtiva}
                  onCheckedChange={(checked) =>
                    setConfigIntegracoes({ ...configIntegracoes, integracaoAtiva: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">Chave de API</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type="password"
                    value={configIntegracoes.apiKey}
                    onChange={(e) => setConfigIntegracoes({ ...configIntegracoes, apiKey: e.target.value })}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => {
                      // Toggle visibility
                    }}
                  >
                    Mostrar
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Esta chave é usada para autenticar solicitações à API do sistema.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookUrl">URL do Webhook</Label>
                <Input
                  id="webhookUrl"
                  value={configIntegracoes.webhookUrl}
                  onChange={(e) => setConfigIntegracoes({ ...configIntegracoes, webhookUrl: e.target.value })}
                />
                <p className="text-xs text-gray-500">URL para onde os eventos do sistema serão enviados.</p>
              </div>

              <div className="p-4 border rounded-md bg-gray-50">
                <h3 className="text-base font-medium mb-2">Sistemas Integrados</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Sistema de Segurança</p>
                        <p className="text-xs text-gray-500">Integrado em 15/03/2023</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Sistema de RH</p>
                        <p className="text-xs text-gray-500">Integrado em 10/01/2023</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800">Ativo</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveConfig} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
