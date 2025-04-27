import type { ReactNode } from "react"
import { ArrowDown, ArrowUp } from "lucide-react"

interface CardProps {
  title: string
  value: string
  description: string
  icon: ReactNode
  trend?: string
  trendPositive?: boolean
  color?: "emerald" | "amber" | "blue" | "red"
}

export function Card({ title, value, description, icon, trend, trendPositive = false, color = "emerald" }: CardProps) {
  const colorMap = {
    emerald: "text-emerald-600",
    amber: "text-amber-500",
    blue: "text-blue-500",
    red: "text-red-500",
  }

  const bgColorMap = {
    emerald: "bg-emerald-50",
    amber: "bg-amber-50",
    blue: "bg-blue-50",
    red: "bg-red-50",
  }

  const borderColorMap = {
    emerald: "border-emerald-100",
    amber: "border-amber-100",
    blue: "border-blue-100",
    red: "border-red-100",
  }

  return (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${borderColorMap[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>

          {trend && (
            <div className="flex items-center mt-2 text-xs">
              {trendPositive ? (
                <ArrowUp className="h-3 w-3 text-emerald-500 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 text-emerald-500 mr-1" />
              )}
              <span className="text-emerald-600">{trend}</span>
            </div>
          )}
        </div>

        <div className={`p-2 rounded-full ${bgColorMap[color]}`}>{icon}</div>
      </div>
    </div>
  )
}
