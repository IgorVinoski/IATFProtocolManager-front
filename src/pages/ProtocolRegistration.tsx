import { useState, useEffect, FormEvent } from 'react';
import { Calendar, Check, Plus, Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type Animal = {
  id: string;
  tagNumber: string;
  name: string;
  breed: string;
};

type Protocol = {
  id: string;
  name: string;
  startDate: string;
  hormones: string;
  bull: string;
  animals: Animal[];
  notifications: boolean;
};

const API_URL = import.meta.env.VITE_ENDERECO_API;

const ProtocolRegistration = () => {
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [hormones, setHormones] = useState('');
  const [bull, setBull] = useState('');
  const [selectedAnimals, setSelectedAnimals] = useState<Animal[]>([]);
  const [notifications, setNotifications] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
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
    err => {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.error("Erro de autenticação/autorização em ProtocolRegistration:", err.response.data.message);
        setError("Sua sessão expirou ou você não tem permissão. Por favor, faça login novamente.");
        logout();
        navigate('/login');
      }
      return Promise.reject(err);
    }
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate('/login');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchProtocols(), fetchAnimals()]);
      } catch (err: any) {
        console.error('Erro ao buscar dados iniciais:', err);
        if (err.response && err.response.data && err.response.data.message) {
          setError(`Falha ao carregar dados: ${err.response.data.message}`);
        } else {
          setError("Não foi possível carregar os dados de protocolos e animais. Tente novamente mais tarde.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, navigate]);

  const fetchProtocols = async () => {
    try {
      const res = await axiosInstance.get<Protocol[]>('/protocols');
      setProtocols(res.data);
    } catch (err: any) {
      console.error('Erro ao buscar protocolos:', err.response?.data || err.message);
      throw err;
    }
  };

  const fetchAnimals = async () => {
    try {
      const res = await axiosInstance.get<Animal[]>('/animals');
      setAnimals(res.data);
    } catch (err: any) {
      console.error('Erro ao buscar animais:', err.response?.data || err.message);
      throw err;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (user?.role !== 'Veterinário' && user?.role !== 'Técnico') {
        setError('Você não tem permissão para criar ou editar protocolos.');
        return;
    }

    if (!name || !startDate || !hormones || !bull || selectedAnimals.length === 0) {
      setError("Por favor, preencha todos os campos obrigatórios e selecione ao menos um animal.");
      return;
    }

    const payload = {
      name,
      startDate,
      hormones,
      bull,
      animals: selectedAnimals.map(animal => animal.id),
      notifications,
    };

    try {
      if (isEditing) {
        await axiosInstance.put(`/protocols/${editingId}`, payload);
      } else {
        await axiosInstance.post('/protocols', payload);
      }

      await fetchProtocols();
      resetForm();
    } catch (err: any) {
      console.error('Erro ao salvar protocolo:', err.response?.data || err.message);
      setError(`Falha ao salvar protocolo: ${err.response?.data?.message || 'Erro desconhecido.'}`);
    }
  };

  const handleEdit = (protocol: Protocol) => {
    if (user?.role !== 'Veterinário' && user?.role !== 'Técnico') {
        setError('Você não tem permissão para editar protocolos.');
        return;
    }
    setName(protocol.name);
    const formattedDate = protocol.startDate ? new Date(protocol.startDate).toISOString().substring(0, 10) : '';
    setStartDate(formattedDate);
    setHormones(protocol.hormones);
    setBull(protocol.bull);
    const animalsInProtocol = protocol.animals.map(protAnimal =>
      animals.find(fullAnimal => fullAnimal.id === protAnimal.id)
    ).filter(Boolean) as Animal[];

    setSelectedAnimals(animalsInProtocol);
    setNotifications(protocol.notifications);
    setIsEditing(true);
    setEditingId(protocol.id);
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (user?.role !== 'Veterinário') {
        setError('Você não tem permissão para excluir protocolos.');
        return;
    }

    if (!window.confirm("Você tem certeza que deseja deletar este protocolo? Esta ação é irreversível.")) {
      return;
    }
    setError(null);
    try {
      await axiosInstance.delete(`/protocols/${id}`);
      console.log(`Protocolo com ID ${id} deletado com sucesso.`);
      await fetchProtocols();
    } catch (err: any) {
      console.error('Erro ao deletar protocolo:', err.response?.data || err.message);
      setError(`Falha ao deletar protocolo: ${err.response?.data?.message || 'Erro desconhecido.'}`);
    }
  };

  const resetForm = () => {
    setName('');
    setStartDate('');
    setHormones('');
    setBull('');
    setSelectedAnimals([]);
    setNotifications(true);
    setIsEditing(false);
    setEditingId('');
    setShowForm(false);
    setError(null);
  };

  const toggleAnimalSelection = (animalId: string) => {
    const animal = animals.find(a => a.id === animalId);
    if (!animal) return;

    setSelectedAnimals((prev) => {
      const alreadySelected = prev.some(a => a.id === animalId);
      if (alreadySelected) {
        return prev.filter((a) => a.id !== animalId);
      } else {
        return [...prev, animal];
      }
    });
  };

  const filteredProtocols = protocols.filter((protocol) =>
    (protocol.name && typeof protocol.name === 'string' && protocol.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (protocol.bull && typeof protocol.bull === 'string' && protocol.bull.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const canCreateEdit = user?.role === 'Veterinário' || user?.role === 'Técnico';
  const canDelete = user?.role === 'Veterinário';

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Carregando dados de protocolos...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Registro de Protocolo IATF</h1>
        {canCreateEdit && (
          <button
            className="btn btn-primary flex items-center gap-2" 
            onClick={() => { setShowForm(true); setError(null); }}
          >
            <Plus size={18} />
            Novo protocolo
          </button>
        )}
      </div>

      {error && !showForm && ( 
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm flex justify-between items-center">
          <span>{error}</span>
          {}
          <button onClick={() => setError(null)} className="ml-4 text-red-700 hover:text-red-900 font-medium">
             Fechar
          </button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
            {}
            <button
              onClick={resetForm}
              className="absolute top-2 right-4 text-gray-500 hover:text-gray-700" 
            >
              Cancelar
            </button>
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'Editar protocolo' : 'Registrar um novo protocolo'}
            </h2>
            {error && showForm && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Nome do protocolo</label>
                  <input
                    type="text"
                    className="input-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Data de início</label>
                  <input
                    type="date"
                    className="input-field"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Hormônios</label>
                  <input
                    type="text"
                    className="input-field"
                    value={hormones}
                    onChange={(e) => setHormones(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Touro</label>
                  <input
                    type="text"
                    className="input-field"
                    value={bull}
                    onChange={(e) => setBull(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="form-label">Selecione animais.</label>
                <div className="mt-2 border border-gray-300 rounded-md max-h-60 overflow-y-auto">
                  {animals.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Sem animais cadastrados. Cadastre-os primeiro.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {animals.map((animal) => (
                        <div
                          key={animal.id}
                          className="flex items-center py-2 px-4 hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleAnimalSelection(animal.id)}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-teal-600 rounded"
                            checked={selectedAnimals.some(a => a.id === animal.id)}
                            onChange={() => {}}
                          />
                          <div className="ml-3">
                            <span className="font-medium text-gray-900">{animal.name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({animal.breed}, Tag: {animal.tagNumber})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {selectedAnimals.length} animais selecionados.
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 rounded"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                  <span className="ml-2 text-gray-700">Notificações ativas</span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Atualizar protocolo' : 'Salvar protocolo'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Procurar protocolos..."
          className="pl-10 pr-4 py-2 border rounded w-full"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="card bg-white rounded-lg shadow-md overflow-hidden">
        {filteredProtocols.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Protocolo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data de início</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hormônio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Touro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Animal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notificação</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ação</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProtocols.map((protocol) => (
                  <tr key={protocol.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{protocol.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(protocol.startDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{protocol.hormones}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{protocol.bull}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {protocol.animals.length} animais
                      <span className="text-xs text-gray-400 ml-1">
                        ({protocol.animals.slice(0, 2).map(a => a.name).join(', ')}
                        {protocol.animals.length > 2 ? '...' : ''})
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {protocol.notifications ? (
                        <span className="flex items-center text-teal-700">
                          <Check size={14} className="mr-1" />
                          Habilitada
                        </span>
                      ) : (
                        <span className="text-gray-500">Desabilitada</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(protocol)}
                        className={`text-blue-600 hover:text-blue-900 mr-3 ${
                          !canCreateEdit ? 'text-gray-400 cursor-not-allowed' : '' 
                        }`}
                        disabled={!canCreateEdit}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(protocol.id)}
                        className={`text-red-600 hover:text-red-900 ${
                          !canDelete ? 'text-gray-400 cursor-not-allowed' : '' 
                        }`}
                        disabled={!canDelete}
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Sem protocolos cadastrados. Cadastre-os.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtocolRegistration;