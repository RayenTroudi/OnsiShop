'use client';

import { useTranslation } from '@/contexts/TranslationContext';

const Disclaimer = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex max-w-full flex-col items-center md:w-[307px] md:items-start md:justify-start">
      <h3 className="text-[20px] font-semibold text-veryDarkPurple">{t('footer_disclaimer_title')}</h3>
      <p className="mt-2 text-center text-[18px] text-darkPurple md:text-left">
        {t('footer_disclaimer_text')}
      </p>
    </div>
  );
};

export default Disclaimer;
