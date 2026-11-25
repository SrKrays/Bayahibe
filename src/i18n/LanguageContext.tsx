/**
 * Traducción de toda la web (misma idea que en JMO):
 * cada texto en español es a la vez la CLAVE y el texto por defecto.
 *   t('Súmate')  →  'Súmate' en español  ·  'Join us' en inglés
 * Si un texto no está en el diccionario, se muestra en español (nunca queda vacío).
 * Los textos en inglés viven en ./translations.ts.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { EN } from './translations';

export type Language = 'es' | 'en';

interface LanguageValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageValue | null>(null);
const STORAGE_KEY = 'bayahibe-lang';

function initialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') return saved;
  } catch {
    /* modo privado, etc. */
  }
  return 'es';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* sin almacenamiento: igual funciona en esta visita */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title =
      language === 'en' ? 'Bayahibe Verde · Guardians of Bayahibe' : 'Bayahibe Verde · Guardianes de Bayahibe';
  }, [language]);

  const t = useCallback(
    (text: string) => {
      if (language !== 'en') return text;
      if (import.meta.env.DEV && !(text in EN)) console.warn('[i18n] falta traducir:', text);
      return EN[text] ?? text;
    },
    [language],
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage debe usarse dentro de <LanguageProvider>');
  return ctx;
}
