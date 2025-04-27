import { User } from "lucide-react"

interface DriverCardProps {
  name: string
  description: string
  status: string
}

export function DriverCard({ name, description, status }: DriverCardProps) {
  // Updated statusMap to match Portuguese status values in lowercase
  const statusMap = {
    ativo: {
      label: "Ativo",
      color: "bg-emerald-100 text-emerald-800",
    },
    inativo: {
      label: "Inativo",
      color: "bg-gray-100 text-gray-800",
    },
    pausa: {
      label: "Pausa",
      color: "bg-amber-100 text-amber-800",
    },
    férias: {
      label: "Férias",
      color: "bg-blue-100 text-blue-800",
    },
    afastado: {
      label: "Afastado",
      color: "bg-red-100 text-red-800",
    },
    // Keep the English keys for backward compatibility
    active: {
      label: "Ativo",
      color: "bg-emerald-100 text-emerald-800",
    },
    paused: {
      label: "Pausa",
      color: "bg-amber-100 text-amber-800",
    },
    offline: {
      label: "Offline",
      color: "bg-gray-100 text-gray-800",
    },
  }

  // Default values in case the status is not found in the map
  const { label = "Desconhecido", color = "bg-gray-100 text-gray-800" } = statusMap[status.toLowerCase()] || {}

  return (
    <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 bg-emerald-50 p-1 rounded-full">
          <User className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>{label}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  )
}
