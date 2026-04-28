from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import math
import random

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets"
OUT.mkdir(parents=True, exist_ok=True)
random.seed(18)


def rgba(hex_color, alpha=255):
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def gradient(size, top, bottom):
    w, h = size
    img = Image.new("RGBA", size)
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(h - 1, 1)
        color = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(4))
        draw.line([(0, y), (w, y)], fill=color)
    return img


def watercolor_wash(size, palette, blobs=120, blur=34):
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    w, h = size
    for _ in range(blobs):
        color = random.choice(palette)
        rx = random.randint(max(20, w // 16), max(60, w // 4))
        ry = random.randint(max(20, h // 18), max(60, h // 4))
        x = random.randint(-rx, w)
        y = random.randint(-ry, h)
        draw.ellipse((x, y, x + rx, y + ry), fill=color)
    return img.filter(ImageFilter.GaussianBlur(blur))


def add_grain(img, alpha=18):
    noise = Image.new("RGBA", img.size, (0, 0, 0, 0))
    pix = noise.load()
    for y in range(img.size[1]):
        for x in range(img.size[0]):
            shade = random.randint(210, 255)
            pix[x, y] = (shade, shade, shade, random.randint(0, alpha))
    return Image.alpha_composite(img, noise)


def draw_wave(draw, y_base, amp, color, width, steps=20):
    points = []
    for i in range(steps + 1):
        x = width * i / steps
        y = y_base + math.sin(i * 1.4) * amp + random.randint(-8, 8)
        points.append((x, y))
    return points


def hero_background():
    w, h = 2400, 1500
    img = gradient((w, h), rgba("#fff6e8"), rgba("#c9e2e2"))
    img.alpha_composite(watercolor_wash((w, h), [rgba("#f0c7a4", 48), rgba("#a8c4be", 62), rgba("#ffffff", 72), rgba("#d6b990", 46)], 180, 48))
    draw = ImageDraw.Draw(img, "RGBA")

    for side in [0, 1]:
        base_x = 0 if side == 0 else w
        sign = 1 if side == 0 else -1
        for layer in range(4):
            points = [(base_x, 520 + layer * 45), (base_x + sign * random.randint(260, 560), 430 + layer * 30)]
            for i in range(5):
                points.append((base_x + sign * random.randint(260, 760), 580 + i * 42 + layer * 16))
            points.append((base_x, 850))
            color = rgba("#8c9586", 42 - layer * 5)
            draw.polygon(points, fill=color)

    horizon = 675
    draw.rectangle((0, horizon, w, h), fill=rgba("#9dc7ca", 72))
    for i in range(26):
        y = horizon + i * 27
        points = draw_wave(draw, y, 16 + i * 0.4, rgba("#ffffff", 75), w, 36)
        draw.line(points, fill=rgba("#ffffff", random.randint(48, 105)), width=random.randint(3, 8))
        if i % 3 == 0:
            draw.line(points, fill=rgba("#2f7881", 30), width=2)

    for _ in range(42):
        x = random.randint(0, w)
        y = random.randint(horizon + 20, h - 80)
        r = random.randint(24, 110)
        draw.ellipse((x - r, y - r // 4, x + r, y + r // 4), fill=rgba("#ffffff", random.randint(22, 62)))

    img = add_grain(img, 10)
    img.save(OUT / "watercolor-hero-sea.png")


def shell_part(name, top=True):
    w, h = 950, 620
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")
    if top:
        bbox = (95, 46, 850, 456)
        base = rgba("#ead7bf", 232)
        edge = rgba("#926f50", 160)
        draw.ellipse(bbox, fill=base, outline=edge, width=8)
        draw.pieslice((75, 8, 870, 494), 186, 354, fill=rgba("#f3e6d3", 210), outline=edge, width=6)
        hinge = (476, 462)
        for angle in range(202, 340, 16):
            x = hinge[0] + math.cos(math.radians(angle)) * 360
            y = hinge[1] + math.sin(math.radians(angle)) * 300
            draw.line((hinge[0], hinge[1], x, y), fill=rgba("#a88462", 86), width=8)
            draw.line((hinge[0], hinge[1], x, y), fill=rgba("#fff9ec", 80), width=3)
        for _ in range(38):
            x = random.randint(170, 780)
            y = random.randint(90, 380)
            draw.ellipse((x, y, x + random.randint(25, 80), y + random.randint(8, 28)), fill=rgba("#ffffff", random.randint(18, 55)))
    else:
        bbox = (85, 186, 870, 545)
        draw.ellipse(bbox, fill=rgba("#ead7bf", 232), outline=rgba("#8f6e50", 160), width=8)
        draw.pieslice((62, 118, 892, 594), 8, 172, fill=rgba("#f5eadb", 222), outline=rgba("#8f6e50", 150), width=6)
        center = (478, 286)
        for angle in range(28, 154, 14):
            x = center[0] + math.cos(math.radians(angle)) * 380
            y = center[1] + math.sin(math.radians(angle)) * 250
            draw.line((center[0], center[1], x, y), fill=rgba("#a88462", 72), width=7)
            draw.line((center[0], center[1], x, y), fill=rgba("#fffaf1", 74), width=3)
        draw.ellipse((335, 248, 615, 485), fill=rgba("#fff7e8", 130))

    layer = layer.filter(ImageFilter.GaussianBlur(0.6))
    shade = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    shade_draw = ImageDraw.Draw(shade, "RGBA")
    for _ in range(80):
        x = random.randint(60, 870)
        y = random.randint(50, 560)
        shade_draw.ellipse((x, y, x + random.randint(20, 100), y + random.randint(8, 34)), fill=rgba("#ffffff", random.randint(12, 38)))
    img.alpha_composite(layer)
    img.alpha_composite(shade.filter(ImageFilter.GaussianBlur(8)))
    img.save(OUT / name)


def pearl(name="pearl.png", size=320):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    center = size / 2
    pix = img.load()
    for y in range(size):
        for x in range(size):
            dx = x - center
            dy = y - center
            dist = math.sqrt(dx * dx + dy * dy) / (size / 2)
            if dist <= 1:
                highlight = max(0, 1 - math.sqrt((x - size * 0.34) ** 2 + (y - size * 0.28) ** 2) / (size * 0.5))
                shade = max(0, (dx + dy) / size)
                r = int(235 + highlight * 24 - shade * 30)
                g = int(224 + highlight * 26 - shade * 18)
                b = int(205 + highlight * 36 + shade * 8)
                a = int(255 * min(1, (1 - dist) * 9))
                pix[x, y] = (r, g, b, a)
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow, "RGBA")
    draw.ellipse((size * 0.12, size * 0.12, size * 0.88, size * 0.88), fill=rgba("#ffffff", 42))
    img = Image.alpha_composite(glow.filter(ImageFilter.GaussianBlur(18)), img)
    ImageDraw.Draw(img, "RGBA").ellipse((size * 0.28, size * 0.22, size * 0.42, size * 0.34), fill=rgba("#ffffff", 150))
    img.save(OUT / name)


def brand_shell():
    img = Image.new("RGBA", (220, 220), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    center = (110, 132)
    for angle in range(205, 337, 18):
        x = center[0] + math.cos(math.radians(angle)) * 78
        y = center[1] + math.sin(math.radians(angle)) * 92
        draw.line((center[0], center[1], x, y), fill=rgba("#1c4f55", 180), width=8)
    draw.pieslice((30, 28, 190, 184), 198, 342, fill=rgba("#fff4df", 230), outline=rgba("#1c4f55", 220), width=5)
    draw.arc((30, 28, 190, 184), 198, 342, fill=rgba("#bd843e", 180), width=4)
    draw.ellipse((91, 122, 129, 160), fill=rgba("#f8ead0", 235), outline=rgba("#bd843e", 160), width=3)
    img.save(OUT / "brand-shell.png")


def shell_card():
    w, h = 600, 720
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    draw.ellipse((54, 30, w - 54, h - 28), fill=rgba("#f7f4ea", 205), outline=rgba("#ffffff", 230), width=8)
    draw.ellipse((74, 54, w - 74, h - 54), outline=rgba("#9db9b5", 70), width=5)
    center = (w / 2, h - 60)
    for angle in range(220, 322, 12):
        x = center[0] + math.cos(math.radians(angle)) * 270
        y = center[1] + math.sin(math.radians(angle)) * 660
        draw.line((center[0], center[1], x, y), fill=rgba("#bd843e", 34), width=5)
    img = img.filter(ImageFilter.GaussianBlur(0.5))
    img.save(OUT / "shell-card.png")


def underwater_band():
    w, h = 2200, 900
    img = gradient((w, h), rgba("#dff2ef"), rgba("#1e6872"))
    img.alpha_composite(watercolor_wash((w, h), [rgba("#ffffff", 55), rgba("#79acb0", 80), rgba("#174a52", 58), rgba("#e7cda5", 26)], 140, 42))
    draw = ImageDraw.Draw(img, "RGBA")
    for x in range(-200, w + 200, 120):
        points = []
        for y in range(0, h, 70):
            points.append((x + math.sin(y / 80) * 28 + random.randint(-10, 10), y))
        draw.line(points, fill=rgba("#ffffff", 35), width=random.randint(3, 8))
    for _ in range(70):
        r = random.randint(5, 22)
        x = random.randint(0, w)
        y = random.randint(30, h - 30)
        draw.ellipse((x, y, x + r, y + r), outline=rgba("#ffffff", random.randint(42, 105)), width=2)
    add_grain(img, 8).save(OUT / "underwater-band.png")


def seaweed(name, mirror=False):
    w, h = 420, 720
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    for stem in range(10):
        base_x = random.randint(40, w - 50)
        height = random.randint(240, 620)
        points = []
        for i in range(10):
            y = h - i * height / 9
            x = base_x + math.sin(i * 0.9 + stem) * random.randint(14, 38)
            points.append((x, y))
        draw.line(points, fill=rgba(random.choice(["#244f42", "#5f7e5c", "#9aa06e"]), random.randint(120, 180)), width=random.randint(7, 13))
        for x, y in points[2:8:2]:
            draw.ellipse((x - 18, y - 8, x + 28, y + 12), fill=rgba("#9fb69b", random.randint(50, 110)))
    if mirror:
        img = img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    img = img.filter(ImageFilter.GaussianBlur(0.3))
    img.save(OUT / name)


def pearl_thread():
    w, h = 1400, 260
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    points = []
    for i in range(80):
        x = i * w / 79
        y = h / 2 + math.sin(i * 0.38) * 38
        points.append((x, y))
    draw.line(points, fill=rgba("#bd843e", 64), width=4)
    for i, (x, y) in enumerate(points[::3]):
        r = 9 + (i % 3)
        draw.ellipse((x - r, y - r, x + r, y + r), fill=rgba("#f2e2c9", 142), outline=rgba("#ffffff", 120), width=2)
    img.save(OUT / "pearl-thread.png")


def paper_grain():
    img = Image.new("RGBA", (900, 900), rgba("#fffaf2"))
    img = add_grain(img, 22)
    img.save(OUT / "paper-grain.png")


def portrait():
    w, h = 720, 720
    img = gradient((w, h), rgba("#f7e7d4"), rgba("#d5e2d6"))
    draw = ImageDraw.Draw(img, "RGBA")
    draw.ellipse((120, 70, 600, 660), fill=rgba("#fff9ef", 130))
    draw.ellipse((196, 112, 560, 650), fill=rgba("#3a2a24", 235))
    draw.ellipse((250, 158, 482, 438), fill=rgba("#c78f6d", 255))
    draw.rectangle((306, 390, 426, 505), fill=rgba("#c78f6d", 255))
    draw.ellipse((230, 208, 278, 284), fill=rgba("#c78f6d", 255))
    draw.ellipse((454, 208, 502, 284), fill=rgba("#c78f6d", 255))
    draw.pieslice((224, 94, 508, 358), 178, 355, fill=rgba("#2d211d", 245))
    draw.polygon([(164, 650), (264, 486), (462, 486), (566, 650)], fill=rgba("#f4e6d8", 255))
    draw.polygon([(264, 486), (356, 650), (462, 486)], fill=rgba("#f8d8c7", 180))
    draw.arc((292, 282, 430, 382), 24, 156, fill=rgba("#7a3f35", 145), width=5)
    draw.ellipse((300, 258, 318, 274), fill=rgba("#1d2625", 220))
    draw.ellipse((412, 258, 430, 274), fill=rgba("#1d2625", 220))
    draw.line((362, 268, 350, 330, 374, 330), fill=rgba("#8f5547", 120), width=4)
    img = add_grain(img, 8)
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).ellipse((36, 36, w - 36, h - 36), fill=255)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    out.save(OUT / "portrait-illustration.png")


def learning_pearl():
    w, h = 760, 480
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    draw.ellipse((120, 292, 620, 396), fill=rgba("#9fb69b", 76))
    draw.ellipse((210, 245, 545, 390), fill=rgba("#e8d5bd", 220), outline=rgba("#9b7a55", 120), width=5)
    for angle in range(220, 330, 16):
        draw.line((382, 330, 382 + math.cos(math.radians(angle)) * 165, 330 + math.sin(math.radians(angle)) * 135), fill=rgba("#9b7a55", 70), width=5)
    draw.ellipse((320, 205, 448, 330), fill=rgba("#f1e0c9", 250), outline=rgba("#ffffff", 120), width=5)
    for stem in range(8):
        x = 470 + stem * 18
        draw.line((x, 310, x + random.randint(-50, 50), random.randint(74, 194)), fill=rgba("#6f8a66", 150), width=5)
    for _ in range(12):
        x = random.randint(120, 650)
        y = random.randint(70, 360)
        r = random.randint(8, 22)
        draw.ellipse((x, y, x + r, y + r), outline=rgba("#ffffff", 95), width=2)
    img = img.filter(ImageFilter.GaussianBlur(0.4))
    img.save(OUT / "learning-pearl.png")


def main():
    hero_background()
    shell_part("oyster-top.png", top=True)
    shell_part("oyster-bottom.png", top=False)
    pearl()
    brand_shell()
    shell_card()
    underwater_band()
    seaweed("seaweed-left.png")
    seaweed("seaweed-right.png", mirror=True)
    pearl_thread()
    paper_grain()
    portrait()
    learning_pearl()


if __name__ == "__main__":
    main()
