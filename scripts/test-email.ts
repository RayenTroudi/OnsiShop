import { sendCustomerConfirmationEmail, sendOrderNotificationEmail } from '../src/lib/email';

// Test data for order email
const testOrderData = {
  orderId: 'TEST-001',
  customerName: 'John Doe',
  customerEmail: 'customer@example.com', // Replace with your test email
  customerPhone: '+1234567890',
  items: [
    {
      name: 'Test Product 1',
      quantity: 2,
      price: 25.99
    },
    {
      name: 'Test Product 2',
      quantity: 1,
      price: 15.50
    }
  ],
  totalAmount: 67.48,
  shippingAddress: 'Test Address\n123 Main St\nTunisia'
};

async function testEmailSystem() {
  console.log('🧪 Testing email system with DT currency and Onsi Shop branding...\n');
  
  try {
    // Test admin notification email
    console.log('📧 Sending admin notification email...');
    const adminResult = await sendOrderNotificationEmail(testOrderData);
    
    if (adminResult.success) {
      console.log('✅ Admin email sent successfully!');
      console.log('Message ID:', adminResult.messageId);
    } else {
      console.log('❌ Admin email failed:', adminResult.error);
    }
    
    console.log('\n---\n');
    
    // Test customer confirmation email
    console.log('📧 Sending customer confirmation email...');
    const customerResult = await sendCustomerConfirmationEmail(testOrderData);
    
    if (customerResult.success) {
      console.log('✅ Customer email sent successfully!');
      console.log('Message ID:', customerResult.messageId);
    } else {
      console.log('❌ Customer email failed:', customerResult.error);
    }
    
    console.log('\n🎉 Email test completed!');
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

// Run the test
testEmailSystem();