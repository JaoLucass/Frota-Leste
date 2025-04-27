"use client"

import { useState, useEffect, useRef } from "react"
import { Heart } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { filterHeartRate, checkHeartRateStatus } from "@/lib/kalman-filter"

interface HeartRateCardProps {
  driverName: string
  vehicleInfo: string
  initialHeartRate: number
  driverId: string
}

export function HeartRateCard({ driverName, vehicleInfo, initialHeartRate, driverId }: HeartRateCardProps) {
  const [heartRate, setHeartRate] = useState(initialHeartRate)
  const [filteredRate, setFilteredRate] = useState(initialHeartRate)
  const [heartRateHistory, setHeartRateHistory] = useState<number[]>([])
  const [status, setStatus] = useState<"normal" | "elevated" | "critical">("normal")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Simular variações nos batimentos para demonstração
  useEffect(() => {
    const timer = setInterval(() => {
      // Simular pequenas variações nos batimentos (em um sistema real, isso viria do banco de dados)
      const variation = Math.random() * 6 - 3 // Variação de -3 a +3 bpm
      const newHeartRate = heartRate + variation
      setHeartRate(newHeartRate)

      // Aplicar filtro de Kalman para suavizar as leituras
      const filtered = filterHeartRate(newHeartRate)
      setFilteredRate(filtered)

      // Atualizar histórico (manter apenas os últimos 20 valores)
      setHeartRateHistory((prev) => {
        const newHistory = [...prev, filtered]
        if (newHistory.length > 20) {
          return newHistory.slice(newHistory.length - 20)
        }
        return newHistory
      })

      // Verificar status dos batimentos
      const heartStatus = checkHeartRateStatus(filtered)
      setStatus(heartStatus.status)
    }, 1000)

    return () => clearInterval(timer)
  }, [heartRate])

  // Desenhar o gráfico de linha
  useEffect(() => {
    if (canvasRef.current && heartRateHistory.length > 1) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Limpar o canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Configurar estilo
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      // Definir cor com base no status
      if (status === "normal") {
        ctx.strokeStyle = "#10b981" // emerald-500
      } else if (status === "elevated") {
        ctx.strokeStyle = "#f59e0b" // amber-500
      } else {
        ctx.strokeStyle = "#ef4444" // red-500
      }

      // Encontrar valores mínimos e máximos para escala
      const min = Math.min(...heartRateHistory) - 5
      const max = Math.max(...heartRateHistory) + 5

      // Desenhar a linha
      ctx.beginPath()
      heartRateHistory.forEach((value, index) => {
        const x = (index / (heartRateHistory.length - 1)) * canvas.width
        const y = canvas.height - ((value - min) / (max - min)) * canvas.height
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    }
  }, [heartRateHistory, status])

  // Determinar a cor com base no status
  const getStatusColor = () => {
    switch (status) {
      case "critical":
        return "text-red-500"
      case "elevated":
        return "text-amber-500"
      default:
        return "text-emerald-500"
    }
  }

  // Determinar o texto do status
  const getStatusText = () => {
    switch (status) {
      case "critical":
        return "Crítico"
      case "elevated":
        return "Elevado"
      default:
        return "Normal"
    }
  }

  // Calcular a porcentagem para a barra de progresso
  const getProgressPercentage = () => {
    // Considerando 60-100 como faixa normal (0-50%)
    // 100-140 como elevado (50-80%)
    // >140 como crítico (80-100%)
    if (filteredRate <= 60) return 0
    if (filteredRate <= 100) return ((filteredRate - 60) / 40) * 50
    if (filteredRate <= 140) return 50 + ((filteredRate - 100) / 40) * 30
    return 80 + ((Math.min(filteredRate, 180) - 140) / 40) * 20
  }

  // Determinar a cor da barra de progresso
  const getProgressColor = () => {
    switch (status) {
      case "critical":
        return "bg-red-500"
      case "elevated":
        return "bg-amber-500"
      default:
        return "bg-emerald-500"
    }
  }

  return (
    <div className="border rounded-lg p-3 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-sm">{driverName}</h3>
          <p className="text-xs text-gray-500">{vehicleInfo}</p>
        </div>
        <div className={`flex items-center gap-1 ${getStatusColor()}`}>
          <Heart className="h-4 w-4 fill-current" />
          <span className="font-bold text-lg">{Math.round(filteredRate)}</span>
          <span className="text-xs">BPM</span>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between items-center text-xs mb-1">
          <span>Status:</span>
          <span className={`font-medium ${getStatusColor()}`}>{getStatusText()}</span>
        </div>
        <Progress value={getProgressPercentage()} className="h-1.5" indicatorClassName={getProgressColor()} />
      </div>

      <div className="h-16 w-full">
        <canvas ref={canvasRef} width={200} height={60} className="w-full h-full" />
      </div>
    </div>
  )
}
