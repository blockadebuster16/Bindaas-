import { useEffect } from 'react';

const useFocusTrap = (ref, isActive) => {
    useEffect(() => {
        if (!isActive || !ref.current) return;

        const focusableElements = ref.current.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement?.focus();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement?.focus();
                    }
                }
            } else if (e.key === 'Escape') {
                // Let the consumer handle Escape if needed, or trigger close
            }
        };

        // Focus the first element on open
        if (firstElement) {
            // small timeout ensures the modal is fully visible before focusing
            setTimeout(() => firstElement.focus(), 50);
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [ref, isActive]);
};

export default useFocusTrap;
