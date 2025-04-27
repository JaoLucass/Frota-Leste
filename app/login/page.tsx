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
import { Eye, EyeOff, LogIn } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulação de login
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Verificar credenciais (simulado)
      if (email === "admin@frotahospitalar.com" && password === "senha123") {
        // Login bem-sucedido
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao sistema de monitoramento de frota.",
        })

        // Redirecionar para a página inicial
        router.push("/")
      } else {
        // Credenciais inválidas
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Email ou senha incorretos. Tente novamente.",
        })
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <LogIn className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Frota Hospitalar</CardTitle>
          <CardDescription className="text-center">Entre com suas credenciais para acessar o sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link href="/recuperar-senha" className="text-xs text-emerald-600 hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            Não tem uma conta?{" "}
            <Link href="/cadastro" className="text-emerald-600 hover:underline">
              Cadastre-se
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
