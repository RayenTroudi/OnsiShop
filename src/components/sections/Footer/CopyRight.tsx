'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import { useEffect, useState } from 'react';

interface CopyrightContent {
  copyright: string;
  allRightsReserved: string;
  companyName?: string;
}

const CopyRight = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState<CopyrightContent | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content');
        const result = await response.json();

        if (result.success) {
          const data = result.data;
          const currentYear = new Date().getFullYear();
          const companyName = data['footer.companyName'] || 'ONSI Store';
          
          setContent({
            copyright: data['footer.copyright'] || `© ${currentYear} ${companyName}`,
            allRightsReserved: data['footer.allRightsReserved'] || t('footer_all_rights_reserved'),
            companyName: companyName
          });
        } else {
          // Fallback to translations
          setContent({
            copyright: t('footer_copyright'),
            allRightsReserved: t('footer_all_rights_reserved')
          });
        }
      } catch (error) {
        console.error('Error fetching copyright content:', error);
        // Fallback to translations
        setContent({
          copyright: t('footer_copyright'),
          allRightsReserved: t('footer_all_rights_reserved')
        });
      }
    };

    fetchContent();
  }, [t]);

  if (!content) {
    return (
      <div className="animate-pulse" suppressHydrationWarning>
        <div className="h-4 bg-gray-300 rounded w-32 mb-1"></div>
        <div className="h-4 bg-gray-300 rounded w-28"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center gap-[8px]" suppressHydrationWarning>
      <p className="text-center text-[clamp(14px,12px_+_0.5vw,16px)] font-medium text-veryDarkPurple">
        {content.copyright}
      </p>
      <p className="text-center text-[clamp(12px,10px_+_0.5vw,14px)] text-gray-600">
        {content.allRightsReserved}
      </p>
    </div>
  );
};

export default CopyRight;
