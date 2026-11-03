"""Write a lighter .webp beside each PNG in public/assets; the game prefers it. Requires Pillow: pip install pillow."""
from pathlib import Path
from PIL import Image

folder = Path(__file__).resolve().parent.parent / 'public' / 'assets'
for png in sorted(folder.glob('*.png')):
    image = Image.open(png)
    image.thumbnail((2048, 1024))  # portraits 1024x1536 -> 683x1024; the battlefield keeps its size
    target = png.with_suffix('.webp')
    image.save(target, 'WEBP', quality=82, method=6)
    print(f'{png.name}: {png.stat().st_size // 1024} KB -> {target.name}: {image.width}x{image.height}, {target.stat().st_size // 1024} KB')
