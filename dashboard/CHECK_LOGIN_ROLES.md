# Hướng dẫn Kiểm tra Đăng nhập & Phân quyền

## 📋 Kiểm tra User hiện tại

### Bước 1: Mở Console (F12)

### Bước 2: Paste script này để kiểm tra:

```javascript
console.clear();
console.log('═══════════════════════════════════════');
console.log('📊 THÔNG TIN ĐĂNG NHẬP');
console.log('═══════════════════════════════════════');

// Lấy thông tin từ sessionStorage
const token = sessionStorage.getItem('accessToken');
const userStr = sessionStorage.getItem('user');

if (!token) {
  console.log('❌ CHƯA ĐĂNG NHẬP');
  console.log('Vui lòng đăng nhập tại /login');
} else {
  console.log('✅ ĐÃ ĐĂNG NHẬP');
  console.log('Token:', token.substring(0, 20) + '...');
  
  if (userStr) {
    const user = JSON.parse(userStr);
    console.log('\n👤 Thông tin User:');
    console.log('  - Username:', user.username);
    console.log('  - Email:', user.email);
    console.log('  - Full Name:', user.full_name || 'N/A');
    console.log('  - Role ID:', user.role_id);
    console.log('  - Role Name:', user.role_name);
    
    const isAdmin = user.role_name?.toLowerCase() === 'admin';
    console.log('\n🔐 Phân quyền:');
    console.log('  - Là Admin?', isAdmin ? '✅ CÓ' : '❌ KHÔNG');
    
    console.log('\n📍 Trang có thể truy cập:');
    console.log('  ✅ Products');
    console.log('  ✅ Inbox');
    console.log('  ✅ Order Lists');
    console.log('  ✅ Product Stock');
    console.log('  ✅ Stock Slips');
    console.log('  ✅ Branches (NEW)');
    console.log('  ✅ Batches (NEW)');
    console.log('  ✅ Supplier Orders (NEW)');
    console.log('  ✅ Stock Takes (NEW)');
    console.log('  ✅ Stock Transfer');
    console.log('  ✅ Inventory Reports (NEW)');
    console.log('  ✅ Customers');
    
    if (isAdmin) {
      console.log('  ✅ Dashboard (Admin only)');
      console.log('  ✅ Staff Accounts (Admin only)');
    } else {
      console.log('  ⛔ Dashboard (cần Admin)');
      console.log('  ⛔ Staff Accounts (cần Admin)');
    }
  }
}

console.log('═══════════════════════════════════════');
```

## 🔍 Kết quả mong đợi:

### Nếu bạn là **Admin**:
```
✅ ĐÃ ĐĂNG NHẬP
👤 Thông tin User:
  - Username: admin
  - Role Name: admin
🔐 Phân quyền:
  - Là Admin? ✅ CÓ
  ✅ Dashboard (Admin only)
  ✅ Staff Accounts (Admin only)
```

### Nếu bạn là **Staff**:
```
✅ ĐÃ ĐĂNG NHẬP
👤 Thông tin User:
  - Username: staff01
  - Role Name: staff
🔐 Phân quyền:
  - Là Admin? ❌ KHÔNG
  ⛔ Dashboard (cần Admin)
  ⛔ Staff Accounts (cần Admin)
```

## 🎯 Logic Phân quyền

### File: `src/App.tsx`

```typescript
// Admin Only Route - Dòng 36-72
const AdminOnlyRoute = ({ children }) => {
  // Check user role
  const isAdmin = userRole?.toLowerCase() === 'admin';
  
  // Nếu KHÔNG phải Admin → Redirect về Products
  if (!isAdmin) {
    return <Navigate to="/dashboard/products" replace />;
  }
  
  return <>{children}</>;
};
```

### Routes được bảo vệ:

```typescript
// CHỈ Admin - Có AdminOnlyRoute
<Route index element={<AdminOnlyRoute><Dashboard /></AdminOnlyRoute>} />
<Route path="staff" element={<AdminOnlyRoute><StaffAccounts /></AdminOnlyRoute>} />

// TẤT CẢ users - Không có AdminOnlyRoute
<Route path="products" element={<Products />} />
<Route path="branches" element={<Branches />} />
<Route path="batches" element={<Batches />} />
// ... các route khác
```

## 🔧 Cách test với cả 2 roles:

### Test với Admin:
1. Logout khỏi account hiện tại
2. Login với account Admin:
   - Username: `admin` (hoặc account admin của bạn)
   - Password: [mật khẩu admin]
3. Sau khi login → Tự động redirect đến `/dashboard`
4. Có thể truy cập: Dashboard + Staff Accounts + tất cả tabs khác

### Test với Staff:
1. Logout khỏi account hiện tại
2. Login với account Staff:
   - Username: `staff01` (hoặc account staff của bạn)
   - Password: [mật khẩu staff]
3. Sau khi login → Tự động redirect đến `/dashboard/products`
4. **KHÔNG** truy cập được: Dashboard, Staff Accounts
5. Có thể truy cập: Tất cả các tab inventory và pages khác

## ⚠️ Hành vi ĐÚNG:

### ✅ Staff bị redirect khỏi Dashboard/Staff Accounts
Đây là **ĐÚNG** và **MONG MUỐN**:
- Dashboard chứa thống kê toàn hệ thống → Chỉ Admin
- Staff Accounts quản lý nhân viên → Chỉ Admin
- Staff chỉ cần các tab nghiệp vụ: Products, Orders, Inventory, etc.

### ❌ Nếu Admin cũng bị redirect
Đây là **LỖI**, có thể do:
1. Backend trả về sai `role_name`
2. Typo trong role name (ví dụ: "Admin" vs "admin")
3. Role không được lưu đúng vào sessionStorage

## 🧪 Debug nếu có vấn đề:

### 1. Kiểm tra API Login response:

```javascript
// Mở Network tab trước khi login
// Login → Check request POST /auth/login
// Xem Response:
{
  "success": true,
  "data": {
    "user": {
      "username": "admin",
      "role_id": 1,
      "roles": {
        "role_name": "admin"  // ← Kiểm tra cái này
      }
    }
  }
}
```

### 2. Kiểm tra sessionStorage sau login:

```javascript
const user = JSON.parse(sessionStorage.getItem('user'));
console.log('Stored user:', user);
console.log('Role name:', user.role_name);
console.log('Is admin?', user.role_name?.toLowerCase() === 'admin');
```

### 3. Kiểm tra API /auth/me:

```javascript
// Paste vào Console:
fetch('http://localhost:3000/api/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken')
  }
})
.then(r => r.json())
.then(data => {
  console.log('Current user from API:', data);
  console.log('Role:', data.data?.roles?.role_name);
});
```

## 📞 Nếu vẫn có vấn đề:

Gửi cho dev kết quả của script check ở trên và thông tin:
1. Username đang dùng
2. Role name trong Console
3. Tab nào bị redirect
4. Screenshot Console log
