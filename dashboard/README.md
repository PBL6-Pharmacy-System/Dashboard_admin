# 🏥 Pharmacy Admin Dashboard

Admin Dashboard cho hệ thống quản lý nhà thuốc. Built with React + TypeScript + Vite.

## ✨ Features

### 📦 Product Management
- ✅ View all products with grid/list view
- ✅ Filter products by categories/subcategories
- ✅ Search products by name
- ✅ **Add new products** (Full implementation)
- ⏳ Edit products (TODO)
- ⏳ Delete products (TODO)

### 🎯 Add Product Features
- ✅ 7-section form with full product information
- ✅ Image upload & preview
- ✅ Dynamic FAQ management
- ✅ Dynamic Product Units
- ✅ API integration with loading/success/error states
- ✅ Toast notifications
- ✅ Form validation
- ✅ Auto redirect after success

### 📊 Dashboard (Existing)
- Sales statistics
- Recent orders
- Top products
- Revenue charts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:3000/api`

### Installation

```bash
# Clone repository
git clone <repo-url>

# Navigate to dashboard
cd admin_dashboard/dashboard

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL

# Start dev server
npm run dev
```

### Access Application
- **Dev URL**: `http://localhost:5173`
- **Products**: `http://localhost:5173/products`
- **Add Product**: `http://localhost:5173/products/add`

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Quick guide để bắt đầu
- **[ADD_PRODUCT_GUIDE.md](./ADD_PRODUCT_GUIDE.md)** - Hướng dẫn chi tiết chức năng thêm sản phẩm
- **[TEST_ADD_PRODUCT.md](./TEST_ADD_PRODUCT.md)** - Test cases và debug guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Tóm tắt implementation

## 🛠️ Tech Stack

- **React 19** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **React Router DOM** - Routing
- **Recharts** - Charts
- **Lucide React** - Icons

## 📁 Project Structure

```
dashboard/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Products.tsx
│   │   ├── AddProduct.tsx      ← Main add product page
│   │   ├── OrderList.tsx
│   │   └── ...
│   ├── components/
│   │   ├── common/
│   │   │   └── Toast.tsx        ← Toast notification
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   └── dashboard/
│   ├── services/
│   │   ├── api.ts               ← Base API service
│   │   ├── productService.ts    ← Product API calls
│   │   └── categoryService.ts
│   ├── constants/
│   │   ├── categoryMenu.ts
│   │   └── menuData.ts
│   └── types/
├── public/
├── .env                          ← Environment config
└── package.json
```

## 🔧 Environment Variables

Create `.env` file:

```bash
# API Base URL
VITE_API_BASE_URL=http://localhost:3000/api

# Other configs (if needed)
# VITE_API_TIMEOUT=30000
# VITE_UPLOAD_MAX_SIZE=10485760
```

## 📝 API Endpoints

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product ✅
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Categories
- `GET /categories` - Get all categories
- `GET /categories/:id/products` - Get products by category

See [API Documentation](./API.md) for details.

## 🧪 Testing

### Run dev server
```bash
npm run dev
```

### Test Add Product
1. Navigate to `/products/add`
2. Fill in required fields (name, description, price)
3. Click "Add Product"
4. Check Console logs for debug info
5. Check Network tab for API calls

### Debug
- Open DevTools (F12)
- Console: View logs
- Network: Check API calls
- React DevTools: Inspect component state

## 🐛 Troubleshooting

### "Không thể thêm sản phẩm"
- ✅ Check backend is running
- ✅ Check `VITE_API_BASE_URL` in `.env`
- ✅ Check CORS policy in backend

### CORS Error
Add to backend:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Build Error
```bash
# Clear cache
rm -rf node_modules
rm package-lock.json
npm install
```

## 🚧 TODO / Future Features

### Products
- [ ] Edit product functionality
- [ ] Delete product with confirmation
- [ ] Bulk operations (delete, export)
- [ ] Product image upload to server
- [ ] Category/Supplier dropdown with search
- [ ] Rich text editor for description
- [ ] Drag & drop image upload
- [ ] Form auto-save to localStorage
- [ ] Product templates
- [ ] Import from Excel/CSV

### General
- [ ] Authentication & Authorization
- [ ] Role-based access control
- [ ] Activity logs
- [ ] Notifications system
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Mobile responsive improvements

## 📦 Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

This project is licensed under MIT License.

## 👥 Team

PBL6 - Pharmacy Management System

---

**Last Updated**: November 11, 2025
**Version**: 1.0.0
