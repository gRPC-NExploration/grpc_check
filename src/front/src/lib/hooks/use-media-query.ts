import { useEffect, useState } from 'react';

export function useMediaQuery(breakpoint: number) {
    const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
        const onChange = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };
        mql.addEventListener('change', onChange);
        setIsMobile(window.innerWidth < breakpoint);
        return () => mql.removeEventListener('change', onChange);
    }, []);

    return !!isMobile;
}
