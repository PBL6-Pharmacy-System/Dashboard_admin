import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import Inbox from './pages/Inbox';
import OrderList from './pages/OrderList';
import ProductStock from './pages/ProductStock';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<AddProduct />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="stock" element={<ProductStock />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
