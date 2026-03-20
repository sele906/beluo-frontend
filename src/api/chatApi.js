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

export async function getMessageList(sessionId, before) {
  const params = { sessionId };
  if (before) params.before = before;
  const res = await api.get("/chat/messages", { params });
  return res.data;
}

// ─── conversation ────────────────────────────────────────

export async function createConversation(characterId) {
  const res = await api.get("/conversation/create", { params: { characterId } });
  return res.data;
}

export async function getConversationList() {
  try {
    const res = await api.get("/conversation/list");
    return res.data;
  } catch (error) {
    console.error("채팅방 목록 불러오기 실패:", error);
    return [];
  }
}

export async function getConversationDetail(sessionId) {
  const res = await api.get("/conversation/detail", { params: { sessionId } });
  return res.data;
}

export async function updateConversationName(sessionId, conversationName) {
  const res = await api.patch("/conversation/edit", { sessionId, conversationName });
  return res.data;
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
    headers: { "Content-Type": "multipart/form-data" },
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
  const res = await api.post("/auth/join", formData);
  return res.data;
}

export async function logout() {
  const res = await api.post("/auth/logout");
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
