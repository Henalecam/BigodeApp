import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type AppointmentItem = {
  id: string
  startTime: string
  endTime: string
  clientName: string
  barberName: string
  services: string[]
  status: "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
}

const statusLabel: Record<AppointmentItem["status"], string> = {
  CONFIRMED: "Confirmado",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado"
}

const statusVariant: Record<AppointmentItem["status"], "default" | "warning" | "success" | "danger" | "outline"> = {
  CONFIRMED: "success",
  IN_PROGRESS: "warning",
  COMPLETED: "outline",
  CANCELLED: "danger"
}

export function DayView({
  appointments,
  loading,
  onSelect
}: {
  appointments: AppointmentItem[]
  loading: boolean
  onSelect: (id: string) => void
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (!appointments.length) {
    return <p className="text-sm text-neutral-500">Nenhum agendamento para este dia.</p>
  }

  return (
    <div className="space-y-3">
      {appointments.map(appointment => (
        <Card
          key={appointment.id}
          className="cursor-pointer border-primary/10 transition hover:border-primary/40"
          onClick={() => onSelect(appointment.id)}
        >
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-primary">
                {appointment.startTime} - {appointment.endTime}
              </p>
              <p className="text-sm text-neutral-600">{appointment.clientName}</p>
              <p className="text-xs text-neutral-500">Barbeiro: {appointment.barberName}</p>
              <p className="text-xs text-neutral-500">{appointment.services.join(", ")}</p>
            </div>
            <Badge variant={statusVariant[appointment.status]}>{statusLabel[appointment.status]}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

