from hashlib import sha256
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "public" / "assets" / "brand"
SOURCE = BRAND / "bussola-app-icon-source.png"
OUTPUTS = {
    "pwa-192x192.png": 192,
    "pwa-512x512.png": 512,
    "pwa-maskable-512x512.png": 512,
    "apple-touch-icon.png": 180,
}


def digest(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest()


with Image.open(SOURCE) as source:
    if source.width != source.height:
        raise SystemExit("The icon master must be square; refusing to crop it.")
    image = source.convert("RGB")
    for name, size in OUTPUTS.items():
        destination = BRAND / name
        resized = image.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(destination, format="PNG", optimize=True)
        print(f"{name} {size}x{size} {digest(destination)}")

