"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { User, Bell, Shield, LogOut, Save, Upload, Eye, EyeOff, Clock } from "lucide-react"

export default function PerfilPage() {
  const [activeTab, setActiveTab] = useState("perfil")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const [perfilData, setPerfilData] = useState({
    nome: "Carlos Silva",
    email: "carlos.silva@frotahospitalar.com",
    telefone: "(95) 98765-4321",
    cargo: "Administrador",
    departamento: "TI",
    dataCadastro: "15/03/2023",
  })

  const [senhaData, setsenhaData] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  })

  const [notificacoesData, setNotificacoesData] = useState({
    emailAtivo: true,
    pushAtivo: true,
    smsAtivo: false,
    alertaManutencao: true,
    alertaCombustivel: true,
    alertaRota: true,
  })

  const handlePerfilChange = (e) => {
    const { name, value } = e.target
    setPerfilData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSenhaChange = (e) => {
    const { name, value } = e.target
    setsenhaData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNotificacaoChange = (name, value) => {
    setNotificacoesData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSalvarPerfil = async () => {
    setLoading(true)
    try {
      // Simulação de salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar seu perfil.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAlterarSenha = async (e) => {
    e.preventDefault()

    if (senhaData.novaSenha !== senhaData.confirmarSenha) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem.",
      })
      return
    }

    setLoading(true)
    try {
      // Simulação de alteração de senha
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      })

      // Limpar campos de senha
      setsenhaData({
        senhaAtual: "",
        novaSenha: "",
        confirmarSenha: "",
      })
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível alterar sua senha.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSalvarNotificacoes = async () => {
    setLoading(true)
    try {
      // Simulação de salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Preferências atualizadas",
        description: "Suas preferências de notificação foram atualizadas com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao atualizar notificações:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar suas preferências de notificação.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    // Simulação de logout
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do sistema.",
    })

    // Redirecionar para a página de login
    router.push("/login")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Avatar" />
                  <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-800">CS</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-bold">{perfilData.nome}</h2>
                  <p className="text-sm text-gray-500">{perfilData.cargo}</p>
                </div>
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Alterar foto
                </Button>
              </div>

              <Separator className="my-6" />

              <div className="space-y-1">
                <Button
                  variant={activeTab === "perfil" ? "default" : "ghost"}
                  className={`w-full justify-start ${activeTab === "perfil" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                  onClick={() => setActiveTab("perfil")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </Button>
                <Button
                  variant={activeTab === "senha" ? "default" : "ghost"}
                  className={`w-full justify-start ${activeTab === "senha" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                  onClick={() => setActiveTab("senha")}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Alterar Senha
                </Button>
                <Button
                  variant={activeTab === "notificacoes" ? "default" : "ghost"}
                  className={`w-full justify-start ${activeTab === "notificacoes" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                  onClick={() => setActiveTab("notificacoes")}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notificações
                </Button>
              </div>

              <Separator className="my-6" />

              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-3/4">
          {activeTab === "perfil" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-emerald-600" />
                  Informações do Perfil
                </CardTitle>
                <CardDescription>Atualize suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input id="nome" name="nome" value={perfilData.nome} onChange={handlePerfilChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={perfilData.email}
                      onChange={handlePerfilChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" name="telefone" value={perfilData.telefone} onChange={handlePerfilChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departamento">Departamento</Label>
                    <Input
                      id="departamento"
                      name="departamento"
                      value={perfilData.departamento}
                      onChange={handlePerfilChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Data de Cadastro</Label>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">{perfilData.dataCadastro}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSalvarPerfil} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </div>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "senha" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-emerald-600" />
                  Alterar Senha
                </CardTitle>
                <CardDescription>Atualize sua senha de acesso ao sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAlterarSenha} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="senhaAtual">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="senhaAtual"
                        name="senhaAtual"
                        type={showPassword ? "text" : "password"}
                        value={senhaData.senhaAtual}
                        onChange={handleSenhaChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="novaSenha">Nova Senha</Label>
                    <Input
                      id="novaSenha"
                      name="novaSenha"
                      type={showPassword ? "text" : "password"}
                      value={senhaData.novaSenha}
                      onChange={handleSenhaChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmarSenha"
                      name="confirmarSenha"
                      type={showPassword ? "text" : "password"}
                      value={senhaData.confirmarSenha}
                      onChange={handleSenhaChange}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Alterando...
                      </div>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Alterar Senha
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "notificacoes" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-emerald-600" />
                  Preferências de Notificação
                </CardTitle>
                <CardDescription>Configure como deseja receber notificações do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Canais de Notificação</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailAtivo" className="flex items-center space-x-2">
                        <span>Notificações por Email</span>
                      </Label>
                      <Switch
                        id="emailAtivo"
                        checked={notificacoesData.emailAtivo}
                        onCheckedChange={(checked) => handleNotificacaoChange("emailAtivo", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="pushAtivo" className="flex items-center space-x-2">
                        <span>Notificações Push</span>
                      </Label>
                      <Switch
                        id="pushAtivo"
                        checked={notificacoesData.pushAtivo}
                        onCheckedChange={(checked) => handleNotificacaoChange("pushAtivo", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="smsAtivo" className="flex items-center space-x-2">
                        <span>Notificações por SMS</span>
                      </Label>
                      <Switch
                        id="smsAtivo"
                        checked={notificacoesData.smsAtivo}
                        onCheckedChange={(checked) => handleNotificacaoChange("smsAtivo", checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Tipos de Alertas</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="alertaManutencao" className="flex items-center space-x-2">
                        <span>Alertas de Manutenção</span>
                      </Label>
                      <Switch
                        id="alertaManutencao"
                        checked={notificacoesData.alertaManutencao}
                        onCheckedChange={(checked) => handleNotificacaoChange("alertaManutencao", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="alertaCombustivel" className="flex items-center space-x-2">
                        <span>Alertas de Combustível</span>
                      </Label>
                      <Switch
                        id="alertaCombustivel"
                        checked={notificacoesData.alertaCombustivel}
                        onCheckedChange={(checked) => handleNotificacaoChange("alertaCombustivel", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="alertaRota" className="flex items-center space-x-2">
                        <span>Alertas de Rota</span>
                      </Label>
                      <Switch
                        id="alertaRota"
                        checked={notificacoesData.alertaRota}
                        onCheckedChange={(checked) => handleNotificacaoChange("alertaRota", checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSalvarNotificacoes}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </div>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Preferências
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
