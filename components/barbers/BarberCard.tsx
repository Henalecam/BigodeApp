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
    <Card className="group cursor-pointer transition-all hover:scale-[1.02] border-l-4 border-l-accent">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-primary mb-1">{name}</h3>
            {phone && <p className="text-sm text-neutral-600">{phone}</p>}
          </div>
          <Badge variant={isActive ? "success" : "outline"} className="shrink-0">
            {isActive ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-primary/10">
          <div className="text-xs text-neutral-500">Comissão:</div>
          <div className="text-sm font-bold text-accent">{commissionRate}%</div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" className="w-full group-hover:bg-gradient-to-r group-hover:from-secondary group-hover:to-accent group-hover:text-white transition-all" onClick={() => onEdit(id)}>
          Gerenciar barbeiro
        </Button>
      </CardFooter>
    </Card>
  )
}

