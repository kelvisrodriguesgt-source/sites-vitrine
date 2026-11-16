#!/usr/bin/env python3
"""Converte as fotos recebidas (ChatGPT, câmera, etc.) para os arquivos que o site espera.

Uso:
    1. Coloque os arquivos em  imagens-originais/  com o NOME do espaço (qualquer formato: png, jpg, webp).
       Exemplo: imagens-originais/hero-estetica.png, imagens-originais/limpeza-de-pele.jpg ...
    2. python3 scripts/prepare-images.py            (ou: npm run images)
    3. As versões prontas (.webp, recortadas na proporção certa e abaixo de ~200 KB) vão para src/assets/images/.

Depois: npm run build. O site passa a mostrar a foto no lugar do espaço reservado automaticamente.
Requer Pillow (pip install pillow).
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "imagens-originais"
OUT = ROOT / "src" / "assets" / "images"

# nome -> (largura, altura) finais. A proporção é a do config (src/config/site.ts).
TARGETS = {
    "hero-estetica": (1600, 900),
    "ambiente-clinica": (1600, 900),
    "limpeza-de-pele": (1200, 900),
    "depilacao-laser": (1200, 900),
    "massoterapia": (1200, 900),
    "drenagem": (1200, 900),
    "dermaplaning": (1200, 900),
    "auriculoterapia": (1200, 900),
    "jaqueline-perfil": (1000, 1250),
    "galeria-pele": (960, 1200),
    "galeria-procedimento": (900, 1200),
    "galeria-bem-estar": (1200, 900),
}
MAX_BYTES = 200 * 1024
EXTS = {".png", ".jpg", ".jpeg", ".webp"}


def save_small(img: Image.Image, dest: Path) -> int:
    """Salva em webp reduzindo a qualidade até caber em ~200 KB (mínimo 60)."""
    for scale in (1.0, 0.9, 0.8):
        frame = img if scale == 1.0 else img.resize((int(img.width * scale), int(img.height * scale)), Image.LANCZOS)
        for quality in range(88, 58, -4):
            frame.save(dest, "WEBP", quality=quality, method=6)
            if dest.stat().st_size <= MAX_BYTES:
                return dest.stat().st_size
    return dest.stat().st_size


def main() -> int:
    if not SRC.is_dir():
        print(f"Pasta de origem não encontrada: {SRC}\nCrie a pasta e coloque as fotos nela (nome = nome do espaço).")
        return 1
    OUT.mkdir(parents=True, exist_ok=True)
    done, unknown = [], []
    for path in sorted(SRC.iterdir()):
        if path.suffix.lower() not in EXTS:
            continue
        name = path.stem.lower()
        if name not in TARGETS:
            unknown.append(path.name)
            continue
        with Image.open(path) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            size = TARGETS[name]
            # Não amplia: se a foto original for menor que o alvo, mantém o tamanho dela (na proporção do espaço).
            ratio = size[0] / size[1]
            crop_w = min(im.width, int(im.height * ratio))
            crop_h = int(crop_w / ratio)
            size = (min(size[0], crop_w), min(size[1], crop_h))
            fitted = ImageOps.fit(im, size, method=Image.LANCZOS, centering=(0.5, 0.5))
            kb = save_small(fitted, OUT / f"{name}.webp") // 1024
        done.append(f"{name}.webp ({size[0]}x{size[1]}, {kb} KB)")
    for line in done:
        print("OK     ", line)
    for name in unknown:
        print("IGNORADO", name, "(nome não corresponde a nenhum espaço)")
    missing = sorted(set(TARGETS) - {Path(d.split(" ")[0]).stem for d in done})
    if missing:
        print("\nAinda sem foto (aparecem como espaço reservado):", ", ".join(missing))
    return 0 if done else 1


if __name__ == "__main__":
    sys.exit(main())
