"use client"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/pt-br"
import "react-big-calendar/lib/css/react-big-calendar.css"

// Configurar o localizer para português
moment.locale("pt-br")
const localizer = momentLocalizer(moment)

// Estilos personalizados para os eventos
const eventStyleGetter = (event) => {
  let backgroundColor = "#10b981" // emerald-600
  const textColor = "#ffffff"

  switch (event.status.toLowerCase()) {
    case "agendado":
      backgroundColor = "#3b82f6" // blue-500
      break
    case "em andamento":
      backgroundColor = "#f59e0b" // amber-500
      break
    case "concluído":
      backgroundColor = "#10b981" // emerald-600
      break
    case "cancelado":
      backgroundColor = "#ef4444" // red-500
      break
  }

  const style = {
    backgroundColor,
    color: textColor,
    borderRadius: "4px",
    border: "none",
    display: "block",
    padding: "2px 5px",
  }

  return {
    style,
  }
}

interface ScheduleCalendarProps {
  agendamentos: Array<{
    id: string
    titulo: string
    dataHora: number
    status: string
    tipo: string
    veiculo: {
      id: string
      placa: string
      modelo: string
    }
  }>
  onEventClick?: (id: string) => void
}

export default function ScheduleCalendar({ agendamentos, onEventClick }: ScheduleCalendarProps) {
  // Converter agendamentos para o formato esperado pelo calendário
  const events = agendamentos.map((agendamento) => ({
    id: agendamento.id,
    title: `${agendamento.titulo} (${agendamento.veiculo.placa})`,
    start: new Date(agendamento.dataHora),
    end: new Date(agendamento.dataHora + 3600000), // Adicionar 1 hora como padrão
    status: agendamento.status,
    tipo: agendamento.tipo,
    veiculo: agendamento.veiculo,
  }))

  // Mensagens em português
  const messages = {
    allDay: "Dia inteiro",
    previous: "Anterior",
    next: "Próximo",
    today: "Hoje",
    month: "Mês",
    week: "Semana",
    day: "Dia",
    agenda: "Agenda",
    date: "Data",
    time: "Hora",
    event: "Evento",
    noEventsInRange: "Não há agendamentos neste período.",
  }

  // Formatos de data personalizados
  const formats = {
    dayHeaderFormat: (date) => moment(date).format("dddd, D [de] MMMM"),
    dayRangeHeaderFormat: ({ start, end }) =>
      `${moment(start).format("D [de] MMMM")} - ${moment(end).format("D [de] MMMM")}`,
  }

  const handleEventClick = (event) => {
    if (onEventClick) {
      onEventClick(event.id)
    }
  }

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: "100%" }}
      messages={messages}
      formats={formats}
      eventPropGetter={eventStyleGetter}
      onSelectEvent={handleEventClick}
      views={["month", "week", "day", "agenda"]}
    />
  )
}
