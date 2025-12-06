# Debug Routes - Hướng dẫn kiểm tra lỗi redirect

## Vấn đề: Khi bấm vào một số tab bị redirect về Products

### Nguyên nhân có thể:

#### 1. **Component bị lỗi JavaScript**
Khi component có lỗi → React crash → redirect về route mặc định

**Cách kiểm tra:**
1. Mở Console (`F12`)
2. Click vào tab bị lỗi
3. Xem có lỗi JavaScript không?
4. Tìm dòng màu đỏ với stack trace

**Ví dụ lỗi thường gặp:**
```
Uncaught TypeError: Cannot read property 'map' of undefined
  at Branches.tsx:157
```

#### 2. **AdminOnlyRoute đang chặn**
Nếu bạn đang dùng tài khoản **Staff** (không phải Admin), bạn sẽ bị redirect khỏi:
- ❌ Dashboard (`/dashboard`)
- ❌ Staff Accounts (`/dashboard/staff`)

**Cách kiểm tra:**
```javascript
// Paste vào Console:
const user = JSON.parse(sessionStorage.getItem('user'));
console.log('Current user role:', user?.role_name);
```

Nếu role là `staff` → bình thường khi bị redirect khỏi Dashboard/Staff Accounts.

#### 3. **Import lỗi hoặc module not found**
```
Module not found: Can't resolve '../services/branchService'
```

**Giải pháp:**
- Restart dev server
- Clear cache: `rm -rf node_modules/.vite`
- Hard refresh browser: `Ctrl + Shift + R`

## ✅ Đã thêm ErrorBoundary

Bây giờ nếu component lỗi, sẽ hiển thị trang lỗi thay vì crash:
- ✅ Hiển thị thông báo lỗi
- ✅ Nút "Tải lại trang"
- ✅ Nút "Về Dashboard"
- ✅ Chi tiết lỗi (dev mode)

## 🧪 Test từng tab

### Các tab KHÔNG bị AdminOnly bảo vệ (tất cả users):
- ✅ Products
- ✅ Inbox
- ✅ Order Lists
- ✅ Product Stock
- ✅ Stock Slips
- ✅ **Branches** ← TAB MỚI
- ✅ **Batches** ← TAB MỚI
- ✅ **Supplier Orders** ← TAB MỚI
- ✅ **Stock Takes** ← TAB MỚI
- ✅ Stock Transfer
- ✅ **Inventory Reports** ← TAB MỚI
- ✅ Customers

### Các tab CHỈ Admin (Staff sẽ bị redirect):
- ⛔ Dashboard (`/dashboard`)
- ⛔ Staff Accounts (`/dashboard/staff`)

## 📝 Checklist Debug

Khi bị redirect, hãy check:

1. **Console Logs**
   ```
   🔄 Fetching [resource]... ← API đang gọi
   ✅ Response: {...}        ← Thành công
   ❌ Error: ...             ← Lỗi
   ```

2. **Network Tab**
   - Filter: XHR/Fetch
   - Xem status code:
     - 200: OK
     - 401: Unauthorized (cần login lại)
     - 404: Endpoint không tồn tại
     - 500: Backend lỗi

3. **Browser Console**
   - Có lỗi JavaScript không?
   - Có lỗi import không?
   - Có warning không?

4. **Current Route**
   ```javascript
   // Paste vào Console:
   console.log('Current path:', window.location.pathname);
   ```

5. **User Role**
   ```javascript
   // Paste vào Console:
   const user = JSON.parse(sessionStorage.getItem('user'));
   console.log('Role:', user?.role_name);
   console.log('Is Admin?', user?.role_name?.toLowerCase() === 'admin');
   ```

## 🔧 Giải pháp

### Nếu bị redirect do lỗi component:
1. Xem lỗi trong Console
2. Sẽ thấy ErrorBoundary screen với chi tiết
3. Copy lỗi và báo cho dev

### Nếu bị redirect do không phải Admin:
1. **Bình thường!** Staff không được vào Dashboard/Staff Accounts
2. Các tab inventory khác đều OK

### Nếu bị redirect không rõ lý do:
1. Check Console logs (🔄 ✅ ❌)
2. Check Network tab
3. Check user role
4. Screenshot và gửi lỗi

## 🎯 Test nhanh

Paste vào Console để test tất cả:

```javascript
console.log('=== DEBUG INFO ===');
console.log('Path:', window.location.pathname);
const user = JSON.parse(sessionStorage.getItem('user') || '{}');
console.log('User:', user?.username);
console.log('Role:', user?.role_name);
console.log('Token:', sessionStorage.getItem('accessToken') ? 'Exists' : 'Missing');
console.log('==================');
```

## 📞 Báo lỗi

Nếu vẫn bị lỗi, gửi cho dev:
1. Screenshot Console (có lỗi màu đỏ)
2. Tab nào bị redirect?
3. User role là gì?
4. Kết quả test script ở trên
