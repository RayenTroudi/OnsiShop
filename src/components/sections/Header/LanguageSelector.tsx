'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import type { Language } from '@/types/translation';
import { useEffect, useState } from 'react';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

export default function HeaderLanguageSelector() {
  const [mounted, setMounted] = useState(false);
  
  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use fallback during SSR or before hydration
  if (!mounted) {
    return (
      <div className="relative group flex h-full items-center justify-center">
        <button 
          className="flex h-full items-center justify-center [&>*]:transition-all [&>*]:duration-300 hover:[&>*]:opacity-50" 
          title="Language Selector"
        >
          <div className="relative w-9 h-9 flex items-center justify-center">
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 32 32" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="transition-all duration-300"
            >
              <circle cx="16" cy="16" r="14" stroke="#000000" strokeWidth="1" fill="none"/>
              <path d="M2 16h28M16 2a14 14 0 0 1 0 28 14 14 0 0 1 0-28" stroke="#000000" strokeWidth="1" fill="none"/>
              <path d="M16 2c3.866 0 7 6.268 7 14s-3.134 14-7 14-7-6.268-7-14 3.134-14 7-14" stroke="#000000" strokeWidth="1" fill="none"/>
            </svg>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border border-gray-300 flex items-center justify-center text-xs">
              🇫🇷
            </div>
          </div>
        </button>
      </div>
    );
  }

  return <LanguageSelectorContent />;
}

function LanguageSelectorContent() {
  const { language, setLanguage } = useTranslation();

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="relative group flex h-full items-center justify-center">
      <button 
        className="flex h-full items-center justify-center [&>*]:transition-all [&>*]:duration-300 hover:[&>*]:opacity-50" 
        title={`Current Language: ${currentLanguage?.nativeName}`}
      >
        {/* Globe icon with current language flag overlay */}
        <div className="relative w-9 h-9 flex items-center justify-center">
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 32 32" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="transition-all duration-300"
          >
            <circle cx="16" cy="16" r="14" stroke="#000000" strokeWidth="1" fill="none"/>
            <path d="M2 16h28M16 2a14 14 0 0 1 0 28 14 14 0 0 1 0-28" stroke="#000000" strokeWidth="1" fill="none"/>
            <path d="M16 2c3.866 0 7 6.268 7 14s-3.134 14-7 14-7-6.268-7-14 3.134-14 7-14" stroke="#000000" strokeWidth="1" fill="none"/>
          </svg>
          {/* Current language flag overlay */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border border-gray-300 flex items-center justify-center text-xs">
            {currentLanguage?.flag}
          </div>
        </div>
      </button>
      
      {/* Dropdown Menu */}
      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-200">
        <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
          <div className="font-medium">Choose Language</div>
        </div>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
              language === lang.code
                ? 'bg-blue-50 text-blue-900'
                : 'text-gray-700'
            }`}
          >
            <span className="mr-3 text-lg" role="img" aria-label={lang.name}>
              {lang.flag}
            </span>
            <div className="flex-1">
              <div className="font-medium">{lang.nativeName}</div>
              <div className="text-xs text-gray-500">{lang.name}</div>
            </div>
            {language === lang.code && (
              <div className="ml-2">
                <svg
                  className="h-4 w-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
