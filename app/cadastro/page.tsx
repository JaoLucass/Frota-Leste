"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Eye, EyeOff, UserPlus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CadastroPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
    senha: "",
    confirmarSenha: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validar senha
    if (formData.senha !== formData.confirmarSenha) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "As senhas não coincidem. Por favor, verifique e tente novamente.",
      })
      setLoading(false)
      return
    }

    try {
      // Simulação de cadastro
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Cadastro bem-sucedido
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Sua conta foi criada. Você já pode fazer login no sistema.",
      })

      // Redirecionar para a página de login
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer cadastro:", error)
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: "Ocorreu um erro ao tentar criar sua conta. Tente novamente mais tarde.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
          <CardDescription className="text-center">
            Preencha os dados abaixo para criar sua conta no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Seu nome completo"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                name="telefone"
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Select value={formData.cargo} onValueChange={(value) => handleSelectChange("cargo", value)}>
                <SelectTrigger id="cargo">
                  <SelectValue placeholder="Selecione seu cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="motorista">Motorista</SelectItem>
                  <SelectItem value="operador">Operador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  name="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={handleChange}
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
              <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
              <Input
                id="confirmarSenha"
                name="confirmarSenha"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando conta...
                </div>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-emerald-600 hover:underline">
              Faça login
            </Link>
          </div>
          <div className="text-xs text-center text-gray-400">
            © {new Date().getFullYear()} Frota Hospitalar. Todos os direitos reservados.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
