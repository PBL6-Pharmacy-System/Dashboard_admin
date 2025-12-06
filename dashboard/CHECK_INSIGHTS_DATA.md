# Script Kiểm tra Insights Data

## 🔍 Copy và paste script này vào Console (F12):

```javascript
// ═══════════════════════════════════════════════════════════
// 📊 COMPREHENSIVE INSIGHTS DATA CHECKER
// ═══════════════════════════════════════════════════════════

async function checkInsightsData() {
  console.clear();
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     INSIGHTS DATA CHECKER                      ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  const token = sessionStorage.getItem('accessToken');
  if (!token) {
    console.error('❌ No token found! Please login first.');
    return;
  }
  
  // Thay đổi URL này nếu cần
  const aiBaseUrl = 'http://localhost:5000';
  
  // ─────────────────────────────────────────────────────────
  // TEST 1: API WITHOUT branch_id (tất cả chi nhánh)
  // ─────────────────────────────────────────────────────────
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📌 TEST 1: API WITHOUT branch_id');
  console.log('   URL: ' + aiBaseUrl + '/api/admin/analytics');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const res1 = await fetch(`${aiBaseUrl}/api/admin/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Status:', res1.status, res1.statusText);
    
    if (!res1.ok) {
      console.error('❌ API Error:', res1.status);
      const text = await res1.text();
      console.error('Response:', text);
    } else {
      const data1 = await res1.json();
      console.log('✅ Response received\n');
      
      // Check structure
      console.log('📦 Response Structure:');
      console.log('   - Keys:', Object.keys(data1));
      console.log('   - Has "insights" key?', 'insights' in data1);
      console.log('   - insights type:', typeof data1.insights);
      console.log('   - insights value:', data1.insights);
      
      // Check revenue.by_branch
      if (data1.revenue?.by_branch) {
        console.log('\n💰 Revenue by Branch:');
        console.log('   - Count:', data1.revenue.by_branch.length);
        data1.revenue.by_branch.forEach((b, i) => {
          console.log(`   ${i+1}. Branch ${b.branch_id}: ${b.branch_name || 'N/A'} - ${b.revenue}đ`);
        });
      }
      
      // Check insights content
      if (data1.insights) {
        console.log('\n💡 Insights Found:');
        if (typeof data1.insights === 'object' && !Array.isArray(data1.insights)) {
          const keys = Object.keys(data1.insights);
          console.log('   - Type: Object');
          console.log('   - Keys:', keys);
          console.log('   - Count:', keys.length);
          
          keys.forEach((key, i) => {
            const value = data1.insights[key];
            const preview = typeof value === 'string' 
              ? value.substring(0, 60) + '...' 
              : value;
            console.log(`   ${i+1}. ${key}:`);
            console.log(`      "${preview}"`);
          });
        } else if (Array.isArray(data1.insights)) {
          console.log('   - Type: Array');
          console.log('   - Count:', data1.insights.length);
          data1.insights.forEach((item, i) => {
            console.log(`   ${i+1}.`, item);
          });
        }
      } else {
        console.log('\n⚠️  No insights in response (this is EXPECTED for all branches)');
      }
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
  
  // ─────────────────────────────────────────────────────────
  // TEST 2: API WITH branch_id=1
  // ─────────────────────────────────────────────────────────
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📌 TEST 2: API WITH branch_id=1');
  console.log('   URL: ' + aiBaseUrl + '/api/admin/analytics?branch_id=1');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    const res2 = await fetch(`${aiBaseUrl}/api/admin/analytics?branch_id=1`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Status:', res2.status, res2.statusText);
    
    if (!res2.ok) {
      console.error('❌ API Error:', res2.status);
      const text = await res2.text();
      console.error('Response:', text);
    } else {
      const data2 = await res2.json();
      console.log('✅ Response received\n');
      
      // Check structure
      console.log('📦 Response Structure:');
      console.log('   - Keys:', Object.keys(data2));
      console.log('   - Has "insights" key?', 'insights' in data2);
      console.log('   - insights type:', typeof data2.insights);
      
      // Check insights content
      if (data2.insights) {
        console.log('\n💡 Insights Found:');
        if (typeof data2.insights === 'object' && !Array.isArray(data2.insights)) {
          const keys = Object.keys(data2.insights);
          console.log('   - Type: Object');
          console.log('   - Keys:', keys);
          console.log('   - Count:', keys.length);
          
          console.log('\n📝 Full Insights Content:\n');
          keys.forEach((key, i) => {
            const value = data2.insights[key];
            console.log(`${i+1}. ${key.toUpperCase()}:`);
            console.log(`   "${value}"\n`);
          });
        } else if (Array.isArray(data2.insights)) {
          console.log('   - Type: Array');
          console.log('   - Count:', data2.insights.length);
          console.log('\n📝 Full Insights Content:\n');
          data2.insights.forEach((item, i) => {
            console.log(`${i+1}.`, item, '\n');
          });
        }
      } else {
        console.log('\n❌ No insights found! (Should have insights for specific branch)');
      }
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
  
  // ─────────────────────────────────────────────────────────
  // TEST 3: Check multiple branches
  // ─────────────────────────────────────────────────────────
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📌 TEST 3: Check branches 1, 2, 3');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  for (let branchId of [1, 2, 3]) {
    try {
      const res = await fetch(`${aiBaseUrl}/api/admin/analytics?branch_id=${branchId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        const hasInsights = !!data.insights;
        const insightsCount = data.insights ? Object.keys(data.insights).length : 0;
        
        console.log(`Branch ${branchId}: ${hasInsights ? '✅' : '❌'} ${insightsCount} insights`);
      } else {
        console.log(`Branch ${branchId}: ❌ Error ${res.status}`);
      }
    } catch (err) {
      console.log(`Branch ${branchId}: ❌ ${err.message}`);
    }
  }
  
  // ─────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────
  console.log('\n\n╔════════════════════════════════════════════════╗');
  console.log('║     SUMMARY & RECOMMENDATIONS                  ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  console.log('✅ Expected Behavior:');
  console.log('   1. Without branch_id: insights should be NULL or empty');
  console.log('   2. With branch_id: insights should be an OBJECT with 5 keys:');
  console.log('      - revenue_trend');
  console.log('      - sales_performance');
  console.log('      - customer_behavior');
  console.log('      - product_recommendations');
  console.log('      - inventory_alert');
  console.log('\n📌 If insights structure is different, please share the output above!');
  
  console.log('\n═══════════════════════════════════════════════════\n');
}

// Run the checker
checkInsightsData();
```

## 📋 Kết quả mong đợi:

### ✅ **Test 1 - Không có branch_id:**
```
📦 Response Structure:
   - Has "insights" key? true
   - insights type: object
   - insights value: null

⚠️  No insights (EXPECTED for all branches)
```

### ✅ **Test 2 - Có branch_id=1:**
```
💡 Insights Found:
   - Type: Object
   - Keys: ['revenue_trend', 'sales_performance', ...]
   - Count: 5

📝 Full Insights Content:

1. REVENUE_TREND:
   "Trong khoảng thời gian 30 ngày, tổng doanh thu đạt..."

2. SALES_PERFORMANCE:
   "Tất cả 5 đơn hàng đều chưa được hoàn thành..."
```

### ✅ **Test 3 - Check all branches:**
```
Branch 1: ✅ 5 insights
Branch 2: ✅ 5 insights
Branch 3: ✅ 5 insights
```

## 🎯 Hành động tiếp theo:

1. **Paste script vào Console**
2. **Chờ kết quả** (mất vài giây)
3. **Copy toàn bộ output** và gửi lại
4. Tôi sẽ điều chỉnh code parsing dựa trên kết quả thực tế

## 🔧 Nếu cần đổi URL:

Sửa dòng:
```javascript
const aiBaseUrl = 'http://localhost:5000'; // Đổi thành URL thật của bạn
```
