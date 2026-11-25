/**
 * Barra superior fija: transparente sobre el hero y sólida al bajar.
 * Así el idioma y "Colaborar" quedan siempre a mano.
 */
import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DonateButton } from './Donate';
import LanguageToggle from './LanguageToggle';
import './siteNav.css';

export default function SiteNav() {
  const { t } = useLanguage();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-nav${solid ? ' is-solid' : ''}`}>
      <a href="#" className="site-nav__logo" aria-label="Bayahibe Verde">
        <LeafIcon />
        <span>
          BAYAHIBE
          <br />
          <em>VERDE</em>
        </span>
      </a>
      <nav className="site-nav__links" aria-label={t('Secciones')}>
        <a href="#objetivo">{t('El objetivo')}</a>
        <a href="#idea">{t('La idea')}</a>
        <a href="#programa">{t('Cómo lo hacemos')}</a>
        <a href="#sumate">{t('Súmate')}</a>
      </nav>
      <div className="site-nav__actions">
        <LanguageToggle />
        <DonateButton variant="nav" />
      </div>
    </header>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 32 32" width="40" height="40" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="#1fb5b0" />
      <path
        d="M22.5 8.5c-7 .3-12 4.3-12 10.4 0 1.5.4 2.8 1.1 3.8M22.5 8.5c.4 7.6-3.7 13.4-9.8 13.4-.9 0-1.6-.1-2.3-.4M22.5 8.5 11.6 22.7"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
