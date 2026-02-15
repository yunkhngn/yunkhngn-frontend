import { useState, useCallback, useEffect, useRef } from 'react';

// ── Block shapes ────────────────────────────────────────────────
const SHAPES = [
    // Single
    [[1]],
    // Dominos
    [[1, 1]],
    [[1], [1]],
    // Trominos
    [[1, 1, 1]],
    [[1], [1], [1]],
    [[1, 1], [1, 0]],
    [[1, 1], [0, 1]],
    [[0, 1], [1, 1]],
    [[1, 0], [1, 1]],
    // Tetrominos
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]],
    [[1, 1], [1, 1]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 1], [0, 1, 0]],
    // Pentominos (bigger, harder)
    [[1, 1, 1, 1, 1]],
    [[1], [1], [1], [1], [1]],
    [[1, 1, 1], [1, 1, 0]],
    [[1, 1, 1], [0, 1, 1]],
    [[1, 1, 1], [1, 0, 1]],
    // L-shaped 3x3
    [[1, 0, 0], [1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [0, 0, 1], [1, 1, 1]],
    [[1, 1, 1], [1, 0, 0], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1], [0, 0, 1]],
    // Big square
    [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
];

const GRID_SIZE = 8;
const PIECE_COUNT = 3;

const COLORS = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
    'bg-amber-500', 'bg-rose-500', 'bg-cyan-500',
    'bg-pink-500', 'bg-teal-500', 'bg-orange-500',
];

const GHOST_COLORS = [
    'bg-blue-500/30', 'bg-emerald-500/30', 'bg-violet-500/30',
    'bg-amber-500/30', 'bg-rose-500/30', 'bg-cyan-500/30',
    'bg-pink-500/30', 'bg-teal-500/30', 'bg-orange-500/30',
];

function randomColor() {
    return Math.floor(Math.random() * COLORS.length);
}

function randomPieces() {
    return Array.from({ length: PIECE_COUNT }, () => ({
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        color: randomColor(),
        used: false,
    }));
}

function emptyGrid() {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(-1));
}

function canPlace(grid, shape, row, col) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (!shape[r][c]) continue;
            const gr = row + r;
            const gc = col + c;
            if (gr < 0 || gr >= GRID_SIZE || gc < 0 || gc >= GRID_SIZE) return false;
            if (grid[gr][gc] !== -1) return false;
        }
    }
    return true;
}

function canPlaceAnywhere(grid, shape) {
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (canPlace(grid, shape, r, c)) return true;
        }
    }
    return false;
}

function placeShape(grid, shape, row, col, colorIdx) {
    const newGrid = grid.map((r) => [...r]);
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                newGrid[row + r][col + c] = colorIdx;
            }
        }
    }
    return newGrid;
}

function clearLines(grid) {
    let cleared = 0;
    const toClearRows = new Set();
    const toClearCols = new Set();

    // Check rows
    for (let r = 0; r < GRID_SIZE; r++) {
        if (grid[r].every((c) => c !== -1)) toClearRows.add(r);
    }
    // Check cols
    for (let c = 0; c < GRID_SIZE; c++) {
        let full = true;
        for (let r = 0; r < GRID_SIZE; r++) {
            if (grid[r][c] === -1) { full = false; break; }
        }
        if (full) toClearCols.add(c);
    }

    cleared = toClearRows.size + toClearCols.size;

    if (cleared > 0) {
        const newGrid = grid.map((r) => [...r]);
        toClearRows.forEach((r) => {
            for (let c = 0; c < GRID_SIZE; c++) newGrid[r][c] = -1;
        });
        toClearCols.forEach((c) => {
            for (let r = 0; r < GRID_SIZE; r++) newGrid[r][c] = -1;
        });
        return { grid: newGrid, cleared };
    }

    return { grid, cleared: 0 };
}

function isGameOver(grid, pieces) {
    const remaining = pieces.filter((p) => !p.used);
    if (remaining.length === 0) return false; // will get new pieces
    return remaining.every((p) => !canPlaceAnywhere(grid, p.shape));
}

