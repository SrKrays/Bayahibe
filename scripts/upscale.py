"""
upscale.py — escala imágenes x2 con Real-ESRGAN (IA), sin cambiar el encuadre.
Todas las fuentes deben pasar por ACÁ con el mismo modelo (si no, no alinean).

Instalación (una vez):
  pip install torch --index-url https://download.pytorch.org/whl/cpu
  pip install spandrel pillow numpy
  Modelo: https://huggingface.co/ai-forever/Real-ESRGAN/resolve/main/RealESRGAN_x2.pth

Uso:
  python scripts/upscale.py RealESRGAN_x2.pth entrada.png salida.png [entrada2.png salida2.png ...]
(en CPU tarda ~2 min por imagen de 1672 px)
"""
import sys
import numpy as np
import torch
from PIL import Image
from spandrel import ModelLoader


def run(model, src, dst, tile=320, pad=16, scale=2):
    img = np.asarray(Image.open(src).convert('RGB')).astype(np.float32) / 255
    H, W, _ = img.shape
    out = np.zeros((H * scale, W * scale, 3), np.float32)
    t = torch.from_numpy(img).permute(2, 0, 1)[None]
    # por tiles para no quedarse sin memoria
    for y in range(0, H, tile):
        for x in range(0, W, tile):
            y0, x0 = max(0, y - pad), max(0, x - pad)
            y1, x1 = min(H, y + tile + pad), min(W, x + tile + pad)
            with torch.no_grad():
                o = model(t[:, :, y0:y1, x0:x1])[0].permute(1, 2, 0).numpy()
            ty, tx = (y - y0) * scale, (x - x0) * scale
            h, w = min(tile, H - y) * scale, min(tile, W - x) * scale
            out[y * scale:y * scale + h, x * scale:x * scale + w] = o[ty:ty + h, tx:tx + w]
    Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8)).save(dst)
    print('  ✓', dst)


if __name__ == '__main__':
    model = ModelLoader().load_from_file(sys.argv[1]).eval()
    files = sys.argv[2:]
    for src, dst in zip(files[::2], files[1::2]):
        run(model, src, dst)
