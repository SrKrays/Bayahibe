/**
 * Hero
 * ------------------------------------------------------------
 * - Monta la escena Pixi (HeroScene).
 * - Una única timeline de GSAP recorre los 4 actos de forma AUTOMÁTICA
 *   (sin depender del scroll). Los puntos de abajo permiten saltar de acto.
 * - Los textos son HTML encima del canvas: nítidos, accesibles y buenos para SEO.
 */
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { HeroScene } from './HeroScene';
import { TIMING } from './config';
import { useLanguage } from '../i18n/LanguageContext';
import './hero.css';

type Act = 1 | 2 | 3 | 4;

const ACT_COPY: Record<Exclude<Act, 1>, { title: string; sub: string }> = {
  2: { title: 'Esto no es el futuro. Es hoy.', sub: 'Bayahibe, República Dominicana.' },
  3: { title: 'Si no hacemos nada.', sub: 'Escenario ilustrativo · 2036' },
  4: { title: 'Bayahibe nos necesita.', sub: 'Aprendemos a cuidar. Salimos a proteger.' },
};

const INTRO_WORD = 'Bayahibe';

export default function Hero() {
  const { t, language } = useLanguage();
  // la timeline vive fuera de React: lee siempre la traducción actual por esta ref
  const tRef = useRef(t);
  tRef.current = t;
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [act, setAct] = useState<Act>(1);
  const [finished, setFinished] = useState(false);
  const [rewinding, setRewinding] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const stage = stageRef.current!;
    const section = sectionRef.current!;
    let scene: HeroScene | null = null;
    let cancelled = false;
    const ctx = gsap.context(() => {}, section);

    // Pixi se descarga aparte: la página (y la foto de fondo) se pintan antes
    import('./HeroScene')
      .then(({ HeroScene }) => HeroScene.create(stage))
      .then((s) => {
        if (cancelled) return s.destroy();
        scene = s;
        const st = s.state;

        // las texturas de los actos 2-4 bajan mientras se lee la intro
        let restReady = false;
        const restPromise = s.loadRest().then(() => {
          restReady = true;
        });

        // la intro se escribe con la fuente de pincel: esperamos a que esté (máx. 1.5 s)
        const fontReady = Promise.race([
          document.fonts.load('230px "Kaushan Script"', INTRO_WORD),
          new Promise((r) => setTimeout(r, 1500)),
        ]);

        fontReady.then(() => {
          if (cancelled) return;
          ctx.add(() => {
            /** Contador del time-lapse: número + leyenda + estilo (días, años, rebobinar, hoy). */
            const lapseEl = section.querySelector<HTMLElement>('.lapse');
            const labelEl = section.querySelector<HTMLElement>('.lapse__label');
            const setNum = (v: number | string) => {
              if (counterRef.current)
                counterRef.current.textContent = typeof v === 'string' ? tRef.current(v) : String(v);
            };
            const setCounter = (num: string, label: string, mode: string) => {
              setNum(num);
              if (labelEl) labelEl.textContent = tRef.current(label);
              if (lapseEl) lapseEl.dataset.label = label; // para re-traducir si cambian el idioma a mitad
              if (lapseEl) lapseEl.dataset.mode = mode;
            };

            const T = TIMING.transition;
            const tl = gsap.timeline({ delay: TIMING.introDelay });
            tlRef.current = tl;

            /** Si la red es lenta, la timeline espera a las texturas en vez de romperse. */
            const waitForTextures = () => {
              if (restReady) return;
              tl.pause();
              restPromise.then(() => tl.play());
            };

            // ================= ACTO 1 · introducción "escrita a mano" =================
            // 1) se dibuja el contorno del trazo  2) la tinta rellena detrás del trazo
            // 3) un subrayado de pincel  4) la bajada sube línea por línea
            tl.addLabel('act1')
              .fromTo('.intro__shade', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: 'power1.out' })
              .fromTo(
                '.intro__eyebrow',
                { autoAlpha: 0, letterSpacing: window.innerWidth < 640 ? '0.4em' : '0.6em' },
                {
                  autoAlpha: 1,
                  letterSpacing: window.innerWidth < 640 ? '0.14em' : '0.26em',
                  duration: 1.2,
                  ease: 'power3.out',
                },
                '<',
              )
              .fromTo(
                '.intro__stroke',
                { strokeDashoffset: 2000, autoAlpha: 1 },
                { strokeDashoffset: 0, duration: 2.0, ease: 'power1.inOut' },
                '-=0.7',
              )
              .fromTo(
                '.intro__ink',
                { attr: { width: 0 } },
                { attr: { width: 1200 }, duration: 1.7, ease: 'power2.inOut' },
                '<0.45',
              )
              .to('.intro__stroke', { autoAlpha: 0.35, duration: 0.6 }, '>-0.3')
              .fromTo(
                '.intro__swash',
                { strokeDashoffset: 1 },
                { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out' },
                '<-0.2',
              )
              .fromTo(
                '.intro__lead-line',
                { autoAlpha: 0, yPercent: 60 },
                { autoAlpha: 1, yPercent: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15 },
                '<0.1',
              )
              .to({}, { duration: TIMING.introHold })
              .to('.intro', { autoAlpha: 0, y: -24, duration: 0.7, ease: 'power2.in' })
              .to('.intro__shade', { autoAlpha: 0, duration: 0.9, ease: 'power1.inOut' }, '<')

              // ================= 1 → 2 · TIME-LAPSE DE DÍAS =================
              // pasan los días en segundos: noches, nubes corriendo y la basura
              // apareciendo de a tandas. El contador muestra el tiempo que pasa.
              .addLabel('to2')
              .call(waitForTextures)
              .call(() => setCounter('1', 'días sin cuidarlo', 'days'))
              .fromTo('.lapse', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 'to2')
              .to(st, { intro: 1, duration: TIMING.lapse, ease: 'power1.inOut' }, 'to2')
              .fromTo(
                st,
                { lapse: 0 },
                {
                  lapse: 1,
                  duration: TIMING.lapse,
                  ease: 'none',
                  // curva: arranca lento y se dispara → sensación de que el tiempo vuela
                  onUpdate: () => setNum(Math.max(1, Math.round(365 * Math.pow(st.lapse, 2.2)))),
                },
                'to2',
              )
              .to('.lapse', { autoAlpha: 0, duration: 0.5 }, '>+0.6')
              .addLabel('act2', `to2+=${TIMING.lapse * 0.85}`)
              .to({}, { duration: TIMING.readHold })

              // ================= 2 → 3 · TIME-LAPSE DE AÑOS =================
              // 2026 → 2036: cada "año" (pulso oscuro) el pueblo se deteriora un escalón
              .addLabel('to3')
              .call(waitForTextures)
              .call(() => setCounter('2026', 'si nada cambia', 'years'))
              .fromTo('.lapse', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 'to3')
              .fromTo(
                st,
                { decade: 0 },
                {
                  decade: 1,
                  duration: TIMING.decade,
                  ease: 'none',
                  onUpdate: () => setNum(2026 + Math.min(10, Math.floor(st.decade * 10 + 0.5))),
                },
                'to3',
              )
              .to('.lapse', { autoAlpha: 0, duration: 0.5 }, '>+0.6')
              .addLabel('act3', `to3+=${TIMING.decade * 0.85}`)
              .to({}, { duration: TIMING.readHold })

              // ================= 3 → 4 · REBOBINAR + LIMPIAR + ¡PUM! =================
              // 1) la cinta vuelve atrás: 2036 → hoy (Bayahibe sucio, como en el Acto 2)
              // 2) aparece la gente y levanta la basura por tandas ("manos a la obra")
              // 3) destello y, ¡pum!, el Bayahibe recuperado con el programa funcionando
              .addLabel('to4')
              .call(() => setCounter('2036', 'rebobinando', 'rewind'))
              .fromTo('.lapse', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 'to4')
              .fromTo(
                st,
                { rewind: 0 },
                {
                  rewind: 1,
                  duration: TIMING.rewind,
                  ease: 'power1.inOut',
                  onUpdate: () => setNum(2036 - Math.min(10, Math.floor(st.rewind * 10 + 0.5))),
                },
                'to4',
              )
              // --- limpieza ---
              .addLabel('clean')
              .call(() => setCounter('HOY', 'manos a la obra', 'clean'))
              .fromTo(st, { people: 0 }, { people: 1, duration: 0.7, ease: 'power2.out' }, 'clean')
              .fromTo(st, { cleanup: 0 }, { cleanup: 1, duration: TIMING.cleanup, ease: 'none' }, 'clean+=0.4')
              // --- ¡pum! ---
              .addLabel('boom')
              .to(st, { flash: 1, duration: 0.22, ease: 'power2.in' }, 'boom')
              .set(st, { people: 0, toHope: 1 }, 'boom+=0.22') // el cambio ocurre tapado por el destello
              .call(() => setCounter('HOY', 'todavía estamos a tiempo', 'now'), [], 'boom+=0.22')
              .to(st, { flash: 0, duration: 0.9, ease: 'power2.out' }, 'boom+=0.24')
              .to(st, { propsMangroves: 1, duration: T * 0.6, ease: 'power1.out' }, 'boom+=0.35')
              .to(st, { propsBins: 1, duration: T * 0.6, ease: 'power1.out' }, `boom+=${0.35 + TIMING.layerStagger}`)
              .to(
                st,
                { propsStation: 1, duration: T * 0.6, ease: 'power1.out' },
                `boom+=${0.35 + TIMING.layerStagger * 2}`,
              )
              .to('.lapse', { autoAlpha: 0, duration: 0.6 }, '>+0.6')
              .addLabel('act4', 'boom+=0.5');

            // qué texto mostrar según dónde está la timeline (funciona también al saltar)
            const labels = tl.labels;
            tl.eventCallback('onUpdate', () => {
              const time = tl.time();
              let next: Act = 1;
              if (time >= labels.act2) next = 2;
              if (time >= labels.act3) next = 3;
              if (time >= labels.act4) next = 4;
              setAct((prev) => (prev === next ? prev : next));
              // durante el rebobinado no hay texto: la imagen cuenta la historia
              const rw = time >= labels.to4 && time < labels.act4;
              setRewinding((prev) => (prev === rw ? prev : rw));
              if (progressRef.current) progressRef.current.style.transform = `scaleX(${tl.progress()})`;
            });
            tl.eventCallback('onComplete', () => setFinished(true));
          });
        });
      })
      .catch((err) => {
        console.warn('[Hero] WebGL no disponible, se usa imagen estática', err);
        if (!cancelled) setWebglFailed(true);
      });

    return () => {
      cancelled = true;
      tlRef.current = null;
      ctx.revert();
      scene?.destroy();
    };
  }, []);

  // si cambian el idioma mientras corre un time-lapse, re-traducimos el contador
  useEffect(() => {
    const el = sectionRef.current?.querySelector<HTMLElement>('.lapse');
    const label = el?.dataset.label;
    const labelEl = el?.querySelector('.lapse__label');
    if (label && labelEl) labelEl.textContent = t(label);
    const num = counterRef.current;
    if (num && /^(HOY|TODAY)$/.test(num.textContent ?? '')) num.textContent = t('HOY');
  }, [language, t]);

  /** Salta a un acto desde los puntos. El acto 1 reinicia todo. */
  const goTo = (n: Act) => {
    const tl = tlRef.current;
    if (!tl) return;
    setFinished(false);
    if (n === 1) tl.restart(true);
    else tl.seek(`act${n}`).play();
  };

  return (
    <section ref={sectionRef} className="hero" aria-label={t('Bayahibe, antes y después')}>
      <div className={`hero__frame${webglFailed ? ' hero__frame--static' : ''}`}>
        <div ref={stageRef} className="hero__stage" aria-hidden="true" />

        {/* ---------- Acto 1: introducción ---------- */}
        <div className="intro__shade" aria-hidden="true" />
        <div className="intro">
          <p className="intro__eyebrow">La Altagracia · {t('República Dominicana')}</p>
          <h1 className="intro__title">
            <svg className="intro__word" viewBox="0 0 1000 320" role="img" aria-label={INTRO_WORD}>
              <defs>
                {/* borde suave de la "tinta" que avanza */}
                <linearGradient id="inkEdge" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0.88" stopColor="#fff" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <mask id="inkMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="320">
                  <rect className="intro__ink" x="-60" y="0" width="0" height="320" fill="url(#inkEdge)" />
                </mask>
              </defs>
              <text
                className="intro__stroke"
                x="500"
                y="225"
                textAnchor="middle"
                textLength="900"
                lengthAdjust="spacingAndGlyphs"
              >
                {INTRO_WORD}
              </text>
              <text
                className="intro__fill"
                mask="url(#inkMask)"
                x="500"
                y="225"
                textAnchor="middle"
                textLength="900"
                lengthAdjust="spacingAndGlyphs"
              >
                {INTRO_WORD}
              </text>
              <path className="intro__swash" pathLength={1} d="M70 282 C 300 255, 620 300, 930 262" />
            </svg>
          </h1>
          <p className="intro__lead">
            <span className="intro__lead-line">
              {t('Mar turquesa, arrecifes, manglares y un pueblo que vive de su costa.')}
            </span>
            <span className="intro__lead-line">{t('Un rincón del Caribe que vale la pena cuidar.')}</span>
          </p>
        </div>

        {/* ---------- Actos 2-4 ---------- */}
        {([2, 3, 4] as const).map((n) => (
          <div
            key={n}
            className={`hero__copy hero__copy--${n}${act === n && !rewinding ? ' is-active' : ''}`}
            aria-hidden={act !== n}
          >
            <h2 className="hero__title">{t(ACT_COPY[n].title)}</h2>
            <p className="hero__sub">{t(ACT_COPY[n].sub)}</p>
            {n === 4 && (
              <div className="hero__ctas">
                <a className="btn btn--solid" href="#sumate">
                  {t('Súmate')}
                </a>
                <a className="btn btn--ghost" href="#idea">
                  {t('Conoce el programa')}
                </a>
              </div>
            )}
          </div>
        ))}

        {/* ---------- Indicador de actos (clickeable) ---------- */}
        {/* contador del time-lapse (Acto 1 → 2) */}
        <div className="lapse" aria-hidden="true">
          <span ref={counterRef} className="lapse__num">
            1
          </span>
          <span className="lapse__icon" aria-hidden="true">
            ⏪
          </span>
          <span className="lapse__label">{t('días sin cuidarlo')}</span>
        </div>

        <div className="hero__dots">
          {([1, 2, 3, 4] as const).map((n) => (
            <button
              key={n}
              className={act === n ? 'is-active' : ''}
              onClick={() => goTo(n)}
              aria-label={n === 1 ? t('Ver desde el principio') : `${t('Ir al acto')} ${n}`}
            />
          ))}
          <div className="hero__progress-track">
            <div className="hero__progress" ref={progressRef} />
          </div>
        </div>

        <a href="#idea" className={`hero__scroll-hint${finished ? ' is-visible' : ''}`}>
          {t('Descubre el proyecto')} <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
