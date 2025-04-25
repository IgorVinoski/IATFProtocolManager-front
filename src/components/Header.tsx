import { Bell, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import moment from 'moment';

const Header = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  const url = import.meta.env.VITE_ENDERECO_API;

  useEffect(() => {
    fetchProtocolsAndCheckNotifications();
  }, []);

  const fetchProtocolsAndCheckNotifications = async () => {
    try {
      const res = await fetch(`${url}/protocols`);
      const data = await res.json();
      checkUpcomingDates(data);
    } catch (err) {
      console.error('Erro ao buscar protocolos para notificações:', err);
    }
  };

  const checkUpcomingDates = (protocols: any[]) => {
    const today = moment();
    let upcoming = false;

    protocols.forEach((protocol) => {
      if (protocol.startDate) {
        const startDate = moment(protocol.startDate);
        const day0 = startDate;
        const day7or8 = startDate.clone().add(7, 'days');
        const day9or10 = startDate.clone().add(9, 'days');
        const day10or11 = startDate.clone().add(10, 'days');

        const daysUntil0 = day0.diff(today, 'days');
        const daysUntil7or8 = day7or8.diff(today, 'days');
        const daysUntil9or10 = day9or10.diff(today, 'days');
        const daysUntil10or11 = day10or11.diff(today, 'days');

        if (daysUntil0 >= 0 && daysUntil0 <= 3) upcoming = true;
        if (daysUntil7or8 >= 0 && daysUntil7or8 <= 3) upcoming = true;
        if (daysUntil9or10 >= 0 && daysUntil9or10 <= 3) upcoming = true;
        if (daysUntil10or11 >= 0 && daysUntil10or11 <= 3) upcoming = true;
      }
    });

    setHasNotifications(upcoming);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-teal-700">IATF Protocol Manager</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100" aria-label="Notifications">
            <Bell size={20} className="text-gray-600" />
            {hasNotifications && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                !
              </span>
            )}
          </button>
          <div className="relative">
            <button
              className="flex items-center gap-2"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <UserRound size={28} className="text-gray-600" />
              <span className="font-medium">{user?.name}</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="p-3 border-b border-gray-200">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-gray-600">{user?.role}</p>
                </div>
                <div className="p-2">
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                    onClick={logout}
                  >
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;