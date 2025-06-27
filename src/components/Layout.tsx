import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {}
      <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />

      {}
      {}
      {}
      <div
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
      >
        {}
        <Header toggleSidebar={toggleSidebar} />
        
        {}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
