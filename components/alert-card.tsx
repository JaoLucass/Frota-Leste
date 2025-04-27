import { AlertTriangle, AlertCircle } from "lucide-react"

interface AlertCardProps {
  title: string
  description: string
  time: string
  severity: "critical" | "warning" | "info"
}

export function AlertCard({ title, description, time, severity }: AlertCardProps) {
  const severityMap = {
    critical: {
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      badge: "Crítico",
      badgeColor: "bg-red-100 text-red-800",
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      badge: "Moderado",
      badgeColor: "bg-amber-100 text-amber-800",
    },
    info: {
      icon: <AlertCircle className="h-5 w-5 text-blue-500" />,
      badge: "Info",
      badgeColor: "bg-blue-100 text-blue-800",
    },
  }

  const { icon, badge, badgeColor } = severityMap[severity]

  return (
    <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          <p className="text-xs text-gray-500 mt-2">{time}</p>
        </div>
      </div>
    </div>
  )
}
