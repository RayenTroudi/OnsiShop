'use client';

// react-fast-marquee
import Marquee from 'react-fast-marquee';

// translation
import { useTranslation } from '@/contexts/TranslationContext';

const Discounts = () => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-veryDarkPurple px-[4px] py-[3px] font-medium text-white md:px-[8px] md:py-[6px] md:text-[18px]">
      <Marquee autoFill={true}>
        <div className="ml-[32px] flex items-center justify-center gap-[32px]">
          <p>{t('promo_free_shipping')}</p>
          <div className="aspect-square w-[8px] rounded-full bg-white" />
        </div>
      </Marquee>
    </div>
  );
};

export default Discounts;
