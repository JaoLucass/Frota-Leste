"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

interface FuelChartProps {
  data: {
    labels: string[]
    consumo: number[]
    preco: number[]
  }
}

export default function FuelChart({ data }: FuelChartProps) {
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
            label: "Consumo (km/L)",
            data: data.consumo,
            backgroundColor: "rgba(16, 185, 129, 0.2)",
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 1,
            yAxisID: "y",
          },
          {
            label: "Preço (R$/L)",
            data: data.preco,
            type: "line",
            backgroundColor: "rgba(245, 158, 11, 0.2)",
            borderColor: "rgba(245, 158, 11, 1)",
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
              text: "Consumo (km/L)",
              color: "rgba(16, 185, 129, 1)",
            },
            grid: {
              drawOnChartArea: false,
            },
            min: 0,
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "Preço (R$/L)",
              color: "rgba(245, 158, 11, 1)",
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
            text: "Histórico de Consumo e Preço",
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
