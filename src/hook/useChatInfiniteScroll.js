import { useState, useRef, useCallback } from "react";
import { getMessageList } from "../api/chatApi";
import { useInfiniteScroll } from "./useInfiniteScroll";

// 채팅 상단 무한 스크롤 (이전 메시지 불러오기)
// - topRef      : 메시지 목록 최상단에 붙이는 sentinel ref
// - messageAreaRef : 스크롤 영역 ref (스크롤 위치 보정에 사용)
// - isFetchingMore : 로딩 인디케이터 표시 여부
// - hasMore     : 더 불러올 메시지가 있는지
// - initCursor  : 초기 로드 후 커서 세팅 (hasMore, nextCursor)
export function useChatInfiniteScroll(sessionId, setMessages) {
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const messageAreaRef = useRef(null);

    const loadMoreMessages = useCallback(async () => {
        if (!hasMore || isFetchingMore || !nextCursor) return;
        setIsFetchingMore(true);

        const area = messageAreaRef.current;
        const prevScrollHeight = area?.scrollHeight ?? 0;

        try {
            const msgData = await getMessageList(sessionId, nextCursor);
            setMessages(prev => [...(msgData.messages ?? []), ...prev]);
            setHasMore(msgData.hasMore ?? false);
            setNextCursor(msgData.nextCursor ?? null);
            // 새 메시지 높이만큼 스크롤 보정 (튐 방지)
            requestAnimationFrame(() => {
                if (area) area.scrollTop = area.scrollHeight - prevScrollHeight;
            });
        } catch (error) {
            console.error("이전 메시지 로드 실패:", error);
        } finally {
            setIsFetchingMore(false);
        }
    }, [hasMore, isFetchingMore, nextCursor, sessionId, setMessages]);

    const topRef = useInfiniteScroll(loadMoreMessages);

    const initCursor = useCallback((initialHasMore, initialNextCursor) => {
        setHasMore(initialHasMore);
        setNextCursor(initialNextCursor);
    }, []);

    return { topRef, messageAreaRef, isFetchingMore, hasMore, initCursor };
}
