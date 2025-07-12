// Simple test script for EventHub
// Run with: node test-simple.js

const { EventHub } = require('./dist/index.js');

async function testEventHub() {
    console.log('🧪 Testing EventHub...\n');

    try {
        // Get EventHub instance
        const eventHub = EventHub.getInstance();
        console.log('✅ EventHub instance created');

        // Initialize with Matomo config
        const config = {
            matomo: {
                enabled: true,
                siteId: '1',
                trackerUrl: 'https://mraghdasi.matomo.cloud/matomo.php',
                debug: true
            }
        };

        console.log('📋 Initializing with config:', JSON.stringify(config, null, 2));
        await eventHub.initialize(config);
        console.log('✅ EventHub initialized successfully');

        // Test tracking an event
        console.log('📊 Tracking test event...');
        await eventHub.track('matomo', 'test_event', {
            test: true,
            timestamp: new Date().toISOString(),
            source: 'node-test'
        });
        console.log('✅ Event tracked successfully');

        console.log('\n🎉 All tests passed!');
        console.log('📈 Check your Matomo dashboard to see the tracked event.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run the test
testEventHub(); 