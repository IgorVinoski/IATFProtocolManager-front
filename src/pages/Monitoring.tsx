import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios'; 
import { useAuth } from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

type Protocol = {
  id: string;
  name: string;
  startDate: string;
  implantRemovalDate?: string;
};

interface CalendarEvent {
  start: Date;
  end: Date;
  title: string;
  allDay?: boolean;
  resource?: any;
}

const API_URL = import.meta.env.VITE_ENDERECO_API;

const Monitoring = () => {
  const { token, logout } = useAuth(); 
  const navigate = useNavigate(); 

  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null); 

  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '', 
    },
  });

  axiosInstance.interceptors.response.use(
    response => response,
    error => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.error("Erro de autenticação/autorização no Monitoramento:", error.response.data.message);
        setError("Sua sessão expirou ou você não tem permissão para acessar este conteúdo. Por favor, faça login novamente.");
        logout(); 
        navigate('/login'); 
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const fetchProtocols = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      setError(null); 
      try {
        const res = await axiosInstance.get<Protocol[]>('/protocols');
        setProtocols(res.data);
      } catch (err: any) {
        console.error('Erro ao buscar protocolos:', err);
        if (err.response && err.response.data && err.response.data.message) {
            setError(`Falha ao carregar protocolos: ${err.response.data.message}`);
        } else {
            setError("Não foi possível carregar os protocolos. Tente novamente mais tarde.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProtocols();
  }, [token, navigate]); 

  useEffect(() => {
    const events: CalendarEvent[] = protocols.reduce((acc, protocol) => {
      if (protocol.startDate) {
        const startDate = new Date(protocol.startDate);

        // Evento Dia 0
        const day0 = new Date(startDate);
        acc.push({
          start: day0,
          end: day0,
          title: `"${protocol.name}" - Dia 0 (Colocação DIV + Benzoato)`,
          allDay: true,
          resource: { protocolId: protocol.id, step: 'Dia 0' },
        });

        // Evento Dia 7/8
        const day7 = new Date(startDate);
        day7.setDate(startDate.getDate() + 7);
        // Considerando que o evento pode acontecer entre o dia 7 e 8
        const day8 = new Date(startDate);
        day8.setDate(startDate.getDate() + 8);

        acc.push({
          start: day7, // Início do período
          end: day8, // Fim do período
          title: `"${protocol.name}" - Dia 7/8 (PGF2α + eCG)`,
          allDay: true,
          resource: { protocolId: protocol.id, step: 'Dia 7/8' },
        });

        // Evento Dia 9/10
        const day9 = new Date(startDate);
        day9.setDate(startDate.getDate() + 9);
        const day10 = new Date(startDate);
        day10.setDate(startDate.getDate() + 10);

        acc.push({
          start: day9,
          end: day10,
          title: `"${protocol.name}" - Dia 9/10 (Retirada DIV + Estradiol)`,
          allDay: true,
          resource: { protocolId: protocol.id, step: 'Dia 9/10' },
        });

        // Evento IATF (Dia 10/11) - Assumindo 48-56h após retirada do implante
        // Se a lógica do seu backend retorna implantRemovalDate para isso, use-o
        // Caso contrário, calcule com base no Day 9/10
        const iatfStartDay = new Date(startDate);
        iatfStartDay.setDate(startDate.getDate() + 10); // 10 dias após o início
        const iatfEndDay = new Date(startDate);
        iatfEndDay.setDate(startDate.getDate() + 11); // 11 dias após o início

        acc.push({
          start: iatfStartDay,
          end: iatfEndDay,
          title: `"${protocol.name}" - IATF`,
          allDay: true,
          resource: { protocolId: protocol.id, step: 'IATF' },
        });
      }
      return acc;
    }, [] as CalendarEvent[]);
    setCalendarEvents(events);
  }, [protocols]);


  if (loading) {
    return <div className="p-6 text-center text-gray-600">Carregando calendário de protocolos...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Voltar para o Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-800">Monitoramento de Protocolos IATF</h1>
      <div className="card bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            allDayAccessor="allDay"
            style={{ height: 500 }} 
            eventPropGetter={(event) => {
              let backgroundColor = '';
              if (event.title.includes('Dia 0')) backgroundColor = '#fcd34d'; // Amarelo
              else if (event.title.includes('Dia 7/8')) backgroundColor = '#60a5fa'; // Azul
              else if (event.title.includes('Dia 9/10')) backgroundColor = '#86efac'; // Verde
              else if (event.title.includes('IATF')) backgroundColor = '#fca5a5'; // Vermelho
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
        <div className="p-4 mt-4 bg-gray-50 rounded-b-lg">
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