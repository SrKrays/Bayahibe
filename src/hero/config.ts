/**
 * Configuración del hero. Todo lo "artístico" vive acá para poder ajustar
 * sin tocar el shader ni la lógica.
 */

/** Corrección de color de cada acto (se interpola entre actos). */
export interface Grade {
  saturation: number; // 1 = original
  brightness: number; // 1 = original
  warmth: number; // -1 frío · 0 neutro · +1 cálido (atardecer)
  contrast: number; // 1 = original
}

export const GRADES: Record<1 | 2 | 3 | 4, Grade> = {
  1: { saturation: 1.1, brightness: 1.02, warmth: 0.08, contrast: 1.04 }, // Así es
  2: { saturation: 0.82, brightness: 0.96, warmth: -0.15, contrast: 1.0 }, // Así está
  3: { saturation: 0.7, brightness: 0.9, warmth: -0.35, contrast: 0.9 }, // 2036
  4: { saturation: 1.1, brightness: 1.03, warmth: 0.75, contrast: 1.04 }, // Puede volver (atardecer)
};

/**
 * Secuencia automática (segundos). No depende del scroll.
 *
 *  [intro texto] ─► 1→2 ─► [lectura] ─► 2→3 ─► [lectura] ─► 3→4 ─► final
 */
export const TIMING = {
  /** Retardo antes de que aparezca el texto de introducción. */
  introDelay: 0.4,
  /** Tiempo que el texto de introducción queda en pantalla (después de animar). */
  introHold: 2.8,
  /** Duración del time-lapse 1 → 2 (los "días" que pasan). */
  lapse: 2.4,
  /** Duración del time-lapse 2 → 3 (10 "años": 2026 → 2036). */
  decade: 2.6,
  /** Duración del rebobinado 3 → 4 (2036 → hoy). */
  rewind: 2.2,
  /** Duración de la limpieza: la gente levanta la basura (3 → 4). */
  cleanup: 3.2,
  /** Duración de cada transición entre actos (pedido: 1–2 s). */
  transition: 1.8,
  /** Tiempo de lectura en los actos 2 y 3 antes de pasar al siguiente. */
  readHold: 3.5,
  /** Separación entre props dentro de una transición. */
  layerStagger: 0.25,
};

export const MOTION = {
  /** Intensidad de movimiento (1 = versión anterior · 1.5 = +50 %). */
  amount: { sea: 1.5, palms: 1.5, sky: 1.5 },
};

/**
 * Perfiles de calidad. La resolución del canvas NO es fija: se calcula con un
 * "presupuesto de pixeles" → un celular (pantalla chica, densidad 3×) puede renderizar
 * a 2× y verse nítido, mientras una pantalla 4K grande se queda en 1×.
 * Si igual baja de ~45 fps, la escena reduce la resolución sola (ver HeroScene).
 */
export const QUALITY_PROFILES = {
  // equipos flojos
  0: { pixelBudget: 1.1e6, maxDpr: 1.5, maxFPS: 30, birds: 3, maxTexture: 1280 },
  // medio / la mayoría de los celulares
  1: { pixelBudget: 2.4e6, maxDpr: 2, maxFPS: 60, birds: 5, maxTexture: 1920 },
  // alto
  2: { pixelBudget: 3.8e6, maxDpr: 2, maxFPS: 60, birds: 7, maxTexture: 2560 },
} as const;

/** Texturas disponibles (ancho → sufijo). Deben coincidir con scripts/build-textures.mjs. */
export const TEXTURE_SIZES = [
  { width: 1280, suffix: '-mobile' },
  { width: 1920, suffix: '-md' },
  { width: 2560, suffix: '' },
] as const;

/**
 * Pantallas verticales (celulares): la foto es horizontal y sólo entra una franja.
 * La "cámara" recorre lentamente el pueblo de un lado al otro para mostrarlo entero.
 */
export const PORTRAIT = {
  /** Centro del encuadre (0 = izquierda, 1 = derecha). El muelle está en ~0.55. */
  focus: 0.55,
  /** Cuánto recorre la cámara hacia cada lado (fracción del ancho de la foto). */
  pan: 0.2,
  /** Segundos de una ida y vuelta completa. */
  panPeriod: 26,
};

export type QualityTier = keyof typeof QUALITY_PROFILES;

/**
 * Time-lapses. Los tres usan el mismo lenguaje visual (pulsos de noche, nubes y mar
 * acelerados, cambios por escalones) para que se lean como una misma "máquina del tiempo".
 */
export const LAPSE = {
  /** Acto 1 → 2: días/noches que se ven pasar (la basura aparece de a tandas). */
  days: 7,
  /** Acto 2 → 3: años (cada uno, un escalón más de deterioro). */
  years: 10,
  /** Cuánto oscurece cada noche (0..1). */
  nightDepth: 0.75,
  /** Los "años" oscurecen menos (son estaciones, no noches). */
  yearDepth: 0.45,
  /** Cuánto se acelera el tiempo (nubes, mar, aves) en el pico del time-lapse. */
  timeWarp: 22,
  /** Limpieza (Acto 3 → 4): en cuántas tandas la gente levanta la basura. */
  cleanupSteps: 8,
  /** La limpieza va un poco acelerada (nubes y mar más rápidos). */
  cleanupWarp: 3,
};

/** Debe coincidir con scripts/build-textures.mjs (lo calcula al generar sky.webp). */
export const SKY = {
  /** Alto de la textura de cielo, como fracción del alto de la imagen. */
  plateHeight: 0.4,
  /** Línea del horizonte (fracción del alto). */
  horizon: 0.38,
};

export const TEXTURES = {
  base: 'base',
  alt: 'alt',
  sky: 'sky',
  mask: 'mask',
  zones: 'zones',
  trash: 'trash',
  props: 'props',
  people: 'people',
} as const;

export const TEXTURE_EXT: Record<keyof typeof TEXTURES, string> = {
  base: 'webp',
  alt: 'webp',
  sky: 'webp',
  mask: 'webp',
  zones: 'png',
  trash: 'webp',
  props: 'webp',
  people: 'webp',
};
