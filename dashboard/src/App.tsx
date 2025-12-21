import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import ProductDetail from './pages/ProductDetail';
// import Inbox from './pages/Inbox';
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
import CreateStockTransfer from './pages/CreateStockTransfer';
import Branches from './pages/Branches';
import BranchDetail from './pages/BranchDetail';
import Batches from './pages/Batches';
import BatchDetail from './pages/BatchDetail';
import SupplierOrders from './pages/SupplierOrders';
import CreateSupplierOrder from './pages/CreateSupplierOrder';
import SupplierOrderDetail from './pages/SupplierOrderDetail';
import StockTakes from './pages/StockTakes';
import CreateStockTake from './pages/CreateStockTake';
import StockTakeDetail from './pages/StockTakeDetail';
import InventoryReports from './pages/InventoryReports';
import FlashSale from './pages/FlashSale';
import Shipments from './pages/Shipments';
import Toast from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import ChatBox from './components/ChatBox';
import { useToast } from './hooks/useToast';
import { DashboardProvider } from './contexts/DashboardContext';
import { useEffect, useState } from 'react';

// Protected Route Component - DISABLED FOR DEVELOPMENT (no login required)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = authService.isAuthenticated();
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
  
  return <>{children}</>;
};

// Admin Only Route Component - DISABLED FOR DEVELOPMENT
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

// Public Route Component (redirect to dashboard if already logged in) - DISABLED FOR DEVELOPMENT
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
        
        {/* Root redirects to dashboard - CHANGED FOR DEVELOPMENT */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardProvider><Layout /></DashboardProvider></ProtectedRoute>}>
          <Route index element={<AdminOnlyRoute><Dashboard /></AdminOnlyRoute>} />
          <Route path="products" element={<ErrorBoundary><Products /></ErrorBoundary>} />
          <Route path="products/add" element={<ErrorBoundary><AddProduct /></ErrorBoundary>} />
          <Route path="products/edit/:id" element={<ErrorBoundary><AddProduct /></ErrorBoundary>} />
          <Route path="products/detail/:id" element={<ErrorBoundary><ProductDetail /></ErrorBoundary>} />
          {/* <Route path="inbox" element={<ErrorBoundary><Inbox /></ErrorBoundary>} /> */}
          <Route path="orders" element={<ErrorBoundary><OrderList /></ErrorBoundary>} />
          <Route path="stock" element={<ErrorBoundary><ProductStock /></ErrorBoundary>} />
          <Route path="stock-slips" element={<ErrorBoundary><StockSlips /></ErrorBoundary>} />
          <Route path="staff" element={<AdminOnlyRoute><ErrorBoundary><StaffAccounts /></ErrorBoundary></AdminOnlyRoute>} />
          <Route path="customers" element={<AdminOnlyRoute><ErrorBoundary><Customers /></ErrorBoundary></AdminOnlyRoute>} />
          <Route path="stock-transfer" element={<ErrorBoundary><StockTransfer /></ErrorBoundary>} />
          <Route path="stock-transfer/create" element={<ErrorBoundary><CreateStockTransfer /></ErrorBoundary>} />
          <Route path="branches" element={<ErrorBoundary><Branches /></ErrorBoundary>} />
          <Route path="branches/:id" element={<ErrorBoundary><BranchDetail /></ErrorBoundary>} />
          <Route path="batches" element={<ErrorBoundary><Batches /></ErrorBoundary>} />
          <Route path="batches/:id" element={<ErrorBoundary><BatchDetail /></ErrorBoundary>} />
          <Route path="supplier-orders" element={<ErrorBoundary><SupplierOrders /></ErrorBoundary>} />
          <Route path="supplier-orders/create" element={<ErrorBoundary><CreateSupplierOrder /></ErrorBoundary>} />
          <Route path="supplier-orders/:id" element={<ErrorBoundary><SupplierOrderDetail /></ErrorBoundary>} />
          <Route path="stock-takes" element={<ErrorBoundary><StockTakes /></ErrorBoundary>} />
          <Route path="stock-takes/create" element={<ErrorBoundary><CreateStockTake /></ErrorBoundary>} />
          <Route path="stock-takes/:id" element={<ErrorBoundary><StockTakeDetail /></ErrorBoundary>} />
          <Route path="inventory-reports" element={<ErrorBoundary><InventoryReports /></ErrorBoundary>} />
          <Route path="flash-sale" element={<ErrorBoundary><FlashSale /></ErrorBoundary>} />
          <Route path="shipments" element={<ErrorBoundary><Shipments /></ErrorBoundary>} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Global ChatBox - Only show when authenticated */}
      {authService.isAuthenticated() && <ChatBox userRole="admin" userName="Admin" />}
    </BrowserRouter>
  );
}

export default App;
