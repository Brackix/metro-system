import { CheckCircle } from "lucide-react"

export function MetroLineStatus() {
  const lines = [
    {
      id: 1,
      name: "Línea Azul",
      color: "#ef4444",
      status: "Buen Servicio",
      statusIcon: CheckCircle,
      statusColor: "text-green-500",
      message: "Trenes funcionando según lo programado.",
    },
    {
      id: 2,
      name: "Línea Roja",
      color: "#3b82f6",
      status: "Buen Servicio",
      statusIcon: CheckCircle,
      statusColor: "text-green-500",
      message: "Trenes funcionando según lo programado.",
    },
  ]

  return (
    <div className="space-y-4">
      {lines.map((line) => (
        <div key={line.id} className="flex items-start space-x-4 pb-4 last:pb-0 border-b last:border-0">
          <div className="w-3 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: line.color }} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{line.name}</h4>
              <div className={`flex items-center ${line.statusColor}`}>
                <line.statusIcon className="h-4 w-4 mr-1" />
                <span className="text-sm">{line.status}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{line.message}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
