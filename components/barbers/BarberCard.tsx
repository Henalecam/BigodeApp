import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type BarberCardProps = {
  id: string
  name: string
  phone?: string | null
  commissionRate: number
  isActive: boolean
  onEdit: (id: string) => void
}

export function BarberCard({ id, name, phone, commissionRate, isActive, onEdit }: BarberCardProps) {
  return (
    <Card className="border-primary/10">
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary">{name}</h3>
          <Badge variant={isActive ? "success" : "outline"}>{isActive ? "Ativo" : "Inativo"}</Badge>
        </div>
        <p className="text-sm text-neutral-500">{phone}</p>
        <p className="text-xs text-neutral-500">Comissão {commissionRate}%</p>
      </CardContent>
      <CardFooter className="p-4">
        <Button variant="outline" className="w-full" onClick={() => onEdit(id)}>
          Gerenciar
        </Button>
      </CardFooter>
    </Card>
  )
}

