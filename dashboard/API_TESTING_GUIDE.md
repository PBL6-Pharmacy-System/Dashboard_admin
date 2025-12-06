# Hướng dẫn Kiểm tra API Inventory

## ✅ Các thay đổi đã thực hiện

### 1. Sửa Icon cho Staff Accounts
- **Trước**: Icon `Users` (trùng với Customers)
- **Sau**: Icon `UserCog` (khác biệt)

### 2. Thêm Console Logs Debug
Tất cả các trang inventory đã có debug logs:
- 🔄 Log khi bắt đầu fetch API
- ✅ Log khi nhận được response
- ❌ Log khi có lỗi

## 🧪 Cách kiểm tra API

### Bước 1: Mở Developer Console
- **Chrome/Edge**: `F12` hoặc `Ctrl + Shift + I`
- **Firefox**: `F12` hoặc `Ctrl + Shift + K`
- Chọn tab **Console**

### Bước 2: Kiểm tra từng trang

#### A. Branches (Chi nhánh)
1. Click vào tab **Branches** trong sidebar
2. Xem Console sẽ hiển thị:
   ```
   🔄 Fetching branches with params: {search: "", includeInventory: true}
   ✅ Branches response: {data: [...]}
   ```
3. **Nếu có lỗi**:
   - ❌ Nếu thấy lỗi 404: API endpoint không tồn tại
   - ❌ Nếu thấy lỗi 401: Token hết hạn, cần login lại
   - ❌ Nếu thấy lỗi 500: Backend có vấn đề

#### B. Batches (Lô hàng)
1. Click vào tab **Batches**
2. Console sẽ show:
   ```
   🔄 Fetching batches with params: {}
   ✅ Batches response: {data: [...]}
   ```

#### C. Supplier Orders (Đơn NCC)
1. Click vào tab **Supplier Orders**
2. Console:
   ```
   🔄 Fetching supplier orders with params: {}
   ✅ Supplier orders response: {data: [...]}
   ```

#### D. Stock Takes (Kiểm kê)
1. Click vào tab **Stock Takes**
2. Console:
   ```
   🔄 Fetching stock takes with params: {}
   ✅ Stock takes response: {data: [...]}
   ```

#### E. Inventory Reports (Báo cáo)
1. Click vào tab **Inventory Reports**
2. Console:
   ```
   🔄 Fetching inventory statistics...
   ✅ Overview: {data: {...}}
   ✅ Low Stock: {data: [...]}
   ✅ Top Imported: {data: [...]}
   ✅ Top Exported: {data: [...]}
   ```

### Bước 3: Kiểm tra Network Tab
1. Mở tab **Network** trong DevTools
2. Filter: Chọn **Fetch/XHR**
3. Reload trang
4. Xem các request:
   - `/api/branches`
   - `/api/product-batches`
   - `/api/supplier-orders`
   - `/api/stock-takes`
   - `/api/statistics/inventory/*`

### Bước 4: Kiểm tra Request Details
Click vào từng request để xem:
- **Headers**: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- **Response**:
  - Status: 200 (thành công)
  - Body: JSON data

## 🔧 Xử lý các lỗi thường gặp

### Lỗi 1: "Failed to fetch" hoặc CORS
**Nguyên nhân**: Backend chưa chạy hoặc URL sai
**Giải pháp**:
```bash
# Kiểm tra backend đang chạy
# Kiểm tra .env file
VITE_API_BASE_URL=http://localhost:3000/api
```

### Lỗi 2: 401 Unauthorized
**Nguyên nhân**: Token hết hạn
**Giải pháp**:
1. Logout
2. Login lại
3. Token mới sẽ được lưu vào sessionStorage

### Lỗi 3: 404 Not Found
**Nguyên nhân**: API endpoint không tồn tại
**Giải pháp**:
1. Kiểm tra backend có module inventory không
2. Kiểm tra route đã được register chưa
3. Xem log backend

### Lỗi 4: Data là undefined hoặc null
**Nguyên nhân**: Response structure khác với expected
**Giải pháp**:
```javascript
// Trong console, check response structure:
console.log('Full response:', response);
console.log('Response data:', response.data);
console.log('Response data type:', typeof response.data);
```

## 📋 Checklist Backend cần có

Để các API hoạt động, backend cần:

### 1. Branches Module
- ✅ `GET /api/branches`
- ✅ `GET /api/branches/:id`
- ✅ `POST /api/branches`
- ✅ `PUT /api/branches/:id`
- ✅ `DELETE /api/branches/:id`

### 2. Product Batches Module
- ✅ `GET /api/product-batches`
- ✅ `GET /api/product-batches/:id`
- ✅ `POST /api/product-batches`
- ✅ `POST /api/product-batches/import`
- ✅ `POST /api/product-batches/:id/expire`
- ✅ `POST /api/product-batches/:id/dispose`

### 3. Supplier Orders Module
- ✅ `GET /api/supplier-orders`
- ✅ `GET /api/supplier-orders/:id`
- ✅ `POST /api/supplier-orders`
- ✅ `PATCH /api/supplier-orders/:id/status`
- ✅ `POST /api/supplier-orders/:id/cancel`

### 4. Stock Takes Module
- ✅ `GET /api/stock-takes`
- ✅ `GET /api/stock-takes/:id`
- ✅ `POST /api/stock-takes`
- ✅ `POST /api/stock-takes/:id/complete`
- ✅ `POST /api/stock-takes/:id/cancel`

### 5. Statistics Module
- ✅ `GET /api/statistics/inventory/overview`
- ✅ `GET /api/statistics/inventory/low-stock`
- ✅ `GET /api/statistics/inventory/top-imported`
- ✅ `GET /api/statistics/inventory/top-exported`

## 🎯 Expected Response Format

Tất cả API nên trả về format:
```json
{
  "success": true,
  "data": [...] hoặc {...},
  "message": "Success"
}
```

Hoặc:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

## 🚀 Test với Mock Data

Nếu backend chưa có, tạm thời test với mock:

```javascript
// Trong service, thay vì:
return api.get('/api/branches');

// Test với mock:
return Promise.resolve({
  data: [
    {
      id: 1,
      branch_name: 'Chi nhánh 1',
      address: '123 Test St',
      phone: '0123456789',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
});
```

## 📞 Liên hệ

Nếu cần hỗ trợ:
1. Check console logs (có icon 🔄 ✅ ❌)
2. Check Network tab
3. Gửi screenshot lỗi
4. Gửi response từ API
