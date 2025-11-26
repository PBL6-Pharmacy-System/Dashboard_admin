// Copy paste script này vào Browser Console để test tất cả API structures
// Open Dashboard > F12 > Console > Paste và Enter

(async function testAllDashboardAPIs() {
    const API = 'http://localhost:3000/api/admin/dashboard';
    const token = localStorage.getItem('accessToken');
    const dates = '?startDate=2025-11-01&endDate=2025-11-26';
    
    if (!token) {
        console.error('❌ No access token found! Please login first.');
        return;
    }
    
    console.log('🚀 Testing all Dashboard APIs...\n');
    
    const apis = [
        { name: 'Revenue', url: '/revenue' + dates, expectedStructure: 'data.chart[]' },
        { name: 'Overview', url: '/overview' + dates, expectedStructure: 'data{}' },
        { name: 'Top Products', url: '/top-products' + dates, expectedStructure: 'data.topSelling[], data.lowSelling[]' },
        { name: 'Orders Stats', url: '/orders-stats' + dates, expectedStructure: 'data[]' },
        { name: 'Reviews', url: '/reviews-stats?limit=3', expectedStructure: 'data[], total' },
        { name: 'Activities', url: '/recent-activities?limit=10', expectedStructure: 'data[]' }
    ];
    
    for (const api of apis) {
        try {
            console.group(`📡 ${api.name} API`);
            console.log(`URL: ${API}${api.url}`);
            console.log(`Expected: ${api.expectedStructure}`);
            
            const response = await fetch(API + api.url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                console.log('✅ Status: SUCCESS');
                console.log('📊 Response:', result);
                
                // Analyze structure
                if (result.data) {
                    if (Array.isArray(result.data)) {
                        console.log(`📦 data: Array (${result.data.length} items)`);
                        if (result.data.length > 0) {
                            console.log('🔍 First item:', result.data[0]);
                        }
                    } else if (typeof result.data === 'object') {
                        console.log('📦 data: Object');
                        console.log('🔑 Keys:', Object.keys(result.data));
                        
                        // Check for nested arrays
                        Object.entries(result.data).forEach(([key, value]) => {
                            if (Array.isArray(value)) {
                                console.log(`  └─ ${key}: Array (${value.length} items)`);
                            }
                        });
                    }
                }
                
                if (result.total !== undefined) {
                    console.log(`📊 total: ${result.total}`);
                }
            } else {
                console.error('❌ Status:', response.status);
                console.error('❌ Error:', result);
            }
            
            console.groupEnd();
            console.log('');
            
            // Delay between requests
            await new Promise(resolve => setTimeout(resolve, 300));
            
        } catch (error) {
            console.error(`❌ ${api.name} failed:`, error);
            console.groupEnd();
        }
    }
    
    console.log('✅ All API tests completed!');
})();
