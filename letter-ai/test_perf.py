import numpy as np
import time

h, w = 3500, 2500
binary = np.random.randint(0, 2, (h, w), dtype=np.uint8) * 255
reveal_map = np.zeros((h, w), dtype=np.uint8)
TIME_MIN = 1
TIME_MAX = 255
band_info = [{"start_y": 0, "end_y": h-1, "min_x": 100, "max_x": w-100}]
band_duration = 200
X_WEIGHT = 0.2

start = time.time()
num_bands = len(band_info)
for b_idx, band in enumerate(band_info):
    t_line_base = TIME_MIN + b_idx * band_duration
    x_range = max(band["max_x"] - band["min_x"], 1)
    
    # Vectorized
    y_slice = slice(band["start_y"], band["end_y"] + 1)
    band_binary = binary[y_slice, :]
    
    x_indices = np.arange(w)
    x_progress = np.clip((x_indices - band["min_x"]) / x_range, 0.0, 1.0)
    
    timing_x = t_line_base + x_progress * band_duration * X_WEIGHT
    timing_x = np.clip(timing_x, TIME_MIN, TIME_MAX).astype(np.uint8)
    
    timing_2d = np.tile(timing_x, (band_binary.shape[0], 1))
    
    mask = band_binary > 0
    reveal_map[y_slice, :][mask] = timing_2d[mask]

stray_mask = (binary > 0) & (reveal_map == 0)
y_indices = np.arange(h)
timing_y = np.clip((y_indices / h) * TIME_MAX, TIME_MIN, TIME_MAX).astype(np.uint8)
timing_2d_y = np.tile(timing_y[:, np.newaxis], (1, w))
reveal_map[stray_mask] = timing_2d_y[stray_mask]

print("Vectorized time:", time.time() - start)
