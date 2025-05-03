import { NavLink } from 'react-router-dom';
import { CalendarDays, Squircle, LayoutDashboard, ListChecks } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-teal-700 flex items-center gap-2">
          <Squircle className="text-teal-600" />
          IATF Manager
        </h2>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <NavLink 
          to="/" 
          className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
          end
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink 
          to="/animals" 
          className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Squircle size={20} />
          Cadastro de animais
        </NavLink>
        <NavLink 
          to="/protocols" 
          className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <ListChecks size={20} />
          IATF Protocols
        </NavLink>
        <NavLink 
          to="/monitoring" 
          className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <CalendarDays size={20} />
          Monitoramento
        </NavLink>
        
        {/* <NavLink 
          to="/probability" 
          className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <ChartBar size={20} />
          Reports & Analytics
        </NavLink> */}
        
      </nav>
      {/* <div className="p-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-blue-800 font-medium">Need help?</p>
          <p className="text-xs text-blue-600 mt-1">
            Check our documentation or contact support
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default Sidebar;
