import { 
  LayoutDashboard, 
  Package, 
  Heart, 
  Inbox, 
  List, 
  Archive,
  DollarSign,
  Calendar,
  CheckSquare,
  Users,
  FileText,
  BarChart3,
  UserCircle,
  Table,
  Settings,
  LogOut
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: Heart, label: 'Favorites', path: '/favorites' },
    { icon: Inbox, label: 'Inbox', path: '/inbox' },
    { icon: List, label: 'Order Lists', path: '/orders' },
    { icon: Archive, label: 'Product Stock', path: '/stock' },
  ];

  const pageItems = [
    { icon: DollarSign, label: 'Pricing', path: '/pricing' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: CheckSquare, label: 'To-Do', path: '/todo' },
    { icon: Users, label: 'Contact', path: '/contact' },
    { icon: FileText, label: 'Invoice', path: '/invoice' },
    { icon: BarChart3, label: 'UI Elements', path: '/ui-elements' },
    { icon: UserCircle, label: 'Team', path: '/team' },
    { icon: Table, label: 'Table', path: '/table' },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0 shadow-lg">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center border-b border-gray-200 flex-shrink-0 bg-white">
        <h1 className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Long</span>
          <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Châu</span>
        </h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-600 hover:bg-white hover:shadow-sm'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
                  )}
                  <item.icon size={20} className={`flex-shrink-0 ${isActive ? 'drop-shadow-sm' : 'group-hover:scale-110 transition-transform'}`} />
                  <span className="text-sm font-semibold relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Pages Section */}
        <div className="mt-8">
          <p className="text-xs font-bold text-gray-400 uppercase px-4 mb-3 tracking-wider flex items-center gap-2">
            <span className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent"></span>
            Pages
            <span className="h-px flex-1 bg-gradient-to-l from-gray-300 to-transparent"></span>
          </p>
          <div className="space-y-1.5">
            {pageItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'text-gray-600 hover:bg-white hover:shadow-sm'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
                    )}
                    <item.icon size={20} className={`flex-shrink-0 ${isActive ? 'drop-shadow-sm' : 'group-hover:scale-110 transition-transform'}`} />
                    <span className="text-sm font-semibold relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 bg-gradient-to-t from-gray-50 to-white space-y-2 flex-shrink-0">
        <button className="group flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-white hover:text-blue-600 rounded-xl transition-all duration-200 hover:shadow-sm">
          <Settings size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-sm font-semibold">Settings</span>
        </button>
        <button className="group flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 hover:shadow-sm">
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;