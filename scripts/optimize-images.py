#!/usr/bin/env python3
"""
Converts the oversized source PNGs into web-sized WebP + JPG.

The source photos are ~1.5-2.7 MB PNGs at ~1500px. On the site they are
never displayed larger than ~560px wide (a service tile in a 5-column
grid at 1440px viewport), so the originals ship roughly 20x more data
than any visitor can actually see.

Originals are preserved untouched in assets/img/_originals/ so we can
always re-export at different settings.

Outputs, next to the original:
  <name>.webp  - primary, served to all modern browsers
  <name>.jpg   - fallback for anything that can't do WebP

Run:  python scripts/optimize-images.py
"""
import os
import shutil
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required:  pip install Pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'assets', 'img')
BACKUP = os.path.join(IMG, '_originals')

# Longest edge, in CSS pixels, at which each group is ever displayed,
# doubled for high-DPI (retina) screens.
TARGETS = [
    (os.path.join(IMG, 'products'), 1200),
    (os.path.join(IMG, 'process'), 1200),
]

WEBP_QUALITY = 82
JPG_QUALITY = 82


def convert(path, max_edge):
    name = os.path.splitext(os.path.basename(path))[0]
    folder = os.path.dirname(path)

    rel = os.path.relpath(path, IMG)
    backup_path = os.path.join(BACKUP, rel)
    os.makedirs(os.path.dirname(backup_path), exist_ok=True)
    if not os.path.exists(backup_path):
        shutil.copy2(path, backup_path)

    img = Image.open(path)
    original_size = os.path.getsize(path)
    w, h = img.size

    if max(w, h) > max_edge:
        scale = max_edge / float(max(w, h))
        img = img.resize((round(w * scale), round(h * scale)), Image.LANCZOS)

    # Flatten transparency onto white; these are photos, not logos.
    if img.mode in ('RGBA', 'LA', 'P'):
        img = img.convert('RGBA')
        flat = Image.new('RGB', img.size, (255, 255, 255))
        flat.paste(img, mask=img.split()[-1])
        img = flat
    else:
        img = img.convert('RGB')

    webp_path = os.path.join(folder, name + '.webp')
    jpg_path = os.path.join(folder, name + '.jpg')
    img.save(webp_path, 'WEBP', quality=WEBP_QUALITY, method=6)
    img.save(jpg_path, 'JPEG', quality=JPG_QUALITY, optimize=True, progressive=True)

    print('%-42s %6.2f MB -> webp %5.0f KB / jpg %5.0f KB   (%dx%d -> %dx%d)' % (
        os.path.basename(path),
        original_size / 1048576,
        os.path.getsize(webp_path) / 1024,
        os.path.getsize(jpg_path) / 1024,
        w, h, img.size[0], img.size[1],
    ))
    return original_size, os.path.getsize(webp_path)


def main():
    total_before = 0
    total_after = 0
    for folder, max_edge in TARGETS:
        if not os.path.isdir(folder):
            continue
        print('\n== %s (max edge %dpx) ==' % (os.path.relpath(folder, ROOT), max_edge))
        for fn in sorted(os.listdir(folder)):
            if fn.lower().endswith('.png'):
                before, after = convert(os.path.join(folder, fn), max_edge)
                total_before += before
                total_after += after

    print('\nTotal (WebP): %.1f MB -> %.1f MB  (%.0f%% smaller)' % (
        total_before / 1048576,
        total_after / 1048576,
        (1 - total_after / float(total_before)) * 100 if total_before else 0,
    ))
    print('Originals backed up in', os.path.relpath(BACKUP, ROOT))


if __name__ == '__main__':
    main()
