import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

function RevealCanvas({ imageUrl, revealMapUrl, duration = 8000 }) {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const letterImg = new Image();
    const mapImg = new Image();
    letterImg.crossOrigin = 'anonymous';
    mapImg.crossOrigin = 'anonymous';

    let animId;
    let letterData;
    let mapData;

    const startAnimation = () => {
      canvas.width = letterImg.width;
      canvas.height = letterImg.height;

      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');

      tempCanvas.width = letterImg.width;
      tempCanvas.height = letterImg.height;
      tempCtx.drawImage(letterImg, 0, 0);
      letterData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

      tempCtx.clearRect(0, 0, canvas.width, canvas.height);
      tempCtx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);
      mapData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

      // Dilation pass: thicken the stroke mask slightly to fully cover the printed ink edges
      const width = canvas.width;
      const height = canvas.height;
      const dilatedMap = new Uint8Array(width * height);
      const DILATE_RADIUS = 3;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let maxVal = 0;
          for (let dy = -DILATE_RADIUS; dy <= DILATE_RADIUS; dy++) {
            for (let dx = -DILATE_RADIUS; dx <= DILATE_RADIUS; dx++) {
              const ny = y + dy;
              const nx = x + dx;
              if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                const val = mapData.data[(ny * width + nx) * 4];
                if (val > maxVal) maxVal = val;
              }
            }
          }
          dilatedMap[y * width + x] = maxVal;
        }
      }

      // Pre-compute the background image by inpainting strokes
      const bgData = tempCtx.createImageData(canvas.width, canvas.height);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const mapVal = dilatedMap[y * width + x];
          // If it's a background pixel (0), just copy it exactly
          if (mapVal === 0) {
            bgData.data[i] = letterData.data[i];
            bgData.data[i + 1] = letterData.data[i + 1];
            bgData.data[i + 2] = letterData.data[i + 2];
            bgData.data[i + 3] = 255;
          } else {
            // It's a stroke pattern. We need to find a nearby background pixel to fill it in
            let bgI = i;
            let found = false;
            // Search radially outwards (up to 20 pixels, strokes are generally thin)
            for (let d = 1; d <= 20; d++) {
              if (x + d < width && dilatedMap[y * width + (x + d)] === 0) { bgI = (y * width + (x + d)) * 4; found = true; break; }
              if (x - d >= 0 && dilatedMap[y * width + (x - d)] === 0) { bgI = (y * width + (x - d)) * 4; found = true; break; }
              if (y + d < height && dilatedMap[(y + d) * width + x] === 0) { bgI = ((y + d) * width + x) * 4; found = true; break; }
              if (y - d >= 0 && dilatedMap[(y - d) * width + x] === 0) { bgI = ((y - d) * width + x) * 4; found = true; break; }
            }
            if (found) {
              bgData.data[i] = letterData.data[bgI];
              bgData.data[i + 1] = letterData.data[bgI + 1];
              bgData.data[i + 2] = letterData.data[bgI + 2];
            } else {
              // Fallback if stroke is super thick (shouldn't happen with handwriting)
              bgData.data[i] = 245;
              bgData.data[i + 1] = 240;
              bgData.data[i + 2] = 232;
            }
            bgData.data[i + 3] = 255;
          }
        }
      }

      // ── Step 3: Detect text line bands from the ink mask ──
      const INK_THRESHOLD = 10;
      const rowInkCount = new Uint16Array(height);
      for (let y = 0; y < height; y++) {
        let count = 0;
        for (let x = 0; x < width; x++) {
          if (dilatedMap[y * width + x] > INK_THRESHOLD) count++;
        }
        rowInkCount[y] = count;
      }

      // Group consecutive rows with ink into line bands
      const lineBands = [];
      const MIN_INK_PER_ROW = 3;
      const GAP_TOLERANCE = Math.max(8, Math.round(height * 0.015));
      let bandStart = -1;
      let gapCount = 0;

      for (let y = 0; y < height; y++) {
        if (rowInkCount[y] >= MIN_INK_PER_ROW) {
          if (bandStart === -1) bandStart = y;
          gapCount = 0;
        } else {
          if (bandStart !== -1) {
            gapCount++;
            if (gapCount > GAP_TOLERANCE) {
              lineBands.push({ startY: bandStart, endY: y - gapCount });
              bandStart = -1;
              gapCount = 0;
            }
          }
        }
      }
      if (bandStart !== -1) {
        lineBands.push({ startY: bandStart, endY: height - 1 - gapCount });
      }

      // Fallback: if no bands detected, treat the whole image as one band
      if (lineBands.length === 0) {
        lineBands.push({ startY: 0, endY: height - 1 });
      }

      // For each band, find the min/max X of ink for better left-to-right sweep
      for (const band of lineBands) {
        let minX = width, maxX = 0;
        for (let y = band.startY; y <= band.endY; y++) {
          for (let x = 0; x < width; x++) {
            if (dilatedMap[y * width + x] > INK_THRESHOLD) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
            }
          }
        }
        band.minX = minX;
        band.maxX = maxX;
      }

      // ── Step 4: Pre-compute a synthetic timing map ──
      // Each band gets an equal slice of the timeline (1–255)
      // Within each band, time flows left-to-right
      const syntheticTimeMap = new Float32Array(width * height);
      const numBands = lineBands.length;
      const TIME_MIN = 1; // Never use 0 for strokes (0 = background)
      const TIME_MAX = 255;
      const bandDuration = (TIME_MAX - TIME_MIN) / numBands;

      for (let b = 0; b < numBands; b++) {
        const band = lineBands[b];
        const tStart = TIME_MIN + b * bandDuration;
        const xRange = Math.max(band.maxX - band.minX, 1);

        for (let y = band.startY; y <= band.endY; y++) {
          for (let x = 0; x < width; x++) {
            const i = y * width + x;
            if (dilatedMap[i] <= INK_THRESHOLD) continue;
            // X progress within this band (0 to 1)
            const xProgress = Math.max(0, Math.min(1, (x - band.minX) / xRange));
            syntheticTimeMap[i] = tStart + xProgress * bandDuration;
          }
        }
      }

      // Handle any stray ink pixels not in any band (assign based on Y position)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = y * width + x;
          if (dilatedMap[i] > INK_THRESHOLD && syntheticTimeMap[i] === 0) {
            syntheticTimeMap[i] = TIME_MIN + (y / height) * (TIME_MAX - TIME_MIN);
          }
        }
      }

      // ── Step 5: Animation loop ──
      setLoaded(true);
      const startTime = performance.now();

      const outputImageData = ctx.createImageData(width, height);
      const out32 = new Uint32Array(outputImageData.data.buffer);
      const letter32 = new Uint32Array(letterData.data.buffer);
      const bg32 = new Uint32Array(bgData.data.buffer);
      const totalPixels = out32.length;

      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const threshold = progress * TIME_MAX;

        for (let i = 0; i < totalPixels; i++) {
          if (dilatedMap[i] <= INK_THRESHOLD) {
            out32[i] = bg32[i]; // Background
          } else if (syntheticTimeMap[i] <= threshold) {
            out32[i] = letter32[i]; // Revealed ink
          } else {
            out32[i] = bg32[i]; // Hidden ink (show inpainted bg)
          }
        }

        ctx.putImageData(outputImageData, 0, 0);
        if (progress < 1) animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);
    };

    let loadCount = 0;
    const onLoad = () => {
      loadCount++;
      if (loadCount === 2) startAnimation();
    };
    letterImg.onload = onLoad;
    mapImg.onload = onLoad;
    letterImg.src = imageUrl;
    mapImg.src = revealMapUrl;

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [imageUrl, revealMapUrl, duration]);

  return (
    <div
      className="relative w-full max-w-lg bg-[#f5f0e8] rounded-sm shadow-2xl overflow-hidden"
      style={{
        boxShadow:
          '0 4px 40px rgba(0,0,0,0.5), inset 0 0 80px rgba(139,109,71,0.08)',
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-auto block"
        style={{ opacity: loaded ? 1 : 0 }}
      />
      {!loaded && (
        <div className="aspect-[3/4] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-amber-600/40 border-t-amber-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

export default function WritingReveal({ pages }) {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2a2119] via-[#140e0b] to-[#0a0705] flex flex-col items-center py-8 px-4">
      {pages.length > 1 && (
        <div className="flex gap-2 mb-6">
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentPage(i)}
              className={`w-8 h-8 rounded-full text-xs font-serif border transition-all ${i === currentPage
                ? 'bg-amber-800/60 border-amber-600/50 text-amber-100'
                : 'bg-transparent border-amber-900/30 text-amber-100/40 hover:border-amber-700/40'
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {pages[currentPage].revealMapUrl ? (
          <RevealCanvas
            imageUrl={pages[currentPage].imageUrl}
            revealMapUrl={pages[currentPage].revealMapUrl}
          />
        ) : (
          <div className="relative w-full max-w-lg bg-[#f5f0e8] rounded-sm shadow-[0_4px_40px_rgba(0,0,0,0.5),_inset_0_0_80px_rgba(139,109,71,0.08)] overflow-hidden">
            <img
              src={pages[currentPage].imageUrl}
              alt={`Page ${currentPage + 1}`}
              className="w-full h-auto block"
            />
          </div>
        )}
      </motion.div>
      {pages.length > 1 && (
        <p className="mt-4 text-amber-100/30 text-xs font-serif">
          Trang {currentPage + 1} / {pages.length}
        </p>
      )}
    </div>
  );
}
