import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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

//메세지 출력
export async function getMessageList(sessionId, before) {
  const params = { sessionId };
  if (before) params.before = before;

  const res = await api.get("/chat/messages", { params });
  return res.data;
}

//conversation

//채팅방 생성
export async function createConversation(characterId) {
    const res = await api.get("/conversation/create", { params: { characterId: characterId } });
    return res.data; 
}

// 채팅방 목록 가져오기
export async function getConversationList() {
  try {
    const res = await api.get("/conversation/list");
    return res.data;
  } catch (error) {
    console.error("채팅방 목록 불러오기 실패:", error);
    return []; 
  }
}

// 채팅방 상세 정보
export async function getConversationDetail(sessionId) {
  const res = await api.get("/conversation/detail", {
    params: { sessionId },
  });
  return res.data;
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

//create

//캐릭터 생성하기
export async function createCharacter(formData) {
  const res = await api.post("/character/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}