// TEST OVERVIEW API - Paste vào Console
(async () => {
    const token = localStorage.getItem('accessToken');
    const url = 'http://localhost:3000/api/admin/dashboard/overview?startDate=2025-10-27&endDate=2025-11-26';
    
    console.log('🔍 Testing Overview API...');
    console.log('URL:', url);
    
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const result = await response.json();
    console.log('📊 Full Response:', result);
    
    if (result.success && result.data) {
        console.log('\n✅ Response Structure:');
        console.log('- success:', result.success);
        console.log('- data:', result.data);
        console.log('\n📋 Data Fields:');
        Object.entries(result.data).forEach(([key, value]) => {
            console.log(`  ${key}:`, value, `(${typeof value})`);
        });
        
        console.log('\n🔍 Checking expected fields:');
        const expectedFields = ['totalRevenue', 'totalOrders', 'totalCustomers', 'totalProducts', 'revenueChange', 'ordersChange', 'customersChange', 'productsChange'];
        expectedFields.forEach(field => {
            const exists = field in result.data;
            const value = result.data[field];
            console.log(`  ${exists ? '✅' : '❌'} ${field}:`, exists ? value : 'MISSING');
        });
    } else {
        console.error('❌ API Error:', result);
    }
})();
