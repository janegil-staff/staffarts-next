// src/i18n/index.jsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import no from "./locales/no.json";
import en from "./locales/en.json";
import nl from "./locales/nl.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import it from "./locales/it.json";
import sv from "./locales/sv.json";
import da from "./locales/da.json";
import fi from "./locales/fi.json";
import es from "./locales/es.json";
import pl from "./locales/pl.json";
import pt from "./locales/pt.json";

const LOCALES = { no, en, nl, fr, de, it, sv, da, fi, es, pl, pt };
const SUPPORTED = Object.keys(LOCALES);
const DEFAULT_LANG = "no";
const STORAGE_KEY = "appLang";

const I18nContext = createContext(null);

function detectBrowserLang() {
  if (typeof navigator === "undefined") return DEFAULT_LANG;
  const langs = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  for (const l of langs) {
    const code = String(l || "").slice(0, 2).toLowerCase();
    if (SUPPORTED.includes(code)) return code;
  }
  return DEFAULT_LANG;
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(DEFAULT_LANG);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let next = DEFAULT_LANG;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.includes(saved)) next = saved;
      else next = detectBrowserLang();
    } catch {
      next = detectBrowserLang();
    }
    setLang(next);
    setHydrated(true);
  }, []);

  const setLanguage = useCallback((next) => {
    if (!SUPPORTED.includes(next)) return;
    setLang(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  const t = useCallback(
    (key, vars) => {
      const dict = LOCALES[lang] || LOCALES[DEFAULT_LANG];
      const enDict = LOCALES.en;
      let value = dict?.[key] ?? enDict?.[key] ?? key;
      if (vars && typeof value === "string") {
        for (const [k, v] of Object.entries(vars)) {
          value = value.replaceAll(`{${k}}`, String(v));
        }
      }
      return value;
    },
    [lang],
  );

  const value = useMemo(
    () => ({ t, lang, setLanguage, hydrated, supported: SUPPORTED }),
    [t, lang, setLanguage, hydrated],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      t: (key) => key,
      lang: DEFAULT_LANG,
      setLanguage: () => {},
      hydrated: false,
      supported: SUPPORTED,
    };
  }
  return ctx;
}
