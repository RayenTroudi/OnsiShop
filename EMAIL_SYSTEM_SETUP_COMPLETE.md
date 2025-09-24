# Onsi Shop Email System Setup

## 📧 Email Configuration Complete

The email system has been successfully configured for your Onsi Shop application with the following features:

### ✅ What's Configured

1. **Gmail SMTP Integration**
   - Email Provider: Gmail SMTP
   - Email Address: `onsi@gmail.com`
   - App Password: `bgge exoy syid apbm`
   
2. **Order Notification Emails**
   - **Admin Notification**: Sent to `onsi@gmail.com` when a new order is placed
   - **Customer Confirmation**: Sent to customer's email address with order details

3. **Branding & Localization**
   - All emails use "Onsi Shop" branding
   - Currency displayed as "DT" (Tunisian Dinar)
   - Professional HTML templates with order details

### 📧 Email Templates

#### Admin Notification Email
- Subject: `🛒 New Order #[ORDER_ID] - [CUSTOMER_NAME]`
- Contains: Order details, customer info, delivery address, total amount in DT
- Includes: Professional table with product details and styling

#### Customer Confirmation Email  
- Subject: `Order Confirmation #[ORDER_ID] - Thank you for your order!`
- Contains: Order confirmation, delivery info, contact details
- Includes: Branded styling and thank you message

### 🚀 How It Works

When a customer places an order through your checkout system:

1. Order is created in the database
2. **Admin notification** is automatically sent to `onsi@gmail.com`
3. **Customer confirmation** is automatically sent to customer's email
4. Both emails include full order details with DT pricing

### 🧪 Testing

Use the test script at `scripts/test-email.ts` to test the email system:

```bash
cd /d/OnsiShop
npx tsx scripts/test-email.ts
```

### 🔧 Configuration Files

- **Environment Variables**: `.env.local` - Contains Gmail SMTP settings
- **Email Logic**: `src/lib/email.ts` - Email templates and sending logic
- **Order API**: `src/app/api/orders/route.ts` - Triggers emails on order creation

### 📋 Environment Variables

```bash
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="onsi@gmail.com"
EMAIL_PASS="bgge exoy syid apbm"
EMAIL_FROM="onsi@gmail.com"
NOTIFICATION_EMAIL="onsi@gmail.com"
SITE_NAME="Onsi Shop"
```

### ⚠️ Important Notes

1. **Gmail App Password**: The password `bgge exoy syid apbm` is a Gmail App Password (not your regular Gmail password)
2. **Email Delivery**: Emails are sent automatically when orders are placed through the checkout system
3. **Currency**: All prices display in DT (Tunisian Dinar) format
4. **Branding**: All emails show "Onsi Shop" branding consistently

### 🎯 Next Steps

1. Test the email system by placing a test order
2. Verify emails are received in your Gmail inbox
3. Check that all pricing shows in DT and branding shows "Onsi Shop"
4. The system is ready for production use!

---

**Email System Status**: ✅ **FULLY CONFIGURED & READY**