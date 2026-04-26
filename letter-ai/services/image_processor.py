import cv2
import numpy as np
import httpx


def download_image(url: str) -> np.ndarray:
    """Download image from URL and decode to OpenCV format."""
    resp = httpx.get(url, timeout=30)
    resp.raise_for_status()
    arr = np.frombuffer(resp.content, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Failed to decode image")
    return img


def generate_reveal_map(img: np.ndarray) -> bytes:
    """
    Process scanned handwriting image to generate a reveal timing map.
    Returns PNG bytes of a grayscale image where:
    - pixel value 0 = background (revealed immediately as paper)
    - pixel value 1–255 = stroke timing (1 = first, 255 = last)

    Algorithm:
    1. Binarize to find ink pixels
    2. Detect text line bands via horizontal projection
    3. Assign each ink pixel a timing value based on (line_index, x_position)
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape

    # ── Step 1: Robust ink detection ──
    # Moderate CLAHE to boost contrast for light handwriting
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(16, 16))
    enhanced = clahe.apply(gray)

    # Primary: Adaptive threshold (works best for varying ink darkness on white paper)
    adaptive_binary = cv2.adaptiveThreshold(
        enhanced, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        blockSize=31,
        C=10,
    )

    # Secondary: Otsu on enhanced (catches bold strokes reliably)
    _, otsu_binary = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Union: detect ink if either method finds it
    binary = cv2.bitwise_or(adaptive_binary, otsu_binary)

    # Morphological cleanup
    # Gentle open to remove isolated noise pixels
    open_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, open_kernel, iterations=1)
    # Close small gaps within strokes
    close_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, close_kernel, iterations=2)

    # Smart connected component filtering:
    # Remove tiny components (noise) but keep elongated thin strokes
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary)
    min_area = max(20, int(h * w * 0.00003))
    for i in range(1, num_labels):
        area = stats[i, cv2.CC_STAT_AREA]
        comp_w = stats[i, cv2.CC_STAT_WIDTH]
        comp_h = stats[i, cv2.CC_STAT_HEIGHT]
        # Keep if area is large enough, OR if it's elongated (stroke-like)
        if area < min_area:
            aspect = max(comp_w, comp_h) / max(min(comp_w, comp_h), 1)
            if aspect < 2.0:  # Square-ish small blob = noise
                binary[labels == i] = 0

    # ── Step 2: Detect text line bands via horizontal projection ──
    row_ink = np.sum(binary > 0, axis=1)  # Number of ink pixels per row

    # Smooth the projection to avoid false line breaks within a character
    smooth_window = max(3, h // 100)
    if smooth_window % 2 == 0:
        smooth_window += 1
    row_ink_smooth = cv2.GaussianBlur(
        row_ink.astype(np.float32).reshape(-1, 1),
        (1, smooth_window), 0
    ).flatten()

    # Find line bands: consecutive rows where ink density > threshold
    ink_threshold = max(2, np.max(row_ink_smooth) * 0.02)
    in_band = False
    band_start = 0
    line_bands = []
    gap_tolerance = max(5, int(h * 0.015))
    gap_count = 0

    for y in range(h):
        if row_ink_smooth[y] >= ink_threshold:
            if not in_band:
                band_start = y
                in_band = True
            gap_count = 0
        else:
            if in_band:
                gap_count += 1
                if gap_count > gap_tolerance:
                    line_bands.append((band_start, y - gap_count))
                    in_band = False
                    gap_count = 0
    if in_band:
        line_bands.append((band_start, h - 1))

    # Fallback if no bands detected
    if not line_bands:
        line_bands = [(0, h - 1)]

    # ── Step 3: Compute per-band ink X extents ──
    band_info = []
    for start_y, end_y in line_bands:
        band_slice = binary[start_y:end_y + 1, :]
        ink_cols = np.where(np.any(band_slice > 0, axis=0))[0]
        if len(ink_cols) > 0:
            min_x = int(ink_cols[0])
            max_x = int(ink_cols[-1])
        else:
            min_x, max_x = 0, w - 1
        band_info.append({
            "start_y": start_y,
            "end_y": end_y,
            "min_x": min_x,
            "max_x": max_x,
        })

    # ── Step 4: Paint the reveal timing map ──
    num_bands = len(band_info)
    reveal_map = np.zeros((h, w), dtype=np.uint8)
    TIME_MIN = 1
    TIME_MAX = 255
    band_duration = (TIME_MAX - TIME_MIN) / num_bands

    for b_idx, band in enumerate(band_info):
        t_start = TIME_MIN + b_idx * band_duration
        x_range = max(band["max_x"] - band["min_x"], 1)

        for y in range(band["start_y"], band["end_y"] + 1):
            for x in range(w):
                if binary[y, x] > 0:
                    x_progress = max(0.0, min(1.0, (x - band["min_x"]) / x_range))
                    timing = int(t_start + x_progress * band_duration)
                    timing = max(TIME_MIN, min(TIME_MAX, timing))
                    reveal_map[y, x] = timing

    # Handle stray ink not in any band (assign by Y position)
    for y in range(h):
        for x in range(w):
            if binary[y, x] > 0 and reveal_map[y, x] == 0:
                reveal_map[y, x] = max(TIME_MIN, int((y / h) * TIME_MAX))

    # Dilate the map to ensure full ink coverage at edges
    dilate_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    reveal_map = cv2.dilate(reveal_map, dilate_kernel, iterations=2)

    _, buf = cv2.imencode(".png", reveal_map)
    return buf.tobytes()


def validate_scan(img: np.ndarray) -> dict:
    """Validate that the scanned image is suitable for processing."""
    h, w = img.shape[:2]
    issues = []

    if h < 300 or w < 200:
        issues.append("Image resolution too low (min 200x300)")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    contrast = gray.std()
    if contrast < 15:
        issues.append(f"Low contrast ({contrast:.0f}); text may be hard to detect")

    return {"valid": len(issues) == 0, "issues": issues, "width": w, "height": h}
