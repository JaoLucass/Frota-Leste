"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, User, Car, Clock } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function DetalhesMotorista({ params }) {
  const [motorista, setMotorista] = useState(null)
  const [veiculos, setVeiculos] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    const fetchMotoristaData = async () => {
      try {
        // Buscar dados do motorista
        const motoristaRef = ref(database, `drivers/${id}`)
        const motoristaSnapshot = await get(motoristaRef)

        if (!motoristaSnapshot.exists()) {
          toast({
            variant: "destructive",
            title: "Erro!",
            description: "Motorista não encontrado.",
          })
          router.push("/motoristas")
          return
        }

        const motoristaData = motoristaSnapshot.val()
        setMotorista({ id, ...motoristaData })

        // Buscar veículos associados a este motorista
        const veiculosRef = ref(database, "vehicles")
        const veiculosSnapshot = await get(veiculosRef)

        if (veiculosSnapshot.exists()) {
          const veiculosData = veiculosSnapshot.val()
          const veiculosAssociados = Object.entries(veiculosData)
            .filter(([_, veiculo]) => veiculo.motorista_id === id)
            .map(([veiculoId, veiculo]) => ({
              id: veiculoId,
              ...veiculo,
            }))

          setVeiculos(veiculosAssociados)
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        toast({
          variant: "destructive",
          title: "Erro!",
          description: "Falha ao buscar dados do motorista.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMotoristaData()
  }, [id, router])

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
        <Button variant="outline" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Detalhes do Motorista</h1>
        <Button variant="outline" onClick={() => router.push(`/motoristas/editar/${id}`)} className="ml-auto">
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-emerald-500" />
              Informações do Motorista
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Nome</h3>
              <p className="font-semibold">{motorista.nome}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">CNH</h3>
              <p>{motorista.cnh}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Telefone</h3>
              <p>{motorista.telefone}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  motorista.status === "Ativo" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {motorista.status}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Em Movimento</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  motorista.is_moving ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {motorista.is_moving ? "Sim" : "Não"}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Criado em</h3>
              <p>{new Date(motorista.createdAt).toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="mr-2 h-5 w-5 text-blue-500" />
              Veículos Associados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {veiculos.length > 0 ? (
              <div className="space-y-4">
                {veiculos.map((veiculo) => (
                  <div
                    key={veiculo.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/veiculos/${veiculo.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{veiculo.placa}</p>
                        <p className="text-sm text-gray-500">
                          {veiculo.modelo} ({veiculo.ano})
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          veiculo.status === "Ativo" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {veiculo.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Car className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Nenhum veículo associado a este motorista.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-amber-500" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>Histórico de atividades em breve.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
