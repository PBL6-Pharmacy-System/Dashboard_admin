# ✅ Checklist Test Chức năng Thêm Sản Phẩm

## 🚀 Setup & Environment

- [ ] Backend API đang chạy ở `http://localhost:3000`
- [ ] Frontend đang chạy ở `http://localhost:5173`
- [ ] File `.env` đã được cấu hình đúng với `VITE_API_BASE_URL`
- [ ] Database đã được setup và có sẵn tables (products, categories, suppliers, etc.)
- [ ] CORS đã được enable ở backend
- [ ] Network connection ổn định

## 📋 UI/UX Testing

### Form Display
- [ ] Trang `/products/add` load thành công
- [ ] Header hiển thị "Add New Product"
- [ ] 7 sections hiển thị đầy đủ và đúng thứ tự
- [ ] Tất cả input fields render đúng
- [ ] Buttons (Add FAQ, Add Unit, Cancel, Submit) hiển thị đúng
- [ ] Icons hiển thị đúng (không có icon bị thiếu)

### Form Interaction
- [ ] Có thể nhập text vào tất cả các input
- [ ] Required fields hiển thị validation khi submit rỗng
- [ ] Number inputs chỉ nhận số
- [ ] Textarea có thể resize (hoặc fixed height)
- [ ] Focus state hiển thị đúng (border color thay đổi)

### Image Upload
- [ ] Click vào upload area mở file dialog
- [ ] Có thể chọn 1 ảnh
- [ ] Có thể chọn nhiều ảnh cùng lúc
- [ ] Preview ảnh hiển thị ngay sau khi chọn
- [ ] Nút X để xóa ảnh hoạt động đúng
- [ ] Layout ảnh không bị lỗi khi có nhiều ảnh

