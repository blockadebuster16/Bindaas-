import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Detect touch/mobile devices — these get native scroll (faster, more natural)
const isTouchDevice = () => {
    return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
    );
};

// Global ref shared across renders (stable across StrictMode double-invoke)
let globalLenis = null;

/**
 * Stop Lenis (for overlays, modals, drawers).
 * Falls back gracefully if Lenis isn't running (touch devices).
 */
export const lenisStop = () => {
    if (globalLenis) globalLenis.stop();
};

/**
 * Resume Lenis after stopping.
 */
export const lenisStart = () => {
    if (globalLenis) globalLenis.start();
};

const SmoothScroll = ({ children }) => {
    const location = useLocation();
    const lenisRef = useRef(null);
    const rafRef = useRef(null);
    const initialized = useRef(false);

    useEffect(() => {
        // Skip Lenis entirely on touch/mobile — native scroll is superior
        if (isTouchDevice()) return;

        // Guard against StrictMode double-invocation
        if (initialized.current) return;
        initialized.current = true;

        const initLenis = async () => {
            try {
                const { default: Lenis } = await import('lenis');

                // Destroy any existing instance before re-creating
                if (lenisRef.current) {
                    lenisRef.current.destroy();
                }

                const instance = new Lenis({
                    duration: 1.4,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    orientation: 'vertical',
                    gestureOrientation: 'vertical',
                    smoothWheel: true,
                    wheelMultiplier: 0.85,
                    touchMultiplier: 0, // No touch interception — let native handle it
                    infinite: false,
                });

                lenisRef.current = instance;
                globalLenis = instance; // Expose for stop/start helpers

                const raf = (time) => {
                    instance.raf(time);
                    rafRef.current = requestAnimationFrame(raf);
                };
                rafRef.current = requestAnimationFrame(raf);
            } catch (e) {
                console.warn('Lenis smooth scroll unavailable, using native scroll:', e);
            }
        };

        initLenis();

        return () => {
            initialized.current = false;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (lenisRef.current) {
                lenisRef.current.destroy();
                lenisRef.current = null;
                globalLenis = null;
            }
        };
    }, []);

    // Scroll to top on route change
    useEffect(() => {
        if (globalLenis) {
            globalLenis.scrollTo(0, { immediate: true });
        } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [location.pathname]);

    return <>{children}</>;
};

export default SmoothScroll;

