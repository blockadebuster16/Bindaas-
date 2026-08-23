import { useEffect, useRef, useState } from 'react';

export const useStickySidebar = (offsetTop = 0, offsetBottom = 0) => {
    const containerRef = useRef(null);
    const sidebarRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        const sidebar = sidebarRef.current;

        if (!container || !sidebar) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        const onScroll = () => {
            const containerRect = container.getBoundingClientRect();
            const sidebarRect = sidebar.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const scrollY = window.scrollY;
            const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
            lastScrollY = scrollY;

            // If sidebar fits in viewport
            if (sidebarRect.height <= viewportHeight - offsetTop - offsetBottom) {
                sidebar.style.position = 'sticky';
                sidebar.style.top = `${offsetTop}px`;
                sidebar.style.bottom = 'auto';
                return;
            }

            // If taller than viewport, adjust top/bottom based on direction
            if (scrollDirection === 'down') {
                if (sidebarRect.bottom <= viewportHeight - offsetBottom) {
                    sidebar.style.position = 'sticky';
                    sidebar.style.top = 'auto';
                    sidebar.style.bottom = `${offsetBottom}px`;
                }
            } else {
                if (sidebarRect.top >= offsetTop) {
                    sidebar.style.position = 'sticky';
                    sidebar.style.top = `${offsetTop}px`;
                    sidebar.style.bottom = 'auto';
                }
            }
        };

        const requestScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    onScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });

        // Initial check
        onScroll();

        return () => {
            window.removeEventListener('scroll', requestScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [offsetTop, offsetBottom]);

    return { containerRef, sidebarRef };
};
