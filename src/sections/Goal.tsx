/**
 * EL OBJETIVO · cómo se logra, de un vistazo.
 * Un ciclo de 4 pasos que se repite cada semana + las metas del primer año.
 * Poco texto: la idea se entiende mirando el recorrido.
 */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../i18n/LanguageContext';
import { useReveal } from './useReveal';

const STEPS = [
  { key: 'learn', title: 'Aprender', text: 'Las escuelas enseñan a separar, reducir y cuidar el mar.' },
  { key: 'act', title: 'Actuar', text: 'Una jornada de limpieza por semana, rotando entre escuelas.' },
  { key: 'measure', title: 'Medir', text: 'Cada kilo se pesa y se publica: el avance se ve.' },
  { key: 'spread', title: 'Contagiar', text: 'Los niños llevan la misión a casa y las familias ganan premios.' },
] as const;

const GOALS = [
  { big: '100%', text: 'de las escuelas con su brigada ambiental' },
  { big: '1', text: 'acción ambiental por semana en cada escuela' },
  { big: '1', text: 'gran jornada comunitaria por mes' },
  { big: '3', text: 'meses entre cada informe público de resultados' },
];

export default function Goal() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  // el ciclo se "dibuja" al entrar en pantalla: línea + pasos uno por uno
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.cycle', start: 'top 75%', once: true } });
      tl.fromTo('.cycle__line-fill', { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'power2.inOut' })
        .fromTo(
          '.cycle__step',
          { autoAlpha: 0, y: 30, scale: 0.92 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.6)', stagger: 0.32 },
          0.1,
        )
        .fromTo('.cycle__loop', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, '>-0.1')
        .fromTo('.cycle__result', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7 }, '>-0.2');
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="objetivo" className="part part--goal">
      <div className="part__inner">
        <p className="eyebrow" data-reveal>
          <span className="eyebrow__num">01</span> {t('El objetivo')}
        </p>
        <h2 className="part__title" data-reveal>
          {t('Que cuidar Bayahibe')} <em>{t('se vuelva costumbre.')}</em>
        </h2>
        <p className="part__intro" data-reveal>
          {t('No es una limpieza: es un ciclo que se repite cada semana, escuela por escuela.')}
        </p>

        <div className="cycle">
          <span className="cycle__line" aria-hidden="true">
            <span className="cycle__line-fill" />
            <span className="cycle__runner" />
          </span>
          <ol className="cycle__steps">
            {STEPS.map((s, i) => (
              <li key={s.key} className="cycle__step">
                <span className="cycle__icon" aria-hidden="true">
                  <StepIcon name={s.key} />
                  <span className="cycle__num">{i + 1}</span>
                </span>
                <h3>{t(s.title)}</h3>
                <p>{t(s.text)}</p>
              </li>
            ))}
          </ol>
          <p className="cycle__loop" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M18 2.5v4.5h-4.5M6 21.5V17h4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t('y vuelve a empezar, cada semana')}
          </p>

          <div className="cycle__result">
            <span className="cycle__result-label">{t('El resultado')}</span>
            <p>{t('Un Bayahibe más limpio, con datos que lo demuestran y cuidado por su propia gente.')}</p>
          </div>
        </div>

        <ul className="goals" data-reveal-group>
          {GOALS.map((g) => (
            <li key={g.text}>
              <strong>{g.big}</strong>
              <span>{t(g.text)}</span>
            </li>
          ))}
        </ul>
        <p className="goals__note" data-reveal>
          {t('Metas del primer año del programa.')}
        </p>
      </div>
    </section>
  );
}

function StepIcon({ name }: { name: string }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'learn': // libro
      return (
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path {...p} d="M3 5.5c3-1.5 6-1.5 9 .5 3-2 6-2 9-.5v13c-3-1.5-6-1.5-9 .5-3-2-6-2-9-.5z" />
          <path {...p} d="M12 6v13" />
        </svg>
      );
    case 'act': // mano con bolsa
      return (
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path {...p} d="M6 8h12l-1.2 12.2a1 1 0 0 1-1 .8H8.2a1 1 0 0 1-1-.8z" />
          <path {...p} d="M9 8a3 3 0 0 1 6 0M10 12v5M14 12v5" />
        </svg>
      );
    case 'measure': // gráfico
      return (
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path {...p} d="M4 20V4M4 20h16" />
          <path {...p} d="M8 16v-4M12 16V8M16 16v-6M20 7l-4 3-4-3-4 4" />
        </svg>
      );
    default: // casa con corazón
      return (
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path {...p} d="M3 11 12 4l9 7v9H3z" />
          <path {...p} d="M12 17s-3-1.8-3-3.7c0-1 .8-1.8 1.7-1.8.6 0 1 .3 1.3.7.3-.4.7-.7 1.3-.7 1 0 1.7.8 1.7 1.8 0 1.9-3 3.7-3 3.7z" />
        </svg>
      );
  }
}
