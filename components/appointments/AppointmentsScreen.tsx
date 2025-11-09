"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { WeekCalendar } from "@/components/calendar/WeekCalendar"
import { DayView } from "@/components/calendar/DayView"
import { useAppointments } from "@/hooks/useAppointments"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type BarberOption = {
  id: string
  name: string
}

export function AppointmentsScreen({ barbers }: { barbers: BarberOption[] }) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [status, setStatus] = useState<string>("")
  const [barberId, setBarberId] = useState<string>("")

  const { appointments, loading, setFilters, fetchAppointments } = useAppointments()

  useEffect(() => {
    const formattedDate = format(selectedDate, "yyyy-MM-dd")
    setFilters({
      date: formattedDate,
      barberId: barberId || undefined,
      status: status || undefined
    })
    fetchAppointments()
  }, [selectedDate, barberId, status, setFilters, fetchAppointments])

  const appointmentsByDay = useMemo(() => {
    return appointments.map(appointment => ({
      id: appointment.id,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      clientName: appointment.client.name,
      barberName: appointment.barber.name,
      services: appointment.services.map(item => item.service.name),
      status: appointment.status
    }))
  }, [appointments])

  const indicators = useMemo(() => {
    const key = format(selectedDate, "yyyy-MM-dd")
    return {
      [key]: {
        total: appointments.length,
        confirmed: appointments.filter(item => item.status === "CONFIRMED").length,
        cancelled: appointments.filter(item => item.status === "CANCELLED").length
      }
    }
  }, [appointments, selectedDate])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Agendamentos</h1>
          <p className="text-sm text-neutral-600">
            Gerencie os atendimentos do dia • {appointments.length} {appointments.length === 1 ? 'agendamento' : 'agendamentos'}
          </p>
        </div>
        <Button asChild>
          <Link href="/agendamentos/novo">+ Novo agendamento</Link>
        </Button>
      </div>
      <WeekCalendar
        referenceDate={selectedDate}
        selectedDate={selectedDate}
        onSelectDate={date => setSelectedDate(date)}
        indicators={indicators}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Select value={barberId || "all"} onValueChange={value => setBarberId(value === "all" ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os barbeiros" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {barbers.map(barber => (
              <SelectItem key={barber.id} value={barber.id}>
                {barber.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status || "all"} onValueChange={value => setStatus(value === "all" ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="CONFIRMED">Confirmado</SelectItem>
            <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
            <SelectItem value="COMPLETED">Concluído</SelectItem>
            <SelectItem value="CANCELLED">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <div className="hidden lg:block" />
      </div>
      <DayView
        appointments={appointmentsByDay}
        loading={loading}
        onSelect={id => router.push(`/agendamentos/${id}`)}
      />
    </div>
  )
}