// ── Component ───────────────────────────────────────────────────
export default function FlappyGame() {
    const [grid, setGrid] = useState(emptyGrid);
    const [pieces, setPieces] = useState(randomPieces);

    // Drag state
    const [dragging, setDragging] = useState(null); // { pieceIndex, startX, startY, currentX, currentY }
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Grid interaction state
    const [hover, setHover] = useState(null); // { row, col }

    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [clearingCells, setClearingCells] = useState(new Set());
    const [highScore, setHighScore] = useState(() => {
        if (typeof window !== 'undefined') {
            const s = localStorage.getItem('blockblast404_high');
            return s ? parseInt(s, 10) : 0;
        }
        return 0;
    });

    const gridRef = useRef(null);
    const pieceRefs = useRef([]);

    // --- Logic for Drag & Drop ---

    const handlePointerDown = (e, index) => {
        if (gameOver || pieces[index].used) return;

        e.preventDefault(); // Prevent scrolling on touch
        const pieceEl = pieceRefs.current[index];
        const rect = pieceEl.getBoundingClientRect();

        // Calculate offset from the top-left of the piece
        const x = e.clientX || e.touches?.[0].clientX;
        const y = e.clientY || e.touches?.[0].clientY;

        setDragOffset({
            x: x - rect.left,
            y: y - rect.top
        });

        setDragging({
            index,
            startX: rect.left,
            startY: rect.top,
            currentX: x, // initial position
            currentY: y,
            width: rect.width,
            height: rect.height
        });
    };

    const handlePointerMove = useCallback((e) => {
        if (!dragging) return;

        const x = e.clientX || e.touches?.[0].clientX;
        const y = e.clientY || e.touches?.[0].clientY;

        // Update dragging position
        setDragging(prev => ({ ...prev, currentX: x, currentY: y }));

        // Check if hovering over grid
        if (gridRef.current) {
            const gridRect = gridRef.current.getBoundingClientRect();

            // Piece center point for hit testing
            // Adjust this offset to make the piece feel like it's under the finger/cursor comfortably
            // We'll use the top-left of the piece relative to pointer + an offset to center on the first block
            const pieceX = x - dragOffset.x + 20; // +20 assumes block size ~40
            const pieceY = y - dragOffset.y + 20;

            if (
                pieceX >= gridRect.left &&
                pieceX <= gridRect.right &&
                pieceY >= gridRect.top &&
                pieceY <= gridRect.bottom
            ) {
                // Calculate grid cell
                const col = Math.floor((pieceX - gridRect.left) / (gridRect.width / GRID_SIZE));
                const row = Math.floor((pieceY - gridRect.top) / (gridRect.height / GRID_SIZE));

                if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
                    setHover({ row, col });
                    return;
                }
            }
        }
        setHover(null);
    }, [dragging, dragOffset]);

    const handlePointerUp = useCallback(() => {
        if (!dragging) return;

        // Try to place piece
        if (hover && pieces[dragging.index]) {
            const piece = pieces[dragging.index];
            if (canPlace(grid, piece.shape, hover.row, hover.col)) {

                // --- Placement Logic (same as before) ---
                let blockCount = 0;
                for (const r of piece.shape) for (const c of r) if (c) blockCount++;

                const newGrid = placeShape(grid, piece.shape, hover.row, hover.col, piece.color);
                const { grid: clearedGrid, cleared } = clearLines(newGrid);

                let earned = blockCount;
                let newCombo = 0;
                if (cleared > 0) {
                    newCombo = combo + 1;
                    earned += cleared * GRID_SIZE * newCombo;
                }

                const newScore = score + earned;
                setCombo(cleared > 0 ? newCombo : 0);
                setScore(newScore);

                if (cleared > 0) {
                    const cc = new Set();
                    for (let r = 0; r < GRID_SIZE; r++) {
                        for (let c = 0; c < GRID_SIZE; c++) {
                            if (newGrid[r][c] !== -1 && clearedGrid[r][c] === -1) {
                                cc.add(`${r}-${c}`);
                            }
                        }
                    }
                    setClearingCells(cc);
                    setTimeout(() => setClearingCells(new Set()), 300);
                }

                setGrid(clearedGrid);

                let nextPieces = pieces.map((p, i) => (i === dragging.index ? { ...p, used: true } : p));
                if (nextPieces.every((p) => p.used)) {
                    nextPieces = randomPieces();
                }
                setPieces(nextPieces);

                if (isGameOver(clearedGrid, nextPieces)) {
                    setGameOver(true);
                    if (newScore > highScore) {
                        setHighScore(newScore);
                        localStorage.setItem('blockblast404_high', newScore.toString());
                    }
                }
            }
        }

        setDragging(null);
        setHover(null);
    }, [dragging, hover, pieces, grid, combo, score, highScore]);

    // Attach global move/up listeners when dragging
    useEffect(() => {
        if (dragging) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
            window.addEventListener('touchmove', handlePointerMove, { passive: false });
            window.addEventListener('touchend', handlePointerUp);
        }
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);
        };
    }, [dragging, handlePointerMove, handlePointerUp]);

    const restart = () => {
        setGrid(emptyGrid());
        setPieces(randomPieces());
        setDragging(null);
        setHover(null);
        setScore(0);
        setCombo(0);
        setGameOver(false);
    };

    const CELL_SIZE = 40; // Approx px size
    const CELL_CLASS = 'w-9 h-9 sm:w-10 sm:h-10';

    // Ghost calculation
    const getGhostCells = () => {
        if (!dragging || hover === null) return new Set();
        const piece = pieces[dragging.index];
        const { shape } = piece;
        if (!canPlace(grid, shape, hover.row, hover.col)) return new Set();
        const cells = new Set();
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) cells.add(`${hover.row + r}-${hover.col + c}`);
            }
        }
        return cells;
    };

    const ghostCells = getGhostCells();
    const canDrop = dragging && hover && canPlace(grid, pieces[dragging.index].shape, hover.row, hover.col);

    return (
        <div className="flex flex-col items-center gap-6 select-none relative">
            {/* Score bar */}
            <div className="flex items-center gap-6 font-mono text-sm">
                <span className="text-muted-foreground">
                    Score: <span className="text-primary font-bold text-lg">{score}</span>
                </span>
                <span className="text-muted-foreground">
                    Best: <span className="text-amber-500 font-bold">{highScore}</span>
                </span>
                {combo > 1 && (
                    <span className="text-emerald-400 font-bold animate-bounce">
                        COMBO x{combo}
                    </span>
                )}
            </div>

            {/* Grid */}
            <div
                ref={gridRef}
                className="grid gap-[2px] p-2 rounded-xl border border-border bg-card/50 backdrop-blur-sm shadow-xl"
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
            >
                {grid.map((row, r) =>
                    row.map((cell, c) => {
                        const key = `${r}-${c}`;
                        const isGhost = ghostCells.has(key);
                        const isClearing = clearingCells.has(key);
                        const filled = cell !== -1;

                        return (
                            <div
                                key={key}
                                className={`${CELL_CLASS} rounded-md border transition-all duration-150
                                    ${filled
                                        ? `${COLORS[cell]} border-white/20 shadow-inner ${isClearing ? 'scale-0 opacity-0' : ''}`
                                        : isGhost
                                            ? `${canDrop ? GHOST_COLORS[pieces[dragging.index].color] : 'bg-red-500/20'} border-dashed ${canDrop ? 'border-white/30' : 'border-red-500/30'}`
                                            : 'bg-muted/30 border-border/30'
                                    }`}
                            />
                        );
                    })
                )}
            </div>

            {/* Pieces tray */}
            <div className="flex items-start justify-center gap-8 min-h-[100px] pt-4">
                {pieces.map((piece, i) => {
                    const isDragging = dragging?.index === i;
                    const isUsed = piece.used;

                    // We render a placeholder when used or dragging
                    if (isUsed) return <div key={i} className="w-16 h-16 opacity-0" />;

                    return (
                        <div
                            key={i}
                            ref={el => pieceRefs.current[i] = el}
                            onPointerDown={(e) => handlePointerDown(e, i)}
                            className={`cursor-grab active:cursor-grabbing touch-none ${isDragging ? 'opacity-0' : ''}`}
                            style={{ opacity: isDragging ? 0 : 1 }} // Hide original while dragging
                        >
                            <div
                                className="grid gap-[2px]"
                                style={{ gridTemplateColumns: `repeat(${piece.shape[0].length}, 1fr)` }}
                            >
                                {piece.shape.flat().map((cell, j) => (
                                    <div
                                        key={j}
                                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-sm ${cell ? `${COLORS[piece.color]} border border-white/20 shadow-sm` : 'bg-transparent'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Dragging Portal/Overlay */}
            {dragging && (
                <div
                    className="fixed pointer-events-none z-50"
                    style={{
                        left: dragging.currentX - dragOffset.x,
                        top: dragging.currentY - dragOffset.y,
                        // Scale up slightly while dragging for visibility
                        transform: 'scale(1.2)'
                    }}
                >
                    <div
                        className="grid gap-[2px]"
                        style={{ gridTemplateColumns: `repeat(${pieces[dragging.index].shape[0].length}, 1fr)` }}
                    >
                        {pieces[dragging.index].shape.flat().map((cell, j) => (
                            <div
                                key={j}
                                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-sm ${cell ? `${COLORS[pieces[dragging.index].color]} border border-white/20 shadow-lg` : 'bg-transparent'}`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Hint */}
            {!gameOver && !dragging && (
                <p className="text-xs text-muted-foreground font-mono animate-pulse">
                    Drag & Drop blocks onto the grid
                </p>
            )}

            {/* Game Over overlay */}
            {gameOver && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-20">
                    <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                        <p className="text-3xl font-bold font-mono text-primary">Game Over</p>
                        <div className="text-center space-y-1">
                            <p className="text-sm text-muted-foreground font-mono">Final Score</p>
                            <p className="text-4xl font-bold">{score}</p>
                            {score >= highScore && score > 0 && (
                                <p className="text-amber-500 font-bold text-sm">New High Score!</p>
                            )}
                        </div>
                        <button
                            onClick={restart}
                            className="mt-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-mono font-bold hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
