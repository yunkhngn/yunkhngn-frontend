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
num_bands = 1

start = time.time()
for b_idx, band in enumerate(band_info):
    t_line_base = TIME_MIN + b_idx * band_duration
    x_range = max(band["max_x"] - band["min_x"], 1)

    for y in range(band["start_y"], band["end_y"] + 1):
        for x in range(w):
            if binary[y, x] > 0:
                x_progress = max(0.0, min(1.0, (x - band["min_x"]) / x_range))
                timing = int(t_line_base + x_progress * band_duration * X_WEIGHT)
                timing = max(TIME_MIN, min(TIME_MAX, timing))
                reveal_map[y, x] = timing
print("Naive part 1:", time.time() - start)
