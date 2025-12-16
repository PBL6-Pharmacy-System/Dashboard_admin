import { 
  LayoutDashboard, 
  Package, 
  // Inbox, 
  ShoppingCart, 
  Users,
  Settings,
  LogOut,
  Warehouse,
  ClipboardList,
  TruckIcon,
  MapPin,
  PackageSearch,
  FileText,
  BarChart3,
  ShoppingBag,
  UserCog,
  Zap
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useState, useEffect } from 'react';

const Sidebar = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setUserRole(user.role_name);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      await authService.logout();
      navigate('/login');
    }
  };

  const allMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', adminOnly: true },
    { icon: Package, label: 'Products', path: '/dashboard/products', adminOnly: false },
    // { icon: Inbox, label: 'Inbox', path: '/dashboard/inbox', adminOnly: false },
    { icon: ShoppingCart, label: 'Order Lists', path: '/dashboard/orders', adminOnly: false },
    { icon: Zap, label: 'Flash Sales', path: '/dashboard/flash-sale', adminOnly: false },
    { icon: Warehouse, label: 'Product Stock', path: '/dashboard/stock', adminOnly: false },
    { icon: ClipboardList, label: 'Stock Slips', path: '/dashboard/stock-slips', adminOnly: false },
    { icon: MapPin, label: 'Branches', path: '/dashboard/branches', adminOnly: false },
    { icon: PackageSearch, label: 'Batches', path: '/dashboard/batches', adminOnly: false },
    { icon: ShoppingBag, label: 'Supplier Orders', path: '/dashboard/supplier-orders', adminOnly: false },
    { icon: FileText, label: 'Stock Takes', path: '/dashboard/stock-takes', adminOnly: false },
    { icon: TruckIcon, label: 'Stock Transfer', path: '/dashboard/stock-transfer', adminOnly: false },
    { icon: BarChart3, label: 'Inventory Reports', path: '/dashboard/inventory-reports', adminOnly: false },
    { icon: UserCog, label: 'Staff Accounts', path: '/dashboard/staff', adminOnly: true },
    { icon: Users, label: 'Customers', path: '/dashboard/customers', adminOnly: true },
  ];

  // Filter menu items based on role
  const menuItems = allMenuItems.filter(item => {
    // Check if user is admin (case-insensitive)
    const isAdmin = userRole?.toLowerCase() === 'admin';
    
    if (isAdmin) {
      return true; // Admin sees all tabs
    }
    return !item.adminOnly; // Staff doesn't see Dashboard and Staff Accounts
  });


  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center border-b border-gray-200 flex-shrink-0">
        <h1 className="text-2xl font-bold">
          <span className="text-blue-600">Long</span>
          <span className="text-gray-800">Châu</span>
        </h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <button className="flex items-center gap-3 px-4 py-2.5 w-full text-gray-600 rounded-lg hover:bg-gray-100">
          <Settings size={20} />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;