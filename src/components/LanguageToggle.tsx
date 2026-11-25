/**
 * Selector ES / EN (pastilla con el activo en turquesa, como en JMO) +
 * burbuja con flecha animada la primera vez, para que se note que existe.
 * La burbuja desaparece al usarlo o al cerrarla, y no vuelve a salir.
 */
import { useEffect, useState } from 'react';
import { useLanguage, type Language } from '../i18n/LanguageContext';
import './languageToggle.css';

const HINT_KEY = 'bayahibe-lang-hint-seen';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [showHint, setShowHint] = useState(false);
  const [atTop, setAtTop] = useState(true);

  // el aviso sólo se muestra sobre el hero: al bajar no tapa el contenido
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < window.innerHeight * 0.5);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(HINT_KEY) === '1';
    } catch {
      /* ignorar */
    }
    if (seen) return;
    // aparece cuando ya se leyó el logo y la intro empezó
    const show = window.setTimeout(() => setShowHint(true), 1800);
    // si no lo usan, se va solo (y no vuelve a molestar)
    const hide = window.setTimeout(() => dismiss(), 16000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    setShowHint(false);
    try {
      localStorage.setItem(HINT_KEY, '1');
    } catch {
      /* ignorar */
    }
  };

  const choose = (lang: Language) => {
    setLanguage(lang);
    dismiss();
  };

  const options: { value: Language; label: string; title: string }[] = [
    { value: 'es', label: 'ES', title: 'Español' },
    { value: 'en', label: 'EN', title: 'English' },
  ];

  return (
    <div className="lang">
      <div className="lang-toggle" role="group" aria-label="Idioma / Language">
        <span className="lang-toggle__thumb" data-pos={language === 'en' ? 'right' : 'left'} aria-hidden="true" />
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            title={o.title}
            aria-pressed={language === o.value}
            className={language === o.value ? 'is-active' : ''}
            onClick={() => choose(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>

      {showHint && atTop && (
        <div className="lang-hint" role="note">
          <svg className="lang-hint__arrow" viewBox="0 0 40 46" aria-hidden="true">
            <path d="M8 44 C 10 24, 22 14, 32 8" />
            <path d="M22 6 L33 7 L30 18" />
          </svg>
          <button type="button" className="lang-hint__body" onClick={() => choose(language === 'es' ? 'en' : 'es')}>
            <span className="lang-hint__flag" aria-hidden="true">
              🌐
            </span>
            {language === 'es' ? (
              <span>
                <strong>Read in English</strong>
                <small>Tap EN to translate the site</small>
              </span>
            ) : (
              <span>
                <strong>Ver en español</strong>
                <small>Toca ES para traducir</small>
              </span>
            )}
          </button>
          <button type="button" className="lang-hint__close" aria-label="Cerrar / Close" onClick={dismiss}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
