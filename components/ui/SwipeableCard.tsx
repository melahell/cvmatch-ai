"use client";

import { useState, useRef, ReactNode } from "react";
import { Trash2 } from "lucide-react";

interface SwipeableCardProps {
    children: ReactNode;
    onDelete: () => void;
    className?: string;
}

export function SwipeableCard({ children, onDelete, className = "" }: SwipeableCardProps) {
    const [translateX, setTranslateX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const startX = useRef(0);
    const currentX = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const DELETE_THRESHOLD = -80;
    const MAX_SWIPE = -100;

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
        currentX.current = startX.current;
        setIsSwiping(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isSwiping) return;

        currentX.current = e.touches[0].clientX;
        const diff = currentX.current - startX.current;

        // Only allow left swipe
        if (diff < 0) {
            const newTranslate = Math.max(diff, MAX_SWIPE);
            setTranslateX(newTranslate);
        }
    };

    const handleTouchEnd = () => {
        setIsSwiping(false);

        if (translateX < DELETE_THRESHOLD) {
            // Trigger delete
            setTranslateX(MAX_SWIPE);
            // Small delay before delete to show animation
            setTimeout(() => {
                onDelete();
            }, 200);
        } else {
            // Snap back
            setTranslateX(0);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        startX.current = e.clientX;
        currentX.current = startX.current;
        setIsSwiping(true);

        const handleMouseMove = (e: MouseEvent) => {
            if (!isSwiping) return;
            currentX.current = e.clientX;
            const diff = currentX.current - startX.current;
            if (diff < 0) {
                setTranslateX(Math.max(diff, MAX_SWIPE));
            }
        };

        const handleMouseUp = () => {
            setIsSwiping(false);
            if (translateX < DELETE_THRESHOLD) {
                setTranslateX(MAX_SWIPE);
                setTimeout(onDelete, 200);
            } else {
                setTranslateX(0);
            }
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    return (
        <div className={`relative overflow-hidden rounded-lg ${className}`} ref={containerRef}>
            {/* Delete background */}
            <div
                className="absolute inset-y-0 right-0 w-24 bg-red-500 flex items-center justify-center"
                style={{ opacity: Math.min(1, Math.abs(translateX) / 50) }}
            >
                <Trash2 className="w-6 h-6 text-white" />
            </div>

            {/* Card content */}
            <div
                className="relative bg-white transition-transform"
                style={{
                    transform: `translateX(${translateX}px)`,
                    transitionDuration: isSwiping ? "0ms" : "200ms"
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>
        </div>
    );
}

export default SwipeableCard;
