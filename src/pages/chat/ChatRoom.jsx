import { useState } from "react";
import { chatApi } from "../../api/chatApi";

function ChatRoom() {

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);

    const typeMessage = (text) => {
    let index = 0;

    // 빈 AI 메시지 먼저 추가
    setMessages((prev) => [...prev, { role: "ai", text: "" }]);

    const interval = setInterval(() => {
        index++;

        setMessages((prev) => {
            const updated = [...prev];
            const lastMessage = updated[updated.length - 1];

            if (lastMessage.role === "ai") {
            lastMessage.text = text.slice(0, index);
            }

            return updated;
        });

        if (index >= text.length) {
            clearInterval(interval);
        }
    }, 50); // 속도 조절 (ms)
    };

  const handleSend = async () => {
      if (!input.trim()) return;
  
      setMessages((prev) => [...prev, { role: "user", text: input }]);
  
      const res = await chatApi(input);
  
      typeMessage(res.reply);
  
      setInput("");
    };
    
    return (
        <>

        <div>
            {messages.map((m, i) => (
                <div key={i}>
                    <b>{m.role === "user" ? "나" : "AI"}:</b> {m.text}
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