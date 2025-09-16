'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import { useEffect, useState } from 'react';

interface DisclaimerContent {
  title: string;
  text: string;
}

const Disclaimer = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState<DisclaimerContent | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content');
        const result = await response.json();

        if (result.success) {
          const data = result.data;
          setContent({
            title: data['footer.disclaimerTitle'] || t('footer_disclaimer_title'),
            text: data['footer.disclaimerText'] || t('footer_disclaimer_text')
          });
        } else {
          // Fallback to translations
          setContent({
            title: t('footer_disclaimer_title'),
            text: t('footer_disclaimer_text')
          });
        }
      } catch (error) {
        console.error('Error fetching disclaimer content:', error);
        // Fallback to translations
        setContent({
          title: t('footer_disclaimer_title'),
          text: t('footer_disclaimer_text')
        });
      }
    };

    fetchContent();
  }, [t]);

  if (!content) {
    return (
      <div className="flex max-w-full flex-col items-center md:w-[307px] md:items-start md:justify-start">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-40 mb-1"></div>
          <div className="h-4 bg-gray-300 rounded w-36"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex max-w-full flex-col items-center md:w-[307px] md:items-start md:justify-start">
      <h3 className="text-[20px] font-semibold text-veryDarkPurple">{content.title}</h3>
      <p className="mt-2 text-center text-[18px] text-darkPurple md:text-left">
        {content.text}
      </p>
    </div>
  );
};

export default Disclaimer;
