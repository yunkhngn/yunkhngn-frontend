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
    # Lowered C from 10 to 5 to preserve thin and faint strokes (accents)
    adaptive_binary = cv2.adaptiveThreshold(
        enhanced, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        blockSize=31,
        C=5,
    )

    # Secondary: Otsu on enhanced (catches bold strokes reliably)
    _, otsu_binary = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Union: detect ink if either method finds it
    binary = cv2.bitwise_or(adaptive_binary, otsu_binary)

    # Morphological cleanup
    # We removed MORPH_OPEN because it severely erodes thin lines and accent marks.
    
    # Close small gaps within strokes
    close_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, close_kernel, iterations=1)

    # Smart connected component filtering:
    # Remove tiny components (noise) but keep small dots (e.g., dot on 'i', accent marks)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary)
    min_area = max(5, int(h * w * 0.000005)) # Greatly reduced to keep accents
    
    # Vectorized noise removal
    keep = stats[:, cv2.CC_STAT_AREA] >= min_area
    keep[0] = False # Ensure background (label 0) is excluded from the "keep as ink" mask
    
    # Create mask of labels to KEEP, then update binary
    # Any pixel whose label has area >= min_area stays 255, else 0
    binary = np.where(keep[labels], 255, 0).astype(np.uint8)

    # ── Step 2: Detect text line bands via horizontal projection ──
    row_ink = np.sum(binary > 0, axis=1)  # Number of ink pixels per row

    # Smooth the projection to avoid false line breaks within a character
    smooth_window = max(3, h // 200) # Giảm mượt dọc để tránh dính dòng
    if smooth_window % 2 == 0:
        smooth_window += 1
    row_ink_smooth = cv2.GaussianBlur(
        row_ink.astype(np.float32).reshape(-1, 1),
        (1, smooth_window), 0
    ).flatten()

    # Find line bands: consecutive rows where ink density > threshold
    ink_threshold = max(2, np.max(row_ink_smooth) * 0.10) # Tăng threshold lên 10% để tách các nét dính
    in_band = False
    band_start = 0
    raw_line_bands = []
    gap_tolerance = max(5, int(h * 0.005)) # Giảm khoảng hở tối đa
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
                    raw_line_bands.append((band_start, y - gap_count))
                    in_band = False
                    gap_count = 0
    if in_band:
        raw_line_bands.append((band_start, h - 1))

    # Fallback if no bands detected
    if not raw_line_bands:
        raw_line_bands = [(0, h - 1)]

    # Robust fallback: Nếu có block văn bản bị dính liền chiếm quá lớn (>8% chiều cao ảnh), 
    # Bắt buộc chia nhỏ nó thành các dòng giả để đảm bảo luôn reveal theo dòng chứ không bị cả mảng
    line_bands = []
    max_band_h = max(20, int(h * 0.08))
    for start_y, end_y in raw_line_bands:
        band_h = end_y - start_y
        if band_h > max_band_h:
            num_splits = int(np.ceil(band_h / max_band_h))
            split_h = band_h // num_splits
            for s in range(num_splits):
                s_start = start_y + s * split_h
                s_end = start_y + (s + 1) * split_h - 1 if s < num_splits - 1 else end_y
                line_bands.append((s_start, s_end))
        else:
            line_bands.append((start_y, end_y))

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
    # Key change: reveal LINE BY LINE (top to bottom).
    # 80% of the timeline is for line transitions, 20% for within-line sweep.
    num_bands = len(band_info)
    reveal_map = np.zeros((h, w), dtype=np.uint8)
    TIME_MIN = 1
    TIME_MAX = 255
    total_range = TIME_MAX - TIME_MIN
    LINE_WEIGHT = 0.10  # 10% of time for line transitions
    X_WEIGHT = 0.90     # 90% for left-to-right within a line

    band_duration = total_range / num_bands

    for b_idx, band in enumerate(band_info):
        # Base time for this line (line transition portion)
        t_line_base = TIME_MIN + b_idx * band_duration
        x_range = max(band["max_x"] - band["min_x"], 1)

        y_slice = slice(band["start_y"], band["end_y"] + 1)
        band_binary = binary[y_slice, :]
        
        # Vectorized timing calculation
        x_indices = np.arange(w)
        x_progress = np.clip((x_indices - band["min_x"]) / x_range, 0.0, 1.0)
        
        timing_x = t_line_base + x_progress * band_duration * X_WEIGHT
        timing_x = np.clip(timing_x, TIME_MIN, TIME_MAX).astype(np.uint8)
        
        timing_2d = np.tile(timing_x, (band_binary.shape[0], 1))
        
        mask = band_binary > 0
        
        # Get the sub-region of reveal_map and update it
        band_reveal = reveal_map[y_slice, :]
        band_reveal[mask] = timing_2d[mask]

    # Handle stray ink not in any band (assign by Y position)
    stray_mask = (binary > 0) & (reveal_map == 0)
    y_indices = np.arange(h)
    timing_y = np.clip((y_indices / h) * TIME_MAX, TIME_MIN, TIME_MAX).astype(np.uint8)
    timing_2d_y = np.tile(timing_y[:, np.newaxis], (1, w))
    reveal_map[stray_mask] = timing_2d_y[stray_mask]

    # Dilate the map to ensure full ink coverage at edges
    # Use smaller kernel to avoid erasing characters near edges
    dilate_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    reveal_map = cv2.dilate(reveal_map, dilate_kernel, iterations=1)

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
