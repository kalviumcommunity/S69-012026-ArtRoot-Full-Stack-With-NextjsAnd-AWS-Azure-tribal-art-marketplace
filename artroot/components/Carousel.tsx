'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

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
            setCurrentIdx((prev: number) => (prev + 1) % images.length);
        }
    };

    const handlePrev = () => {
        if (loop || currentIdx > 0) {
            setCurrentIdx((prev: number) => (prev - 1 + images.length) % images.length);
        }
    };

    return (
        <div
            className="relative w-full h-full flex items-center justify-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ perspective: '1000px' }}
        >
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                    {images.map((img, index) => {
                        let diff = index - currentIdx;

                        if (loop) {
                            if (diff > images.length / 2) diff -= images.length;
                            if (diff < -images.length / 2) diff += images.length;
                        }

                        const isCenter = diff === 0;
                        const isVisible = Math.abs(diff) <= 2;

                        if (!isVisible) return null;

                        return (
                            <motion.div
                                key={`${img}-${index}`}
                                initial={{
                                    opacity: 0,
                                    scale: 0.8,
                                    rotateY: diff > 0 ? 25 : -25,
                                    z: -300,
                                    x: diff * (baseWidth * 0.45)
                                }}
                                animate={{
                                    opacity: isCenter ? 1 : 0.6,
                                    scale: isCenter ? 1 : 0.8,
                                    rotateY: diff * -10,
                                    z: isCenter ? 0 : -400,
                                    x: diff * (baseWidth * 0.4),
                                    filter: isCenter ? 'brightness(1)' : 'brightness(0.4)', // Removed blur for performance
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.5,
                                    z: -600,
                                    transition: { duration: 0.4 }
                                }}
                                transition={{
                                    duration: 0.7, // Faster transition for snake-like feel
                                    ease: "easeOut"
                                }}
                                style={{
                                    width: baseWidth,
                                    maxWidth: '85vw',
                                    height: '100%',
                                    position: 'absolute',
                                    zIndex: 10 - Math.abs(diff),
                                }}
                                className="rounded-3xl overflow-hidden shadow-2xl cursor-pointer border border-white/10 will-change-transform"
                                onClick={() => setCurrentIdx(index)}
                            >
                                <Image
                                    src={img}
                                    alt={`Slide ${index}`}
                                    fill
                                    className="object-cover"
                                    sizes={`${baseWidth}px`}
                                    priority={isCenter}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
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
