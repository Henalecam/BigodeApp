import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type ClientCardProps = {
  id: string
  name: string
  phone: string
  appointmentsCount: number
  lastAppointment?: string
  onView: (id: string) => void
}

export function ClientCard({ id, name, phone, appointmentsCount, lastAppointment, onView }: ClientCardProps) {
  return (
    <Card className="border-primary/10">
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary">{name}</h3>
          <Badge variant="outline">{appointmentsCount} atend.</Badge>
        </div>
        <p className="text-sm text-neutral-500">{phone}</p>
        {lastAppointment ? <p className="text-xs text-neutral-500">Último: {lastAppointment}</p> : null}
      </CardContent>
      <CardFooter className="p-4">
        <Button variant="outline" className="w-full" onClick={() => onView(id)}>
          Detalhes
        </Button>
      </CardFooter>
    </Card>
  )
}

