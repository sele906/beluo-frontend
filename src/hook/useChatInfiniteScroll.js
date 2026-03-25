import { useState, useRef, useCallback } from "react";
import { getMessageList } from "../api/chatApi";
import { useInfiniteScroll } from "./useInfiniteScroll";

/**
 * 채팅방 상단 무한 스크롤 (이전 메시지 불러오기)
 *
 * @param {string} sessionId
 * @param {Function} setMessages - 메시지 상태 setter (ChatRoom에서 주입)
 * @returns {{
 *   topRef: React.RefObject,
 *   messageAreaRef: React.RefObject,
 *   isFetchingMore: boolean,
 *   hasMore: boolean,
 *   initCursor: (hasMore: boolean, nextCursor: string|null) => void,
 * }}
 */
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
      const olderMessages = msgData.messages ?? [];

      setMessages((prev) => [...olderMessages, ...prev]);
      setHasMore(msgData.hasMore ?? false);
      setNextCursor(msgData.nextCursor ?? null);

      // 스크롤 위치 복원 (새로 추가된 높이만큼 보정)
      requestAnimationFrame(() => {
        if (area) {
          area.scrollTop = area.scrollHeight - prevScrollHeight;
        }
      });
    } catch (error) {
      console.error("이전 메시지 로드 실패:", error);
    } finally {
      setIsFetchingMore(false);
    }
  }, [hasMore, isFetchingMore, nextCursor, sessionId, setMessages]);

  const topRef = useInfiniteScroll(loadMoreMessages);

  // 초기 로드 후 커서 세팅
  const initCursor = useCallback((initialHasMore, initialNextCursor) => {
    setHasMore(initialHasMore);
    setNextCursor(initialNextCursor);
  }, []);

  return { topRef, messageAreaRef, isFetchingMore, hasMore, initCursor };
}
