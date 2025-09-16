'use client';

import type { Language, TranslationContextType, TranslationResponse } from '@/types/translation';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export function TranslationProvider({ children, defaultLanguage = 'en' }: TranslationProviderProps) {
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [translations, setTranslations] = useState<TranslationResponse>({});
  const [isLoading, setIsLoading] = useState(true);
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

  // Fetch translations when language changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const fetchTranslations = async () => {
      setIsLoading(true);
      console.log(`🔄 Fetching translations for language: ${language}`);
      
      try {
        const timestamp = Date.now(); // Add timestamp for cache busting
        const response = await fetch(`/api/translations?language=${language}&t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setTranslations(data);
          console.log(`✅ Loaded ${Object.keys(data).length} translations for ${language}`);
          
          // Debug: log some key translations including auth keys
          const debugKeys = ['hero_title', 'promo_title', 'about_title', 'auth_sign_in', 'auth_create_new_account', 'common_or', 'auth_demo_credentials'];
          debugKeys.forEach(key => {
            if (data[key]) {
              console.log(`🔍 ${key}: "${data[key]}"`);
            } else {
              console.warn(`⚠️ Missing translation for debug key: ${key}`);
            }
          });
        } else {
          console.error('Failed to fetch translations:', response.status, response.statusText);
          // Fallback to empty object but don't reset existing translations
          if (Object.keys(translations).length === 0) {
            setTranslations({});
          }
        }
      } catch (error) {
        console.error('Error fetching translations:', error);
        // Fallback to empty object but don't reset existing translations
        if (Object.keys(translations).length === 0) {
          setTranslations({});
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTranslations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/translations?language=${lang}`);
        if (response.ok) {
          const data = await response.json();
          setTranslations(data);
        } else {
          console.error('Failed to fetch translations:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();
  }, [lang]);

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return { t, isLoading, translations };
}