### FAQ Management
- [ ] Mặc định có 1 FAQ entry rỗng
- [ ] Click "Add FAQ" thêm được FAQ mới
- [ ] Có thể nhập question và answer
- [ ] Nút X xóa FAQ hoạt động (nhưng không xóa được nếu chỉ còn 1)
- [ ] FAQ numbering hiển thị đúng (#1, #2, #3...)

### Product Units Management
- [ ] Mặc định có 1 unit entry
- [ ] Click "Add Unit" thêm được unit mới
- [ ] Có thể nhập SKU, Barcode, Sale Price
- [ ] Nút Minus xóa unit hoạt động (nhưng không xóa được nếu chỉ còn 1)
- [ ] Unit numbering hiển thị đúng (#1, #2, #3...)

### Responsive Design
- [ ] Layout đúng trên desktop (>1024px)
- [ ] Layout đúng trên tablet (768-1024px)
- [ ] Layout đúng trên mobile (<768px)
- [ ] Không có horizontal scroll
- [ ] Buttons có kích thước phù hợp để click trên mobile

## 🔧 Functionality Testing

### Case 1: Submit với chỉ required fields
**Steps:**
1. Điền Name: "Test Product 1"
2. Điền Description: "Test Description"
3. Điền Price: "100000"
4. Click "Add Product"

**Expected:**
- [ ] Loading state hiển thị (button disabled, spinner xuất hiện)
- [ ] Success toast hiển thị sau vài giây
- [ ] Auto redirect về `/products` sau 2 giây
- [ ] Sản phẩm mới xuất hiện trong danh sách products

### Case 2: Submit với tất cả fields
**Steps:**
1. Điền tất cả required fields
2. Điền tất cả optional fields
3. Upload 2-3 ảnh
4. Add 2 FAQs
5. Add 2 Product Units
6. Click "Add Product"

**Expected:**
- [ ] Loading state hiển thị
- [ ] Success toast hiển thị
- [ ] Auto redirect về `/products`
- [ ] Tất cả data được lưu đúng (check database hoặc API response)

### Case 3: Submit với fields rỗng (validation)
**Steps:**
1. Không điền gì
2. Click "Add Product"

**Expected:**
- [ ] Form hiển thị validation errors
- [ ] Required fields có border đỏ hoặc message lỗi
- [ ] Form không submit

### Case 4: Submit với price không hợp lệ
**Steps:**
1. Điền Name và Description
2. Điền Price: "-1000" (số âm)
3. Click "Add Product"

**Expected:**
- [ ] Validation error hiển thị
- [ ] Hoặc API trả về error
- [ ] Error toast hiển thị với message rõ ràng

### Case 5: Cancel button
**Steps:**
1. Điền một số fields
2. Click "Cancel"

**Expected:**
- [ ] Navigate về `/products`
- [ ] Data không được lưu
- [ ] Không có popup confirmation (hoặc có nếu đã implement)

### Case 6: Remove images
**Steps:**
1. Upload 3 ảnh
2. Click X trên ảnh thứ 2
3. Submit form

**Expected:**
- [ ] Ảnh thứ 2 bị xóa khỏi preview
- [ ] Chỉ 2 ảnh còn lại được submit
- [ ] Array order đúng (ảnh 1, ảnh 3)

### Case 7: FAQ với question rỗng
**Steps:**
1. Add 2 FAQs
2. FAQ #1: điền đầy đủ
3. FAQ #2: để trống
4. Submit

**Expected:**
- [ ] Chỉ FAQ #1 được gửi lên API
- [ ] FAQ rỗng bị filter ra
- [ ] No error

## 🌐 API Integration Testing

### API Request
- [ ] Request gửi đến đúng endpoint `POST /api/products`
- [ ] Request header có `Content-Type: application/json`
- [ ] Request body format đúng JSON
- [ ] Required fields có trong request body
- [ ] Optional fields có giá trị default hợp lý khi rỗng
- [ ] Arrays (images, faq, productUnits) format đúng

### API Response Handling

#### Success Response (200/201)
- [ ] Success toast hiển thị với message đúng
- [ ] Toast icon là CheckCircle (✓)
- [ ] Toast màu xanh
- [ ] Auto redirect hoạt động
- [ ] Console log đúng format

#### Error Response (400)
- [ ] Error toast hiển thị
- [ ] Toast icon là AlertCircle (!)
- [ ] Toast màu đỏ
- [ ] Error message hiển thị rõ ràng
- [ ] Có button X để đóng toast
- [ ] User có thể sửa và retry

#### Network Error
- [ ] Error toast hiển thị khi backend offline
- [ ] Error message: "Không thể thêm sản phẩm. Vui lòng thử lại!"
- [ ] Button không bị stuck ở loading state
- [ ] User có thể retry

#### Timeout
- [ ] Có timeout handling (nếu implement)
- [ ] Error message thông báo timeout
- [ ] User có thể retry

## 🐛 Edge Cases & Error Handling

### Browser Compatibility
- [ ] Hoạt động trên Chrome
- [ ] Hoạt động trên Firefox
- [ ] Hoạt động trên Safari
- [ ] Hoạt động trên Edge

### Special Characters
- [ ] Name với ký tự đặc biệt (é, à, ô, ư, ...)
- [ ] Name với emoji 😀
- [ ] Description với HTML tags (bị escape)
- [ ] Description với line breaks

### Large Data
- [ ] Upload 10+ ảnh (check performance)
- [ ] Add 20+ FAQs (check scroll và UI)
- [ ] Description rất dài (>1000 chars)
- [ ] Check có memory leak không

### Concurrent Operations
- [ ] Click submit nhiều lần liên tục (button phải disabled)
- [ ] Submit 2 products liên tiếp nhanh
- [ ] Mở 2 tabs và submit cùng lúc

## 📊 Performance Testing

- [ ] Form load time < 1s
- [ ] Submit response time < 3s (với network bình thường)
- [ ] No memory leaks khi thêm/xóa nhiều images
- [ ] No memory leaks khi thêm/xóa nhiều FAQs
- [ ] Smooth animations (no janky)
- [ ] No excessive re-renders (check React DevTools)

## 🔒 Security Testing

- [ ] XSS prevention (HTML tags bị escape)
- [ ] SQL injection prevention (backend responsibility)
- [ ] File upload validation (type, size)
- [ ] Input sanitization
- [ ] No sensitive data in console logs
- [ ] No API keys exposed

## 📱 Accessibility Testing

- [ ] Tất cả inputs có labels
- [ ] Tab order hợp lý
- [ ] Có thể submit form bằng Enter key
- [ ] Error messages có aria-live regions
- [ ] Color contrast đạt WCAG standards
- [ ] Screen reader friendly

## 📝 Console Logs Testing

### Successful Flow
```
✅ Phải thấy logs sau trong console:
📦 Submitting product data: {...}
🚀 Creating product with data: {...}
✅ Product created response: {...}
✅ Product created successfully: {...}
```

### Error Flow
```
✅ Phải thấy logs sau trong console:
📦 Submitting product data: {...}
🚀 Creating product with data: {...}
❌ Error creating product: {error message}
```

### No Unexpected Errors
- [ ] Không có unhandled promise rejection
- [ ] Không có undefined errors
- [ ] Không có React warnings
- [ ] Không có CORS errors (nếu setup đúng)

## 🎯 Final Checklist

### Development
- [ ] Code không có TypeScript errors
- [ ] Code không có ESLint warnings
- [ ] All imports resolved correctly
- [ ] Build chạy thành công (`npm run build`)
- [ ] Preview build hoạt động (`npm run preview`)

### Documentation
- [ ] README.md updated
- [ ] QUICK_START.md có và chính xác
- [ ] ADD_PRODUCT_GUIDE.md có và chi tiết
- [ ] TEST_ADD_PRODUCT.md có test cases
- [ ] IMPLEMENTATION_SUMMARY.md có overview

### Git
- [ ] Code được commit với message rõ ràng
- [ ] Không commit node_modules, .env, dist
- [ ] .gitignore đúng
- [ ] Branch naming đúng convention

## 📈 Post-Launch Monitoring

### Week 1
- [ ] Monitor error rates
- [ ] Check API response times
- [ ] Gather user feedback
- [ ] Fix critical bugs

### Week 2-4
- [ ] Analyze usage patterns
- [ ] Optimize slow queries
- [ ] Add requested features
- [ ] Improve UX based on feedback

---

## ✨ Sign-off

**Tested by:** _____________
**Date:** _____________
**All tests passed:** ☐ Yes ☐ No
**Critical issues:** _____________
**Notes:** _____________

---

**Status:**
- 🟢 All tests passed → Ready for production
- 🟡 Minor issues → Deploy with monitoring
- 🔴 Critical issues → Fix before deploy
