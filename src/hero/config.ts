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
  rewind: 2.6,
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
  /** Ancho a partir del cual se usan texturas full (si no, las -mobile). */
  desktopMinWidth: 900,
};

/**
 * Perfiles de calidad. Se elige uno al cargar según el equipo y, si igual
 * baja de ~45 fps, la escena reduce la resolución sola (ver HeroScene).
 */
export const QUALITY_PROFILES = {
  0: { resolution: 0.75, maxFPS: 30, birds: 3, mobileTextures: true }, // equipos flojos
  1: { resolution: 1, maxFPS: 60, birds: 5, mobileTextures: false }, // medio / celulares
  2: { resolution: 1.25, maxFPS: 60, birds: 7, mobileTextures: false }, // alto
} as const;

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
  /** Rebobinado: qué parte deshace los años (el resto deshace los días). */
  rewindYears: 0.65,
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
} as const;

export const TEXTURE_EXT: Record<keyof typeof TEXTURES, string> = {
  base: 'webp',
  alt: 'webp',
  sky: 'webp',
  mask: 'webp',
  zones: 'png',
  trash: 'webp',
  props: 'webp',
};
