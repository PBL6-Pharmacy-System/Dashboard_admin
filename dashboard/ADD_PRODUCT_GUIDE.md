# 📦 Hướng dẫn Thêm Sản phẩm - Admin Dashboard

## ✅ Đã implement

### 1. **API Integration**
- ✅ Kết nối với API `POST /products`
- ✅ Xử lý response và error
- ✅ Validation dữ liệu đầu vào

### 2. **Form Features**
- ✅ Form đầy đủ các trường thông tin sản phẩm
- ✅ Upload và preview ảnh sản phẩm
- ✅ Quản lý FAQ động (thêm/xóa)
- ✅ Quản lý Product Units (thêm/xóa)
- ✅ Loading state khi đang submit
- ✅ Success/Error notification
- ✅ Auto redirect về trang Products sau khi thành công

### 3. **UI/UX**
- ✅ Loading spinner khi đang thêm sản phẩm
- ✅ Success message màu xanh với icon
- ✅ Error message màu đỏ với thông báo lỗi chi tiết
- ✅ Disable button khi đang submit
- ✅ Responsive design

## 🚀 Cách sử dụng

### 1. Khởi động dev server
```bash
cd dashboard
npm run dev
```

### 2. Truy cập trang Add Product
- Navigate đến: `http://localhost:5173/products/add`
- Hoặc click nút **"Add New Product"** ở trang Products

### 3. Điền thông tin sản phẩm

#### **Thông tin bắt buộc (*):**
- **Product Name**: Tên sản phẩm
- **Description**: Mô tả sản phẩm
- **Price (VND)**: Giá bán

#### **Thông tin tùy chọn:**
- Tax Fee (%)
- Brand
- Registration Number
- Manufacturer
- Producer
- Country of Manufacture
- Specification
- Usage Instructions
- Dosage Information
- Adverse Effects
- Category ID
- Supplier ID
- Base Unit ID

#### **Images:**
- Click vào khung upload để chọn ảnh
- Có thể upload nhiều ảnh
- Preview ảnh trước khi submit
- Click nút X để xóa ảnh không cần

#### **FAQ Section:**
- Click "Add FAQ" để thêm câu hỏi mới
- Điền Question và Answer
- Click icon X để xóa FAQ

#### **Product Units:**
- Click "Add Unit" để thêm đơn vị mới
- Điền SKU, Barcode, Sale Price
- Click icon Minus để xóa unit

### 4. Submit Form
- Click nút **"Add Product"** để thêm sản phẩm
- Đợi loading (nút sẽ hiển thị "Đang thêm...")
- Nếu thành công: Hiển thị thông báo xanh và tự động chuyển về trang Products sau 2 giây
- Nếu lỗi: Hiển thị thông báo đỏ với lỗi chi tiết

## 🔧 API Endpoint

### POST `/api/products`

**Request Body:**
```json
{
  "name": "Tên sản phẩm",
  "description": "Mô tả sản phẩm",
  "price": "100000",
  "tax_fee": "10",
  "manufacturer": "Nhà sản xuất",
  "usage": "Cách sử dụng",
  "dosage": "Liều lượng",
  "specification": "Quy cách",
  "adverseEffect": "Tác dụng phụ",
  "registNum": "Số đăng ký",
  "brand": "Thương hiệu",
  "producer": "Nhà sản xuất",
  "manufactor": "Nước sản xuất",
  "legalDeclaration": null,
  "category_id": 1,
  "supplier_id": 1,
  "base_unit_id": 1,
  "images": ["url1", "url2"],
  "faq": [
    {
      "question": "Câu hỏi 1",
      "answer": "Câu trả lời 1"
    }
  ],
  "productUnits": [
    {
      "base_qty_per_unit": 1,
      "sale_price": 100000,
      "is_default": true,
      "sku": "SKU001",
      "barcode": "123456",
      "unit_id": 1
    }
  ]
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 123,
    "name": "Tên sản phẩm",
    ...
  }
}
```

**Response Error (400/500):**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

## 📝 Validation Rules

1. **Required Fields:**
   - name (không được rỗng)
   - description (không được rỗng)
   - price (phải là số > 0)

2. **Optional Fields:**
   - Tất cả các trường khác có thể để trống
   - Nếu category_id, supplier_id, base_unit_id không điền → sẽ gửi `null`

3. **FAQs:**
   - Chỉ gửi các FAQ có đầy đủ question và answer
   - FAQs rỗng sẽ bị lọc ra

4. **Product Units:**
   - base_qty_per_unit phải là số nguyên > 0
   - sale_price phải là số > 0
   - is_default: unit đầu tiên sẽ là default

## 🐛 Troubleshooting

### Lỗi: "Không thể thêm sản phẩm"
**Nguyên nhân:**
- Backend API không khả dụng
- CORS policy bị block
- Dữ liệu không hợp lệ

**Giải pháp:**
1. Kiểm tra backend có đang chạy không
2. Kiểm tra `VITE_API_BASE_URL` trong `.env`
3. Mở Console để xem lỗi chi tiết
4. Kiểm tra Network tab trong DevTools

### Lỗi: "CORS policy"
**Giải pháp:**
- Thêm CORS headers ở backend:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Lỗi: "Validation failed"
**Giải pháp:**
- Đảm bảo điền đầy đủ các trường bắt buộc
- Kiểm tra format của price (phải là số)
- Kiểm tra category_id, supplier_id, base_unit_id có tồn tại không

## 🔄 Next Steps (Tính năng có thể mở rộng)

### 1. **Upload ảnh thật lên server**
```typescript
// Thêm function upload image
const uploadImages = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));
  
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  return data.urls; // Array of uploaded image URLs
};

// Sử dụng trong handleSubmit
const imageUrls = await uploadImages(imageFiles);
productData.images = imageUrls;
```

### 2. **Dropdown cho Category/Supplier**
```typescript
// Fetch categories và suppliers
const [categories, setCategories] = useState([]);
const [suppliers, setSuppliers] = useState([]);

useEffect(() => {
  // Fetch categories
  categoryService.getAllCategories().then(setCategories);
  // Fetch suppliers
  supplierService.getAllSuppliers().then(setSuppliers);
}, []);

// Thay input bằng select
<select value={formData.category_id} onChange={...}>
  {categories.map(cat => (
    <option key={cat.id} value={cat.id}>{cat.name}</option>
  ))}
</select>
```

### 3. **Rich Text Editor cho Description**
```bash
npm install react-quill
```

```tsx
import ReactQuill from 'react-quill';

<ReactQuill
  value={formData.description}
  onChange={(value) => setFormData({...formData, description: value})}
/>
```

### 4. **Drag & Drop cho Images**
```bash
npm install react-dropzone
```

```tsx
import { useDropzone } from 'react-dropzone';

const { getRootProps, getInputProps } = useDropzone({
  accept: {'image/*': []},
  onDrop: handleImageUpload
});
```

## 📊 Console Logs để Debug

Khi submit form, bạn sẽ thấy các logs sau:

```
📦 Submitting product data: {...}
🚀 Creating product with data: {...}
✅ Product created response: {...}
✅ Product created successfully: {...}
```

Hoặc nếu có lỗi:
```
❌ Error creating product: Error message
```

## ✨ Features Completed

- [x] Form UI với 7 sections
- [x] Validation form
- [x] API integration với POST /products
- [x] Loading state
- [x] Success notification
- [x] Error handling
- [x] Auto redirect
- [x] Image preview
- [x] Dynamic FAQ management
- [x] Dynamic Product Units
- [x] Responsive design

---

**Happy Coding! 🚀**
