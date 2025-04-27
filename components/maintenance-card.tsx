import { Wrench } from "lucide-react"

interface MaintenanceCardProps {
  title: string
  description: string
  time: string
}

export function MaintenanceCard({ title, description, time }: MaintenanceCardProps) {
  return (
    <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <Wrench className="h-5 w-5 text-blue-500" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{title}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Agendado</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          <p className="text-xs text-gray-500 mt-2">{time}</p>
        </div>
      </div>
    </div>
  )
}
