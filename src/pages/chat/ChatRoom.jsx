import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getMessageList, sendChat } from "../../api/chatApi";

function ChatRoom() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const conversationName = searchParams.get("chatName");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
    const [ isLoading, setIsLoading] = useState(false);

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
  }, [sessionId]); // sessionId 변경 시 재실행

  // 타이핑 효과
  const typeMessage = (text) => {
    let index = 0;

    setMessages((prev) => [...prev, { role: "ai", content: "" }]);

    const interval = setInterval(() => {
      index++;

      setMessages((prev) => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];

        if (lastMessage.role === "ai") {
          lastMessage.content = text.slice(0, index);
        }

        return updated;
      });

      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 30);
  };

  // 메시지 전송
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    //ai 더미 응답
    setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Loading...", isLoading: true },
    ]);

    try {
        const res = await sendChat(input, sessionId); 

        setMessages((prev) => prev.slice(0, -1));
        typeMessage(res.reply);
    } catch (error) {
        console.error("메시지 전송 실패:", error);
    }
  };

  return (
    <>
      <h2>{conversationName}</h2>

      <div>
        {messages.map((m, i) => (
          <div key={i}>

            <b>{m.role === "user" ? "나" : "AI"}:</b> 
            
            <p>{m.content}</p>

          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button onClick={handleSend}>전송</button>
    </>
  );
}

export default ChatRoom;