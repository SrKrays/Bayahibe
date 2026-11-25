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
import './hero.css';

type Act = 1 | 2 | 3 | 4;

const ACT_COPY: Record<Exclude<Act, 1>, { title: string; sub: string }> = {
  2: { title: 'Esto no es el futuro. Es hoy.', sub: 'Bayahibe, República Dominicana.' },
  3: { title: 'Si no hacemos nada.', sub: 'Escenario ilustrativo · 2036' },
  4: { title: 'Bayahibe nos necesita.', sub: 'Aprendemos a cuidar. Salimos a proteger.' },
};

const INTRO_WORD = 'Bayahibe';

export default function Hero() {
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
              if (counterRef.current) counterRef.current.textContent = String(v);
            };
            const setCounter = (num: string, label: string, mode: string) => {
              setNum(num);
              if (labelEl) labelEl.textContent = label;
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

              // ================= 3 → 4 · REBOBINAR =================
              // la cinta vuelve atrás: 2036 → 2026 → hoy. Todo se deshace y, sobre el
              // Bayahibe limpio, aparece el programa (tachos, cartel, manglares).
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
                  onUpdate: () => {
                    const r = st.rewind;
                    if (r < 0.7) setNum(2036 - Math.min(10, Math.floor((r / 0.7) * 10 + 0.5)));
                    else setNum('HOY');
                  },
                },
                'to4',
              )
              .call(() => setCounter('HOY', 'todavía estamos a tiempo', 'now'))
              .to(st, { toHope: 1, duration: T, ease: 'power2.inOut' })
              .to(st, { propsMangroves: 1, duration: T * 0.7, ease: 'power1.out' }, `<${T * 0.2}`)
              .to(st, { propsBins: 1, duration: T * 0.7, ease: 'power1.out' }, `<${TIMING.layerStagger}`)
              .to(st, { propsStation: 1, duration: T * 0.7, ease: 'power1.out' }, `<${TIMING.layerStagger}`)
              .to('.lapse', { autoAlpha: 0, duration: 0.6 }, '>+0.3')
              .addLabel('act4', `to4+=${TIMING.rewind + T * 0.5}`);

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

  /** Salta a un acto desde los puntos. El acto 1 reinicia todo. */
  const goTo = (n: Act) => {
    const tl = tlRef.current;
    if (!tl) return;
    setFinished(false);
    if (n === 1) tl.restart(true);
    else tl.seek(`act${n}`).play();
  };

  return (
    <section ref={sectionRef} className="hero" aria-label="Bayahibe, antes y después">
      <div className={`hero__frame${webglFailed ? ' hero__frame--static' : ''}`}>
        <div ref={stageRef} className="hero__stage" aria-hidden="true" />

        <header className="hero__nav">
          <a href="#" className="hero__logo">
            <LeafIcon />
            <span>
              BAYAHIBE
              <br />
              VERDE
            </span>
          </a>
          <nav className="hero__links" aria-label="Secciones">
            <a href="#idea">La idea</a>
            <a href="#programa">Cómo lo hacemos</a>
            <a href="#sumate" className="hero__links-cta">
              Súmate
            </a>
          </nav>
        </header>

        {/* ---------- Acto 1: introducción ---------- */}
        <div className="intro__shade" aria-hidden="true" />
        <div className="intro">
          <p className="intro__eyebrow">La Altagracia · República Dominicana</p>
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
              Mar turquesa, arrecifes, manglares y un pueblo que vive de su costa.
            </span>
            <span className="intro__lead-line">Un rincón del Caribe que vale la pena cuidar.</span>
          </p>
        </div>

        {/* ---------- Actos 2-4 ---------- */}
        {([2, 3, 4] as const).map((n) => (
          <div
            key={n}
            className={`hero__copy hero__copy--${n}${act === n && !rewinding ? ' is-active' : ''}`}
            aria-hidden={act !== n}
          >
            <h2 className="hero__title">{ACT_COPY[n].title}</h2>
            <p className="hero__sub">{ACT_COPY[n].sub}</p>
            {n === 4 && (
              <div className="hero__ctas">
                <a className="btn btn--solid" href="#sumate">
                  Súmate
                </a>
                <a className="btn btn--ghost" href="#idea">
                  Conoce el programa
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
          <span className="lapse__label">días sin cuidarlo</span>
        </div>

        <div className="hero__dots">
          {([1, 2, 3, 4] as const).map((n) => (
            <button
              key={n}
              className={act === n ? 'is-active' : ''}
              onClick={() => goTo(n)}
              aria-label={n === 1 ? 'Ver desde el principio' : `Ir al acto ${n}`}
            />
          ))}
          <div className="hero__progress-track">
            <div className="hero__progress" ref={progressRef} />
          </div>
        </div>

        <a href="#idea" className={`hero__scroll-hint${finished ? ' is-visible' : ''}`}>
          Descubre el proyecto <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 32 32" width="34" height="34" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="rgba(255,255,255,.14)" />
      <path
        d="M22.5 8.5c-7 .3-12 4.3-12 10.4 0 1.5.4 2.8 1.1 3.8M22.5 8.5c.4 7.6-3.7 13.4-9.8 13.4-.9 0-1.6-.1-2.3-.4M22.5 8.5 11.6 22.7"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
