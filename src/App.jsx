// src/App.jsx
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import AnimalRegistration from './pages/AnimalRegistration';
import ProtocolRegistration from './pages/ProtocolRegistration';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { AnimalProvider } from './context/AnimalContext';
import Monitoring from './pages/Monitoring';

function App() {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AnimalProvider>
              <Layout />
            </AnimalProvider>
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="animals" element={<AnimalRegistration />} />
          <Route path="protocols" element={<ProtocolRegistration />} />
          <Route path="Monitoring" element={<Monitoring />} />
   {/* //       <Route path="/probability" element={<ProbabilitySimulator />} /> */}

        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;