/**
 * PARTE 2 · Cómo cambiamos todo, poco a poco.
 * Las etapas del programa como una línea que se dibuja con el scroll.
 */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReveal } from './useReveal';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    when: '4 semanas',
    title: 'Aprender antes de salir',
    text: 'Antes de recoger un solo residuo, cada escuela hace un ciclo corto: conocer Bayahibe, entender a dónde va la basura y qué le hace el plástico al mar.',
    items: ['Conozcamos Bayahibe', '¿A dónde va la basura?', 'El plástico y el mar', 'Somos guardianes de Bayahibe'],
  },
  {
    when: 'Cada semana',
    title: 'Un colegio, una jornada',
    text: 'Una jornada por semana con sistema rotativo: todas las escuelas participan sin sobrecargar a docentes ni estudiantes. Con protocolo de seguridad infantil en cada salida.',
    items: ['Entorno escolar', 'Espacios comunitarios', 'Reciclables', 'Limpieza costera controlada'],
  },
  {
    when: 'En casa',
    title: 'La misión llega a la familia',
    text: 'Cada semana, una “Misión ambiental en familia” y un Pasaporte Verde para cada estudiante. El aprendizaje sale del aula y entra a cada hogar.',
    items: ['Separar botellas y latas', 'Menos bolsas plásticas', 'Cuidar el frente de casa', 'Enseñar a un adulto'],
  },
  {
    when: 'Cada jornada',
    title: 'Medir lo que hacemos',
    text: 'Cada jornada registra participantes, kilos recuperados por tipo y su destino final. Con esos datos nace el Índice Ambiental Escolar de Bayahibe y un informe público periódico.',
    items: ['Kg recuperados', 'Kg reciclables', 'Estudiantes participantes', 'Actividades educativas'],
  },
  {
    when: 'Cada mes',
    title: 'Toda la comunidad',
    text: 'Hoteles, restaurantes, comercios y operadores turísticos se suman al cuidado del destino. Una vez al mes, la Gran Jornada Bayahibe Verde reúne a todos.',
    items: ['Hoteles', 'Comercios', 'Operadores turísticos', 'Voluntarios'],
  },
];

export default function Process() {
  const ref = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  useReveal(ref);

  // la línea vertical se "dibuja" a medida que se avanza por las etapas
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.steps', start: 'top 70%', end: 'bottom 70%', scrub: 0.6 },
        },
      );
      gsap.utils.toArray<HTMLElement>('.step').forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 70%',
          onEnter: () => step.classList.add('is-on'),
          onLeaveBack: () => step.classList.remove('is-on'),
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="programa" className="part part--process">
      <div className="part__inner">
        <p className="eyebrow" data-reveal>
          <span className="eyebrow__num">02</span> Cómo lo cambiamos
        </p>

        <h2 className="part__title" data-reveal>
          Poco a poco.
          <em> Escuela por escuela, semana a semana.</em>
        </h2>
        <p className="part__intro" data-reveal>
          El cambio no llega con una sola limpieza. Llega cuando cuidar se vuelve costumbre. Por eso el programa avanza
          en etapas: primero aprender, después actuar, medir los resultados y sumar a toda la comunidad.
        </p>

        <ol className="steps">
          <span className="steps__line" aria-hidden="true">
            <span ref={lineRef} className="steps__line-fill" />
          </span>
          {STEPS.map((s, i) => (
            <li key={s.title} className="step" data-reveal>
              <span className="step__dot" aria-hidden="true">
                {i + 1}
              </span>
              <div className="step__body">
                <span className="step__when">{s.when}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <ul className="step__items">
                  {s.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>

        <div className="safety" data-reveal>
          <p className="safety__label">Seguridad ante todo</p>
          <p className="safety__rule">
            No tocar <span>→</span> Aislar el área <span>→</span> Avisar al adulto responsable
          </p>
          <p className="safety__text">
            Los estudiantes participan siempre en zonas inspeccionadas, con autorización de sus familias, adultos
            responsables, guantes, hidratación y protección solar. Los residuos peligrosos los manejan solo adultos.
          </p>
        </div>
      </div>
    </section>
  );
}
