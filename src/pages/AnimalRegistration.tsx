import { useState, useEffect, FormEvent } from 'react';
import { Plus, Search, X } from 'lucide-react';
import axios from 'axios';

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

  const fetchAnimals = async () => {
    const response = await axios.get(`${API_URL}/animals`);
    setAnimals(response.data);
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newAnimal = {
      tagNumber,
      name,
      breed,
      weight,
      age,
      reproductiveHistory,
      imageUrl: imageUrl || undefined,
    };

    if (isEditing) {
      await axios.put(`${API_URL}/animals/${editingId}`, newAnimal);
    } else {
      await axios.post(`${API_URL}/animals/`, newAnimal);
    }

    resetForm();
    fetchAnimals();
  };

  const handleEdit = (animal: Animal) => {
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
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchAnimals();
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {/* <Cow className="w-6 h-6" /> */}
          Cadastro de Animais
        </h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-5 h-5" />
          Novo Animal
        </button>
      </div>

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
              <button
                onClick={() => handleEdit(animal)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(animal.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
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
