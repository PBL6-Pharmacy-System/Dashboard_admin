## 🧪 Test Thêm Sản Phẩm

### Test Case 1: Thêm sản phẩm với đầy đủ thông tin
```json
{
  "name": "Paracetamol 500mg",
  "description": "Thuốc giảm đau, hạ sốt hiệu quả",
  "price": "15000",
  "tax_fee": "10",
  "manufacturer": "DHG Pharma",
  "usage": "Uống sau bữa ăn",
  "dosage": "1-2 viên mỗi lần, 3 lần/ngày",
  "specification": "Hộp 10 vỉ x 10 viên",
  "adverseEffect": "Có thể gây buồn ngủ, buồn nôn",
  "registNum": "VD-12345-20",
  "brand": "Panadol",
  "producer": "DHG Pharma",
  "manufactor": "Việt Nam",
  "category_id": "1",
  "supplier_id": "1",
  "base_unit_id": "1",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "faq": [
    {
      "question": "Có thể uống lúc đói không?",
      "answer": "Nên uống sau bữa ăn để tránh kích ứng dạ dày"
    },
    {
      "question": "Trẻ em có dùng được không?",
      "answer": "Trẻ em trên 6 tuổi có thể sử dụng với liều lượng giảm"
    }
  ],
  "productUnits": [
    {
      "base_qty_per_unit": "1",
      "sale_price": "15000",
      "is_default": true,
      "sku": "PARA500-001",
      "barcode": "8936038660010",
      "unit_id": 1
    },
    {
      "base_qty_per_unit": "10",
      "sale_price": "140000",
      "is_default": false,
      "sku": "PARA500-002",
      "barcode": "8936038660027",
      "unit_id": 2
    }
  ]
}
```

### Test Case 2: Thêm sản phẩm chỉ với thông tin bắt buộc
```json
{
  "name": "Vitamin C 1000mg",
  "description": "Bổ sung vitamin C",
  "price": "120000"
}
```

### Test với cURL

```bash
# Test từ terminal
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test Description",
    "price": "100000",
    "tax_fee": "10",
    "brand": "Test Brand",
    "category_id": 1,
    "supplier_id": 1,
    "base_unit_id": 1
  }'
```

### Test với JavaScript Fetch

```javascript
// Test trong browser console hoặc Node.js
const testAddProduct = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Product',
        description: 'Test Description',
        price: '100000',
        tax_fee: '10',
        brand: 'Test Brand',
        category_id: 1,
        supplier_id: 1,
        base_unit_id: 1,
        images: ['https://via.placeholder.com/300'],
        faq: [
          {
            question: 'Test question?',
            answer: 'Test answer'
          }
        ],
        productUnits: [
          {
            base_qty_per_unit: 1,
            sale_price: 100000,
            is_default: true,
            sku: 'TEST001',
            barcode: '123456',
            unit_id: 1
          }
        ]
      })
    });

    const data = await response.json();
    console.log('✅ Success:', data);
    return data;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};

// Run test
testAddProduct();
```

### Expected Responses

#### Success (201 Created)
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 123,
    "name": "Test Product",
    "description": "Test Description",
    "price": "100000",
    "created_at": "2025-11-11T10:00:00.000Z",
    ...
  }
}
```

#### Error (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Product name is required"
    },
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```

#### Error (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

### Checklist Test

- [ ] Test với tất cả các trường được điền
- [ ] Test với chỉ các trường bắt buộc
- [ ] Test với giá trị không hợp lệ (price = -1)
- [ ] Test với name rỗng
- [ ] Test với description rỗng
- [ ] Test với nhiều ảnh (>5 ảnh)
- [ ] Test với nhiều FAQ (>10 FAQs)
- [ ] Test với nhiều Product Units (>5 units)
- [ ] Test với category_id không tồn tại
- [ ] Test với supplier_id không tồn tại
- [ ] Test upload ảnh thật (nếu có endpoint upload)
- [ ] Test network error (tắt backend)
- [ ] Test CORS error
- [ ] Test timeout (backend chậm)

### Debug với Browser DevTools

1. **Mở DevTools** (F12)
2. **Tab Console**: Xem logs
   ```
   📦 Submitting product data: {...}
   🚀 Creating product with data: {...}
   ✅ Product created response: {...}
   ```

3. **Tab Network**: 
   - Filter: `products`
   - Check Request Payload
   - Check Response
   - Check Status Code

4. **Tab Application**:
   - Check localStorage nếu cần
   - Check cookies nếu có authentication

### Mock Backend Response (nếu backend chưa sẵn sàng)

```typescript
// Thêm vào productService.ts
async createProduct(product: any): Promise<any> {
  // Mock response for testing
  if (import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return {
      success: true,
      message: 'Product created successfully (MOCK)',
      data: {
        id: Math.floor(Math.random() * 1000),
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }
  
  // Real API call
  return api.post('/products', product);
}
```

---

**Happy Testing! 🧪**
