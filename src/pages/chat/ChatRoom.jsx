import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getConversationDetail, getMessageList,
  sendChat, regenerateChat, confirmChat, editChat,
  deleteConversation,
} from "../../api/chatApi";
import Avatar from "../../components/common/Avatar";
import ChatNameEditModal from "../../components/common/ChatNameEditModal";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import MessageItem from "../../components/chat/MessageItem";
import PendingReplySlider from "../../components/chat/PendingReplySlider";
import ChatInputBar from "../../components/chat/ChatInputBar";
import { BiDotsVerticalRounded, BiChevronLeft } from "react-icons/bi";
import { toast } from "sonner";
import { useChatInfiniteScroll } from "../../hook/useChatInfiniteScroll";
import { useTypeMessage } from "../../hook/useTypeMessage";
import classes from "./ChatRoom.module.css";

function ChatRoom() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();

  // ── 채팅방 메타 정보 ──────────────────────────────────────
  const [info, setInfo] = useState({});
  const [isPageLoading, setIsPageLoading] = useState(true);

  // ── 확정된 메시지 목록 ────────────────────────────────────
  const [messages, setMessages] = useState([]);

  // ── 미확정 AI 응답 슬라이더 ───────────────────────────────
  const [replies, setReplies] = useState([]);
  const [replyIdx, setReplyIdx] = useState(0);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // ── 입력 / 전송 ──────────────────────────────────────────
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ── 메시지 편집 ──────────────────────────────────────────
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // ── 케밥 메뉴 / 모달 ─────────────────────────────────────
  const [kebabOpen, setKebabOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'rename' | 'delete' | null

  // ── Refs ─────────────────────────────────────────────────
  const kebabRef = useRef(null);
  const bottomRef = useRef(null);
  const shouldScrollBottom = useRef(false);
  const slideDir = useRef("right");
  const touchStartX = useRef(null);
  const lastAiBubbleRef = useRef(null);

  // ── 슬라이더 너비 동기화 ──────────────────────────────────
  const [sliderWidth, setSliderWidth] = useState(undefined);

  // ── 커스텀 훅 ────────────────────────────────────────────
  const { topRef, messageAreaRef, isFetchingMore, initCursor } =
    useChatInfiniteScroll(sessionId, setMessages);

  const { typeText } = useTypeMessage(
    useCallback(() => {
      setIsTyping(false);
      shouldScrollBottom.current = true;
    }, [])
  );

  useEffect(() => {
    const el = lastAiBubbleRef.current;
    if (!el) { setSliderWidth(undefined); return; }
    const ro = new ResizeObserver(() => setSliderWidth(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [messages]);

  useEffect(() => {
    if (isLoading) setSliderWidth(undefined);
  }, [isLoading]);

  // ── 파생값 ───────────────────────────────────────────────
  const hasPendingReply = isLoading || isTyping || replies.length > 0;
  const lastUserMsgIdx = messages.reduce((acc, m, i) => (m.role === "user" ? i : acc), -1);

  // ── Effects ──────────────────────────────────────────────

  useEffect(() => {
    if (!sessionId) return;
    setIsPageLoading(true);
    async function init() {
      try {
        const [detail, msgData] = await Promise.all([
          getConversationDetail(sessionId),
          getMessageList(sessionId, null),
        ]);
        setInfo(detail);
        setMessages(msgData.messages ?? []);
        initCursor(msgData.hasMore ?? false, msgData.nextCursor ?? null);
      } catch (error) {
        console.error("초기 로드 실패:", error);
      } finally {
        setIsPageLoading(false);
      }
    }
    init();
  }, [sessionId, initCursor]);

  useEffect(() => {
    if (!isPageLoading) {
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }));
    }
  }, [isPageLoading]);

  useEffect(() => {
    if (shouldScrollBottom.current) {
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
      shouldScrollBottom.current = false;
    }
  }, [messages, typingText]);

  useEffect(() => {
    if (!kebabOpen) return;
    const handleClickOutside = (e) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target)) setKebabOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [kebabOpen]);

  // ── 슬라이더 네비게이션 ──────────────────────────────────

  const goToPrev = () => {
    slideDir.current = "left";
    setReplyIdx((i) => Math.max(0, i - 1));
  };

  const goToNext = () => {
    slideDir.current = "right";
    const max = replies.length - 1 + (isRegenerating ? 1 : 0);
    setReplyIdx((i) => Math.min(max, i + 1));
  };

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // 왼쪽 스와이프: 마지막 슬라이드면 재생성, 아니면 다음으로
        const isAtLast = replyIdx >= replies.length - 1 + (isRegenerating ? 1 : 0);
        if (isAtLast && !isTyping && !isRegenerating) handleRegenerate();
        else goToNext();
      } else {
        goToPrev();
      }
    }
    touchStartX.current = null;
  };

  // ── 메시지 전송 ──────────────────────────────────────────

  const handleSend = async () => {
    if (!input.trim() || isLoading || isRegenerating) return;

    if (replies.length > 0) {
      try {
        await confirmChat(sessionId, replies[replyIdx]);
        setMessages((prev) => [...prev, { role: "ai", content: replies[replyIdx] }]);
      } catch (error) {
        console.error("자동 확정 실패:", error);
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
      const { reply, userMessageId } = await sendChat(input, sessionId);
      if (userMessageId) {
        setMessages((prev) => {
          const msgs = [...prev];
          const last = msgs.length - 1;
          if (msgs[last]?.role === "user") msgs[last] = { ...msgs[last], id: userMessageId };
          return msgs;
        });
      }
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

  // ── AI 응답 재생성 ────────────────────────────────────────

  const handleRegenerate = async () => {
    const newIdx = replies.length;
    setReplyIdx(newIdx);
    setIsRegenerating(true);
    try {
      const { reply } = await regenerateChat(sessionId);
      setReplies((prev) => [...prev, reply]);
      setIsTyping(true);
      typeText(reply, setTypingText);
    } catch (error) {
      console.error("재생성 실패:", error);
      setReplyIdx(newIdx - 1);
      toast.error("재생성에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsRegenerating(false);
    }
  };

  // ── AI 응답 수동 확정 ─────────────────────────────────────

  const handleConfirm = async () => {
    const content = replies[replyIdx];
    try {
      const res = await confirmChat(sessionId, content);
      const aiMessageId = res?.messageId ?? res?.id ?? null;
      setMessages((prev) => [
        ...prev,
        { role: "ai", content, ...(aiMessageId && { id: aiMessageId }) },
      ]);
      setReplies([]);
      setReplyIdx(0);
      setTypingText("");
    } catch (err) {
      console.error("확정 실패:", err);
      toast.error("확정에 실패했어요. 다시 시도해주세요.");
    }
  };

  // ── 메시지 편집 ──────────────────────────────────────────

  const handleEditSave = async () => {
    if (!editValue.trim()) return;
    if (!editingId) {
      toast.error("메시지 ID가 없어요. 잠시 후 다시 시도해주세요.");
      return;
    }
    const editingRole = messages.find((m) => m.id === editingId)?.role;
    try {
      await editChat(editingId, sessionId, editValue.trim());
      setEditingId(null);
      const msgData = await getMessageList(sessionId, null);
      setMessages(msgData.messages ?? []);
      initCursor(msgData.hasMore ?? false, msgData.nextCursor ?? null);

      // 유저 메시지 편집 → AI 응답 생성 / AI 메시지 편집 → DB 저장만
      if (editingRole === "user") {
        const newIdx = replies.length;
        setReplyIdx(newIdx);
        setIsRegenerating(true);
        try {
          const { reply } = await regenerateChat(sessionId);
          setReplies((prev) => [...prev, reply]);
          setIsTyping(true);
          typeText(reply, setTypingText);
        } catch (err) {
          console.error("편집 후 AI 응답 실패:", err);
          setReplyIdx(Math.max(0, newIdx - 1));
          toast.error("AI 응답 생성에 실패했어요. 다시 시도해주세요.");
        } finally {
          setIsRegenerating(false);
        }
      }
    } catch (err) {
      console.error("메시지 수정 실패:", err);
      toast.error("수정에 실패했어요. 다시 시도해주세요.");
    }
  };

  // ── 채팅방 설정 ──────────────────────────────────────────

  const handleNameUpdate = (newName) => setInfo((prev) => ({ ...prev, conversationName: newName }));

  const handleDelete = async () => {
    try {
      await deleteConversation(sessionId);
      navigate("/chatlist");
    } catch (err) {
      console.error("채팅방 삭제 실패:", err);
      toast.error("삭제에 실패했어요. 다시 시도해주세요.");
    }
  };

  // ── 페이지 로딩 ──────────────────────────────────────────

  if (isPageLoading) {
    return (
      <div className={classes.pageLoader}>
        <span className={classes.loadingDots}><span /><span /><span /></span>
      </div>
    );
  }

  // ── 슬라이더 현재 슬라이드 내용 ──────────────────────────
  const pendingSlideContent = (() => {
    const dots = <span className={`${classes.loadingDots} ${classes.loadingDotsBubble}`}><span /><span /><span /></span>;
    if (replyIdx >= replies.length) return dots;
    if (isTyping && replyIdx === replies.length - 1) return typingText || dots;
    return replies[replyIdx];
  })();

  // ─────────────────────────────────────────────────────────

  return (
    <div className={classes.chatRoomWrapper}>

      {activeModal === "rename" && (
        <ChatNameEditModal
          sessionId={sessionId}
          conversationName={info.conversationName}
          onNameUpdate={handleNameUpdate}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "delete" && (
        <ConfirmDeleteModal
          onConfirm={handleDelete}
          onClose={() => setActiveModal(null)}
        />
      )}

      <div className={classes.container}>

        {/* ── 상단 타이틀 바 ── */}
        <div className={classes.topBar}>
          <button className={classes.backBtn} onClick={() => navigate("/chatlist")}>
            <BiChevronLeft />
          </button>
          <div className={classes.topAvatar}>
            <Avatar filePath={info.characterImgUrl} name={info.characterName} size={150} />
          </div>
          <span className={classes.topName}>{info.conversationName}</span>
          <div className={classes.kebabWrapper} ref={kebabRef}>
            <button className={classes.kebabBtn} onClick={() => setKebabOpen((o) => !o)}>
              <BiDotsVerticalRounded />
            </button>
            {kebabOpen && (
              <div className={classes.dropdown}>
                <button className={classes.dropdownItem} onClick={() => { setKebabOpen(false); setActiveModal("rename"); }}>
                  이름 변경
                </button>
                <button className={`${classes.dropdownItem} ${classes.dropdownItemDanger}`} onClick={() => { setKebabOpen(false); setActiveModal("delete"); }}>
                  채팅방 삭제
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── 메시지 스크롤 영역 ── */}
        <div className={classes.messages} ref={messageAreaRef}>

          <p className={classes.disclaimer}>AI가 생성한 내용은 허구이며 실제 인물·사건과 무관합니다.</p>

          <div ref={topRef} style={{ height: 1 }} />

          {isFetchingMore && (
            <div className={classes.loadingMore}>
              <span className={classes.loadingDots}><span /><span /><span /></span>
            </div>
          )}

          {messages.map((m, i) => {
            const isLastUser = i === lastUserMsgIdx && m.role === "user";
            const isLastMsg = i === messages.length - 1;
            const isLastAi = m.role === "ai" && isLastMsg;
            const canEdit = (isLastUser && hasPendingReply) || (isLastAi && m.id);
            return (
              <MessageItem
                key={m.id ?? i}
                message={m}
                info={info}
                canEdit={canEdit}
                isEditing={editingId === m.id}
                editValue={editValue}
                onEditStart={() => { setEditingId(m.id); setEditValue(m.content); }}
                onEditChange={setEditValue}
                onEditSave={handleEditSave}
                onEditCancel={() => setEditingId(null)}
                bubbleRef={isLastAi ? lastAiBubbleRef : undefined}
              />
            );
          })}

          {hasPendingReply && (
            <PendingReplySlider
              content={pendingSlideContent}
              info={info}
              replyIdx={replyIdx}
              slideDir={slideDir.current}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              width={sliderWidth}
              replies={replies}
              isTyping={isTyping}
              isRegenerating={isRegenerating}
              onConfirm={handleConfirm}
              onRegenerate={handleRegenerate}
              onPrev={goToPrev}
              onNext={goToNext}
            />
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── 입력창 ── */}
        <ChatInputBar
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={isLoading || isRegenerating}
        />

      </div>
    </div>
  );
}

export default ChatRoom;
