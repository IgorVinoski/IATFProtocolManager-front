import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

type Protocol = {
  id: string;
  name: string;
  startDate: string;
};

interface CalendarEvent {
  start: Date;
  end: Date;
  title: string;
  allDay?: boolean;
  resource?: any;
}

const Monitoring = () => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const url = import.meta.env.VITE_ENDERECO_API;

  useEffect(() => {
    fetchProtocols();
  }, []);

  useEffect(() => {
    const events = protocols.reduce((acc, protocol) => {
      if (protocol.startDate) {
        const startDate = new Date(protocol.startDate);
        const day0 = new Date(startDate);
        const day7or8 = new Date(startDate);
        day7or8.setDate(startDate.getDate() + 7);
        const day9or10 = new Date(startDate);
        day9or10.setDate(startDate.getDate() + 9);
        const day10or11 = new Date(startDate);
        day10or11.setDate(startDate.getDate() + 10);

        acc.push(
          {
            start: day0,
            end: day0,
            title: `"${protocol.name}" - Dia 0`,
            allDay: true,
            resource: { protocolId: protocol.id, step: 'Dia 0' },
          },
          {
            start: day7or8,
            end: day7or8,
            title: `"${protocol.name}" - Dia 7/8`,
            allDay: true,
            resource: { protocolId: protocol.id, step: 'Dia 7/8' },
          },
          {
            start: day9or10,
            end: day9or10,
            title: `"${protocol.name}" - Dia 9/10`,
            allDay: true,
            resource: { protocolId: protocol.id, step: 'Dia 9/10' },
          },
          {
            start: day10or11,
            end: day10or11,
            title: `"${protocol.name}" - IATF`,
            allDay: true,
            resource: { protocolId: protocol.id, step: 'IATF' },
          }
        );
      }
      return acc;
    }, []);
    setCalendarEvents(events);
  }, [protocols]);

  const fetchProtocols = async () => {
    try {
      const res = await fetch(`${url}/protocols`);
      const data = await res.json();
      setProtocols(data);
    } catch (err) {
      console.error('Erro ao buscar protocolos:', err);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Monitoramento de Protocolos IATF</h1>
      <div className="card overflow-hidden">
        <div className="p-4">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            allDayAccessor="allDay"
            style={{ height: 500 }} // Ajuste a altura conforme necessário
            eventPropGetter={(event) => {
              let backgroundColor = '';
              if (event.title.includes('Dia 0')) backgroundColor = '#fcd34d';
              if (event.title.includes('Dia 7/8')) backgroundColor = '#60a5fa';
              if (event.title.includes('Dia 9/10')) backgroundColor = '#86efac';
              if (event.title.includes('IATF')) backgroundColor = '#fca5a5';
              return {
                style: {
                  backgroundColor,
                  color: 'white',
                  borderRadius: '5px',
                  opacity: 0.8,
                  border: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              };
            }}
          />
        </div>
        <div className="p-4 mt-4 bg-gray-50 rounded-b-md">
          <h3 className="font-semibold text-gray-700 mb-2">Legenda:</h3>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>Dia 0: Colocação DIV + Benzoato de Estradiol</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>Dia 7/8: Aplicação de PGF2α (+ eCG)</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Dia 9/10: Retirada DIV + Nova dose de Estradiol</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Dia 10/11: IATF</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;