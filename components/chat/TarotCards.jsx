'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const POSITIONS = ['Quá khứ', 'Hiện tại', 'Tương lai'];
const POSITION_ICONS = ['🌙', '☀️', '⭐'];

export default function TarotCards({ cards }) {
    const [flipped, setFlipped] = useState([false, false, false]);

    const handleFlip = (index) => {
        setFlipped(prev => {
            const next = [...prev];
            next[index] = true;
            return next;
        });
    };

    if (!cards || cards.length !== 3) return null;

    return (
        <div className="w-full my-3">
            {/* Header */}
            <div className="text-center mb-3">
                <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
                    ✦ Trải bài Tarot ✦
                </span>
            </div>

            {/* Cards Grid */}
            <div className="flex gap-2 justify-center">
                {cards.map((card, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.3, duration: 0.5 }}
                        className="flex flex-col items-center gap-1.5 flex-1 max-w-[130px]"
                    >
                        {/* Position Label */}
                        <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
                            {POSITION_ICONS[index]} {POSITIONS[index]}
                        </span>

                        {/* Card */}
                        <div
                            className="relative w-full aspect-[2/3] cursor-pointer [perspective:600px]"
                            onClick={() => handleFlip(index)}
                        >
                            {/* Card Inner - handles flip */}
                            <div className={cn(
                                "relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]",
                                flipped[index] && "[transform:rotateY(180deg)]"
                            )}>
                                {/* Card Back */}
                                <div className="absolute inset-0 [backface-visibility:hidden] rounded-lg overflow-hidden border border-purple-500/30 bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-950 flex items-center justify-center shadow-lg shadow-purple-500/10">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_70%)]" />
                                    <div className="text-center">
                                        <div className="text-3xl mb-1">🔮</div>
                                        <span className="text-[9px] text-purple-300/60 font-medium tracking-wider">TAP TO REVEAL</span>
                                    </div>
                                </div>

                                {/* Card Front */}
                                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg overflow-hidden border border-purple-500/20 shadow-lg shadow-purple-500/10">
                                    <Image
                                        src={card.image}
                                        alt={card.name}
                                        fill
                                        sizes="130px"
                                        className="object-cover"
                                        unoptimized
                                    />
                                    {/* Card Name Overlay */}
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 pt-4">
                                        <p className="text-[10px] font-bold text-white text-center leading-tight truncate">
                                            {card.name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Flip hint */}
            {!flipped.every(Boolean) && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-center text-[10px] text-muted-foreground/50 mt-2"
                >
                    Nhấn vào lá bài để lật
                </motion.p>
            )}
        </div>
    );
}
