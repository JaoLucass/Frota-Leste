"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, get } from "firebase/database"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Fuel, Car, MapPin, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

export default function DetalhesAbastecimento({ params }) {
  const [abastecimento, setAbastecimento] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    const fetchAbastecimento = async () => {
      try {
        const abastecimentoRef = ref(database, `fuel/${id}`)
        const snapshot = await get(abastecimentoRef)

        if (!snapshot.exists()) {
          toast({
            variant: "destructive",
            title: "Erro!",
            description: "Abastecimento não encontrado.",
          })
          router.push("/combustivel")
          return
        }

        const abastecimentoData = snapshot.val()
        setAbastecimento({ id, ...abastecimentoData })
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        toast({
          variant: "destructive",
          title: "Erro!",
          description: "Falha ao buscar dados do abastecimento.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAbastecimento()
  }, [id, router])

  // Calcular consumo
  const calcularConsumo = () => {
    if (!abastecimento || !abastecimento.kmAnterior) return null

    const distancia = abastecimento.kmAtual - abastecimento.kmAnterior
    const consumo = distancia / abastecimento.litros

    return consumo.toFixed(2)
  }

  // Calcular preço por litro
  const calcularPrecoLitro = () => {
    if (!abastecimento) return null

    const preco = abastecimento.valor / abastecimento.litros

    return preco.toFixed(2)
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
        <Button variant="outline" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Detalhes do Abastecimento</h1>
        <Button variant="outline" onClick={() => router.push(`/combustivel/editar/${id}`)} className="ml-auto">
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Fuel className="mr-2 h-5 w-5 text-emerald-500" />
              Informações do Abastecimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Data</h3>
              <p className="font-semibold">
                {new Date(abastecimento.data).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Tipo de Combustível</h3>
              <Badge className="mt-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                {abastecimento.tipoCombustivel}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Litros</h3>
              <p>{abastecimento.litros.toFixed(2)} L</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Valor Total</h3>
              <p>R$ {abastecimento.valor.toFixed(2)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Preço por Litro</h3>
              <p>R$ {calcularPrecoLitro()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="mr-2 h-5 w-5 text-blue-500" />
              Veículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => router.push(`/veiculos/${abastecimento.veiculo.id}`)}
            >
              <div>
                <h3 className="text-sm font-medium text-gray-500">Placa</h3>
                <p className="font-semibold">{abastecimento.veiculo.placa}</p>
              </div>
              <div className="mt-2">
                <h3 className="text-sm font-medium text-gray-500">Modelo</h3>
                <p>{abastecimento.veiculo.modelo}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Quilometragem</h3>
              <p>{abastecimento.kmAtual} km</p>
            </div>
            {abastecimento.kmAnterior && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Quilometragem Anterior</h3>
                <p>{abastecimento.kmAnterior} km</p>
              </div>
            )}
            {calcularConsumo() && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Consumo</h3>
                <p>{calcularConsumo()} km/L</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-amber-500" />
              Posto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Nome</h3>
              <p className="font-semibold">{abastecimento.posto}</p>
            </div>
          </CardContent>
        </Card>

        {abastecimento.observacoes && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5 text-emerald-500" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{abastecimento.observacoes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
