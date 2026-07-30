import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SmoothScroll = ({ children }) => {
    const location = useLocation();

    useEffect(() => {
        let lenisInstance = null;
        let animationFrameId = null;

        const initLenis = async () => {
            try {
                const { default: Lenis } = await import('lenis');
                lenisInstance = new Lenis({
                    duration: 1.4,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    orientation: 'vertical',
                    gestureOrientation: 'vertical',
                    smoothWheel: true,
                    wheelMultiplier: 0.85, // Bluorng-style smooth, luxury momentum scroll (slightly slower & controlled)
                    touchMultiplier: 1.5,
                    infinite: false,
                });

                window.lenis = lenisInstance;

                const raf = (time) => {
                    lenisInstance?.raf(time);
                    animationFrameId = requestAnimationFrame(raf);
                };

                animationFrameId = requestAnimationFrame(raf);
            } catch (e) {
                console.warn('Lenis smooth scroll falling back to native CSS smooth scroll:', e);
            }
        };

        initLenis();

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (lenisInstance) {
                lenisInstance.destroy();
                window.lenis = null;
            }
        };
    }, []);

    // Scroll to top on route change
    useEffect(() => {
        if (window.lenis) {
            window.lenis.scrollTo(0, { immediate: true });
        } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [location.pathname]);

    return <>{children}</>;
};

export default SmoothScroll;
