import nodemailer, { Transporter } from 'nodemailer';

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
}

// Create nodemailer transporter
const createTransporter = (): Transporter => {
  // Always use real email sending (production mode)
  console.log('📧 Email service configured for real email sending');
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendOrderNotificationEmail = async (orderData: OrderEmailData) => {
  try {
    const transporter = createTransporter();
    
    const notificationEmail = process.env.NOTIFICATION_EMAIL || 'rayentroudi00@gmail.com';
    const fromEmail = process.env.EMAIL_FROM || 'noreply@your-store.com';
    
    // Format order items for email
    const itemsList = orderData.items
      .map(item => `• ${item.name} - Quantity: ${item.quantity} - Price: ${item.price.toFixed(2)} DT`)
      .join('\n');

    const emailContent = `
🛍️ NEW ORDER RECEIVED - Order #${orderData.orderId}

A new order has been placed on your website!

Customer Information:
👤 Name: ${orderData.customerName}
📧 Email: ${orderData.customerEmail}
📞 Phone: ${orderData.customerPhone}

📦 Shipping Address:
${orderData.shippingAddress}

🛒 Order Items:
${itemsList}

💰 Total Amount: ${orderData.totalAmount.toFixed(2)} DT

📅 Order Date: ${new Date().toLocaleString()}

Please contact the customer to arrange delivery and payment.

---
Order Management System
${process.env.SITE_NAME || 'Onsi Shop'}
    `.trim();

    const mailOptions = {
      from: fromEmail,
      to: notificationEmail,
      subject: `🛍️ New Order #${orderData.orderId} - Customer: ${orderData.customerName}`,
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #6366F1; margin-bottom: 20px;">🛍️ New Order Received</h1>
            
            <div style="background-color: #6366F1; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="margin: 0;">Order #${orderData.orderId}</h2>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="color: #374151; border-bottom: 2px solid #E5E7EB; padding-bottom: 5px;">👤 Customer Information</h3>
              <p><strong>Name:</strong> ${orderData.customerName}</p>
              <p><strong>Email:</strong> <a href="mailto:${orderData.customerEmail}">${orderData.customerEmail}</a></p>
              <p><strong>Phone:</strong> <a href="tel:${orderData.customerPhone}">${orderData.customerPhone}</a></p>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="color: #374151; border-bottom: 2px solid #E5E7EB; padding-bottom: 5px;">📦 Shipping Address</h3>
              <p style="background-color: #F3F4F6; padding: 10px; border-radius: 5px;">${orderData.shippingAddress.replace(/\n/g, '<br>')}</p>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="color: #374151; border-bottom: 2px solid #E5E7EB; padding-bottom: 5px;">🛒 Order Items</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #F3F4F6;">
                    <th style="padding: 10px; text-align: left; border: 1px solid #E5E7EB;">Product</th>
                    <th style="padding: 10px; text-align: center; border: 1px solid #E5E7EB;">Qty</th>
                    <th style="padding: 10px; text-align: right; border: 1px solid #E5E7EB;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderData.items.map(item => `
                    <tr>
                      <td style="padding: 10px; border: 1px solid #E5E7EB;">${item.name}</td>
                      <td style="padding: 10px; text-align: center; border: 1px solid #E5E7EB;">${item.quantity}</td>
                      <td style="padding: 10px; text-align: right; border: 1px solid #E5E7EB;">${item.price.toFixed(2)} DT</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div style="background-color: #10B981; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h3 style="margin: 0;">💰 Total Amount: ${orderData.totalAmount.toFixed(2)} DT</h3>
            </div>

            <div style="background-color: #FEF3C7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 0; color: #92400E;"><strong>📞 Next Steps:</strong> Please contact the customer to arrange delivery and payment.</p>
            </div>

            <div style="text-align: center; color: #6B7280; font-size: 12px; margin-top: 30px;">
              <p>Order Date: ${new Date().toLocaleString()}</p>
              <p>Order Management System - ${process.env.SITE_NAME || 'Onsi Shop'}</p>
            </div>
          </div>
        </div>
      `
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Order notification email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send order notification email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const sendCustomerConfirmationEmail = async (orderData: OrderEmailData) => {
  try {
    const transporter = createTransporter();
    
    const fromEmail = process.env.EMAIL_FROM || 'noreply@your-store.com';
    
    // Format order items for customer email
    const itemsList = orderData.items
      .map(item => `• ${item.name} - Quantity: ${item.quantity} - ${item.price.toFixed(2)} DT`)
      .join('\n');

    const customerEmailContent = `
Thank you for your order!

Order Confirmation #${orderData.orderId}

Dear ${orderData.customerName},

Thank you for your order! We have received your order and will contact you soon to arrange delivery.

Order Details:
${itemsList}

Total: ${orderData.totalAmount.toFixed(2)} DT

Shipping Address:
${orderData.shippingAddress}

We will contact you at ${orderData.customerPhone} or ${orderData.customerEmail} to coordinate delivery and payment.

Thank you for shopping with us!

${process.env.SITE_NAME || 'Onsi Shop'}
    `.trim();

    const customerMailOptions = {
      from: fromEmail,
      to: orderData.customerEmail,
      subject: `Order Confirmation #${orderData.orderId} - Thank you for your order!`,
      text: customerEmailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #10B981; margin-bottom: 20px;">✅ Order Confirmed!</h1>
            
            <p style="font-size: 18px; color: #374151;">Dear ${orderData.customerName},</p>
            <p style="color: #6B7280;">Thank you for your order! We have received your order and will contact you soon to arrange delivery.</p>
            
            <div style="background-color: #10B981; color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin: 0;">Order #${orderData.orderId}</h2>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="color: #374151; border-bottom: 2px solid #E5E7EB; padding-bottom: 5px;">🛒 Order Items</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #F3F4F6;">
                    <th style="padding: 10px; text-align: left; border: 1px solid #E5E7EB;">Product</th>
                    <th style="padding: 10px; text-align: center; border: 1px solid #E5E7EB;">Qty</th>
                    <th style="padding: 10px; text-align: right; border: 1px solid #E5E7EB;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderData.items.map(item => `
                    <tr>
                      <td style="padding: 10px; border: 1px solid #E5E7EB;">${item.name}</td>
                      <td style="padding: 10px; text-align: center; border: 1px solid #E5E7EB;">${item.quantity}</td>
                      <td style="padding: 10px; text-align: right; border: 1px solid #E5E7EB;">${item.price.toFixed(2)} DT</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div style="background-color: #6366F1; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h3 style="margin: 0;">💰 Total: ${orderData.totalAmount.toFixed(2)} DT</h3>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="color: #374151; border-bottom: 2px solid #E5E7EB; padding-bottom: 5px;">📦 Delivery Address</h3>
              <p style="background-color: #F3F4F6; padding: 10px; border-radius: 5px;">${orderData.shippingAddress.replace(/\n/g, '<br>')}</p>
            </div>

            <div style="background-color: #FEF3C7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 0; color: #92400E;"><strong>📞 What's Next?</strong> We will contact you at ${orderData.customerPhone} or ${orderData.customerEmail} to coordinate delivery and payment.</p>
            </div>

            <div style="text-align: center; color: #6B7280; font-size: 12px; margin-top: 30px;">
              <p>Thank you for shopping with ${process.env.SITE_NAME || 'Onsi Shop'}!</p>
              <p>Order Date: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      `
    };

    // Send the customer confirmation email
    const info = await transporter.sendMail(customerMailOptions);
    console.log('📧 Customer confirmation email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send customer confirmation email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
