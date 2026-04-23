import { useState, useEffect, useRef } from "react";
import { useTypeMessage } from "../../hook/useTypeMessage";
import { useParams } from "react-router-dom";
import {
    getConversationDetail, getMessageList,
    sendChat, regenerateChat, confirmChat, editChat,
} from "../../api/chatApi";
import { toast } from "sonner";
import MessageItem from "../../components/chat/MessageItem";
import ChatInputBar from "../../components/chat/ChatInputBar";
import ChatRoomHeader from "../../components/chat/ChatRoomHeader";
import ReplySlider from "../../components/chat/ReplySlider";
import Avatar from "../../components/common/Avatar";
import { BiRefresh } from "react-icons/bi";
import classes from "./ChatRoom.module.css";
import rowClasses from "../../components/chat/MessageItem.module.css";
import controlClasses from "../../components/chat/ReplyControls.module.css";

function ChatRoom() {
    const { id: sessionId } = useParams();

    // ── 채팅방 정보 ───────────────────────────────────────────
    const [info, setInfo] = useState({});

    // ── 확정된 메시지 목록 (DB 저장 상태) ────────────────────
    const [messages, setMessages] = useState([]);

    // ── 무한 스크롤 커서 ──────────────────────────────────────
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    // ── 입력 / 전송 상태 ──────────────────────────────────────
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingText, setTypingText] = useState("");

    // ── 재생성 슬라이더 ───────────────────────────────────────
    // replies[]  : 재생성된 답변 목록 (미확정)
    // sliderIdx  : 0 = 저장된 답변, 1+ = replies[sliderIdx-1]
    const [replies, setReplies] = useState([]);
    const [sliderIdx, setSliderIdx] = useState(0);

    // ── 메시지 편집 ──────────────────────────────────────────
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");

    const { typeText } = useTypeMessage();

    const messageAreaRef = useRef(null);
    const bottomRef = useRef(null);

    // ── 초기 로드 ─────────────────────────────────────────────
    useEffect(() => {
        async function init() {
            const [detail, msgData] = await Promise.all([
                getConversationDetail(sessionId),
                getMessageList(sessionId, null),
            ]);
            setInfo(detail);
            setMessages(msgData.messages ?? []);
            setHasMore(msgData.hasMore ?? false);
            setNextCursor(msgData.nextCursor ?? null);
            requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }));
        }
        init();
    }, [sessionId]);

    // ── 무한 스크롤: 상단 100px 이내 진입 시 이전 메시지 로드 ──
    useEffect(() => {
        const area = messageAreaRef.current;
        if (!area) return;
        const handleScroll = async () => {
            if (area.scrollTop > 100 || !hasMore || isFetching) return;
            setIsFetching(true);
            const prevHeight = area.scrollHeight;
            const msgData = await getMessageList(sessionId, nextCursor);
            setMessages(prev => [...(msgData.messages ?? []), ...prev]);
            setHasMore(msgData.hasMore ?? false);
            setNextCursor(msgData.nextCursor ?? null);
            // 새 메시지 높이만큼 스크롤 보정 (튐 방지)
            requestAnimationFrame(() => { area.scrollTop = area.scrollHeight - prevHeight; });
            setIsFetching(false);
        };
        area.addEventListener("scroll", handleScroll);
        return () => area.removeEventListener("scroll", handleScroll);
    }, [sessionId, hasMore, isFetching, nextCursor]);

    // ── 전송 ──────────────────────────────────────────────────
    const handleSend = async () => {
        if (!input.trim() || isLoading || isRegenerating || isTyping) return;

        const text = input;
        setMessages(prev => [...prev, { role: "user", content: text, createdAt: new Date().toISOString() }]);
        setInput("");
        setReplies([]);
        setSliderIdx(0);
        setIsLoading(true);
        requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));

        try {
            const { reply } = await sendChat(text, sessionId);
            const { messageId } = await confirmChat(sessionId, reply);

            // 타이핑 시작 — savedMsg는 클로저로 캡처, 완료 시 messages[]에 추가
            const savedMsg = { role: "assistant", content: reply, id: messageId };
            const scrollBottom = () => requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
            setIsTyping(true);
            scrollBottom();
            typeText(
                reply,
                setTypingText,
                scrollBottom,
                () => {
                    setIsTyping(false);
                    setTypingText("");
                    setMessages(prev => [...prev, savedMsg]);
                    scrollBottom();
                }
            );
        } catch (error) {
            setMessages(prev => prev.slice(0, -1));
            setInput(text);
            toast.error(error.response?.data || "전송에 실패했어요. 다시 시도해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    // ── 재생성 ────────────────────────────────────────────────
    // regenerateChat → 로딩 슬롯에서 타이핑 → 완료 시 replies[]에 추가
    // isRegenerating은 타이핑 완료 후 onComplete에서 해제
    const handleRegenerate = async () => {
        setSliderIdx(1 + replies.length);
        setIsRegenerating(true);
        try {
            const { reply } = await regenerateChat(sessionId);
            const scrollBottom = () => requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
            setIsTyping(true);
            scrollBottom();
            typeText(
                reply,
                setTypingText,
                scrollBottom,
                () => {
                    setIsTyping(false);
                    setTypingText("");
                    setIsRegenerating(false);
                    setReplies(prev => {
                        const next = [...prev, reply];
                        setSliderIdx(next.length);
                        return next;
                    });
                    scrollBottom();
                }
            );
        } catch (error) {
            setSliderIdx(replies.length > 0 ? replies.length : 0);
            setIsRegenerating(false);
            toast.error(error.response?.data || "재생성에 실패했어요. 다시 시도해주세요.");
        }
    };

    // ── 확정 (체크버튼) ───────────────────────────────────────
    const handleConfirm = async () => {
        const content = replies[sliderIdx - 1];
        try {
            const { messageId } = await confirmChat(sessionId, content, true);
            setMessages(prev => {
                const msgs = [...prev];
                const lastAiIdx = msgs.findLastIndex(m => m.role === "assistant");
                if (lastAiIdx >= 0) msgs[lastAiIdx] = { ...msgs[lastAiIdx], content, id: messageId };
                return msgs;
            });
            setReplies([]);
            setSliderIdx(0);
        } catch (err) {
            toast.error(err.response?.data || "확정에 실패했어요. 다시 시도해주세요.");
        }
    };

    // ── 메시지 편집 ──────────────────────────────────────────
    const handleEditSave = async () => {
        if (!editValue.trim() || !editingId) return;
        const editingRole = messages.find(m => m.id === editingId)?.role;
        try {
            await editChat(editingId, sessionId, editValue.trim());
            setEditingId(null);
            const msgData = await getMessageList(sessionId, null);
            setMessages(msgData.messages ?? []);
            setNextCursor(msgData.nextCursor ?? null);
            setHasMore(msgData.hasMore ?? false);

            if (editingRole === "user") {
                setIsRegenerating(true);
                try {
                    const { reply } = await regenerateChat(sessionId);
                    const { messageId } = await confirmChat(sessionId, reply);
                    setMessages(prev => [...prev, { role: "assistant", content: reply, id: messageId }]);
                    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
                } catch (err) {
                    toast.error(err.response?.data || "AI 응답 생성에 실패했어요.");
                } finally {
                    setIsRegenerating(false);
                }
            }
        } catch (err) {
            toast.error(err.response?.data || "수정에 실패했어요.");
        }
    };

    // ── 슬라이더 파생값 ───────────────────────────────────────
    const busy = isLoading || isRegenerating || isTyping;
    // replies가 있을 때만 마지막 AI 메시지를 슬라이더로 대체 (map에서 제외)
    const lastAiIdx = (replies.length > 0 || isRegenerating) ? messages.findLastIndex(m => m.role === "assistant") : -1;
    const lastIsAi = messages.length > 0 && messages[messages.length - 1]?.role === "assistant";
    // 총 슬라이드 수: 저장된 답변(1) + 재생성 답변 + 재생성 중 로딩(1)
    const totalSlides = 1 + replies.length + (isRegenerating ? 1 : 0);
    const isOnSaved = sliderIdx === 0;
    // 로딩: 재생성 중이고 타이핑 아직 시작 안 됨 / 타이핑: 재생성 중이고 isTyping
    const isOnLoading = isRegenerating && !isTyping && sliderIdx === totalSlides - 1;
    const isOnTyping  = isRegenerating &&  isTyping && sliderIdx === totalSlides - 1;
    const sliderContent = isOnSaved
        ? (lastAiIdx >= 0 ? messages[lastAiIdx].content : "")
        : isOnLoading  ? null
        : isOnTyping   ? typingText
        : replies[sliderIdx - 1];

    // 편집 가능 여부: 슬라이더 활성 중이거나 busy 상태면 불가
    const lastUserMsgIdx = messages.reduce((acc, m, i) => m?.role === "user" ? i : acc, -1);
    const canEdit = (m, i) => {
        if (!m || busy || replies.length > 0) return false;
        return (m.role === "user" && i === lastUserMsgIdx)
            || (m.role === "assistant" && i === messages.length - 1 && m.id);
    };

    return (
        <div className={classes.chatRoomWrapper}>
            <div className={classes.container}>

                {/* 상단 타이틀 바 + 케밥 메뉴 + 모달 */}
                <ChatRoomHeader
                    info={info}
                    sessionId={sessionId}
                    onNameUpdate={(name) => setInfo(prev => ({ ...prev, conversationName: name }))}
                />

                {/* 메시지 스크롤 영역 */}
                <div className={classes.messages} ref={messageAreaRef}>

                    {isFetching && (
                        <div className={classes.loadingMore}>
                            <span className={classes.loadingDots}><span /><span /><span /></span>
                        </div>
                    )}

                    {!hasMore && !isFetching && (
                        <p className={classes.disclaimer}>AI가 생성한 내용은 허구이며 실제 인물·사건과 무관합니다.</p>
                    )}

                    {/* 확정 메시지 목록 (슬라이더 대상인 마지막 AI 메시지는 제외) */}
                    {messages.map((m, i) => {
                        if (!m || i === lastAiIdx) return null;
                        return (
                            <MessageItem
                                key={m.id ?? i}
                                message={m}
                                info={info}
                                canEdit={canEdit(m, i)}
                                isEditing={editingId === m.id}
                                editValue={editValue}
                                onEditStart={() => { setEditingId(m.id); setEditValue(m.content); }}
                                onEditChange={setEditValue}
                                onEditSave={handleEditSave}
                                onEditCancel={() => setEditingId(null)}
                            />
                        );
                    })}

                    {/* 전송 중 로딩 dots */}
                    {isLoading && (
                        <div className={`${rowClasses.row} ${rowClasses.rowAi}`}>
                            <div className={rowClasses.aiAvatar}>
                                <Avatar filePath={info.characterImgUrl} name={info.characterName} size={150} />
                            </div>
                            <div className={rowClasses.msgWrapper}>
                                <div className={`${rowClasses.bubble} ${rowClasses.bubbleAi}`}>
                                    <span className={classes.loadingDots}><span /><span /><span /></span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 타이핑 버블 (전송 시만 - 재생성 타이핑은 슬라이더가 담당) */}
                    {isTyping && !isRegenerating && (
                        <div className={`${rowClasses.row} ${rowClasses.rowAi}`}>
                            <div className={rowClasses.aiAvatar}>
                                <Avatar filePath={info.characterImgUrl} name={info.characterName} size={150} />
                            </div>
                            <div className={rowClasses.msgWrapper}>
                                <div className={`${rowClasses.bubble} ${rowClasses.bubbleAi}`}>
                                    {typingText}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 재생성 슬라이더
                        - 슬라이드 0   : 저장된 답변 (opacity 0.5, 체크버튼 없음)
                        - 슬라이드 1~N : 재생성 답변 (체크버튼 표시)
                        - 슬라이드 N+1 : 재생성 중 로딩 dots
                    */}
                    {(replies.length > 0 || isRegenerating) && lastAiIdx >= 0 && (
                        <ReplySlider
                            info={info}
                            sliderContent={sliderContent}
                            isOnSaved={isOnSaved}
                            isOnLoading={isOnLoading}
                            sliderIdx={sliderIdx}
                            totalSlides={totalSlides}
                            busy={busy}
                            onPrev={() => setSliderIdx(i => Math.max(0, i - 1))}
                            onNext={() => setSliderIdx(i => Math.min(totalSlides - 1, i + 1))}
                            onRegenerate={handleRegenerate}
                            onConfirm={handleConfirm}
                        />
                    )}

                    {/* 재생성 버튼 (replies 없을 때 마지막 AI 메시지 아래) */}
                    {!busy && lastIsAi && replies.length === 0 && (
                        <div style={{ paddingLeft: 44 }}>
                            <button className={controlClasses.regenBtn} onClick={handleRegenerate}>
                                <BiRefresh />
                            </button>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* 입력창 */}
                <ChatInputBar
                    value={input}
                    onChange={setInput}
                    onSend={handleSend}
                    disabled={busy}
                />

            </div>
        </div>
    );
}

export default ChatRoom;
