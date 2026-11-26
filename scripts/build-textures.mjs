/**
 * build-textures.mjs
 * ------------------------------------------------------------
 * Toma los PNG "de trabajo" de /assets-src (los que salen de Photopea)
 * y los empaqueta en pocas texturas optimizadas para la GPU en /public/textures.
 *
 *   assets-src/                         public/textures/
 *   (las fotos salen en .avif + .webp de respaldo)
 *   ├─ base-clean.png          ───►     base.webp         (fondo Actos 1, 2, 4)
 *   ├─ base-2036.png           ───►     alt.webp          (fondo Acto 3)
 *   ├─ sky-plate.png           ───►     sky.webp          (cielo infinito: en espejo, 2 anchos)
 *   ├─ mask-sea.png       (R)  ┐
 *   ├─ mask-vegetation.png(G)  ├──►     mask.webp         (RGB empaquetada)
 *   ├─ mask-sky.png       (B)  ┘
 *   ├─ trash-*.png (4 capas)   ───►     trash.webp        (todas las capas de basura juntas)
 *   ├─ props-*.png (3 capas)   ───►     props.webp        (todos los props del Acto 4 juntos)
 *   └─ zonas                   ───►     zones.png         (R = zona basura, G = zona props,
 *                                                         B = "día" en que aparece cada objeto de basura)
 *
 * Nota: nada de datos en el canal alpha de mask/zones. El navegador premultiplica
 * el alpha al subir la textura y eso destruiría los otros canales.
 *
 * ¿Por qué empaquetar? 6 texturas en vez de 14 archivos:
 *  - menos requests HTTP
 *  - menos texturas por shader (algunos celulares soportan sólo 8)
 *  - cada capa se sigue animando por separado gracias a zones.png
 *
 * Uso:  npm run assets
 * Genera 3 tamaños: 2560 (sin sufijo) · 1920 (-md) · 1280 (-mobile).
 * Las máscaras pueden tener otro tamaño (se reescalan); las capas deben
 * coincidir con base-clean.png.
 */
import sharp from 'sharp';
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const SRC = 'assets-src';
const OUT = 'public/textures';

// Orden = índice de zona en el shader (1..n). No cambiar sin actualizar HeroScene.ts
const TRASH_LAYERS = ['trash-left', 'trash-right', 'trash-shore', 'trash-sea'];
const PROPS_LAYERS = ['props-mangroves', 'props-bins', 'props-station'];

const targets = [
  { suffix: '', width: 2560, quality: 90 },
  { suffix: '-md', width: 1920, quality: 90 },
  { suffix: '-mobile', width: 1280, quality: 86 },
];
const AVIF_QUALITY = { '': 68, '-md': 70, '-mobile': 64 };
const SKY_PLATE_HEIGHT = 0.4; // = SKY.plateHeight en src/hero/config.ts

const src = (name) => path.join(SRC, `${name}.png`);

async function rawRGBA(name, width, height) {
  const { data, info } = await sharp(src(name))
    .resize(width, height, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.width !== width || info.height !== height) throw new Error(`${name}: tamaño incorrecto`);
  return data;
}

async function rawGray(name, width, height) {
  return sharp(src(name)).resize(width, height, { fit: 'fill' }).greyscale().raw().toBuffer();
}

/** Combina varias capas RGBA (sin solaparse) en una sola + mapa de zonas. */
async function packLayers(layers, width, height) {
  const color = Buffer.alloc(width * height * 4);
  const zone = new Uint8Array(width * height);
  for (let li = 0; li < layers.length; li++) {
    if (!existsSync(src(layers[li]))) {
      console.warn(`  ⚠ falta ${layers[li]}.png (se omite)`);
      continue;
    }
    const data = await rawRGBA(layers[li], width, height);
    for (let p = 0; p < width * height; p++) {
      const a = data[p * 4 + 3];
      if (a > color[p * 4 + 3]) {
        color[p * 4] = data[p * 4];
        color[p * 4 + 1] = data[p * 4 + 1];
        color[p * 4 + 2] = data[p * 4 + 2];
        color[p * 4 + 3] = a;
        // zona 1..n codificada en pasos de 32 (para leerla robusta en el shader)
        zone[p] = (li + 1) * 32;
      }
    }
  }
  return { color, zone };
}

/**
 * A cada objeto de basura (grupo de pixeles conectados) le asigna un "día"
 * al azar (0..1). El shader lo usa para el time-lapse: aparecen de a tandas.
 */
