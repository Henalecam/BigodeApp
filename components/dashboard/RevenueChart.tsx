"use client"

type RevenuePoint = {
  label: string
  value: number
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const maxValue = Math.max(...data.map(point => point.value), 1)

  return (
    <div className="flex h-48 items-end gap-4">
      {data.map(point => (
        <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-full w-full items-end justify-center rounded-md bg-primary/5 p-1">
            <div
              className="w-full rounded-md bg-primary transition-all"
              style={{ height: `${(point.value / maxValue) * 100}%` }}
            />
          </div>
          <div className="text-center text-xs text-neutral-500">{point.label.slice(5)}</div>
        </div>
      ))}
    </div>
  )
}

