import { useState, useEffect, FormEvent } from 'react';
import { Plus, Search, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Importe o hook de autenticação
import { useNavigate } from 'react-router-dom'; // Para redirecionar em caso de erro de autenticação

type Animal = {
  id: string;
  tagNumber: string;
  name: string;
  breed: string;
  weight: string;
  age: string;
  reproductiveHistory: string;
  imageUrl?: string;
};

const API_URL = import.meta.env.VITE_ENDERECO_API;

const AnimalRegistration = () => {
  const { token, logout, user } = useAuth(); // Obtenha o token, função de logout e dados do usuário
  const navigate = useNavigate(); // Hook para navegação

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [tagNumber, setTagNumber] = useState('');
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [reproductiveHistory, setReproductiveHistory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState<string | null>(null); // Novo estado para erros

  // Configura uma instância do Axios com o token de autorização
  // Isso evita repetir o header 'Authorization' em cada requisição
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Adiciona o token aqui!
    },
  });

  // Interceptor para lidar com erros de autenticação
  axiosInstance.interceptors.response.use(
    response => response,
    error => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.error("Erro de autenticação/autorização:", error.response.data.message);
        setError("Sua sessão expirou ou você não tem permissão. Por favor, faça login novamente.");
        logout(); // Limpa a sessão no frontend
        navigate('/login'); // Redireciona para a página de login
      }
      return Promise.reject(error);
    }
  );

  const fetchAnimals = async () => {
    try {
      const response = await axiosInstance.get('/animals'); // Usa a instância configurada
      setAnimals(response.data);
      setError(null); // Limpa erros anteriores
    } catch (err) {
      console.error('Erro ao buscar animais:', err);
      // O interceptor já trata 401/403, outros erros podem ser tratados aqui se necessário
    }
  };

  useEffect(() => {
    // Só tenta buscar animais se houver um token
    if (token) {
      fetchAnimals();
    } else {
      // Se não houver token, o ProtectedRoute já deveria ter redirecionado para o login.
      // Ou, se a página for acessada diretamente, o fetch falharia e o interceptor agiria.
      console.warn("Nenhum token encontrado, não é possível buscar animais.");
    }
  }, [token]); // Dependência do token para re-fetch se o token mudar

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); // Limpa erros antes de uma nova tentativa

    const animalData = {
      tagNumber,
      name,
      breed,
      weight,
      age,
      reproductiveHistory,
      imageUrl: imageUrl || undefined,
    };

    try {
      if (isEditing) {
        await axiosInstance.put(`/animals/${editingId}`, animalData); // Usa a instância configurada
      } else {
        await axiosInstance.post('/animals/', animalData); // Usa a instância configurada
      }
      resetForm();
      fetchAnimals(); // Atualiza a lista após sucesso
    } catch (err: any) {
      console.error('Erro ao salvar animal:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Erro ao salvar: ${err.response.data.message}`);
      } else {
        setError('Ocorreu um erro ao salvar o animal.');
      }
    }
  };

  const handleEdit = (animal: Animal) => {
    // Verifica a permissão antes de permitir a edição
    if (user?.role !== 'Veterinário' && user?.role !== 'Técnico') {
        setError('Você não tem permissão para editar animais.');
        return;
    }
    setTagNumber(animal.tagNumber);
    setName(animal.name);
    setBreed(animal.breed);
    setWeight(animal.weight);
    setAge(animal.age);
    setReproductiveHistory(animal.reproductiveHistory);
    setImageUrl(animal.imageUrl || '');
    setIsEditing(true);
    setEditingId(animal.id);
    setShowForm(true);
    setError(null); // Limpa erros ao abrir o formulário para edição
  };

  const handleDelete = async (id: string) => {
    // Verifica a permissão antes de permitir a exclusão
    if (user?.role !== 'Veterinário') {
        setError('Você não tem permissão para excluir animais.');
        return;
    }
    try {
      await axiosInstance.delete(`/animals/${id}`); // Usa a instância configurada
      fetchAnimals(); // Atualiza a lista após sucesso
      setError(null);
    } catch (err: any) {
      console.error('Erro ao excluir animal:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Erro ao excluir: ${err.response.data.message}`);
      } else {
        setError('Ocorreu um erro ao excluir o animal.');
      }
    }
  };

  const resetForm = () => {
    setTagNumber('');
    setName('');
    setBreed('');
    setWeight('');
    setAge('');
    setReproductiveHistory('');
    setImageUrl('');
    setIsEditing(false);
    setEditingId('');
    setShowForm(false);
    setError(null); // Limpa erros ao fechar o formulário
  };

  const filteredAnimals = animals.filter(animal => {
    if (!animal) {
      return false;
    }
    return (
      (animal.name && typeof animal.name === 'string' && animal.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (animal.tagNumber && typeof animal.tagNumber === 'string' && animal.tagNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (animal.breed && typeof animal.breed === 'string' && animal.breed.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const canCreateEdit = user?.role === 'Veterinário' || user?.role === 'Técnico';
  const canDelete = user?.role === 'Veterinário';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Cadastro de Animais
        </h2>
        {/* Botão de Novo Animal visível apenas para Veterinários e Técnicos */}
        {canCreateEdit && (
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            onClick={() => { setShowForm(true); setError(null); }} // Limpa erros ao abrir o formulário
          >
            <Plus className="w-5 h-5" />
            Novo Animal
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, número ou raça..."
          className="pl-10 pr-4 py-2 border rounded w-full"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAnimals.length === 0 && !error && (
          <p className="col-span-full text-center text-gray-600">Nenhum animal encontrado.</p>
        )}
        {filteredAnimals.map(animal => (
          <div
            key={animal.id}
            className="border rounded-lg p-4 shadow hover:shadow-md transition"
          >
            {animal.imageUrl && (
              <img
                src={animal.imageUrl}
                alt={animal.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
            )}
            <h3 className="text-xl font-semibold">{animal.name}</h3>
            <p className="text-sm text-gray-600">
              Número: {animal.tagNumber} | Raça: {animal.breed}
            </p>
            <p className="text-sm text-gray-600">
              Peso: {animal.weight} kg | Idade: {animal.age} anos
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Histórico Reprodutivo: {animal.reproductiveHistory}
            </p>
            <div className="flex gap-2">
              {/* Botão de Editar visível e clicável apenas para Veterinários e Técnicos */}
              <button
                onClick={() => handleEdit(animal)}
                className={`px-3 py-1 rounded text-sm ${
                  canCreateEdit ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!canCreateEdit}
              >
                Editar
              </button>
              {/* Botão de Excluir visível e clicável apenas para Veterinários */}
              <button
                onClick={() => handleDelete(animal.id)}
                className={`px-3 py-1 rounded text-sm ${
                  canDelete ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!canDelete}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
            <button
              onClick={resetForm}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'Editar Animal' : 'Novo Animal'}
            </h2>
            {/* Mensagem de erro específica para o formulário */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Número de identificação"
                className="w-full border p-2 rounded"
                value={tagNumber}
                onChange={e => setTagNumber(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Nome"
                className="w-full border p-2 rounded"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Raça"
                className="w-full border p-2 rounded"
                value={breed}
                onChange={e => setBreed(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Peso"
                className="w-full border p-2 rounded"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Idade"
                className="w-full border p-2 rounded"
                value={age}
                onChange={e => setAge(e.target.value)}
                required
              />
              <textarea
                placeholder="Histórico Reprodutivo"
                className="w-full border p-2 rounded"
                value={reproductiveHistory}
                onChange={e => setReproductiveHistory(e.target.value)}
              />
              <input
                type="text"
                placeholder="URL da imagem (opcional)"
                className="w-full border p-2 rounded"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
              />
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                {isEditing ? 'Salvar Alterações' : 'Cadastrar Animal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimalRegistration;