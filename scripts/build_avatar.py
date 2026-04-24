"""Build fishing.gif from fishing.png.

Splits the 3-panel source storyboard, strips panel dividers, removes
the background using onnxruntime + u2net (same model rembg uses, but
without rembg's broken llvmlite/numba dependency chain), and assembles
a looping GIF.

One-off — run only when fishing.png changes. Output: fishing.gif (repo root).
"""

from pathlib import Path
import urllib.request
import numpy as np
import onnxruntime as ort
from PIL import Image

REPO = Path(__file__).parent.parent
SRC = REPO / "fishing.png"
OUT = REPO / "fishing.gif"
FRAME_DIR = REPO / "scripts" / "frames"
MODEL_PATH = REPO / "scripts" / "u2net.onnx"

# u2net model from the official rembg release mirror
MODEL_URL = (
    "https://github.com/danielgatis/rembg/releases/download/"
    "v0.0.0/u2net.onnx"
)

FRAME_MS = 500  # per frame
PANELS = 3
# Pixel padding to trim off the black panel borders after splitting.
BORDER_CROP = 6


def download_model() -> None:
    if MODEL_PATH.exists():
        print(f"Model already present: {MODEL_PATH}")
        return
    print(f"Downloading u2net model (~180 MB) to {MODEL_PATH} …")
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    print("Download complete.")


def preprocess(pil_img: Image.Image) -> np.ndarray:
    """Resize to 320x320 and normalise to float32 tensor [1,3,H,W]."""
    img = pil_img.convert("RGB").resize((320, 320), Image.BILINEAR)
    arr = np.array(img, dtype=np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    arr = (arr - mean) / std
    return arr.transpose(2, 0, 1)[np.newaxis]  # [1,3,320,320]


def predict_mask(session: ort.InferenceSession, pil_img: Image.Image) -> Image.Image:
    """Run u2net and return a greyscale mask the same size as pil_img."""
    tensor = preprocess(pil_img)
    inp_name = session.get_inputs()[0].name
    out_name = session.get_outputs()[0].name
    pred = session.run([out_name], {inp_name: tensor})[0]  # [1,1,320,320]
    mask = pred[0, 0]
    # Normalise to [0,255]
    mask = (mask - mask.min()) / (mask.max() - mask.min() + 1e-8)
    mask = (mask * 255).astype(np.uint8)
    mask_img = Image.fromarray(mask, mode="L")
    return mask_img.resize(pil_img.size, Image.BILINEAR)


def remove_background(session: ort.InferenceSession, pil_img: Image.Image) -> Image.Image:
    """Return RGBA image with background zeroed out."""
    mask = predict_mask(session, pil_img)
    result = pil_img.convert("RGBA")
    r, g, b, a = result.split()
    # Use the u2net mask as the alpha channel
    result = Image.merge("RGBA", (r, g, b, mask))
    return result


def main() -> None:
    download_model()

    session = ort.InferenceSession(str(MODEL_PATH))
    print("Model loaded.")

    src = Image.open(SRC).convert("RGBA")
    w, h = src.size
    panel_w = w // PANELS
    FRAME_DIR.mkdir(parents=True, exist_ok=True)

    frames: list[Image.Image] = []
    for i in range(PANELS):
        left = i * panel_w + BORDER_CROP
        right = (i + 1) * panel_w - BORDER_CROP
        top = BORDER_CROP
        bottom = h - BORDER_CROP
        panel = src.crop((left, top, right, bottom))
        print(f"Processing frame {i} ({panel.width}x{panel.height}) …")
        cut = remove_background(session, panel)
        cut.save(FRAME_DIR / f"frame_{i}.png")
        frames.append(cut)

    # Resize all frames to match the smallest dimensions (they may differ by 1-2px)
    min_w = min(f.width for f in frames)
    min_h = min(f.height for f in frames)
    frames = [f.resize((min_w, min_h), Image.NEAREST) for f in frames]

    frames[0].save(
        OUT,
        save_all=True,
        append_images=frames[1:],
        duration=FRAME_MS,
        loop=0,
        disposal=2,
        transparency=0,
    )
    print(f"Wrote {OUT} ({min_w}x{min_h}, {len(frames)} frames @ {FRAME_MS}ms)")


if __name__ == "__main__":
    main()
