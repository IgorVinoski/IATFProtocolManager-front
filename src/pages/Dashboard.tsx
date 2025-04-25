import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { Bell, CalendarDays, Squircle, Users } from 'lucide-react';
import axios from 'axios';

const colors = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];

interface ProtocolEvent {
  name: string;
  day?: number;
  dayStart?: number;
  dayEnd?: number;
  hoursAfterImplantRemovalStart?: number;
  hoursAfterImplantRemovalEnd?: number;
}

const protocolEvents: ProtocolEvent[] = [
  { name: 'Colocação do dispositivo + Estradiol', day: 0 },
  { name: 'Prostaglandina (PGF2α) + eCG (se utilizado)', dayStart: 7, dayEnd: 8 },
  { name: 'Retirada do dispositivo + Nova dose de Estradiol', dayStart: 9, dayEnd: 10 },
  { name: 'IATF', dayStart: 10, dayEnd: 11, hoursAfterImplantRemovalStart: 48, hoursAfterImplantRemovalEnd: 56 },
];

interface ProtocolData {
  id: string;
  name: string;
  startDate?: string;
  notifications?: boolean;
  implantRemovalDate?: string;
}

interface AnimalStatsData {
  total_animals: number;
  pregnant_animals: number;
}

interface ProtocolStatsItem {
  name: string;
  total: string | null;
  pregnantCount: number | null;
}

interface ProtocolStatsResponse {
  stats: ProtocolStatsItem[];
}

const Dashboard = () => {
  const [animals, setAnimals] = useState<any[]>([]);
  const [protocols, setProtocols] = useState<ProtocolData[]>([]);
  const [pregnancySuccessRate, setPregnancySuccessRate] = useState<any[]>([]);
  const [pregnancyRateByProtocol, setPregnancyRateByProtocol] = useState<any[]>([]);
  const [nearbyEventsCount, setNearbyEventsCount] = useState(0);

  const url = import.meta.env.VITE_ENDERECO_API;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          animalRes,
          protocolRes,
          animalStatsRes,
          protocolStatsRes,
        ] = await Promise.all([
          axios.get<any[]>(`${url}/animals`),
          axios.get<ProtocolData[]>(`${url}/protocols`),
          axios.get<AnimalStatsData>(`${url}/animals/stats`),
          axios.get<ProtocolStatsResponse>(`${url}/protocols/stats`),
        ]);

        setAnimals(animalRes.data);
        setProtocols(protocolRes.data);

        const { total_animals, pregnant_animals } = animalStatsRes.data;
        const naoPrenhas = total_animals - pregnant_animals;

        setPregnancySuccessRate([
          { name: 'Prenhas', value: pregnant_animals },
          { name: 'Não Prenhas', value: naoPrenhas },
        ]);

        const barData = protocolStatsRes.data.stats.map((protocol) => {
          const totalAnimais = parseInt(protocol.total || '0', 10);
          const prenhasProtocol = protocol.pregnantCount !== null ? parseInt(protocol.pregnantCount.toString(), 10) : 0;
          const taxa = totalAnimais > 0 ? Math.round((prenhasProtocol / totalAnimais) * 100) : 0;
          return { name: protocol.name, pregnancyRate: taxa };
        });
        setPregnancyRateByProtocol(barData);

        calculateNearbyEvents(protocolRes.data);
      } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
      }
    };

    fetchData();
  }, [url]);

  const calculateNearbyEvents = (protocolsData: ProtocolData[]) => {
    const today = new Date();
    let totalNearbyEvents = 0;

    protocolsData.forEach((protocol) => {
      if (protocol.startDate) {
        const protocolStartDate = new Date(protocol.startDate);
        let hasNearbyEvent = false;

        protocolEvents.forEach((event) => {
          if (event.day !== undefined) {
            const eventDate = new Date(protocolStartDate);
            eventDate.setDate(protocolStartDate.getDate() + event.day);
            const diffInDays = (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
            if (diffInDays >= 0 && diffInDays <= 3) {
              hasNearbyEvent = true;
            }
          } else if (event.dayStart !== undefined && event.dayEnd !== undefined) {
            const startDate = new Date(protocolStartDate);
            startDate.setDate(protocolStartDate.getDate() + event.dayStart);
            const endDate = new Date(protocolStartDate);
            endDate.setDate(protocolStartDate.getDate() + event.dayEnd);

            const diffStart = (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
            const diffEnd = (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

            if ((diffStart >= 0 && diffStart <= 3) || (diffEnd >= 0 && diffEnd <= 3) || (today >= startDate && today <= endDate)) {
              hasNearbyEvent = true;
            }
          } else if (event.hoursAfterImplantRemovalStart !== undefined && protocol.implantRemovalDate) {
            const implantRemovalDate = new Date(protocol.implantRemovalDate);
            const iatfStartDate = new Date(implantRemovalDate);
            iatfStartDate.setHours(iatfStartDate.getHours() + (event.hoursAfterImplantRemovalStart || 0));
            const iatfEndDate = new Date(implantRemovalDate);
            iatfEndDate.setHours(iatfEndDate.getHours() + (event.hoursAfterImplantRemovalEnd || 0));

            const diffStart = (iatfStartDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
            const diffEnd = (iatfEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

            if ((diffStart >= 0 && diffStart <= 3) || (diffEnd >= 0 && diffEnd <= 3) || (today >= iatfStartDate && today <= iatfEndDate)) {
              hasNearbyEvent = true;
            }
          }
        });

        if (hasNearbyEvent) {
          totalNearbyEvents++;
        }
      }
    });
    setNearbyEventsCount(totalNearbyEvents);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-100 rounded-full">
              <Squircle size={24} className="text-teal-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total de animais</p>
              <h3 className="text-2xl font-bold">{animals.length}</h3>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total de protocolos</p>
              <h3 className="text-2xl font-bold">{protocols.length}</h3>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <CalendarDays size={24} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Próximos eventos</p>
              <h3 className="text-2xl font-bold">{nearbyEventsCount}</h3>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Bell size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Notificações habilitadas</p>
              <h3 className="text-2xl font-bold">{protocols.filter((p) => p.notifications).length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pizza */}
        <div className="card h-80">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Taxa de Sucesso de Prenhez</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pregnancySuccessRate}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label
              >
                {pregnancySuccessRate.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Barras */}
        <div className="card h-80">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Taxa de Prenhez por Protocolo</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pregnancyRateByProtocol}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="pregnancyRate" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;