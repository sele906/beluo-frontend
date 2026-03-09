import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getConversationDetail, getMessageList, sendChat } from "../../api/chatApi";
import Avatar from "../../components/common/Avatar";

import { BiRightArrowAlt } from "react-icons/bi";
import classes from "./ChatRoom.module.css";

function ChatRoom() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [info, setInfo] = useState({});
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // 무한 스크롤 관련 상태
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const bottomRef = useRef(null);
  const topRef = useRef(null);           // 스크롤 최상단 감지용
  const messageAreaRef = useRef(null);   // 스크롤 위치 복원용

  // 스크롤 제어 플래그
  const shouldScrollBottom = useRef(false);  // 바닥 스크롤 여부

  // messages 변경 시 바닥 스크롤
  useEffect(() => {
    if (shouldScrollBottom.current) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
      shouldScrollBottom.current = false;
    }
  }, [messages]);

  // 페이지 로드시 스크롤
  useEffect(() => {
    if (!isPageLoading) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "instant" });
      });
    }
  }, [isPageLoading]);

  // 채팅방 입장 시 기존 세팅 불러오기
  useEffect(() => {
    if (!sessionId) return;

    async function init() {
      try {
        // 메타데이터 로드
        const detail = await getConversationDetail(sessionId);
        setInfo({
          characterName: detail.characterName,
          characterImgUrl: detail.characterImgUrl,
          conversationName: detail.conversationName,
        });

        // 첫 10개 메시지 로드 (before 없이 호출 = 최신 10개)
        const msgData = await getMessageList(sessionId, null);
        setMessages(msgData.messages ?? []);
        setHasMore(msgData.hasMore ?? false);
        setNextCursor(msgData.nextCursor ?? null);

      } catch (error) {
        console.error("초기 로드 실패:", error);
      } finally {
        setIsPageLoading(false);
      }
    }

    init();
  }, [sessionId]);

  // 이전 메시지 불러오기 (무한 스크롤)
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || isFetchingMore || !nextCursor) return;

    setIsFetchingMore(true);

    // 스크롤 위치 기억 (새 메시지 추가 후 복원용)
    const area = messageAreaRef.current;
    const prevScrollHeight = area?.scrollHeight ?? 0;

    try {
      const msgData = await getMessageList(sessionId, nextCursor);
      const olderMessages = msgData.messages ?? [];

      // shouldScrollBottom 플래그 건드리지 않고 위에 붙이기
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
  }, [hasMore, isFetchingMore, nextCursor, sessionId]);

  // IntersectionObserver로 최상단 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreMessages();
        }
      },
      { threshold: 1.0 }
    );

    const target = topRef.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [loadMoreMessages]);

  // 타이핑 효과
  const typeMessage = (text) => {
    let index = 0;
    setMessages((prev) => [...prev, { role: "ai", content: "" }]);
    shouldScrollBottom.current = true; // AI 답변 시작 시 바닥으로

    const interval = setInterval(() => {
      index++;
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "ai") last.content = text.slice(0, index);
        return updated;
      });
      if (index >= text.length) clearInterval(interval);
    }, 30);

    
  };

  // 메시지 전송
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input, createdAt: new Date().toISOString() };
    shouldScrollBottom.current = true; // 유저 메시지 전송 시 바닥으로
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "ai", content: "", isLoading: true }]);

    try {
      const res = await sendChat(input, sessionId);
      setMessages((prev) => prev.slice(0, -1));
      typeMessage(res.reply);
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로딩
  if (isPageLoading) {
    return (
      <div className={classes.pageLoader}>
        <span className={classes.loadingDots}>
          <span /><span /><span />
        </span>
      </div>
    );
  }

  return (
    <div className={classes.chatRoomWrapper}>
    <div className={classes.container}>

      {/* ── 상단 타이틀 바 ── */}
      <div className={classes.topBar}>
        <div className={classes.topAvatar}>
          <Avatar
            filePath={info.characterImgUrl}
            name={info.characterName}
            className={classes.aiAvatarImg}
            size={150}
          />
        </div>
        <span className={classes.topName}>{info.conversationName}</span>
      </div>

      {/* ── 메시지 영역 ── */}
      <div className={classes.messages} ref={messageAreaRef}>

        {/* 무한 스크롤 감지 타겟 */}
        <div ref={topRef} style={{ height: 1 }} />

        {/* 위쪽 로딩 인디케이터 */}
        {isFetchingMore && (
          <div className={classes.loadingMore}>
            <span className={classes.loadingDots}><span /><span /><span /></span>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`${classes.row} ${m.role === "user" ? classes.rowUser : classes.rowAi}`}
          >

            {/* AI 아바타 */}
            {m.role !== "user" && (
              <div className={classes.aiAvatar}>
                <Avatar
                  filePath={info.characterImgUrl}
                  name={info.characterName}
                  className={classes.aiAvatarImg}
                  size={150}
                />
              </div>
            )}

            {/* 말풍선 */}
            <div className={`${classes.bubble} ${m.role === "user" ? classes.bubbleUser : classes.bubbleAi}`}>
              {m.isLoading ? (
                <span className={classes.loadingDots}>
                  <span /><span /><span />
                </span>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── 입력창 ── */}
      <div className={classes.inputBar}>
        <input
          className={classes.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="메시지를 입력하세요..."
          disabled={isLoading}
        />
        <button
          className={classes.sendBtn}
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          aria-label="전송"
        >
          <BiRightArrowAlt />
        </button>
      </div>

    </div>
    </div>
  );
}

export default ChatRoom;
