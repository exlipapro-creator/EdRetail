import { createContext, useContext, useState, ReactNode } from 'react';
import { Lang, I18nString } from '../types';

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (s: I18nString) => string;
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  t: (s) => s.en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const stored = (localStorage.getItem('edmark-lang') as Lang) || 'en';
  const [lang, setLangState] = useState<Lang>(stored);

  const setLang = (l: Lang) => {
    localStorage.setItem('edmark-lang', l);
    setLangState(l);
  };

  const t = (s: I18nString): string => s[lang];

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
