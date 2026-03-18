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
        await api.post("/auth/logout"); // refreshToken DB 삭제
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

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

//캐릭터 요약 목록 가져오기
export async function getCharacterOverviewList() {
  const res = await api.get("/character");
  return res.data;
}

//캐릭터 검색 목록 가져오기
export async function getCharacterList(keyword) {
  const res = await api.get("/character/list", { params: { keyword: keyword } });
  return res.data;
}

//캐릭터 요약 상세 페이지
export async function getCharacterSummaryDetail(id) {
  const res = await api.get(`/character/${id}/summary`);
  return res.data;
}

//like

export async function setAddLiked(characterId) {
  await api.post(`/character/like/${characterId}`);
}

export async function setCancelLiked(characterId) {
  await api.delete(`/character/like/${characterId}`);
}

//blocked

export async function setAddBlocked(characterId) {
  await api.post(`/character/blocked/${characterId}`);
}

export async function setCancelBlocked(characterId) {
  await api.delete(`/character/blocked/${characterId}`);
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

//auth

//로그인
export async function loginApi(data) {
  const res = await api.post("/auth/login", data);
  return res.data;
}

//회원가입
export async function joinApi(data) {
  const res = await api.post("/auth/join", data);
  return res.data;
}

//로그아웃
export async function logoutApi() {
  const res = await api.post("/auth/logout");
  return res.data;
}

//mypage

//마이페이지
export async function mypageOverviewApi() {
  const res = await api.get("/mypage/overview");
  return res.data;
}

//회원정보
export async function profileApi() {
  const res = await api.get("/mypage/profile");
  return res.data;
}

//회원정보 수정하기
export async function updateProfile(formData) {
  const res = await api.patch(`/mypage/profile`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

//내 캐릭터
export async function charactersApi() {
  const res = await api.get("/mypage/characters");
  return res.data;
}

//캐릭터 상세 페이지
export async function getCharacterDetail(id) {
  const res = await api.get(`/mypage/characters/${id}`);
  return res.data;
}

//캐릭터 수정하기
export async function updateCharacter(id, formData) {
  const res = await api.patch(`/mypage/characters/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

//캐릭터 삭제하기
export async function deleteCharacter(id) {
  await api.delete(`/mypage/characters/${id}`);
}

//관심 캐릭터
export async function likedApi() {
  const res = await api.get("/mypage/liked");
  return res.data;
}

//차단 캐릭터
export async function blockedApi() {
  const res = await api.get("/mypage/blocked");
  return res.data;
}


