import { addDays, format, isSameDay, isToday, startOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

type WeekCalendarProps = {
  referenceDate: Date
  selectedDate: Date
  onSelectDate: (date: Date) => void
  indicators?: Record<string, { total: number; confirmed: number; cancelled: number }>
}

export function WeekCalendar({
  referenceDate,
  selectedDate,
  onSelectDate,
  indicators = {}
}: WeekCalendarProps) {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map(day => {
        const key = format(day, "yyyy-MM-dd")
        const indicator = indicators[key]
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectDate(day)}
            className={cn(
              "flex flex-col items-center rounded-lg border border-transparent p-3 transition focus:outline-none focus:ring-2 focus:ring-primary",
              isSameDay(day, selectedDate) && "border-primary bg-primary/10",
              isToday(day) && "border-secondary bg-secondary/10"
            )}
          >
            <span className="text-xs uppercase text-neutral-500">{format(day, "EEE", { locale: ptBR })}</span>
            <span className="text-lg font-semibold text-primary">{format(day, "dd")}</span>
            {indicator ? (
              <span className="text-xs text-neutral-500">
                {indicator.confirmed} confirmados
              </span>
            ) : (
              <span className="text-xs text-neutral-400">Sem dados</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

