import { useState, useEffect, FormEvent } from 'react';
import { Calendar, Check, Plus, Search } from 'lucide-react';

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

const ProtocolRegistration = () => {
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

  useEffect(() => {
    fetchProtocols();
    fetchAnimals();
  }, []);
  
  const url = import.meta.env.VITE_ENDERECO_API;

  const fetchProtocols = async () => {
    try {
      const res = await fetch(`${url}/protocols`);
      const data = await res.json();
      console.log('o data ', data)
      setProtocols(data);
    } catch (err) {
      console.error('Erro ao buscar protocolos:', err);
    }
  };

  const fetchAnimals = async () => {
    try {
      const res = await fetch(`${url}/animals`);
      const data = await res.json();
      setAnimals(data);
    } catch (err) {
      console.error('Erro ao buscar animais:', err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      startDate,
      hormones,
      bull,
      animals: selectedAnimals,
      notifications,
    };
    console.log('o payload ', payload)
    try {
      if (isEditing) {
        await fetch(`${url}/protocols/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`${url}/protocols`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      await fetchProtocols();
      resetForm();
    } catch (err) {
      console.error('Erro ao salvar protocolo:', err);
    }
  };

  const handleEdit = (protocol: Protocol | undefined) => {
    console.log("Protocolo para edição:", protocol);

    if (protocol) {
      setName(protocol.name);
      const formattedDate = protocol.startDate ? protocol.startDate.substring(0, 10) : '';
      setStartDate(formattedDate);
      setHormones(protocol.hormones);
      setBull(protocol.bull);
      setSelectedAnimals(protocol.animals);
      setNotifications(protocol.notifications);
      setIsEditing(true);
      setEditingId(protocol.id);
      setShowForm(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${url}/protocols/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log(`Protocolo com ID ${id} deletado com sucesso.`);
        await fetchProtocols(); 
      } else {
        console.error(`Erro ao deletar protocolo com ID ${id}:`, response.status);
      }
    } catch (err) {
      console.error('Erro ao deletar protocolo:', err);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">IATF registro de protocolo</h1>
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          Novo protocolo
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Edit Protocol' : 'Register New Protocol'}
          </h2>
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
                <span className="ml-2 text-gray-700">Notificação ativas</span>
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
                Cancel
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

      <div className="card overflow-hidden">
        {filteredProtocols.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Protocol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hormones</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bull</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Animals</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notifications</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                          Enabled
                        </span>
                      ) : (
                        <span className="text-gray-500">Disabled</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(protocol)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(protocol.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
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
