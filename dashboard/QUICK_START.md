# 🚀 Quick Start - Thêm Sản Phẩm

## Bước 1: Khởi động ứng dụng

```bash
cd dashboard
npm run dev
```

Mở browser: `http://localhost:5173`

## Bước 2: Navigate đến Add Product

**Cách 1:** Click vào menu "Products" → Click nút "Add New Product"

**Cách 2:** Truy cập trực tiếp: `http://localhost:5173/products/add`

## Bước 3: Điền form

### ✅ Thông tin BẮT BUỘC:
```
1. Product Name: "Paracetamol 500mg"
2. Description: "Thuốc giảm đau, hạ sốt"
3. Price: "15000"
```

### 📝 Thông tin TÙY CHỌN (có thể bỏ qua):
- Tax Fee: "10"
- Brand: "Panadol"
- Registration Number: "VD-12345-20"
- Manufacturer: "DHG Pharma"
- ... (các trường khác)

### 🖼️ Ảnh (optional):
- Click "Click to upload images"
- Chọn 1 hoặc nhiều ảnh
- Preview sẽ hiển thị ngay

### ❓ FAQ (optional):
- Click "Add FAQ" để thêm câu hỏi
- Điền Question và Answer
- Click X để xóa

### 📦 Product Units (optional):
- Mặc định có 1 unit
- Click "Add Unit" để thêm unit mới
- Điền SKU, Barcode, Sale Price

## Bước 4: Submit

1. Click nút **"Add Product"**
2. Đợi loading (nút sẽ hiện "Đang thêm...")
3. Xem kết quả:
   - ✅ **Thành công**: Toast màu xanh → Tự động về /products sau 2s
   - ❌ **Lỗi**: Toast màu đỏ → Sửa lỗi và thử lại

## 🐛 Troubleshooting

### Lỗi: "Không thể thêm sản phẩm"

**Nguyên nhân:** Backend API không chạy hoặc sai URL

**Giải pháp:**
```bash
# 1. Kiểm tra .env file
cat .env

# 2. Check backend có chạy không
curl http://localhost:3000/api/products

# 3. Sửa VITE_API_BASE_URL trong .env nếu cần
VITE_API_BASE_URL=http://localhost:3000/api
```

### Lỗi: "Vui lòng điền đầy đủ thông tin"

**Giải pháp:** Đảm bảo điền 3 trường bắt buộc:
- ✅ Product Name
- ✅ Description  
- ✅ Price

### Lỗi CORS

**Giải pháp:** Thêm CORS trong backend:
```javascript
// backend/app.js
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

## 📊 Console Logs để debug

Mở DevTools (F12) → Console tab:

### Successful flow:
```
📦 Submitting product data: {...}
🚀 Creating product with data: {...}
✅ Product created response: {...}
✅ Product created successfully: {...}
```

### Error flow:
```
📦 Submitting product data: {...}
🚀 Creating product with data: {...}
❌ Error creating product: Error message
```

## ✅ Test nhanh

### Test 1: Minimal Product (chỉ 3 trường bắt buộc)
```
Name: Test Product
Description: Test Description  
Price: 100000
→ Click Add Product
```

### Test 2: Full Product (tất cả trường)
```
Name: Paracetamol 500mg
Description: Thuốc giảm đau, hạ sốt hiệu quả
Price: 15000
Tax Fee: 10
Brand: Panadol
Registration Number: VD-12345-20
Manufacturer: DHG Pharma
Producer: DHG Pharma
Country: Việt Nam
Specification: Hộp 10 vỉ x 10 viên
Usage: Uống sau bữa ăn
Dosage: 1-2 viên/lần, 3 lần/ngày
Adverse Effects: Buồn ngủ, buồn nôn
Category ID: 1
Supplier ID: 1
Base Unit ID: 1

+ Upload 2-3 ảnh
+ Add 2 FAQs
+ Add 2 Product Units

→ Click Add Product
```

## 📸 Screenshots Flow

```
1. Products Page
   ↓
2. Click "Add New Product"
   ↓
3. Fill Form (7 sections)
   ↓
4. Click "Add Product"
   ↓
5. See Loading State
   ↓
6. Success Toast appears
   ↓
7. Auto redirect to Products page
```

## 🎯 Expected Result

Sau khi thêm thành công:
1. Toast notification màu xanh hiển thị
2. Message: "Thêm sản phẩm thành công! 🎉"
3. Tự động chuyển về `/products` sau 2 giây
4. Sản phẩm mới xuất hiện trong danh sách

---

**Total Time:** ~2-3 phút cho 1 sản phẩm đơn giản

**Enjoy!** 🎉
