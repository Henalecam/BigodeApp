"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-between text-sm font-medium",
        caption_label: "hidden",
        nav: "flex items-center gap-1",
        nav_button: "h-8 w-8 rounded-md border border-primary/10 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "w-9 font-semibold text-xs text-neutral-500",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm focus-within:relative focus-within:z-20",
        day: "flex h-9 w-9 items-center justify-center rounded-md text-sm transition hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary",
        day_today: "bg-secondary/10 text-primary",
        day_selected: "bg-primary text-primary-foreground",
        day_outside: "text-neutral-300",
        day_disabled: "text-neutral-300 opacity-50",
        ...classNames
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }

