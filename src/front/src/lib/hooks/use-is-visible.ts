import { RefObject, useEffect, useState } from 'react';

export const useIsVisible = <T extends HTMLElement>(
    ref: RefObject<T | null>,
) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsVisible(entry.isIntersecting);
        });

        observer.observe(ref.current);

        return () => {
            observer.disconnect();
        };
    }, [ref.current]);

    return isVisible;
};
