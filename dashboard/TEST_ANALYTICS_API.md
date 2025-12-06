# Test Analytics API Response

## 🧪 Script kiểm tra response

Paste vào Console (F12) để xem response structure:

```javascript
// Test Analytics API
async function testAnalyticsAPI() {
  const token = sessionStorage.getItem('accessToken');
  const aiBaseUrl = 'http://localhost:5000'; // Thay bằng AI_BASE_URL thực tế
  
  console.log('=== TEST ANALYTICS API ===');
  
  // Test 1: Lấy tất cả chi nhánh (không có branch_id)
  console.log('\n1️⃣ Testing WITHOUT branch_id:');
  try {
    const res1 = await fetch(`${aiBaseUrl}/api/admin/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data1 = await res1.json();
    console.log('Response:', data1);
    console.log('Has insights?', !!data1.insights);
    console.log('Insights type:', typeof data1.insights);
    if (data1.insights && typeof data1.insights === 'object') {
      console.log('Insights keys:', Object.keys(data1.insights));
    }
  } catch (err) {
    console.error('Error:', err);
  }
  
  // Test 2: Lấy chi nhánh cụ thể (branch_id=1)
  console.log('\n2️⃣ Testing WITH branch_id=1:');
  try {
    const res2 = await fetch(`${aiBaseUrl}/api/admin/analytics?branch_id=1`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data2 = await res2.json();
    console.log('Response:', data2);
    console.log('Has insights?', !!data2.insights);
    console.log('Insights type:', typeof data2.insights);
    if (data2.insights && typeof data2.insights === 'object') {
      console.log('Insights keys:', Object.keys(data2.insights));
    }
  } catch (err) {
    console.error('Error:', err);
  }
  
  // Test 3: Check revenue by branch
  console.log('\n3️⃣ Testing revenue.by_branch:');
  try {
    const res3 = await fetch(`${aiBaseUrl}/api/admin/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data3 = await res3.json();
    console.log('Revenue by branch:', data3.revenue?.by_branch);
    
    if (Array.isArray(data3.revenue?.by_branch)) {
      console.log('Branches found:', data3.revenue.by_branch.length);
      data3.revenue.by_branch.forEach(branch => {
        console.log(`  - Branch ${branch.branch_id}: ${branch.branch_name || 'N/A'}`);
      });
    }
  } catch (err) {
    console.error('Error:', err);
  }
  
  console.log('\n=== END TEST ===');
}

// Run test
testAnalyticsAPI();
```

## 📋 Kết quả mong đợi:

### **API không có branch_id:**
```json
{
  "period": { ... },
  "revenue": {
    "total": 6720000,
    "by_branch": [
      { "branch_id": 1, "branch_name": "Chi nhánh 1", "revenue": 2000000 },
      { "branch_id": 2, "branch_name": "Chi nhánh 2", "revenue": 3000000 },
      { "branch_id": 3, "branch_name": "Chi nhánh 3", "revenue": 1720000 }
    ]
  },
  "insights": null  // ← Không có insights khi không chọn branch
}
```

### **API có branch_id=1:**
```json
{
  "period": { ... },
  "revenue": { "total": 2000000, ... },
  "insights": {
    "revenue_trend": "Chi nhánh 1 đạt doanh thu...",
    "sales_performance": "...",
    "customer_behavior": "...",
    "product_recommendations": "...",
    "inventory_alert": "..."
  }
}
```

## 🔧 Expected Behavior:

1. **Không có branch_id** → `insights = null` → UI hiển thị "Chọn chi nhánh để xem insights"
2. **Có branch_id** → `insights = {...}` → Convert sang array và hiển thị
3. **revenue.by_branch** → Dùng để tạo dropdown branches

## 💡 Nếu API trả về format khác:

Gửi kết quả test cho dev để điều chỉnh code parsing.
