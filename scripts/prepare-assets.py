"""
prepare-assets.py
------------------------------------------------------------
Genera los PNG de trabajo de /assets-src a partir de las 4 imágenes fuente
(ya escaladas x2 con scripts/upscale.py):

  assets-src/sources/base-clean.png   Acto 1 (limpio)
  assets-src/sources/base-2036.png    Acto 3
  assets-src/sources/src-trash.png    misma escena con basura   (Acto 2)
  assets-src/sources/src-hope.png     misma escena con props    (Acto 4)

Salida en assets-src/:
  base-clean.png, base-2036.png
  trash-left|right|shore|sea.png      recortes por diferencia contra la base
  props-mangroves|bins|station.png
  sky-plate.png                       cielo "sin palmeras" para el cielo infinito
  (las máscaras mask-*.png NO se tocan si ya existen: pueden estar hechas a mano)

Uso:  python scripts/prepare-assets.py          (pip install numpy pillow scipy)
"""
from pathlib import Path
import shutil
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent / 'assets-src'
SRC = ROOT / 'sources'
HORIZON = 0.38      # debe coincidir con SKY.horizon (src/hero/config.ts)
PLATE_H = 0.40      # debe coincidir con SKY.plateHeight


def load(name):
    return Image.open(SRC / name).convert('RGB')


def small(img, w):
    return img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)


def layers(src_name, zones, prefix, base_hi, thr=55, min_area=40):
    """Recorta lo que cambió entre src y base. La detección se hace a 1x (más estable)
    y el color se toma de la versión escalada."""
    src_hi = load(src_name)
    W, H = base_hi.size
    lw = W // 2
    a = np.asarray(small(base_hi, lw)).astype(np.float32)
    b = np.asarray(small(src_hi, lw)).astype(np.float32)
    h = a.shape[0]
    yy, xx = np.mgrid[0:h, 0:lw]
    X, Y = xx / lw, yy / h
    m = np.abs(b - a).sum(-1) > thr
    m = ndi.binary_opening(m, iterations=1)
    m = ndi.binary_closing(m, iterations=3)
    m = ndi.binary_fill_holes(m)
    lab, n = ndi.label(m)
    sizes = ndi.sum(m, lab, range(1, n + 1))
    keep = np.isin(lab, 1 + np.where(sizes >= min_area)[0])
    src_np = np.asarray(src_hi)
    for name, fn in zones.items():
        z = ndi.binary_dilation(keep & fn(X, Y), iterations=1)
        alpha = Image.fromarray((z * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR)
        alpha = alpha.filter(ImageFilter.GaussianBlur(1.2))
        Image.fromarray(np.dstack([src_np, np.asarray(alpha)]), 'RGBA').save(ROOT / f'{prefix}-{name}.png')
        print(f'  ✓ {prefix}-{name}.png')


def sky_plate(base_hi):
    """Cielo sin palmeras ni postes: donde no hay cielo, se rellena con el color
    medio del cielo de esa misma fila (cielo despejado). Así, cuando el cielo
    se desplaza, detrás de las palmeras no aparece nada raro."""
    W, H = base_hi.size
    ph = round(H * PLATE_H)
    img = np.asarray(base_hi).astype(np.float32)[:ph]
    # sólo cielo "seguro": la máscara se achica para dejar afuera bordes de palmeras,
    # cables y huecos entre hojas (que si no, aparecerían "fantasmas" al moverse)
    m1 = np.asarray(Image.open(ROOT / 'mask-sky.png').convert('L').resize((W // 2, H // 2), Image.BILINEAR)) > 200
    m1 = ndi.binary_opening(m1, iterations=4)
    m1 = ndi.binary_erosion(m1, iterations=10)
    lab, n = ndi.label(m1)
    sizes = ndi.sum(m1, lab, range(1, n + 1))
    m1 = np.isin(lab, 1 + np.where(sizes > 4000)[0])        # sin islas chicas
    sky = np.asarray(Image.fromarray((m1 * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR))[:ph] / 255.0
    # cables finos (líneas oscuras): "black-hat" morfológico
    lum = img.mean(-1)
    wires = ((ndi.grey_closing(lum, size=(11, 11)) - lum) > 10) & (lum < 150)
    wires = ndi.binary_dilation(wires, iterations=3)
    sky = sky * (1 - wires)
    solid = sky > 0.85

    # relleno: por cada fila, interpolación entre los pixeles de cielo más cercanos
    # a izquierda y derecha (respeta el degradé), usando el cielo suavizado (sin nubes marcadas)
    soft = np.stack([ndi.gaussian_filter(img[..., c], 6) for c in range(3)], -1)
    fill = np.zeros_like(img)
    xs = np.arange(W)
    last = None
    for y in range(ph):
        valid = solid[y].copy()
        if valid.sum() > 30:
            valid &= lum[y] <= np.percentile(lum[y][valid], 70)   # sin nubes: sólo azul
        if valid.sum() > 30:
            row = np.stack([np.interp(xs, xs[valid], soft[y, valid, c]) for c in range(3)], -1)
            last = row
        fill[y] = last if last is not None else img[y].mean(0)
    fill = np.stack([ndi.gaussian_filter(fill[..., c], (25, 40)) for c in range(3)], -1)
    # un poco de textura para que el relleno no sea plano
    noise = ndi.gaussian_filter(np.random.default_rng(3).normal(0, 1, (ph, W)), 6)[..., None] * 3
    fill = fill + noise
    a = (ndi.gaussian_filter(sky, 8) * (1 - ndi.gaussian_filter(wires.astype(np.float32), 1.5)))[..., None]
    out = img * a + fill * (1 - a)
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(ROOT / 'sky-plate.png')
    print('  ✓ sky-plate.png')


if __name__ == '__main__':
    base_hi = load('base-clean.png')
    shutil.copy(SRC / 'base-clean.png', ROOT / 'base-clean.png')
    shutil.copy(SRC / 'base-2036.png', ROOT / 'base-2036.png')
    print('  ✓ base-clean / base-2036')

    layers('src-trash.png', {
        'left': lambda X, Y: (X < 0.47) & (Y > 0.6),
        'right': lambda X, Y: (X > 0.6) & (Y > 0.64),
        'shore': lambda X, Y: (X > 0.38) & (X < 0.78) & (Y > 0.53) & (Y < 0.64),
        'sea': lambda X, Y: (X > 0.38) & (X < 0.85) & (Y > HORIZON + 0.02) & (Y < 0.555),
    }, 'trash', base_hi)

    layers('src-hope.png', {
        'bins': lambda X, Y: (X > 0.2) & (X < 0.36) & (Y > 0.62) & (Y < 0.82),
        'station': lambda X, Y: (X > 0.74) & (Y > 0.56) & (Y < 0.88),
        'mangroves': lambda X, Y: (X > 0.4) & (X < 0.76) & (Y > 0.5) & (Y < 0.6),
    }, 'props', base_hi)

    sky_plate(base_hi)
    print('Listo. Ahora: npm run assets')
