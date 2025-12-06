import { ChevronDown, Menu } from 'lucide-react';
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
                src={user?.avatar || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxITERUTEhMTFRUWEhYWExgYGBcaFxkXFRUXFhkYGBUYHSggGBolHRcYITEhJSkrLi8uGB8zODMsNygtLisBCgoKDg0OGxAQGy4lHyYvLS8tLS0tLTAtLS0tLS8vLSsrLS0tLS0tLS0tNS0tLS0tLy0tLS0vLS0tLS0tLS0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABQYDBAcBAgj/xABFEAACAgECAwUEBgUKBQUAAAABAgADEQQhBRIxBhNBUWEicYGRBxQyQlKhM2KSscEjQ1NygqKy0fDxJERzs8IVFnSDk//EABoBAQADAQEBAAAAAAAAAAAAAAABAwQCBQb/xAAqEQEAAgIBAwMDBAMBAAAAAAAAAQIDEQQSITETQVEiMpFhoeHwM1KxFP/aAAwDAQACEQMRAD8A7jERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAhONdqdPpn7t+dn5QxWteYqp2DN5DaZ9J2g01tDaiu1WrUEufFceBU7g+kgu0nBNSNSdVpQtnOgW6pjyk8vRkbpnw3/PO1M47w/UWOjfVLqTZbXTYGdQloL8wVsHzGeb5zPbJetta7La0idf39k7rO12uCHVha66Qy8tLD22rLAZZvBjnO3T18eiocgHzGZzu7h7I9dnECrHmzptJQCzM64wScjmxnf7u/XwlhXifEnHMmiqrHgLb/AGviEQgfOTim0feWjce39/6skSurrOJMeT6tRWfG02l0A9K1AYt8h6zPpTr63At7i+sqctWrVujAEj2GZgynYbHIlvU46U3MWr1KVo1ljBUUFmY9ABIfh/GLmKi6g1hdMLdQ5yFVyM92gwecgAk+W3jI3i+uo192m0tdiWVF2u1AU59mkKURh5F3XY/hibdkxXuzabiuv1Xt6amqmk7o2o5i7jwYVp9ke/3zc4Hxe5rn02qrRLkQWK1ZJrsrJ5cjm3BB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'}
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