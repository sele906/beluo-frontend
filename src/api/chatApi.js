import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

//chat

// 메세지 보내기
export async function sendChat(message, sessionId) {
  const res = await api.post("/chat/send", {
    message: message,
    sessionId: sessionId
  });

  return res.data;
}

//최근 10개 대화 출력
export async function getMessageList(sessionId) {
  const res = await api.get("/chat/messages", {
    params: { sessionId: sessionId },
  });

  return res.data.map(item => ({
    id: item.id,
    role: item.role,
    content: item.content,
    createdAt: item.createdAt
  }));
}

//conversation

// 채팅방 목록 가져오기
export async function getConversationList() {
  try {
    const res = await api.get("/conversation/list");
    return res.data.map(item => ({
      characterName: item.characterName,
      conversationName: item.conversationName,
      sessionId: item.sessionId,
    }));
  } catch (error) {
    console.error("채팅방 목록 불러오기 실패:", error);
    return []; 
  }
}

//charcter

//캐릭터 목록 가져오기
export async function getCharacterList() {
  const res = await api.get("/character/list");
  return res.data;
}

//캐릭터 상세 페이지
export async function getCharacterDetail(id) {
  const res = await api.get("/character/detail?id=" + id);
  return res.data;
}