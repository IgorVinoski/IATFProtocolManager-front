import { NavLink } from 'react-router-dom';
import { CalendarDays, Squircle, LayoutDashboard, ListChecks, X, UserRound } from 'lucide-react';

interface SidebarProps {
  isSidebarOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, closeSidebar }) => {

  return (
    <>
      {}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {}
      <div
        className={`
          w-64 bg-white border-r border-gray-200 flex flex-col
          lg:static lg:block /* Em telas grandes, é estático e visível */
          lg:translate-x-0 lg:shadow-none lg:z-auto /* Remove transformações e z-index extras em desktop */
          fixed inset-y-0 left-0 z-50 shadow-xl transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} /* Controla o deslizamento em mobile */
        `}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-teal-700 flex items-center gap-2">
            <Squircle className="text-teal-600" />
            IATF Manager
          </h2>
          {}
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1 rounded-md text-gray-600 hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            end
            onClick={closeSidebar}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink
            to="/animals"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <Squircle size={20} />
            Cadastro de animais
          </NavLink>
          <NavLink
            to="/protocols"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <ListChecks size={20} />
            IATF Protocols
          </NavLink>
          <NavLink
            to="/monitoring"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <CalendarDays size={20} />
            Monitoramento
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <UserRound size={20} />
            Meu Perfil
          </NavLink>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
