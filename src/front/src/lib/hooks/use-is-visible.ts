import { RefObject, useLayoutEffect, useState } from 'react';

export const useIsVisible = <T extends HTMLElement>(
    ref: RefObject<T | null>,
) => {
    const [isVisible, setIsVisible] = useState(false);

    useLayoutEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {
                threshold: 0.9,
            },
        );

        observer.observe(ref.current);

        return () => {
            observer.disconnect();
        };
    }, [ref.current]);

    return isVisible;
};
