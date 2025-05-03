import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cat } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Veterinarian' | 'Technician' | 'Rural Producer'>('Veterinarian');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password || !role) {
      setError('Preencha todos os campos!');
      return;
    }
    
    const success = register({ name, email, password, role });
    if (success) {
      navigate('/');
    } else {
      setError('Email already in use');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-teal-50 p-3 rounded-full">
              <Cat size={32} className="text-teal-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">IATF Protocol Manager</h1>
          <p className="mt-2 text-gray-600">Crie sua conta! Relaxa. Isso não é armazenado em banco, é só pra testes.</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Nome completo</label>
              <input
                id="name"
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">E-mail</label>
              <input
                id="email"
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Senha</label>
              <input
                id="password"
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role" className="form-label">Cargo</label>
              <select
                id="role"
                className="input-field"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              >
                <option value="Veterinarian">Veterinário</option>
                <option value="Technician">Técnico</option>
                <option value="Rural Producer">Produtor rural</option>
              </select>
            </div>
            
            <button type="submit" className="w-full btn btn-primary mt-6">
              Register
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800">
                Entre
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
