// TEST ALL REMAINING APIs - Paste vào Browser Console
(async () => {
    const token = localStorage.getItem('accessToken');
    const BASE = 'http://localhost:3000/api/admin/dashboard';
    const dates = '?startDate=2025-10-27&endDate=2025-11-26';
    
    if (!token) {
        console.error('❌ No token found!');
        return;
    }

    console.log('🔍 Testing remaining APIs...\n');

    // 1. Orders Stats
    console.group('📊 Orders Stats API');
    try {
        const res = await fetch(`${BASE}/orders-stats${dates}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('Response:', data);
        if (data.success && data.data) {
            console.log('✅ Array:', Array.isArray(data.data), 'Length:', data.data.length);
            if (data.data.length > 0) {
                console.log('First item:', data.data[0]);
                console.log('Keys:', Object.keys(data.data[0]));
            }
        }
    } catch (e) {
        console.error('❌ Error:', e);
    }
    console.groupEnd();
    console.log('\n');

    await new Promise(r => setTimeout(r, 500));

    // 2. Top Products
    console.group('🏆 Top Products API');
    try {
        const res = await fetch(`${BASE}/top-products${dates}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('Response:', data);
        if (data.success && data.data) {
            console.log('✅ Has topSelling:', !!data.data.topSelling);
            console.log('✅ Has lowSelling:', !!data.data.lowSelling);
            console.log('topSelling count:', data.data.topSelling?.length || 0);
            console.log('lowSelling count:', data.data.lowSelling?.length || 0);
            if (data.data.topSelling?.[0]) {
                console.log('First topSelling:', data.data.topSelling[0]);
                console.log('Keys:', Object.keys(data.data.topSelling[0]));
            }
        }
    } catch (e) {
        console.error('❌ Error:', e);
    }
    console.groupEnd();
    console.log('\n');

    await new Promise(r => setTimeout(r, 500));

    // 3. Reviews
    console.group('⭐ Reviews API');
    try {
        const res = await fetch(`${BASE}/reviews-stats?limit=3`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('Response:', data);
        if (data.success) {
            console.log('✅ Array:', Array.isArray(data.data));
            console.log('✅ Has total:', 'total' in data);
            console.log('Count:', data.data?.length || 0);
            console.log('Total:', data.total);
            if (data.data?.[0]) {
                console.log('First review:', data.data[0]);
                console.log('Keys:', Object.keys(data.data[0]));
            }
        }
    } catch (e) {
        console.error('❌ Error:', e);
    }
    console.groupEnd();
    console.log('\n');

    await new Promise(r => setTimeout(r, 500));

    // 4. Recent Activities
    console.group('📋 Recent Activities API');
    try {
        const res = await fetch(`${BASE}/recent-activities?limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('Response:', data);
        if (data.success && data.data) {
            console.log('✅ Array:', Array.isArray(data.data));
            console.log('Count:', data.data?.length || 0);
            if (data.data?.[0]) {
                console.log('First activity:', data.data[0]);
                console.log('Keys:', Object.keys(data.data[0]));
            }
        }
    } catch (e) {
        console.error('❌ Error:', e);
    }
    console.groupEnd();

    console.log('\n✅ All tests completed!');
})();
