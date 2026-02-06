'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

interface CarouselProps {
    images: string[];
    baseWidth?: number;
    autoplay?: boolean;
    autoplayDelay?: number;
    pauseOnHover?: boolean;
    loop?: boolean;
}

export default function Carousel({
    images,
    baseWidth = 400,
    autoplay = true,
    autoplayDelay = 4000,
    pauseOnHover = true,
    loop = true,
}: CarouselProps) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (autoplay && (!pauseOnHover || !isHovered)) {
            const timer = setInterval(() => {
                handleNext();
            }, autoplayDelay);
            return () => clearInterval(timer);
        }
    }, [autoplay, autoplayDelay, pauseOnHover, isHovered, currentIdx]);

    const handleNext = () => {
        if (loop || currentIdx < images.length - 1) {
            setCurrentIdx((prev) => (prev + 1) % images.length);
        }
    };

    const handlePrev = () => {
        if (loop || currentIdx > 0) {
            setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    return (
        <div
            className="relative w-full h-full flex items-center justify-center overflow-visible"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ perspective: '1200px' }}
        >
            <div className="relative w-full h-full flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                    {images.map((img, index) => {
                        // Calculate distance from current index
                        let diff = index - currentIdx;

                        // Handle looping logic for distance
                        if (loop) {
                            if (diff > images.length / 2) diff -= images.length;
                            if (diff < -images.length / 2) diff += images.length;
                        }

                        const isCenter = diff === 0;
                        const isVisible = Math.abs(diff) <= 2; // Only show 5 items max

                        if (!isVisible) return null;

                        return (
                            <motion.div
                                key={`${img}-${index}`}
                                initial={{
                                    opacity: 0,
                                    scale: 0.8,
                                    rotateY: diff > 0 ? 30 : -30,
                                    z: -300,
                                    x: diff * (baseWidth * 0.4)
                                }}
                                animate={{
                                    opacity: isCenter ? 1 : 0.5,
                                    scale: isCenter ? 1 : 0.75,
                                    rotateY: diff * -12,
                                    z: isCenter ? 0 : -500,
                                    x: diff * (baseWidth * 0.35),
                                    filter: isCenter ? 'brightness(1)' : 'brightness(0.3) blur(4px)',
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.3,
                                    z: -800,
                                    x: diff > 0 ? 1000 : -1000
                                }}
                                transition={{
                                    duration: 1.2,
                                    ease: [0.16, 1, 0.3, 1]
                                }}
                                style={{
                                    width: baseWidth,
                                    maxWidth: '90vw',
                                    height: '100%',
                                    position: 'absolute',
                                    zIndex: 10 - Math.abs(diff),
                                }}
                                className="rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)] cursor-pointer border border-white/5"
                                onClick={() => setCurrentIdx(index)}
                            >
                                <img
                                    src={img}
                                    alt={`Slide ${index}`}
                                    className="w-full h-full object-cover"
                                />

                                {/* Subtle Reflection/Gradient for depth */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Navigation Indicators */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIdx(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentIdx ? 'bg-[#D2691E] w-8' : 'bg-white/30'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
