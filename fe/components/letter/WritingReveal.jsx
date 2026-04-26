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

      setLoaded(true);
      const startTime = performance.now();

      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const threshold = progress * 255;

        const output = ctx.createImageData(canvas.width, canvas.height);
        const paper = [245, 240, 232];

        for (let i = 0; i < output.data.length; i += 4) {
          const revealVal = mapData.data[i];
          if (revealVal === 0 || revealVal <= threshold) {
            output.data[i] = letterData.data[i];
            output.data[i + 1] = letterData.data[i + 1];
            output.data[i + 2] = letterData.data[i + 2];
            output.data[i + 3] = 255;
          } else {
            output.data[i] = paper[0];
            output.data[i + 1] = paper[1];
            output.data[i + 2] = paper[2];
            output.data[i + 3] = 255;
          }
        }
        ctx.putImageData(output, 0, 0);
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
    <div className="min-h-screen bg-[#1a1410] flex flex-col items-center py-8 px-4">
      {pages.length > 1 && (
        <div className="flex gap-2 mb-6">
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentPage(i)}
              className={`w-8 h-8 rounded-full text-xs font-serif border transition-all ${
                i === currentPage
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
          <div className="relative w-full max-w-lg bg-[#f5f0e8] rounded-sm shadow-2xl overflow-hidden">
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
