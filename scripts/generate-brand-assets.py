# Maraton ikon seti: onayli ikondan (assets/brand/icon-a-1024.png, secenek 1).
#   python scripts/generate-brand-assets.py
# Uretir (assets/): icon (iOS, onayli gorselin kendisi), adaptive-icon (Android
# on katman: isaret, %62), adaptive-icon-bg (zemin + sol ust kizil isilti),
# splash-icon (isaret, %80), notification-icon (beyaz tek renk, 96px), favicon,
# brand/mark.png (zeminsiz isaret).
#
# Isaret ONAYLI GORSELDEN ayiklanir (yeniden cizilmez): beyaz kemer ve cam
# kesisim (en kucuk kanal > 95), kizil kemer ve nokta (r > 150, r - g > 90);
# kose isiltisi disarida kalsin diye yalniz isaret kutusu.
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
SRC = ASSETS / "brand" / "icon-a-1024.png"


def extract_mark():
    a = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float32)
    r, g = a[..., 0], a[..., 1]
    white = np.clip((a.min(axis=2) - 95) / 45, 0, 1)
    red = np.clip((r - 150) / 45, 0, 1) * np.clip((r - g - 90) / 40, 0, 1)
    alpha = np.maximum(white, red)
    box = np.zeros_like(alpha)
    box[300:735, 80:975] = 1
    alpha_img = Image.fromarray((alpha * box * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    rgba = Image.fromarray(a.astype(np.uint8)).convert("RGBA")
    rgba.putalpha(alpha_img)
    return rgba.crop(alpha_img.getbbox())


def place(mark, size, frac):
    w = int(size * frac)
    h = int(mark.height * w / mark.width)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(mark.resize((w, h), Image.LANCZOS), ((size - w) // 2, (size - h) // 2))
    return canvas


def glow_background(size=1024):
    bg = Image.new("RGB", (size, size), (28, 28, 35))
    g = Image.new("L", (size, size), 0)
    ImageDraw.Draw(g).ellipse((-size * .55, -size * .55, size * .7, size * .7), fill=165)
    g = g.filter(ImageFilter.GaussianBlur(size * .17))
    return Image.composite(Image.new("RGB", (size, size), (205, 28, 40)), bg, g)


def main():
    mark = extract_mark()
    mark.save(ASSETS / "brand" / "mark.png")
    icon = Image.open(SRC).convert("RGB")  # iOS: seffaflik yok
    icon.save(ASSETS / "icon.png")
    icon.resize((48, 48), Image.LANCZOS).save(ASSETS / "favicon.png")
    place(mark, 1024, 0.62).save(ASSETS / "adaptive-icon.png")
    glow_background().save(ASSETS / "adaptive-icon-bg.png")
    place(mark, 1024, 0.80).save(ASSETS / "splash-icon.png")
    mono = place(mark, 384, 0.86)
    white = Image.new("RGBA", mono.size, (255, 255, 255, 0))
    white.putalpha(mono.getchannel("A"))
    white.resize((96, 96), Image.LANCZOS).save(ASSETS / "notification-icon.png")
    print("ikon seti uretildi:", ASSETS)


if __name__ == "__main__":
    main()
