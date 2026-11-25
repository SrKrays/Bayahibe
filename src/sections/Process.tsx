/**
 * PARTE · Paso a paso.
 * Las etapas del programa como una línea que se dibuja con el scroll.
 * Cada chip se puede tocar y abre una explicación corta y didáctica
 * (pedido del cliente: "clicable, algo simple pero didáctico").
 */
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../i18n/LanguageContext';
import { useReveal } from './useReveal';
import Passport from './Passport';

gsap.registerPlugin(ScrollTrigger);

interface Chip {
  label: string;
  info: string;
}

interface Step {
  when: string;
  title: string;
  text: string;
  chips: Chip[];
  passportLink?: boolean;
}

const STEPS: Step[] = [
  {
    when: '4 semanas',
    title: 'Aprender antes de salir',
    text: 'Antes de recoger un solo residuo, cada escuela hace un ciclo corto: conocer Bayahibe, entender a dónde va la basura y qué le hace el plástico al mar.',
    chips: [
      {
        label: 'Conozcamos Bayahibe',
        info: 'Bayahibe vive del mar: playas, arrecifes, manglares y el Parque Nacional Cotubanamá. Los niños descubren qué hace único a su pueblo y por qué el turismo depende de que esté limpio. Al final dibujan "Así quiero ver Bayahibe dentro de 20 años".',
      },
      {
        label: '¿A dónde va la basura?',
        info: 'Lo que se tira en la calle no desaparece: el viento y la lluvia lo arrastran a cañadas, playas y al mar. Lo que se separa en casa puede reciclarse. La regla que aprenden: Reducir → Reutilizar → Separar → Reciclar.',
      },
      {
        label: 'El plástico y el mar',
        info: 'El plástico no se degrada: se rompe en pedazos cada vez más pequeños (microplásticos) que terminan en peces, tortugas y aves. Por eso el primer paso es evitar los plásticos de un solo uso: bolsas, sorbetes y vasos.',
      },
      {
        label: 'Somos guardianes de Bayahibe',
        info: 'Cada curso forma su Brigada Ambiental: un docente, los estudiantes, familias y voluntarios. Reciben guantes, bolsas, pinzas, chalecos, botiquín y planillas. Los Guardianes de Bayahibe son los niños que se ocupan de cuidar su pueblo.',
      },
    ],
  },
  {
    when: 'Cada semana',
    title: 'Un colegio, una jornada',
    text: 'Una jornada por semana con sistema rotativo: todas las escuelas participan sin sobrecargar a docentes ni estudiantes. Con protocolo de seguridad infantil en cada salida.',
    chips: [
      {
        label: 'Entorno escolar',
        info: 'La primera salida es a la escuela y sus alrededores: cerca, segura y fácil de organizar. Los niños ven el cambio en el lugar donde pasan el día.',
      },
      {
        label: 'Espacios comunitarios',
        info: 'Plazas, calles y canchas del barrio. Antes de cada jornada, un adulto recorre e inspecciona la zona.',
      },
      {
        label: 'Reciclables',
        info: 'Jornadas para recuperar botellas, latas y cartón y llevarlos a reciclaje. Todo se pesa y se registra.',
      },
      {
        label: 'Limpieza costera controlada',
        info: 'La playa, con supervisión y sólo en zonas seguras. Los residuos peligrosos (vidrios, jeringas, químicos) los manejan únicamente adultos.',
      },
    ],
  },
  {
    when: 'En casa',
    title: 'La misión llega a la familia',
    text: 'Cada semana, una "Misión ambiental en familia" y un Pasaporte Verde para cada estudiante. El aprendizaje sale del aula y entra a cada hogar.',
    passportLink: true,
    chips: [
      {
        label: 'Separar botellas y latas',
        info: 'Misión de la semana: armar en casa un rincón para botellas y latas, separadas del resto de la basura.',
      },
      {
        label: 'Menos bolsas plásticas',
        info: 'Misión de la semana: usar cinco bolsas plásticas menos. Bolsa de tela, mochila o caja: todo vale.',
      },
      {
        label: 'Cuidar el frente de casa',
        info: 'Misión de la semana: limpiar el frente de la vivienda junto a la familia y mantenerlo así.',
      },
      {
        label: 'Enseñar a un adulto',
        info: 'Misión de la semana: explicarle a un adulto por qué no hay que tirar basura en la calle. El niño enseña: la familia aprende.',
      },
    ],
  },
  {
    when: 'Cada jornada',
    title: 'Medir lo que hacemos',
    text: 'Cada jornada registra participantes, kilos recuperados por tipo y su destino final. Con esos datos nace el Índice Ambiental Escolar de Bayahibe y un informe público periódico.',
    chips: [
      {
        label: 'Kg recuperados',
        info: 'Todo lo que se junta se pesa. El total de cada mes se publica para que todo Bayahibe vea el avance.',
      },
      {
        label: 'Kg reciclables',
        info: 'Se registra aparte lo que puede reciclarse: plástico, vidrio, metal y cartón, y a dónde se llevó.',
      },
      {
        label: 'Estudiantes participantes',
        info: 'Cuántos niños participan en cada jornada. Que se sumen más es tan importante como juntar más.',
      },
      {
        label: 'Actividades educativas',
        info: 'Charlas, talleres y misiones también cuentan. En el Reto Escuelas Verdes no gana quien junta más basura: se suman los cuatro indicadores.',
      },
    ],
  },
  {
    when: 'Cada mes',
    title: 'Toda la comunidad',
    text: 'Hoteles, restaurantes, comercios y operadores turísticos se suman al cuidado del destino. Una vez al mes, la Gran Jornada Bayahibe Verde reúne a todos.',
    chips: [
      {
        label: 'Hoteles',
        info: 'Patrocinan materiales y aportan los premios del Pasaporte Verde, como estadías para las familias.',
      },
      {
        label: 'Comercios',
        info: 'Se convierten en puntos de depósito para reciclaje y reducen el plástico de un solo uso.',
      },
      {
        label: 'Operadores turísticos',
        info: 'Comparten lo que saben del mar: charlas de educación marina para las escuelas.',
      },
      {
        label: 'Voluntarios',
        info: 'Acompañan las jornadas y la Gran Jornada mensual, donde los adultos se ocupan de las tareas de riesgo.',
      },
    ],
  },
];

