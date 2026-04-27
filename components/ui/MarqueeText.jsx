import React, { useRef, useState, useEffect } from "react";

export function MarqueeText({ children, className }) {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const containerRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        const checkOverflow = () => {
            if (containerRef.current && textRef.current) {
                setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
            }
        };

        checkOverflow();
        window.addEventListener("resize", checkOverflow);
        return () => window.removeEventListener("resize", checkOverflow);
    }, [children]);

    return (
        <div
            ref={containerRef}
            className={`overflow-hidden whitespace-nowrap ${className || ""}`}
        >
            <div
                ref={textRef}
                className={`inline-block ${isOverflowing ? "animate-marquee flex" : ""}`}
            >
                <span className={isOverflowing ? "pr-4" : ""}>{children}</span>
                {isOverflowing && <span className="pr-4">{children}</span>}
            </div>
        </div>
    );
}
