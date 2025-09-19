'use client';

import type { Language, TranslationContextType, TranslationResponse } from '@/types/translation';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

// Import the translation files
import arTranslations from '@/locales/ar.json';
import enTranslations from '@/locales/en.json';
import frTranslations from '@/locales/fr.json';

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

// Translation map for easy access
const translationsMap: Record<Language, TranslationResponse> = {
  en: enTranslations,
  fr: frTranslations,
  ar: arTranslations,
};

export function TranslationProvider({ children, defaultLanguage = 'en' }: TranslationProviderProps) {
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [translations, setTranslations] = useState<TranslationResponse>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load translations from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && ['fr', 'en', 'ar'].includes(savedLanguage)) {
        setLanguage(savedLanguage);
      }
      setIsInitialized(true);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      localStorage.setItem('language', language);
    }
  }, [language, isInitialized]);

  // Load translations when language changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const loadTranslations = () => {
      setIsLoading(true);
      console.log(`🔄 Loading translations for language: ${language}`);
      
      try {
        const selectedTranslations = translationsMap[language] || translationsMap.en;
        setTranslations(selectedTranslations);
        console.log(`✅ Loaded ${Object.keys(selectedTranslations).length} translations for ${language}`);
      } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback to English translations
        setTranslations(translationsMap.en);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language, isInitialized]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (translation) {
      return translation;
    }
    
    // Only show warnings if we're not loading and have completed initialization
    // This reduces noise during initial SSR/hydration
    if (!isLoading && isInitialized && Object.keys(translations).length > 0) {
      console.log(`⚠️ Missing translation for key: ${key} (language: ${language})`);
    }
    
    return key;
  };

  const value: TranslationContextType = {
    language,
    setLanguage,
    t,
    isLoading,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

// Helper hook for specific language translations
export function useTranslationWithLanguage(lang: Language) {
  const [translations, setTranslations] = useState<TranslationResponse>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadTranslations = () => {
      setIsLoading(true);
      try {
        const selectedTranslations = translationsMap[lang] || translationsMap.en;
        setTranslations(selectedTranslations);
      } catch (error) {
        console.error('Error loading translations:', error);
        setTranslations(translationsMap.en);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [lang]);

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return { t, isLoading, translations };
}
