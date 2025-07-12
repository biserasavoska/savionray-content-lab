const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testPhase2Features() {
  console.log('🧪 Testing Phase 2 Features...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    if (healthResponse.ok) {
      console.log('✅ Server is running and healthy');
    } else {
      console.log('❌ Server health check failed');
      return;
    }

    // Test 2: Check organization list API
    console.log('\n2. Testing organization list API...');
    const orgListResponse = await fetch(`${BASE_URL}/api/organization/list`);
    if (orgListResponse.ok) {
      const orgData = await orgListResponse.json();
      console.log(`✅ Organization list API working - Found ${orgData.organizations?.length || 0} organizations`);
      
      if (orgData.organizations && orgData.organizations.length > 0) {
        const firstOrg = orgData.organizations[0];
        console.log(`   - First organization: ${firstOrg.name} (ID: ${firstOrg.id})`);
        
        // Test 3: Check organization stats API
        console.log('\n3. Testing organization stats API...');
        const statsResponse = await fetch(`${BASE_URL}/api/organization/${firstOrg.id}/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('✅ Organization stats API working');
          console.log(`   - Total ideas: ${statsData.totalIdeas || 0}`);
          console.log(`   - Total drafts: ${statsData.totalContentDrafts || 0}`);
          console.log(`   - Total published: ${statsData.totalPublishedContent || 0}`);
          console.log(`   - Active users: ${statsData.activeUsers || 0}`);
          console.log(`   - Recent activity: ${statsData.recentActivity?.length || 0} items`);
        } else {
          console.log('❌ Organization stats API failed');
          const errorText = await statsResponse.text();
          console.log(`   Error: ${errorText}`);
        }
      }
    } else {
      console.log('❌ Organization list API failed');
      const errorText = await orgListResponse.text();
      console.log(`   Error: ${errorText}`);
    }

    // Test 4: Check if organization dashboard page exists
    console.log('\n4. Testing organization dashboard page...');
    const dashboardResponse = await fetch(`${BASE_URL}/organization/dashboard`);
    if (dashboardResponse.ok) {
      console.log('✅ Organization dashboard page is accessible');
    } else {
      console.log('❌ Organization dashboard page failed');
      console.log(`   Status: ${dashboardResponse.status}`);
    }

    console.log('\n🎉 Phase 2 feature testing completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Navigate to /organization/dashboard to see the new dashboard');
    console.log('3. Test the enhanced organization switcher in the navigation');
    console.log('4. Try creating content with the organization-specific creator');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testPhase2Features(); 