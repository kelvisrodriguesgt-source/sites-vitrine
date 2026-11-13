#!/usr/bin/env python3
"""Gera as imagens PROVISÓRIAS do site (pizzas vistas de cima desenhadas por código) em public/img.
Troque pelas fotos reais (mesmos nomes de arquivo) quando houver. Uso: python3 scripts/make-placeholder-images.py"""
import math, random, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'img')
os.makedirs(OUT, exist_ok=True)


def noise(size, scale, seed, amp):
    rng = np.random.default_rng(seed)
    small = rng.random((max(2, size // scale), max(2, size // scale)))
    img = Image.fromarray((small * 255).astype('uint8')).resize((size, size), Image.BICUBIC)
    return (np.asarray(img, dtype=np.float32) / 255 - 0.5) * amp


def disk(size, r, cx=None, cy=None):
    m = Image.new('L', (size, size), 0)
    c = size / 2
    ImageDraw.Draw(m).ellipse((c - r + (cx or 0), c - r + (cy or 0), c + r + (cx or 0), c + r + (cy or 0)), fill=255)
    return m


def tint(size, mask, base, seed, var=18, scale=14):
    n = noise(size, scale, seed, var * 2)[..., None]
    arr = np.clip(np.array(base, dtype=np.float32)[None, None, :] + n, 0, 255).astype('uint8')
    img = Image.fromarray(arr, 'RGB').convert('RGBA')
    img.putalpha(mask)
    return img


def blob(draw, rnd, cx, cy, r, fill, squash=0.8):
    pts = []
    n = 14
    ph = rnd.random() * 6.28
    for i in range(n):
        a = i / n * 6.2832
        k = 1 + 0.18 * math.sin(a * 3 + ph) + rnd.uniform(-0.06, 0.06)
        pts.append((cx + math.cos(a) * r * k, cy + math.sin(a) * r * k * squash))
    draw.polygon(pts, fill=fill)


def scatter(rnd, R, count, inner=0.78, min_gap=0.0):
    pts = []
    tries = 0
    while len(pts) < count and tries < count * 60:
        tries += 1
        a = rnd.random() * 6.2832
        d = math.sqrt(rnd.random()) * R * inner
        x, y = math.cos(a) * d, math.sin(a) * d
        if all((x - px) ** 2 + (y - py) ** 2 > (min_gap * R) ** 2 for px, py in pts):
            pts.append((x, y))
    return pts


def pepperoni_slice(size_px, rnd, seed):
    s = size_px * 3
    im = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    c = s / 2
    r = s * 0.44
    pts = []
    for i in range(48):
        a = i / 48 * 6.2832
        k = 1 + 0.035 * math.sin(a * 5 + seed) + rnd.uniform(-0.012, 0.012)
        pts.append((c + math.cos(a) * r * k, c + math.sin(a) * r * k))
    d.polygon(pts, fill=(150, 28, 24, 255))
    inner = [(c + (x - c) * 0.93, c + (y - c) * 0.93) for x, y in pts]
    d.polygon(inner, fill=(196, 48, 36, 255))
    inner2 = [(c + (x - c) * 0.62, c + (y - c) * 0.62) for x, y in pts]
    d.polygon(inner2, fill=(208, 58, 42, 255))
    for _ in range(14):
        a = rnd.random() * 6.2832
        dd = rnd.random() ** 0.7 * r * 0.78
        rr = rnd.uniform(0.04, 0.09) * s
        d.ellipse((c + math.cos(a) * dd - rr, c + math.sin(a) * dd - rr, c + math.cos(a) * dd + rr, c + math.sin(a) * dd + rr), fill=(132, 22, 20, 235))
    hl = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    ImageDraw.Draw(hl).ellipse((c - r * 0.55, c - r * 0.8, c + r * 0.1, c - r * 0.2), fill=(255, 190, 160, 70))
    im = Image.alpha_composite(im, hl.filter(ImageFilter.GaussianBlur(s * 0.03)))
    return im.resize((size_px, size_px), Image.LANCZOS)


def pizza(flavor, px, seed):
    S = px * 2
    rnd = random.Random(seed)
    c = S / 2
    R = S * 0.485
    base = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    # sombra suave
    sh = Image.new('L', (S, S), 0)
    ImageDraw.Draw(sh).ellipse((c - R, c - R + S * 0.014, c + R, c + R + S * 0.014), fill=110)
    shadow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    shadow.putalpha(sh.filter(ImageFilter.GaussianBlur(S * 0.012)))
    base = Image.alpha_composite(base, shadow)
    # borda
    crust = tint(S, disk(S, R), (214, 154, 78), seed, var=26, scale=10)
    base = Image.alpha_composite(base, crust)
    ring = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse((c - R * 0.98, c - R * 0.98, c + R * 0.98, c + R * 0.98), outline=(240, 196, 120, 130), width=int(S * 0.012))
    base = Image.alpha_composite(base, ring)
    toast = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    td = ImageDraw.Draw(toast)
    for _ in range(70):
        a = rnd.random() * 6.2832
        d = R * rnd.uniform(0.9, 0.99)
        r = S * rnd.uniform(0.004, 0.012)
        td.ellipse((c + math.cos(a) * d - r, c + math.sin(a) * d - r, c + math.cos(a) * d + r, c + math.sin(a) * d + r), fill=(160, 96, 40, 150))
    base = Image.alpha_composite(base, toast)
    sweet = flavor == 'chocolate-morango'
    # molho / cobertura
    sauce_col = (92, 52, 34) if sweet else (190, 48, 32)
    base = Image.alpha_composite(base, tint(S, disk(S, R * 0.86), sauce_col, seed + 1, var=22, scale=12))
    cheese_col = (74, 38, 24) if sweet else {'quatro-queijos': (250, 214, 120), 'margherita': (248, 226, 150)}.get(flavor, (246, 200, 96))
    layer = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    n_patches = 70 if not sweet else 40
    for x, y in scatter(rnd, R, n_patches, inner=0.84):
        col = tuple(int(v + rnd.uniform(-14, 14)) for v in cheese_col) + (235,)
        blob(ld, rnd, c + x, c + y, S * rnd.uniform(0.04, 0.075), col)
    base = Image.alpha_composite(base, layer.filter(ImageFilter.GaussianBlur(S * 0.0025)))
    top = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(top)

    def circle(x, y, r, fill, outline=None, w=0):
        d.ellipse((c + x - r, c + y - r, c + x + r, c + y + r), fill=fill, outline=outline, width=w)

    if flavor == 'margherita':
        for x, y in scatter(rnd, R, 9, 0.72, 0.28):
            blob(d, rnd, c + x, c + y, S * 0.07, (252, 248, 236, 255), 0.9)
        for x, y in scatter(rnd, R, 11, 0.74, 0.22):
            a = rnd.random() * 3
            for k in range(3):
                circle(x + k * S * 0.012, y + k * S * 0.006, S * 0.026 - k * S * 0.004, (46 + k * 14, 128 + k * 10, 52 + k * 6, 255))
        for x, y in scatter(rnd, R, 14, 0.8, 0.12):
            circle(x, y, S * 0.012, (196, 40, 28, 255))
    elif flavor == 'calabresa':
        for x, y in scatter(rnd, R, 22, 0.76, 0.2):
            circle(x, y, S * 0.044, (168, 72, 40, 255), (128, 46, 24, 255), int(S * 0.006))
            for _ in range(5):
                a = rnd.random() * 6.28
                dd = rnd.random() * S * 0.026
                circle(x + math.cos(a) * dd, y + math.sin(a) * dd, S * 0.006, (232, 150, 104, 255))
        for x, y in scatter(rnd, R, 14, 0.78, 0.2):
            circle(x, y, S * 0.034, (0, 0, 0, 0), (244, 236, 214, 255), int(S * 0.007))
        for x, y in scatter(rnd, R, 12, 0.8, 0.25):
            blob(d, rnd, c + x, c + y, S * 0.018, (52, 120, 52, 255))
    elif flavor == 'frango-catupiry':
        for x, y in scatter(rnd, R, 36, 0.78, 0.14):
            blob(d, rnd, c + x, c + y, S * 0.03, (232, 196, 136, 255), 0.7)
        for x, y in scatter(rnd, R, 10, 0.72, 0.3):
            blob(d, rnd, c + x, c + y, S * 0.045, (252, 244, 226, 255), 0.9)
            circle(x, y, S * 0.018, (255, 252, 240, 255))
        for x, y in scatter(rnd, R, 14, 0.8, 0.2):
            blob(d, rnd, c + x, c + y, S * 0.014, (60, 130, 56, 255))
    elif flavor == 'portuguesa':
        for x, y in scatter(rnd, R, 16, 0.76, 0.22):
            blob(d, rnd, c + x, c + y, S * 0.04, (232, 140, 134, 255), 0.7)
        for x, y in scatter(rnd, R, 5, 0.66, 0.4):
            circle(x, y, S * 0.05, (252, 250, 244, 255))
            circle(x, y, S * 0.024, (244, 184, 36, 255))
        for x, y in scatter(rnd, R, 14, 0.78, 0.2):
            circle(x, y, S * 0.02, (0, 0, 0, 0), (36, 28, 40, 255), int(S * 0.009))
        for x, y in scatter(rnd, R, 10, 0.8, 0.2):
            circle(x, y, S * 0.032, (0, 0, 0, 0), (214, 168, 220, 255), int(S * 0.006))
    elif flavor == 'quatro-queijos':
        cols = [(252, 250, 240), (250, 190, 70), (232, 232, 220), (252, 226, 150)]
        for i, (x, y) in enumerate(scatter(rnd, R, 26, 0.8, 0.16)):
            blob(d, rnd, c + x, c + y, S * rnd.uniform(0.03, 0.05), cols[i % 4] + (255,), 0.85)
        for x, y in scatter(rnd, R, 6, 0.7, 0.35):
            blob(d, rnd, c + x, c + y, S * 0.04, (236, 238, 240, 255), 0.85)
            for _ in range(5):
                circle(x + rnd.uniform(-1, 1) * S * 0.025, y + rnd.uniform(-1, 1) * S * 0.02, S * 0.005, (70, 110, 150, 255))
        for x, y in scatter(rnd, R, 10, 0.8, 0.2):
            blob(d, rnd, c + x, c + y, S * 0.012, (60, 130, 56, 255))
    elif flavor == 'pepperoni':
        pass
    elif sweet:
        for x, y in scatter(rnd, R, 24, 0.8, 0.12):
            blob(d, rnd, c + x, c + y, S * 0.055, (60, 28, 18, 255), 0.8)
        for x, y in scatter(rnd, R, 14, 0.74, 0.28):
            for k in (0, 1):
                circle(x, y, S * (0.04 - k * 0.018), (214 - k * 20, 28 + k * 150, 40 + k * 160, 255))
            d.polygon([(c + x - S * 0.012, c + y - S * 0.045), (c + x + S * 0.012, c + y - S * 0.045), (c + x, c + y - S * 0.07)], fill=(60, 140, 60, 255))
        for _ in range(120):
            a = rnd.random() * 6.28
            dd = math.sqrt(rnd.random()) * R * 0.78
            d.line((c + math.cos(a) * dd, c + math.sin(a) * dd, c + math.cos(a) * dd + S * 0.02, c + math.sin(a) * dd + S * 0.01), fill=(250, 238, 224, 220), width=int(S * 0.005))
    base = Image.alpha_composite(base, top)
    if flavor == 'pepperoni':
        n = 20
        for i, (x, y) in enumerate(scatter(rnd, R, n, 0.78, 0.2)):
            sl = pepperoni_slice(int(S * 0.19), rnd, i).rotate(rnd.uniform(0, 360), Image.BICUBIC)
            base.alpha_composite(sl, (int(c + x - sl.width / 2), int(c + y - sl.height / 2)))
        d2 = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        dd = ImageDraw.Draw(d2)
        for x, y in scatter(rnd, R, 12, 0.82, 0.18):
            blob(dd, rnd, c + x, c + y, S * 0.012, (60, 130, 56, 255))
        base = Image.alpha_composite(base, d2)
    # brilho
    gloss = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(gloss).ellipse((c - R * 0.85, c - R * 0.95, c + R * 0.2, c - R * 0.15), fill=(255, 245, 220, 36))
    base = Image.alpha_composite(base, gloss.filter(ImageFilter.GaussianBlur(S * 0.06)))
    mask = disk(S, R * 1.0)
    out = base.copy()
    out.putalpha(ImageChops.lighter(base.getchannel('A'), Image.new('L', (S, S), 0)))
    return out.resize((px, px), Image.LANCZOS)


def save_webp(im, name, max_kb, q=84):
    path = os.path.join(OUT, name)
    for quality in range(q, 40, -6):
        im.save(path, 'WEBP', quality=quality, method=6)
        if os.path.getsize(path) <= max_kb * 1024:
            break
    print(f'{name}: {os.path.getsize(path) // 1024} KB')


FLAVORS = ['margherita', 'calabresa', 'frango-catupiry', 'portuguesa', 'quatro-queijos', 'pepperoni', 'chocolate-morango']
for i, f in enumerate(FLAVORS):
    save_webp(pizza(f, 600, 100 + i * 7), f'{f}.webp', 80)

save_webp(pizza('pepperoni', 1500, 777), 'hero.webp', 250, 82)

rnd = random.Random(5)
for i in range(1, 7):
    sl = pepperoni_slice(220, rnd, i * 1.7).rotate(rnd.uniform(0, 360), Image.BICUBIC)
    bb = sl.getbbox()
    sl = sl.crop(bb)
    save_webp(sl, f'pepperoni-{i}.webp', 15, 80)
