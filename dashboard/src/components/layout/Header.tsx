import { Bell, ChevronDown, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import type { User } from '../../services/authService';

const Header = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };

    loadUser();
  }, []);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-20 flex-shrink-0 shadow-sm">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between">
        {/* Left - Menu & Search */}
        <div className="flex items-center gap-4 flex-1">
          <button className="p-2.5 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 lg:hidden group">
            <Menu size={20} className="text-gray-600 group-hover:text-blue-600" />
          </button>

          {/* <div className="flex-1 max-w-lg">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors z-10" size={18} />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-11 pr-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 placeholder:text-gray-400"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all pointer-events-none"></div>
            </div>
          </div> */}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notification */}
          <button className="relative p-2.5 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 group">
            <Bell size={20} className="text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-full border-2 border-white animate-pulse"></span>
          </button>

          {/* Language Selector */}
          <button className="flex items-center gap-2 px-3 py-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 group">
            <img 
              src="https://flagcdn.com/w40/gb.png" 
              alt="English" 
              className="w-6 h-4 object-cover rounded shadow-sm"
            />
            <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 hidden sm:inline">English</span>
            <ChevronDown size={14} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-y-0.5 transition-all" />
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-3 pl-3 pr-2 py-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 ml-1 group border border-transparent hover:border-gray-200">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                {user?.full_name || user?.username || 'Loading...'}
              </p>
              <p className="text-xs font-medium text-gray-500">
                {user?.role_id === 1 ? 'Admin' : user?.role_id === 2 ? 'Employee' : 'Customer'}
              </p>
            </div>
            <div className="relative">
              <img
                src={user?.avatar || 'https://i.pravatar.cc/150?img=5'}
                alt={user?.full_name || 'User'}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <ChevronDown size={14} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-y-0.5 transition-all" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;