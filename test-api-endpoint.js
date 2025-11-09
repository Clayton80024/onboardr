// Test script to verify hybrid payment API endpoint
// Run this in your browser console or as a Node.js script

const testHybridPaymentAPI = async () => {
  try {
    console.log('🧪 Testing Hybrid Payment API...')
    
    // Test if the endpoint exists (should return 405 Method Not Allowed for GET)
    const response = await fetch('/api/stripe/create-hybrid-payment', {
      method: 'GET'
    })
    
    if (response.status === 405) {
      console.log('✅ Hybrid payment API endpoint exists!')
      console.log('✅ Ready to accept POST requests')
    } else {
      console.log('❌ API endpoint not found or not working')
      console.log('Status:', response.status)
    }
    
  } catch (error) {
    console.log('❌ Error testing API:', error.message)
  }
}

// Run the test
testHybridPaymentAPI()

