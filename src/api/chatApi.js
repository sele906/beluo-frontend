import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes("/auth/refresh") && !originalRequest.url.includes("/auth/logout")) {
      originalRequest._retry = true;
      try {
        await api.post("/auth/refresh");
        return api(originalRequest);
      } catch {
        await api.post("/auth/logout");
        localStorage.removeItem("isLoggedIn");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── chat ───────────────────────────────────────────────

export async function sendChat(message, sessionId) {
  const res = await api.post("/chat/send", { message, sessionId });
  return res.data;
}

export async function regenerateChat(sessionId) {
  const res = await api.post("/chat/regenerate", { sessionId });
  return res.data;
}

export async function confirmChat(sessionId, reply) {
  const res = await api.post("/chat/confirm", { sessionId, reply });
  return res.data;
}

export async function editChat(chatId, sessionId, content) {
  await api.patch("/chat/edit", { chatId, sessionId, content });
}

export async function getMessageList(sessionId, before) {
  const res = await api.get(`/chat/messages/${sessionId}`, {
    params: before ? { before } : {}
  });
  return res.data;
}

// ─── conversation ────────────────────────────────────────

export async function createConversation(characterId) {
  const res = await api.post(`/conversation/create/${characterId}`);
  return res.data;
}

export async function getConversationList(cursor = null) {
  try {
    const params = cursor ? { before: cursor } : {};
    const res = await api.get("/conversation/list", { params });
    return res.data;
  } catch (error) {
    console.error("채팅방 목록 불러오기 실패:", error);
    return { conversations: [], hasMore: false, nextCursor: null };
  }
}

export async function getConversationDetail(sessionId) {
  const res = await api.get(`/conversation/detail/${sessionId}`);
  return res.data;
}

export async function updateConversationName(sessionId, conversationName) {
  const res = await api.patch("/conversation/edit", { sessionId, conversationName });
  return res.data;
}

export async function deleteConversation(id) {
  await api.delete(`/conversation/delete/${id}`);
}

// ─── character ───────────────────────────────────────────

export async function getCharacterOverviewList() {
  const res = await api.get("/character");
  return res.data;
}

export async function getCharacterList(keyword) {
  const res = await api.get("/character/list", { params: { keyword } });
  return res.data;
}

export async function getCharacterSummaryDetail(id) {
  const res = await api.get(`/character/${id}/summary`);
  return res.data;
}

export async function createCharacter(formData) {
  const res = await api.post("/character/create", formData, {
    headers: { "Content-Type": undefined },
  });
  return res.data;
}

// ─── like ────────────────────────────────────────────────

export async function addLike(characterId) {
  await api.post(`/character/like/${characterId}`);
}

export async function cancelLike(characterId) {
  await api.delete(`/character/like/${characterId}`);
}

// ─── blocked ─────────────────────────────────────────────

export async function addBlocked(characterId) {
  await api.post(`/character/blocked/${characterId}`);
}

export async function cancelBlocked(characterId) {
  await api.delete(`/character/blocked/${characterId}`);
}

// ─── auth ────────────────────────────────────────────────

export async function login(data) {
  const res = await api.post("/auth/login", data);
  return res.data;
}

export async function join(user, file) {
  const formData = new FormData();
  formData.append("user", new Blob([JSON.stringify(user)], { type: "application/json" }));
  if (file) formData.append("file", file);
  const res = await api.post("/auth/join", formData, {
    headers: { "Content-Type": undefined },
  });
  return res.data;
}

export async function oauthJoin(name, birth, file) {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("birth", birth);
    if (file) formData.append("file", file);
    const res = await api.post("/auth/oauth2/join", formData, {
      headers: { "Content-Type": undefined },
    });
    return res.data;
  }

export async function logout() {
  const res = await api.post("/auth/logout");
  return res.data;
}

export async function sendVerifyEmailApi(email) {
  const res = await api.post("/auth/verify/send", { email });
  return res.data;
}

export async function checkVerifyCodeApi(email, code) {
  const res = await api.post("/auth/verify/check", { email, code });
  return res.data;
}

// ─── mypage ──────────────────────────────────────────────

export async function getMypageOverview() {
  const res = await api.get("/mypage/overview");
  return res.data;
}

export async function getProfile() {
  const res = await api.get("/mypage/profile");
  return res.data;
}

export async function updateProfile(formData) {
  const res = await api.patch("/mypage/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteProfile() {
  await api.delete("/mypage/profile");
}

export async function getMyCharacters() {
  const res = await api.get("/mypage/characters");
  return res.data;
}

export async function getCharacterDetail(id) {
  const res = await api.get(`/mypage/characters/${id}`);
  return res.data;
}

export async function updateCharacter(id, formData) {
  const res = await api.patch(`/mypage/characters/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteCharacter(id) {
  await api.delete(`/mypage/characters/${id}`);
}

export async function getLikedCharacters() {
  const res = await api.get("/mypage/liked");
  return res.data;
}

export async function getBlockedCharacters() {
  const res = await api.get("/mypage/blocked");
  return res.data;
}

export async function submitInquiry(content) {
  await api.post("/mypage/inquiry", { content });
}

export async function getModel() {
  const res = await api.get("/mypage/model");
  return res.data; 
}

export async function updateModel(model) {
  await api.post("/mypage/model", model, {
    headers: { "Content-Type": "text/plain" },
  });
}
