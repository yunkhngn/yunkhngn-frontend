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
    - pixel value 0 = revealed first (top-left text)
    - pixel value 255 = revealed last (bottom-right text)
    - background pixels = 0 (revealed immediately as paper)
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape

    binary = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        blockSize=31,
        C=15,
    )

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel, iterations=1)
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel, iterations=1)

    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(
        binary
    )

    components = []
    for i in range(1, num_labels):
        x, y, cw, ch, area = stats[i]
        if area < 20:
            continue
        cx, cy = centroids[i]
        components.append({"id": i, "cx": cx, "cy": cy, "area": area})

    if not components:
        reveal_map = np.zeros((h, w), dtype=np.uint8)
        _, buf = cv2.imencode(".png", reveal_map)
        return buf.tobytes()

    components.sort(key=lambda c: c["cy"])
    line_height = h * 0.04
    lines = []
    current_line = [components[0]]

    for comp in components[1:]:
        if abs(comp["cy"] - current_line[-1]["cy"]) < line_height:
            current_line.append(comp)
        else:
            lines.append(sorted(current_line, key=lambda c: c["cx"]))
            current_line = [comp]
    lines.append(sorted(current_line, key=lambda c: c["cx"]))

    total = sum(len(line) for line in lines)
    reveal_map = np.zeros((h, w), dtype=np.uint8)
    idx = 0

    for line in lines:
        for comp in line:
            timing = int((idx / max(total - 1, 1)) * 255)
            reveal_map[labels == comp["id"]] = timing
            idx += 1

    dilate_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    reveal_map = cv2.dilate(reveal_map, dilate_kernel, iterations=2)

    reveal_map = cv2.GaussianBlur(reveal_map, (11, 11), 0)

    _, buf = cv2.imencode(".png", reveal_map)
    return buf.tobytes()


def validate_scan(img: np.ndarray) -> dict:
    """Validate that the scanned image is suitable for processing."""
    h, w = img.shape[:2]
    issues = []

    if h < 500 or w < 300:
        issues.append("Image resolution too low (min 300x500)")
    if w > h:
        issues.append("Image appears to be landscape; expected portrait")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    contrast = gray.std()
    if contrast < 30:
        issues.append(f"Low contrast ({contrast:.0f}); text may be hard to detect")

    return {"valid": len(issues) == 0, "issues": issues, "width": w, "height": h}
