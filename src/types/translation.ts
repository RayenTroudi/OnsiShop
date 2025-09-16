export type Language = 'fr' | 'en' | 'ar';

export interface Translation {
  id: string;
  key: string;
  language: Language;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TranslationRequest {
  key: string;
  language: Language;
  text: string;
}

export interface TranslationResponse {
  [key: string]: string;
}

export interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}
