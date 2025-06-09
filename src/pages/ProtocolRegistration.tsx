import { useState, useEffect, FormEvent } from 'react';
import { Calendar, Check, Plus, Search } from 'lucide-react';
import axios from 'axios'; // Import axios
import { useAuth } from '../context/AuthContext'; // Import the AuthContext hook
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

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

const API_URL = import.meta.env.VITE_ENDERECO_API; // Get the API base URL

const ProtocolRegistration = () => {
  const { token, logout } = useAuth(); // Get token and logout from AuthContext
  const navigate = useNavigate(); // Hook for navigation

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
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  // Create an Axios instance with authorization header
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '', // Attach token if available
    },
  });

  // Add an interceptor to handle authentication errors
  axiosInstance.interceptors.response.use(
    response => response,
    err => {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.error("Authentication/Authorization error in ProtocolRegistration:", err.response.data.message);
        setError("Sua sessão expirou ou você não tem permissão para acessar este conteúdo. Por favor, faça login novamente.");
        logout(); // Clear frontend session
        navigate('/login'); // Redirect to login page
      }
      return Promise.reject(err);
    }
  );

  useEffect(() => {
    // Fetch protocols and animals on component mount
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
        console.error('Error fetching initial data:', err);
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
  }, [token, navigate]); // Depend on token and navigate

  const fetchProtocols = async () => {
    try {
      // Use axiosInstance for authenticated request
      const res = await axiosInstance.get<Protocol[]>('/protocols');
      setProtocols(res.data);
    } catch (err: any ) {
      console.error('Erro ao buscar protocolos:', err.response?.data || err.message);
      // Error handled by interceptor or generic error state
      throw err; // Re-throw to be caught by the parent fetchData
    }
  };

  const fetchAnimals = async () => {
    try {
      // Use axiosInstance for authenticated request
      const res = await axiosInstance.get<Animal[]>('/animals');
      setAnimals(res.data);
    } catch (err: any) {
      console.error('Erro ao buscar animais:', err.response?.data || err.message);
      // Error handled by interceptor or generic error state
      throw err; // Re-throw to be caught by the parent fetchData
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Simple validation for required fields
    if (!name || !startDate || !hormones || !bull || selectedAnimals.length === 0) {
      setError("Por favor, preencha todos os campos obrigatórios e selecione ao menos um animal.");
      return;
    }

    const payload = {
      name,
      startDate,
      hormones,
      bull,
      animals: selectedAnimals.map(animal => animal.id), // Send only animal IDs to backend
      notifications,
    };

    try {
      if (isEditing) {
        await axiosInstance.put(`/protocols/${editingId}`, payload);
      } else {
        await axiosInstance.post('/protocols', payload);
      }

      await fetchProtocols(); // Refetch protocols to update the list
      resetForm(); // Reset form fields
    } catch (err: any) {
      console.error('Erro ao salvar protocolo:', err.response?.data || err.message);
      setError(`Falha ao salvar protocolo: ${err.response?.data?.message || 'Erro desconhecido.'}`);
    }
  };

  const handleEdit = (protocol: Protocol | undefined) => {
    if (protocol) {
      setName(protocol.name);
      // Format date to YYYY-MM-DD for input type="date"
      const formattedDate = protocol.startDate ? new Date(protocol.startDate).toISOString().substring(0, 10) : '';
      setStartDate(formattedDate);
      setHormones(protocol.hormones);
      setBull(protocol.bull);
      setSelectedAnimals(protocol.animals);
      setNotifications(protocol.notifications);
      setIsEditing(true);
      setEditingId(protocol.id);
      setShowForm(true);
      setError(null); // Clear any previous errors when opening for edit
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Você tem certeza que deseja deletar este protocolo? Esta ação é irreversível.")) {
      return;
    }
    setError(null); // Clear previous errors
    try {
      await axiosInstance.delete(`/protocols/${id}`);
      console.log(`Protocolo com ID ${id} deletado com sucesso.`);
      await fetchProtocols(); // Refetch protocols after deletion
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
    setError(null); // Clear errors on form reset
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

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Carregando dados de protocolos...</div>;
  }

  if (error && !showForm) { // Only show global error if form is not open
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Registro de Protocolo IATF</h1>
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) { // If opening the form, reset it
              resetForm();
            }
          }}
        >
          <Plus size={18} />
          Novo protocolo
        </button>
      </div>

      {showForm && (
        <div className="card bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Editar protocolo' : 'Registrar um novo protocolo'}
          </h2>
          {error && showForm && ( // Show error specifically for the form
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
                          onChange={() => {}} // Empty onChange to allow click on div to toggle
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
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(protocol.id)}
                        className="text-red-600 hover:text-red-900"
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