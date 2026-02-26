import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// 채팅방 목록 가져오기
export async function getConversationList() {
  const res = await api.get("/testGetConversationList");

  return res.data.map(item => ({
    characterName: item.characterName,
    conversationName: item.conversationName,
    sessionId: item.sessionId,
  }));
}

// 채팅 가져오기
export async function getMessageList(sessionId) {
  const res = await api.get("/testGetMessageList", {
    params: { sessionId: sessionId },
  });

  return res.data.map(item => ({
    id: item.id,
    role: item.role,
    content: item.content,
    createdAt: item.createdAt
  }));
}

// 채팅 보내기
export async function sendChat(message, sessionId) {
  const res = await api.post("/testChatSend", {
    message: message,
    sessionId: sessionId
  });

  return res.data;
}