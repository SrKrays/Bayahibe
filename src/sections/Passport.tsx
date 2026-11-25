/**
 * PASAPORTE VERDE · Guardián de Bayahibe
 * Pedido del cliente: que se entienda para qué sirve y qué se gana.
 * Cada misión cumplida = un sello. Pasaporte completo del mes = voucher
 * (estadía o experiencia) aportado por hoteles y comercios aliados.
 */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../i18n/LanguageContext';

const STAMPS = [
  'Aprendí a separar residuos',
  'Participé en una limpieza',
  'Planté una especie',
  'Reciclé',
  'Eliminé un plástico de un solo uso',
  'Aprendí sobre el arrecife',
  'Aprendí sobre manglares',
  'Protegí un animal',
  'Enseñé una acción ambiental a mi familia',
];

const HOW = [
  { title: 'Cada semana, una misión', text: 'La familia recibe una misión ambiental para hacer en casa.' },
  { title: 'Cada misión, un sello', text: 'La misión cumplida se marca con un sello en el pasaporte.' },
  {
    title: 'Pasaporte completo, premio',
    text: 'La familia que completa el pasaporte del mes gana un voucher: una estadía o experiencia en Bayahibe aportada por hoteles y comercios aliados.',
  },
];

export default function Passport() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);

  // los sellos se van "estampando" uno por uno al entrar en pantalla
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.passport__stamp',
        { scale: 1.8, autoAlpha: 0, rotate: -18 },
        {
          scale: 1,
          autoAlpha: 1,
          rotate: (i: number) => [-6, 4, -3, 7, -5, 3, -7, 5, -2][i % 9],
          duration: 0.35,
          ease: 'back.out(2)',
          stagger: 0.14,
          scrollTrigger: { trigger: ref.current, start: 'top 70%', once: true },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div className="passport" id="pasaporte" ref={ref} data-reveal>
      <div className="passport__book" aria-hidden="true">
        <div className="passport__cover">
          <span className="passport__kicker">{t('Pasaporte Verde')}</span>
          <strong>{t('Guardián de Bayahibe')}</strong>
          <span className="passport__month">{t('Mes')} · 1</span>
        </div>
        <ul className="passport__grid">
          {STAMPS.map((s) => (
            <li key={s}>
              <span className="passport__stamp">✓</span>
              <small>{t(s)}</small>
            </li>
          ))}
        </ul>
      </div>

      <div className="passport__text">
        <span className="passport__badge">{t('Premio mensual')}</span>
        <h3>{t('¿Qué es el Pasaporte Verde?')}</h3>
        <p className="passport__lead">
          {t(
            'Es la libreta de cada estudiante. Convierte el cuidado del ambiente en un juego en familia, con un premio de verdad.',
          )}
        </p>
        <ol className="passport__how">
          {HOW.map((h, i) => (
            <li key={h.title}>
              <span>{i + 1}</span>
              <div>
                <strong>{t(h.title)}</strong>
                <p>{t(h.text)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
