import Hero from './hero/Hero';
import Goal from './sections/Goal';
import Idea from './sections/Idea';
import Process from './sections/Process';
import Join from './sections/Join';
import SiteNav from './components/SiteNav';
import { DonateProvider } from './components/Donate';
import { LanguageProvider } from './i18n/LanguageContext';
import './sections/sections.css';

export default function App() {
  return (
    <LanguageProvider>
      <DonateProvider>
        <SiteNav />
        <main>
          <Hero />
          {/* 01 · el objetivo: cómo se logra, de un vistazo */}
          <Goal />
          {/* 02 · qué es y quiénes */}
          <Idea />
          {/* 03 · paso a paso (con chips clickeables y Pasaporte Verde) */}
          <Process />
          <Join />
        </main>
      </DonateProvider>
    </LanguageProvider>
  );
}
