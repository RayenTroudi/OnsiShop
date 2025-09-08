'use client';

import { useTranslation } from '@/contexts/TranslationContext';

const CopyRight = () => {
  const { t } = useTranslation();
  
  return (
    <p className="text-center text-darkPurple">
      {t('footer_copyright')}
      <br />
      {t('footer_all_rights_reserved')}
    </p>
  );
};

export default CopyRight;