function pieceDays(alpha, width, height) {
  const days = new Uint8Array(width * height);
  const seen = new Uint8Array(width * height);
  const stack = new Int32Array(width * height);
  let seed = 12345;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < alpha.length; i++) {
    if (seen[i] || alpha[i] < 40) continue;
    const day = 8 + Math.floor(rand() * 240); // nunca 0: en el día 0 no hay basura
    let top = 0;
    stack[top++] = i;
    seen[i] = 1;
    while (top) {
      const p = stack[--top];
      days[p] = day;
      const x = p % width;
      const nb = [p - width, p + width, x > 0 ? p - 1 : -1, x < width - 1 ? p + 1 : -1];
      for (const q of nb) {
        if (q >= 0 && q < alpha.length && !seen[q] && alpha[q] >= 40) {
          seen[q] = 1;
          stack[top++] = q;
        }
      }
    }
  }
  return days;
}

async function build({ suffix, width, quality }) {
  const meta = await sharp(src('base-clean')).metadata();
  const height = Math.round((meta.height / meta.width) * width);
  console.log(`\n▶ ${width}x${height} ${suffix || '(full)'}`);

  const webp = { quality, effort: 6, smartSubsample: true };

  /** Fotos: AVIF (mitad de peso, más calidad) + WebP de respaldo para navegadores viejos. */
  const photo = async (pipeline, name, { alpha = false } = {}) => {
    const buf = await pipeline.toBuffer();
    await Promise.all([
      sharp(buf)
        .avif({ quality: AVIF_QUALITY[suffix], effort: 4, chromaSubsampling: '4:4:4' })
        .toFile(path.join(OUT, `${name}${suffix}.avif`)),
      sharp(buf)
        .webp(alpha ? { ...webp, alphaQuality: 90 } : webp)
        .toFile(path.join(OUT, `${name}${suffix}.webp`)),
    ]);
  };

  // 1. Fondos
  await photo(sharp(src('base-clean')).resize(width, height, { kernel: 'lanczos3' }), 'base');
  await photo(sharp(src('base-2036')).resize(width, height, { kernel: 'lanczos3' }), 'alt');
  console.log('  ✓ base / alt');

  // 1b. Cielo infinito: plate + su espejo pegados → se puede desplazar sin costura
  const plateH = Math.round(height * SKY_PLATE_HEIGHT);
  const plate = await sharp(src('sky-plate')).resize(width, plateH, { fit: 'fill' }).toBuffer();
  const mirrored = await sharp(plate).flop().toBuffer();
  const skyPipe = sharp({ create: { width: width * 2, height: plateH, channels: 3, background: '#000' } })
    .composite([
      { input: plate, left: 0, top: 0 },
      { input: mirrored, left: width, top: 0 },
    ])
    .resize(Math.min(width * 2, 4096), plateH, { fit: 'fill' }) // límite de textura en GPUs flojas
    .png();
  await photo(skyPipe, 'sky');
  console.log('  ✓ sky (espejo)');

  // 2. Máscaras + profundidad -> una sola RGBA (PNG sin pérdida: son datos, no foto)
  const [sea, veg, sky] = await Promise.all(
    ['mask-sea', 'mask-vegetation', 'mask-sky'].map((n) => rawGray(n, width, height)),
  );
  const mask = Buffer.alloc(width * height * 3);
  for (let p = 0; p < width * height; p++) {
    mask[p * 3] = sea[p];
    mask[p * 3 + 1] = veg[p];
    mask[p * 3 + 2] = sky[p];
  }
  await sharp(mask, { raw: { width, height, channels: 3 } })
    .webp({ quality: 85, effort: 6 })
    .toFile(path.join(OUT, `mask${suffix}.webp`));
  console.log('  ✓ mask (sea/veg/sky)');

  // 3. Capas
  const trash = await packLayers(TRASH_LAYERS, width, height);
  const props = await packLayers(PROPS_LAYERS, width, height);
  await photo(sharp(trash.color, { raw: { width, height, channels: 4 } }).png(), 'trash', { alpha: true });
  await photo(sharp(props.color, { raw: { width, height, channels: 4 } }).png(), 'props', { alpha: true });

  // Gente limpiando (opcional): capa propia, sólo si existe assets-src/people.png
  if (existsSync(src('people'))) {
    await photo(sharp(src('people')).resize(width, height, { fit: 'fill' }).png(), 'people', { alpha: true });
    console.log('  ✓ people');
  }
  console.log('  ✓ trash / props');

  // 4. Zonas + "día" de cada objeto de basura (PNG sin pérdida: son datos, no foto)
  const trashAlpha = new Uint8Array(width * height);
  for (let p = 0; p < width * height; p++) trashAlpha[p] = trash.color[p * 4 + 3];
  const days = pieceDays(trashAlpha, width, height);
  const zones = Buffer.alloc(width * height * 3);
  for (let p = 0; p < width * height; p++) {
    zones[p * 3] = trash.zone[p];
    zones[p * 3 + 1] = props.zone[p];
    zones[p * 3 + 2] = days[p];
  }
  await sharp(zones, { raw: { width, height, channels: 3 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, `zones${suffix}.png`));
  console.log('  ✓ zones + días');
}

mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) rmSync(path.join(OUT, f)); // limpia texturas viejas
for (const t of targets) await build(t);
console.log('\nListo ✔');
