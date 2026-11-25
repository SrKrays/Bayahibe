/**
 * PARTE 1 · La idea y quiénes la llevan adelante.
 * Textos basados en el documento del programa "Bayahibe Verde".
 */
import { useRef } from 'react';
import { useReveal } from './useReveal';

const WHO = [
  {
    tag: 'Protagonistas',
    title: 'Escuelas, docentes y estudiantes',
    text: 'Cada curso forma una Brigada Ambiental Escolar: un docente coordinador, estudiantes, familias y voluntarios. Una estructura educativa, nunca política ni partidaria.',
  },
  {
    tag: 'Territorio',
    title: 'Junta Municipal de Bayahibe',
    text: 'Articula el programa en el distrito y facilita la logística de las jornadas: zonas, recolección y destino final de los residuos.',
  },
  {
    tag: 'Educación',
    title: 'Ministerio de Educación · Distrito 12-02',
    text: 'Coordina la incorporación del programa en los centros educativos de Bayahibe, dentro del Distrito Educativo de San Rafael del Yuma.',
  },
  {
    tag: 'Medio ambiente',
    title: 'Ministerio de Medio Ambiente',
    text: 'Socio técnico en residuos, biodiversidad y el vínculo con el Parque Nacional Cotubanamá, sumando la experiencia de EcoAcademia en la comunidad.',
  },
  {
    tag: 'Comunidad',
    title: 'Familias, comercios, hoteles y voluntarios',
    text: 'Porque el turismo de Bayahibe depende de un entorno sano, todos tienen un lugar: materiales, puntos de recolección, educación marina y manos.',
  },
];

const CHAIN = ['Escuela', 'Niño', 'Familia', 'Barrio'];

export default function Idea() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section ref={ref} id="idea" className="part part--idea">
      <div className="part__inner">
        <p className="eyebrow" data-reveal>
          <span className="eyebrow__num">01</span> La idea
        </p>

        <h2 className="part__title" data-reveal>
          Bayahibe no es solo el lugar donde vivimos.
          <em> Es un ecosistema que debemos cuidar.</em>
        </h2>

        <div className="idea__grid">
          <div className="idea__text" data-reveal-group>
            <p className="lead">
              <strong>Bayahibe Verde</strong> es un programa escolar permanente de educación ambiental, reciclaje y
              protección del entorno para el Distrito Municipal de Bayahibe, en La Altagracia.
            </p>
            <p>
              Bayahibe vive de su mar, de sus arrecifes y manglares, y está unido al Parque Nacional Cotubanamá.
              Cuando los residuos llegan a la costa, no solo se daña el paisaje: se daña la biodiversidad, el turismo y
              el trabajo de toda la comunidad.
            </p>
            <p>
              La propuesta es crear una <strong>cultura ambiental que nazca en las escuelas</strong>: formar a niños y
              adolescentes como agentes de cuidado del territorio y unir lo que aprenden en el aula con acciones
              concretas de limpieza, separación de residuos, reciclaje y protección de los ecosistemas costeros.
            </p>
          </div>

          <aside className="idea__quote" data-reveal>
            <p>“Un niño que aprende a cuidar su entorno se convierte en un adulto que protege su comunidad.”</p>
            <div className="chain" aria-label="Escuela, niño, familia, barrio">
              {CHAIN.map((c, i) => (
                <span key={c} className="chain__item">
                  {c}
                  {i < CHAIN.length - 1 && <span className="chain__arrow">→</span>}
                </span>
              ))}
            </div>
          </aside>
        </div>

        <h3 className="part__subtitle" data-reveal>
          ¿Quiénes lo hacen posible?
        </h3>
        <p className="part__intro" data-reveal>
          No es una iniciativa aislada. El programa propone unir a las instituciones que ya trabajan en el territorio
          con la fuerza de toda la comunidad.
        </p>

        <ul className="who" data-reveal-group>
          {WHO.map((w) => (
            <li key={w.title} className="who__card">
              <span className="who__tag">{w.tag}</span>
              <h4>{w.title}</h4>
              <p>{w.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
