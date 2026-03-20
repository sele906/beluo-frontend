import { useEffect, useRef } from 'react';

/**
 * IntersectionObserver 기반 무한 스크롤 훅
 * @param {() => void} onIntersect - sentinel이 화면에 보일 때 호출할 함수 (useCallback으로 감싸야 함)
 * @returns {React.RefObject} - sentinel 엘리먼트에 붙일 ref
 */
export function useInfiniteScroll(onIntersect) {
    const sentinelRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) onIntersect();
            },
            { threshold: 1.0 }
        );

        const target = sentinelRef.current;
        if (target) observer.observe(target);
        return () => { if (target) observer.unobserve(target); };
    }, [onIntersect]);

    return sentinelRef;
}
