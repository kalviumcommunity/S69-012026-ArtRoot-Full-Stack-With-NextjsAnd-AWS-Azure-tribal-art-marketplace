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
    baseWidth: propBaseWidth = 400,
    autoplay = true,
    autoplayDelay = 4000,
    pauseOnHover = true,
    loop = true,
}: CarouselProps) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;
    const baseWidth = isMobile ? windowWidth * 0.85 : propBaseWidth;

    useEffect(() => {
        if (autoplay && (!pauseOnHover || !isHovered)) {
            const timer = setInterval(() => {
                handleNext();
            }, autoplayDelay);
            return () => clearInterval(timer);
        }
    }, [autoplay, autoplayDelay, pauseOnHover, isHovered, currentIdx, images.length]);

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
                        const isVisible = Math.abs(diff) <= (isMobile ? 1 : 2);

                        if (!isVisible) return null;

                        // Calculate spacing based on device
                        const spacing = isMobile ? baseWidth * 0.6 : baseWidth * 0.4;

                        return (
                            <motion.div
                                key={`${img}-${index}`}
                                initial={{
                                    opacity: 0,
                                    scale: 0.8,
                                    rotateY: diff > 0 ? 25 : -25,
                                    z: -300,
                                    x: diff * spacing * 1.2
                                }}
                                animate={{
                                    opacity: isCenter ? 1 : 0.6,
                                    scale: isCenter ? 1 : 0.8,
                                    rotateY: diff * (isMobile ? -8 : -10),
                                    z: isCenter ? 0 : -400,
                                    x: diff * spacing,
                                    filter: isCenter ? 'brightness(1)' : 'brightness(0.4)',
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.5,
                                    z: -600,
                                    transition: { duration: 0.4 }
                                }}
                                transition={{
                                    duration: 0.7,
                                    ease: "easeOut"
                                }}
                                style={{
                                    width: baseWidth,
                                    height: isMobile ? '70%' : '100%', // Adjust height on mobile to keep ratio
                                    position: 'absolute',
                                    zIndex: 10 - Math.abs(diff),
                                }}
                                className="rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl cursor-pointer border border-white/10 will-change-transform"
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
            <div className="absolute bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIdx(i)}
                        className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 ${i === currentIdx ? 'bg-[#D2691E] w-6 md:w-8' : 'bg-white/30'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
