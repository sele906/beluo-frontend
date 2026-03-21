import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getConversationDetail, getMessageList, sendChat, regenerateChat, confirmChat, deleteConversation } from "../../api/chatApi";
import Avatar from "../../components/common/Avatar";
import ChatNameEditModal from "../../components/common/ChatNameEditModal";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";

import { BiRightArrowAlt, BiDotsVerticalRounded, BiChevronLeft, BiRefresh, BiChevronRight, BiChevronLeft as BiChevronLeftNav } from "react-icons/bi";
import { toast } from "sonner";
import { useChatInfiniteScroll } from "../../hook/useChatInfiniteScroll";
import { useTypeMessage } from "../../hook/useTypeMessage";
import classes from "./ChatRoom.module.css";

function ChatRoom() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();

  const [info, setInfo] = useState({});
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // 미확정 AI 응답 후보들
  const [replies, setReplies] = useState([]);
  const [replyIdx, setReplyIdx] = useState(0);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const [kebabOpen, setKebabOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'rename' | 'delete' | null
  const kebabRef = useRef(null);
  const bottomRef = useRef(null);

  // 스크롤 제어 플래그
  const shouldScrollBottom = useRef(false);

  // 슬라이드 방향 추적 + 이동 헬퍼
  const slideDir = useRef('right');
  const goToPrev = () => {
    slideDir.current = 'left';
    setReplyIdx((i) => Math.max(0, i - 1));
  };
  const goToNext = () => {
    slideDir.current = 'right';
    const max = replies.length - 1 + (isRegenerating ? 1 : 0);
    setReplyIdx((i) => Math.min(max, i + 1));
  };

  // 스와이프 감지
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? goToNext() : goToPrev();
    touchStartX.current = null;
  };

  const { topRef, messageAreaRef, isFetchingMore, initCursor } = useChatInfiniteScroll(sessionId, setMessages);
  const { typeText } = useTypeMessage(useCallback(() => {
    setIsTyping(false);
    shouldScrollBottom.current = true;
  }, []));

  // kebab 외부 클릭 시 닫기
  useEffect(() => {
    if (!kebabOpen) return;
    const handleClickOutside = (e) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target)) {
        setKebabOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [kebabOpen]);

  // messages / typingText 변경 시 바닥 스크롤
  useEffect(() => {
    if (shouldScrollBottom.current) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
      shouldScrollBottom.current = false;
    }
  }, [messages, typingText]);

  // 페이지 로드시 바닥 스크롤
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

    setIsPageLoading(true);

    async function init() {
      try {
        const detail = await getConversationDetail(sessionId);
        setInfo(detail);

        const msgData = await getMessageList(sessionId, null);
        setMessages(msgData.messages ?? []);
        initCursor(msgData.hasMore ?? false, msgData.nextCursor ?? null);

      } catch (error) {
        console.error("초기 로드 실패:", error);
      } finally {
        setIsPageLoading(false);
      }
    }

    init();
  }, [sessionId]);

  // 메시지 전송
  const handleSend = async () => {
    if (!input.trim() || isLoading || isRegenerating) return;

    // 미확정 응답이 있으면 먼저 confirm 후 messages에 추가
    if (replies.length > 0) {
      try {
        await confirmChat(sessionId, replies[replyIdx]);
        setMessages((prev) => [...prev, { role: "ai", content: replies[replyIdx] }]);
      } catch (error) {
        console.error("confirm 실패:", error);
        toast.error("응답 저장에 실패했어요. 다시 시도해주세요.");
        return;
      }
      setReplies([]);
      setReplyIdx(0);
      setTypingText("");
    }

    const userMessage = { role: "user", content: input, createdAt: new Date().toISOString() };
    shouldScrollBottom.current = true;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { reply } = await sendChat(input, sessionId);
      setReplies([reply]);
      setReplyIdx(0);
      setIsTyping(true);
      typeText(reply, setTypingText);
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 응답 재생성
  const handleRegenerate = async () => {
    const newIdx = replies.length; // 곧 추가될 로딩 슬라이드 위치
    setReplyIdx(newIdx);
    setIsRegenerating(true);
    try {
      const { reply } = await regenerateChat(sessionId);
      setReplies((prev) => [...prev, reply]);
      setIsTyping(true);
      typeText(reply, setTypingText);
    } catch (error) {
      console.error("재생성 실패:", error);
      setReplyIdx(newIdx - 1); // 실패 시 이전 슬라이드로
      toast.error("재생성에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsRegenerating(false);
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

  const handleNameUpdate = (newName) => {
    setInfo((prev) => ({ ...prev, conversationName: newName }));
  };

  const handleDelete = async () => {
    try {
      await deleteConversation(sessionId);
      navigate('/chatlist');
    } catch (err) {
      console.error('채팅방 삭제 실패:', err);
      toast.error('삭제에 실패했어요. 다시 시도해주세요.');
    }
  };

  const hasPendingReply = isLoading || isTyping || replies.length > 0;

  return (
    <div className={classes.chatRoomWrapper}>
    {activeModal === 'rename' && (
      <ChatNameEditModal
        sessionId={sessionId}
        conversationName={info.conversationName}
        onNameUpdate={handleNameUpdate}
        onClose={() => setActiveModal(null)}
      />
    )}
    {activeModal === 'delete' && (
      <ConfirmDeleteModal
        onConfirm={handleDelete}
        onClose={() => setActiveModal(null)}
      />
    )}
    <div className={classes.container}>

      {/* ── 상단 타이틀 바 ── */}
      <div className={classes.topBar}>
        <button className={classes.backBtn} onClick={() => navigate('/chatlist')}>
          <BiChevronLeft />
        </button>
        <div className={classes.topAvatar}>
          <Avatar
            filePath={info.characterImgUrl}
            name={info.characterName}
            size={150}
          />
        </div>
        <span className={classes.topName}>{info.conversationName}</span>
        <div className={classes.kebabWrapper} ref={kebabRef}>
          <button className={classes.kebabBtn} onClick={() => setKebabOpen((o) => !o)}>
            <BiDotsVerticalRounded />
          </button>
          {kebabOpen && (
            <div className={classes.dropdown}>
              <button className={classes.dropdownItem} onClick={() => { setKebabOpen(false); setActiveModal('rename'); }}>
                이름 변경
              </button>
              <button className={`${classes.dropdownItem} ${classes.dropdownItemDanger}`} onClick={() => { setKebabOpen(false); setActiveModal('delete'); }}>
                채팅방 삭제
              </button>
            </div>
          )}
        </div>
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

        {/* 확정된 메시지 목록 */}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`${classes.row} ${m.role === "user" ? classes.rowUser : classes.rowAi}`}
          >
            {m.role !== "user" && (
              <div className={classes.aiAvatar}>
                <Avatar filePath={info.characterImgUrl} name={info.characterName} size={150} />
              </div>
            )}
            {m.role === "user" && (
              <div className={classes.userAvatar}>
                <Avatar filePath={info.userImgUrl} name={info.userName} size={72} />
              </div>
            )}
            <div className={`${classes.bubble} ${m.role === "user" ? classes.bubbleUser : classes.bubbleAi}`}>
              {m.content}
            </div>
          </div>
        ))}

        {/* 미확정 AI 응답 슬라이더 */}
        {hasPendingReply && (() => {
          const isLoadingSlide = replyIdx >= replies.length;
          const slideContent = isLoadingSlide
            ? <span className={classes.loadingDots}><span /><span /><span /></span>
            : (isTyping && replyIdx === replies.length - 1)
              ? (typingText || <span className={classes.loadingDots}><span /><span /><span /></span>)
              : replies[replyIdx];

          return (
            <div className={`${classes.row} ${classes.rowAi}`}>
              <div className={classes.aiAvatar}>
                <Avatar filePath={info.characterImgUrl} name={info.characterName} size={150} />
              </div>
              <div
                className={classes.repliesSlider}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  key={replyIdx}
                  className={`${classes.replySlide} ${slideDir.current === 'left' ? classes.replySlideLeft : ''}`}
                >
                  {slideContent}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 재생성 컨트롤 */}
        {!isLoading && replies.length > 0 && (
          <div className={classes.replyControls}>
            {(replies.length > 1 || isRegenerating) && (() => {
              const total = replies.length + (isRegenerating ? 1 : 0);
              return (
                <>
                  <button
                    className={classes.replyNavBtn}
                    onClick={goToPrev}
                    disabled={replyIdx === 0}
                  >
                    <BiChevronLeftNav />
                  </button>
                  <span className={classes.replyNavText}>{replyIdx + 1} / {total}</span>
                  <button
                    className={classes.replyNavBtn}
                    onClick={goToNext}
                    disabled={replyIdx >= total - 1}
                  >
                    <BiChevronRight />
                  </button>
                </>
              );
            })()}
            <button
              className={classes.regenBtn}
              onClick={handleRegenerate}
              disabled={isTyping || isRegenerating}
            >
              <BiRefresh />
            </button>
          </div>
        )}

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
          disabled={isLoading || isRegenerating}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <button
          className={classes.sendBtn}
          onClick={handleSend}
          disabled={isLoading || isRegenerating || !input.trim()}
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
