import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { getMessageList, sendChat } from "../../api/chatApi";
import { BiRightArrowAlt } from "react-icons/bi";
import classes from "./ChatRoom.module.css";

function ChatRoom() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const conversationName = searchParams.get("chatName");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef(null);

  // 새 메시지 올 때마다 스크롤 아래로
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 채팅방 입장 시 기존 메시지 불러오기
  useEffect(() => {
    if (!sessionId) return;
    async function fetchMessages() {
      try {
        const data = await getMessageList(sessionId);
        setMessages(data);
      } catch (error) {
        console.error("대화 불러오기 실패:", error);
      }
    }
    fetchMessages();
  }, [sessionId]);

  // 타이핑 효과
  const typeMessage = (text) => {
    let index = 0;
    setMessages((prev) => [...prev, { role: "ai", content: "" }]);

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

  return (
    <div className={classes.container}>

      {/* ── 상단 타이틀 바 ── */}
      <div className={classes.topBar}>
        <div className={classes.topAvatar}>
          {messages[0]?.anonymousImg ? (
            <img src={messages[0].anonymousImg} alt="avatar" className={classes.topAvatarImg} />
          ) : (
            conversationName?.charAt(0).toUpperCase()
          )}
        </div>
        <span className={classes.topName}>{conversationName}</span>
      </div>

      {/* ── 메시지 영역 ── */}
      <div className={classes.messages}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`${classes.row} ${m.role === "user" ? classes.rowUser : classes.rowAi}`}
          >

            {/* AI 아바타 */}
            {m.role !== "user" && (
              <div className={classes.aiAvatar}>
                {m.anonymousImg ? (
                  <img src={m.anonymousImg} alt="avatar" className={classes.aiAvatarImg} />
                ) : (
                  conversationName?.charAt(0).toUpperCase()
                )}
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
  );
}

export default ChatRoom;
