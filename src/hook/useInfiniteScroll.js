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

//   import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

//   // 1. loadMore를 useCallback으로 감싸기 (의존성 변경 시에만 재생성)
//   const loadMore = useCallback(async () => {
//       if (!hasMore || isFetching) return;
//       // ... 데이터 fetch 후 items에 append
//   }, [hasMore, isFetching, nextCursor]);

//   // 2. sentinel ref 받기
//   const sentinelRef = useInfiniteScroll(loadMore);

//   // 3. JSX에서 리스트 하단에 sentinel 배치
//   <div ref={sentinelRef} style={{ height: 1 }} />