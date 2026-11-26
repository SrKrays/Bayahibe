/** Cierre: llamado a sumarse + colaborar. El formulario real llega con el backend .NET. */
import { useRef } from 'react';
import { DonateButton } from '../components/Donate';
import { useLanguage } from '../i18n/LanguageContext';
import { useReveal } from './useReveal';

const WAYS = [
  { title: 'Soy una escuela', text: 'Formen su Brigada Ambiental y súmense a la rotación de jornadas.' },
  { title: 'Tengo un comercio u hotel', text: 'Patrocinio de materiales, puntos de depósito para reciclaje y premios para el Pasaporte Verde.' },
  { title: 'Quiero ser voluntario/a', text: 'Acompaña las jornadas y la Gran Jornada “Mi casa, mi mar”.' },
];

export default function Join() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section ref={ref} id="sumate" className="join">
      <div className="part__inner">
        <h2 className="join__title" data-reveal>
          {t('Bayahibe lo hace')} <em>{t('en comunidad.')}</em>
        </h2>
        <ul className="join__ways" data-reveal-group>
          {WAYS.map((w) => (
            <li key={w.title}>
              <a href="#sumate" className="join__card">
                <h3>{t(w.title)}</h3>
                <p>{t(w.text)}</p>
                <span className="join__arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="join__donate" data-reveal>
          <div>
            <h3>{t('¿Quieres ayudar desde donde estés?')}</h3>
            <p>{t('Tu aporte se convierte en guantes, bolsas y materiales para las brigadas escolares.')}</p>
          </div>
          <DonateButton variant="large" />
        </div>

        <footer className="foot" data-reveal>
          <span>MI CASA, MI MAR · {t('Guardianes de Bayahibe')}</span>
          <span>{t('Aprendemos a cuidar. Salimos a proteger. Bayahibe nos necesita.')}</span>
        </footer>
      </div>
    </section>
  );
}
