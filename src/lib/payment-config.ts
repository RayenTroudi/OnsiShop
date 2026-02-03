export const paymentMethods = [
  {
    id: 'cod',
    name: 'Cash on Delivery',
    nameAr: 'الدفع عند الاستلام',
    nameFr: 'Paiement à la livraison',
    description: 'Pay when you receive your order',
    descriptionAr: 'ادفع عند استلام طلبك',
    descriptionFr: 'Payez à la réception de votre commande',
    icon: '💵',
    enabled: true
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    nameAr: 'بطاقة ائتمان/خصم',
    nameFr: 'Carte de crédit/débit',
    description: 'Pay securely with your card',
    descriptionAr: 'ادفع بأمان باستخدام بطاقتك',
    descriptionFr: 'Payez en toute sécurité avec votre carte',
    icon: '💳',
    enabled: true
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    nameAr: 'تحويل بنكي',
    nameFr: 'Virement bancaire',
    description: 'Transfer payment to our bank account',
    descriptionAr: 'حول المبلغ إلى حسابنا البنكي',
    descriptionFr: 'Transférez le paiement sur notre compte bancaire',
    icon: '🏦',
    enabled: true
  }
];

export const shippingMethods = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    nameAr: 'شحن قياسي',
    nameFr: 'Livraison standard',
    description: '5-7 business days',
    descriptionAr: '5-7 أيام عمل',
    descriptionFr: '5-7 jours ouvrables',
    price: 0,
    estimatedDays: 7
  },
  {
    id: 'express',
    name: 'Express Shipping',
    nameAr: 'شحن سريع',
    nameFr: 'Livraison express',
    description: '2-3 business days',
    descriptionAr: '2-3 أيام عمل',
    descriptionFr: '2-3 jours ouvrables',
    price: 15,
    estimatedDays: 3
  }
];
