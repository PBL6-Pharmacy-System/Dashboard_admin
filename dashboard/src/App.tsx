import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import ProductDetail from './pages/ProductDetail';
import Inbox from './pages/Inbox';
import OrderList from './pages/OrderList';
import ProductStock from './pages/ProductStock';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import { authService } from './services/authService';
import Dashboard from './pages/Dashboard';
import StaffAccounts from './pages/StaffAccounts';
import Customers from './pages/Customers';
import StockSlips from './pages/StockSlips';
import StockTransfer from './pages/StockTransfer';
import Toast from './components/common/Toast';
import { useToast } from './hooks/useToast';
import { DashboardProvider } from './contexts/DashboardContext';
import { useEffect, useState } from 'react';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin Only Route Component
const AdminOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkRole = async () => {
      const user = await authService.getCurrentUser();
      
      if (user) {
        setUserRole(user.role_name);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    };
    checkRole();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  const isAdmin = userRole?.toLowerCase() === 'admin';
  
  if (!isAdmin) {
    return <Navigate to="/dashboard/products" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { toast, hideToast } = useToast();

  return (
    <BrowserRouter>
      {/* Global Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          description={toast.description}
          onClose={hideToast}
        />
      )}
      
      <Routes>
        {/* Auth Routes - Redirect to dashboard if already logged in */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        
        {/* Root redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardProvider><Layout /></DashboardProvider></ProtectedRoute>}>
          <Route index element={<AdminOnlyRoute><Dashboard /></AdminOnlyRoute>} />
          <Route path="products" element={<Products />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<AddProduct />} />
          <Route path="products/detail/:id" element={<ProductDetail />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="stock" element={<ProductStock />} />
          <Route path="stock-slips" element={<StockSlips />} />
          <Route path="staff" element={<AdminOnlyRoute><StaffAccounts /></AdminOnlyRoute>} />
          <Route path="customers" element={<Customers />} />
          <Route path="stock-transfer" element={<StockTransfer />} />

        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
