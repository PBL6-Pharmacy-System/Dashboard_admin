// API Test Utility
// Paste this in browser console to test APIs

const testAPI = {
  // Get token
  getToken() {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      console.error('❌ No token found. Please login first.');
      return null;
    }
    console.log('✅ Token found:', token.substring(0, 20) + '...');
    return token;
  },

  // Test single endpoint
  async test(endpoint, method = 'GET', body = null) {
    const token = this.getToken();
    if (!token) return;

    const baseUrl = 'http://localhost:3000/api';
    const url = `${baseUrl}${endpoint}`;
    
    console.log(`\n🔍 Testing ${method} ${endpoint}`);
    console.log('Full URL:', url);

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      console.log('📊 Status:', response.status, response.statusText);
      
      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Error response:', error);
        return null;
      }

      const data = await response.json();
      console.log('✅ Response:', data);
      console.log('📦 Data type:', typeof data.data);
      console.log('📦 Is array?', Array.isArray(data.data));
      
      if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
        console.log('📦 Data keys:', Object.keys(data.data));
      }

      return data;
    } catch (error) {
      console.error('❌ Request failed:', error);
      return null;
    }
  },

  // Test all inventory APIs
  async testAll() {
    console.log('🚀 Testing All Inventory APIs\n');
    console.log('═'.repeat(50));

    await this.test('/branches');
    await this.test('/product-batches');
    await this.test('/stock-takes');
    await this.test('/supplier-orders');
    await this.test('/branch-inventory');
    await this.test('/branches/1/inventory');
    
    console.log('\n' + '═'.repeat(50));
    console.log('✅ All tests completed!');
  },

  // Test specific resources
  async testBranches() {
    console.log('🏢 Testing Branches API\n');
    return await this.test('/branches');
  },

  async testBatches() {
    console.log('📦 Testing Batches API\n');
    return await this.test('/product-batches');
  },

  async testStockTakes() {
    console.log('📋 Testing Stock Takes API\n');
    return await this.test('/stock-takes');
  },

  async testSupplierOrders() {
    console.log('🚚 Testing Supplier Orders API\n');
    return await this.test('/supplier-orders');
  },

  async testBranchInventory(branchId = 1) {
    console.log(`🏪 Testing Branch ${branchId} Inventory API\n`);
    return await this.test(`/branches/${branchId}/inventory`);
  },

  // Check environment
  checkEnv() {
    console.log('🔧 Environment Check\n');
    console.log('VITE_API_BASE_URL:', import.meta?.env?.VITE_API_BASE_URL || 'Not found');
    console.log('VITE_AI_BASE_URL:', import.meta?.env?.VITE_AI_BASE_URL || 'Not found');
    console.log('Token exists:', !!sessionStorage.getItem('accessToken'));
    console.log('\nFull .env values:');
    console.log('API_BASE_URL:', window.location.origin.includes('5173') 
      ? 'http://localhost:3000/api (expected)' 
      : 'Unknown');
  }
};

// Make it global for easy access
window.testAPI = testAPI;

console.log(`
🔧 API Test Utility Loaded!

Usage:
  testAPI.testAll()              - Test all APIs
  testAPI.testBranches()         - Test branches API
  testAPI.testBatches()          - Test batches API
  testAPI.testStockTakes()       - Test stock takes API
  testAPI.testSupplierOrders()   - Test supplier orders API
  testAPI.testBranchInventory(1) - Test branch inventory
  testAPI.checkEnv()             - Check environment variables

Example:
  testAPI.testBranches()
`);

// Auto-run env check
testAPI.checkEnv();
