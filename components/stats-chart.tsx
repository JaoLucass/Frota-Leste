"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

interface StatsChartProps {
  data: {
    consumo: number[]
    distancia: number[]
    labels: string[]
  }
}

export default function StatsChart({ data }: StatsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destruir o gráfico anterior se existir
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Consumo (L/100km)",
            data: data.consumo,
            backgroundColor: "rgba(16, 185, 129, 0.2)",
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 1,
            yAxisID: "y",
          },
          {
            label: "Distância (km)",
            data: data.distancia,
            type: "line",
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: "Consumo (L/100km)",
              color: "rgba(16, 185, 129, 1)",
            },
            grid: {
              drawOnChartArea: false,
            },
            min: 7,
            max: 9,
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "Distância (km)",
              color: "rgba(59, 130, 246, 1)",
            },
            grid: {
              drawOnChartArea: false,
            },
            min: 0,
          },
        },
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Desempenho da Frota - Última Semana",
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} />
}
