import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type TimeSlotPickerProps = {
  slots: string[]
  selected?: string
  loading?: boolean
  onSelect: (time: string) => void
}

export function TimeSlotPicker({ slots, selected, loading, onSelect }: TimeSlotPickerProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (!slots.length) {
    return <p className="text-sm text-neutral-500">Nenhum horário disponível para o dia selecionado.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {slots.map(slot => (
        <Button
          key={slot}
          variant={selected === slot ? "default" : "outline"}
          onClick={() => onSelect(slot)}
        >
          {slot}
        </Button>
      ))}
    </div>
  )
}