export default function Process() {
  const { t } = useLanguage();
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
          <span className="eyebrow__num">03</span> {t('Cómo lo cambiamos')}
        </p>

        <h2 className="part__title" data-reveal>
          {t('Paso a paso.')}
          <em> {t('Escuela por escuela, semana a semana.')}</em>
        </h2>
        <p className="part__intro" data-reveal>
          {t(
            'El cambio no llega con una sola limpieza. Llega cuando cuidar se vuelve costumbre. Por eso el programa avanza en etapas: primero aprender, después actuar, medir los resultados y sumar a toda la comunidad.',
          )}
        </p>
        <p className="steps__tip" data-reveal>
          <span aria-hidden="true">👆</span> {t('Toca cada tema para saber más')}
        </p>

        <ol className="steps">
          <span className="steps__line" aria-hidden="true">
            <span ref={lineRef} className="steps__line-fill" />
          </span>
          {STEPS.map((s, i) => (
            <StepItem key={s.title} step={s} index={i} />
          ))}
        </ol>

        <Passport />

        <div className="safety" data-reveal>
          <p className="safety__label">{t('Seguridad ante todo')}</p>
          <p className="safety__rule">
            {t('No tocar')} <span>→</span> {t('Aislar el área')} <span>→</span> {t('Avisar al adulto responsable')}
          </p>
          <p className="safety__text">
            {t(
              'Los estudiantes participan siempre en zonas inspeccionadas, con autorización de sus familias, adultos responsables, guantes, hidratación y protección solar. Los residuos peligrosos los manejan solo adultos.',
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

function StepItem({ step, index }: { step: Step; index: number }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const chip = open === null ? null : step.chips[open];

  // el panel se abre con una animación de altura (sin saltos)
  useEffect(() => {
    if (!panelRef.current || open === null) return;
    gsap.fromTo(panelRef.current, { height: 0, autoAlpha: 0 }, { height: 'auto', autoAlpha: 1, duration: 0.4, ease: 'power2.out' });
  }, [open]);

  const panelId = `step-${index}-info`;

  return (
    <li className="step" data-reveal>
      <span className="step__dot" aria-hidden="true">
        {index + 1}
      </span>
      <div className="step__body">
        <span className="step__when">{t(step.when)}</span>
        <h3>{t(step.title)}</h3>
        <p>{t(step.text)}</p>
        <ul className="step__items">
          {step.chips.map((c, ci) => (
            <li key={c.label}>
              <button
                type="button"
                className={open === ci ? 'is-open' : ''}
                aria-expanded={open === ci}
                aria-controls={panelId}
                onClick={() => setOpen((o) => (o === ci ? null : ci))}
              >
                {t(c.label)}
                <span className="step__plus" aria-hidden="true" />
              </button>
            </li>
          ))}
          {step.passportLink && (
            <li>
              <a className="step__passport-link" href="#pasaporte">
                {t('¿Qué es el Pasaporte Verde?')} →
              </a>
            </li>
          )}
        </ul>
        {chip && (
          <div className="step__info" id={panelId} ref={panelRef} role="region" aria-label={t(chip.label)}>
            <div className="step__info-inner">
              <strong>{t(chip.label)}</strong>
              <p>{t(chip.info)}</p>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
