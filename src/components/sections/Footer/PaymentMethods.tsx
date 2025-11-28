// next
import Image from 'next/image';

// data
import paymentMethods from '@/data/payment-methods.json';

const PaymentMethods = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-[12px]">
      {paymentMethods.map((paymentMethod, i) => (
        <div 
          key={i} 
          className="flex items-center justify-center rounded-lg bg-white p-[8px] shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <Image 
            src={paymentMethod.image} 
            alt={paymentMethod.title} 
            width={56} 
            height={40}
            className="object-contain"
          />
        </div>
      ))}
    </div>
  );
};

export default PaymentMethods;
