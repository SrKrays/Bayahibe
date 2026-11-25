import type { QualityTier } from './config';

/**
 * Estima la potencia del equipo SIN medir todavía (eso lo hace HeroScene después):
 * núcleos, memoria, ahorro de datos, puntero táctil y la GPU real.
 */
export function detectQuality(): QualityTier {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const touch = window.matchMedia('(pointer: coarse)').matches;
  const gpu = gpuName();

  // GPU por software (sin aceleración) o equipo muy limitado
  if (/swiftshader|llvmpipe|software|basic render/i.test(gpu)) return 0;
  if (nav.connection?.saveData || cores <= 2 || memory <= 2) return 0;
  // integradas viejas
  if (/intel.*(hd|uhd) graphics [2-5]\d{2}\b|mali-[4t]\d|adreno \(tm\) [3-5]\d\d/i.test(gpu)) return 0;
  if (touch || cores <= 4 || memory <= 4) return 1;
  return 2;
}

function gpuName(): string {
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl) return 'software';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return name;
  } catch {
    return '';
  }
}

/** ¿El navegador decodifica AVIF? (imagen de 1×1 px). Si no, se usan los .webp. */
export function supportsAvif(): Promise<boolean> {
  const img = new Image();
  img.src =
    'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  return img
    .decode()
    .then(() => img.width > 0)
    .catch(() => false);
}
