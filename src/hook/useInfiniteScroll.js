import { useEffect, useRef } from "react";

// IntersectionObserver 기반 무한 스크롤
// sentinel 엘리먼트가 화면에 보이면 onIntersect 호출
// onIntersect는 반드시 useCallback으로 감싸서 전달
export function useInfiniteScroll(onIntersect) {
    const sentinelRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) onIntersect(); },
            { threshold: 1.0 }
        );
        const target = sentinelRef.current;
        if (target) observer.observe(target);
        return () => { if (target) observer.unobserve(target); };
    }, [onIntersect]);

    return sentinelRef;
}
