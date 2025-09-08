'use client';

import { useTranslation } from '@/contexts/TranslationContext';

export default function Error({ reset }: { reset: () => void }) {
  const { t } = useTranslation();
  
  return (
    <div className="mx-auto my-16 flex max-w-xl flex-col gap-2">
      <h2 className="text-xl font-bold text-veryDarkPurple">{t('error_title')}</h2>
      <p className="my-2 text-darkPurple">
        {t('error_message')}
      </p>
      <button className="btn text-[20px]" onClick={() => reset()}>
        {t('error_try_again')}
      </button>
    </div>
  );
}
