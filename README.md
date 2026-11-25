# Bayahibe Verde · Guardianes de Bayahibe

Web de presentación y concientización del programa escolar **Bayahibe Verde** (Bayahibe, República Dominicana).
Hero inmersivo en 4 actos: **Así es → Así está → Así podría estar (2036) → Así puede volver**.

## Arrancar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de producción en /dist
npm run assets     # empaqueta las texturas en 3 tamaños (2560 / 1920 / 1280)
```

## Stack

| Pieza | Para qué |
|---|---|
| **React 19 + Vite 8 + TypeScript** | Base de la app |
| **PixiJS 8** (WebGL) | Un solo canvas con un solo shader GLSL para todo el hero |
| **GSAP 3 + ScrollTrigger** | Intro automática (Acto 1 → 2) y scroll suavizado (Actos 3 y 4) |
| **sharp** (dev) | Script que empaqueta los PNG de Photopea en texturas livianas |
| Vercel | Deploy del front (estático). El backend .NET entra en la fase del Índice Ambiental |

No se usa `@pixi/react`: el hero es un único quad con shader, así que Pixi vive aislado en `HeroScene.ts`
y React sólo lo monta/desmonta y le pasa valores. Más simple de debuggear y sin re-renders.

## Estructura

```
assets-src/              PNG de trabajo (salen de la IA + Photopea) — NO se publican
  base-clean.png         fondo limpio (Actos 1, 2 y 4)
  base-2036.png          fondo deteriorado (Acto 3)
  mask-sea.png           blanco = mar
  mask-vegetation.png    blanco = palmeras / plantas
  mask-sky.png           blanco = cielo
  depth.png              profundidad (blanco = cerca) — Depth Anything V2
  trash-left|right|shore|sea.png        capas de basura (PNG transparente, lienzo completo)
  props-mangroves|bins|station.png      props del Acto 4 (PNG transparente, lienzo completo)

public/textures/         lo que genera `npm run assets` (esto sí se publica)

scripts/build-textures.mjs   empaquetador de texturas

src/hero/
  config.ts              colores por acto, tiempos de la secuencia, aves  ← ajustar acá
  HeroScene.ts           Pixi: carga escalonada, uniforms, ticker, pausa fuera de pantalla
  Hero.tsx               React + GSAP: secuencia automática, textos y UI
  hero.css
  shaders/scene.vert
  shaders/scene.frag     el shader: vida (mar/palmeras/cielo/luz), basura, 2036, props, color
```

## Cómo funciona el hero (secuencia automática)

Una sola timeline de GSAP (`Hero.tsx`), sin depender del scroll. Tiempos en `config.ts → TIMING`.

1. **Acto 1 · Intro**: "Bayahibe" se escribe a mano (trazo + tinta + subrayado de pincel) + bajada. Mientras tanto bajan las texturas de los otros actos.
2. **1 → 2 · time-lapse** (2.4 s): pasan los "días" en segundos — noches, nubes corriendo — y cada noche aparece
   una tanda nueva de basura (cada objeto tiene su día). Un contador sube de 1 a 365 "días sin cuidarlo".
3. **2 → 3 · time-lapse de años** (2.6 s): 2026 → 2036. Cada "año" (pulso de estación) el pueblo se deteriora
   un escalón más hacia el escenario 2036. Se van las aves y el sol.
4. **3 → 4 · rebobinado** (2.6 s): efecto de cinta VHS, el tiempo corre hacia atrás (nubes, mar y aves en reversa),
   2036 → 2026 → la basura se deshace → "HOY · todavía estamos a tiempo". Después: atardecer y aparecen manglares,
   tachos y la estación de Guardianes. Aparecen los CTA.

Los tres time-lapses comparten lenguaje (pulsos de noche, tiempo acelerado, cambios por escalones) y el mismo
contador. Duraciones en `config.ts → TIMING`, cantidad de días/años e intensidad en `config.ts → LAPSE`.

Los puntos de abajo son clickeables: saltan a cada acto (el primero reinicia). Si la red es lenta, la timeline
espera a las texturas en lugar de romperse.

**Vida de la escena** (shader, sin deformar la foto):
- **Cielo infinito**: una textura de cielo sin palmeras (en espejo) se desplaza sin fin *detrás* de las palmeras.
- **Mar**: agua que fluye en perspectiva (olas chicas al fondo, grandes cerca), brillo de sol sobre las crestas, espuma.
- **Palmeras**: brisa continua con ráfagas que viajan de izquierda a derecha + hojas temblando. Sólo las copas con
  cielo alrededor se mueven fuerte (las casas no tiemblan).
- Sombras de nubes, rayos de sol y gaviotas.

### Rendimiento (equipos flojos incluidos)

- `quality.ts` elige un perfil al cargar (núcleos, memoria, ahorro de datos, GPU real):
  **0** flojo (resolución 0.75, 30 fps, shader liviano, texturas mobile) · **1** medio · **2** alto (con enfoque extra).
- Si igual no llega a ~45 fps, `HeroScene` baja la resolución sola (hasta 2 veces) y luego limita a 30 fps.
- El shader salta los cálculos de mar/palmeras/cielo donde no hay mar/palmeras/cielo, y la basura usa un camino
  rápido una vez asentada.
- Pixi se descarga aparte (import dinámico): la página y la foto de fondo se pintan antes.
- Sin `backdrop-filter` ni `filter: blur` encima del canvas (obligaban al navegador a recomponer cada frame).
- Aves como sprites pre-dibujados; render pausado fuera de pantalla; `prefers-reduced-motion` respetado.
- Fuentes servidas desde el propio sitio (@fontsource), sin Google Fonts.
- Fotos en **AVIF** (calidad 68–70, color 4:4:4): mitad del peso que WebP y más nitidez. Los navegadores sin AVIF
  reciben el `.webp` automáticamente. Carga inicial del Acto 1 en pantallas comunes: ~550 KB.

Intensidad de movimiento: `config.ts → MOTION.amount` (mar, palmeras, cielo).

## Secciones

- `src/sections/Idea.tsx` — **Parte 1**: qué es Bayahibe Verde y quiénes lo hacen posible.
- `src/sections/Process.tsx` — **Parte 2**: cómo se cambia poco a poco (5 etapas + protocolo de seguridad).
- `src/sections/Join.tsx` — Súmate (el formulario real llega con el backend .NET).

## Pipeline de imágenes

```
1. Imágenes de la IA (1672 px)         → assets-src/originals/
2. python scripts/upscale.py ...        → x2 con Real-ESRGAN (las 4, mismo modelo)
                                          → assets-src/sources/
3. python scripts/prepare-assets.py     → capas de basura/props, cielo sin palmeras
4. npm run assets                       → texturas finales en public/textures
```

Máscaras (`mask-sea|vegetation|sky.png`): pueden estar hechas a mano en Photopea, a cualquier tamaño.
`prepare-assets.py` no las pisa. Las actuales son automáticas: mejorarlas mejora el movimiento de las palmeras.
`depth.png` ya no se usa.
