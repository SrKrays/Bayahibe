/** Cierre: llamado a sumarse. El formulario real llega con el backend .NET. */
import { useRef } from 'react';
import { useReveal } from './useReveal';

const WAYS = [
  { title: 'Soy una escuela', text: 'Formen su Brigada Ambiental y súmense a la rotación de jornadas.' },
  { title: 'Tengo un comercio u hotel', text: 'Patrocinio de materiales, puntos de recolección y menos plástico.' },
  { title: 'Quiero ser voluntario/a', text: 'Acompaña las jornadas y la Gran Jornada Bayahibe Verde.' },
];

export default function Join() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section ref={ref} id="sumate" className="join">
      <div className="part__inner">
        <h2 className="join__title" data-reveal>
          Bayahibe lo hace <em>en comunidad.</em>
        </h2>
        <ul className="join__ways" data-reveal-group>
          {WAYS.map((w) => (
            <li key={w.title}>
              <a href="#sumate" className="join__card">
                <h3>{w.title}</h3>
                <p>{w.text}</p>
                <span className="join__arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
        <footer className="foot" data-reveal>
          <span>BAYAHIBE VERDE · Guardianes de Bayahibe</span>
          <span>Aprendemos a cuidar. Salimos a proteger. Bayahibe nos necesita.</span>
        </footer>
      </div>
    </section>
  );
}
