# Beluo Frontend

AI 캐릭터 채팅 플랫폼 Beluo의 프론트엔드입니다.<br/>
사용자가 직접 AI 캐릭터를 만들고, 다양한 AI 모델과 채팅할 수 있는 서비스입니다.

## 프로젝트 설계

### 개발환경

**FrontEnd**

<img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black"> <img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"> <img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white"> <img src="https://img.shields.io/badge/css3-1572B6?style=for-the-badge&logo=css3&logoColor=white">

<img src="https://img.shields.io/badge/vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"> <img src="https://img.shields.io/badge/reactrouter-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white"> <img src="https://img.shields.io/badge/zustand-433e38?style=for-the-badge&logo=react&logoColor=white"> <img src="https://img.shields.io/badge/axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white">

**Tool**

<img src="https://img.shields.io/badge/vscode-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white"> <img src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white">

**Deployment**

<img src="https://img.shields.io/badge/vercel-000000?style=for-the-badge&logo=vercel&logoColor=white">

---

## 실행 방법

```bash
npm install
npm run dev      
npm run build    
npm run preview  
```

## 환경 변수

환경 변수는 `.env.example`을 참고해 `.env` 파일을 생성하세요.

```bash
cp .env.example .env
```

---

## 디렉토리 구조

```
src/
├── api/          # Axios 인스턴스 및 API 함수
├── components/   # 재사용 컴포넌트
│   ├── layout/   # Header, Sidebar, Footer
│   ├── chat/     # 채팅 관련 컴포넌트
│   └── common/   # 공통 컴포넌트
├── hook/         # 커스텀 훅 (인증, 무한스크롤, 타이핑 효과)
├── pages/        # 페이지 컴포넌트
│   ├── auth/     # 로그인, 회원가입, OAuth2
│   ├── main/     # 메인, 캐릭터 검색
│   ├── chat/     # 채팅 목록, 채팅방
│   ├── create/   # 캐릭터 생성
│   └── mypage/   # 마이페이지
├── routes/       # React Router 설정
├── store/        # Zustand 스토어
└── styles/       # 글로벌 CSS
```

---

## 구현 기능

### 인증

**로그인 / 회원가입**

- 일반 로그인 및 회원가입
- OAuth2 소셜 로그인 (카카오 등)
- 이메일 인증 코드 발송 및 검증
- JWT 기반 인증 (자동 토큰 갱신)

### 캐릭터

**탐색**

- 메인 페이지 캐릭터 소개
- 캐릭터 검색
- 캐릭터 상세 모달

**관리**

- 캐릭터 생성 (이미지 업로드 포함)
- 찜하기 / 찜 취소
- 차단하기 / 차단 취소

### 채팅

**대화**

- AI 캐릭터와 실시간 대화
- AI 응답 슬라이더 (여러 응답 중 선택)
- 응답 재생성
- 메시지 편집 후 재응답
- 타이핑 효과 애니메이션
- 무한 스크롤 (이전 메시지 로드)

**채팅방 관리**

- 채팅 목록 조회
- 채팅방 이름 수정
- 채팅방 삭제

### 마이페이지

**프로필**

- 프로필 조회 및 수정
- 아바타 이미지 업로드
- 계정 삭제

**내 캐릭터**

- 내가 만든 캐릭터 목록
- 캐릭터 수정 / 삭제

**기타**

- 찜한 캐릭터 목록
- 차단한 캐릭터 목록
- AI 모델 선택 및 크레딧 조회
- 문의 제출

---

## 관련 레포지토리
Backend: [beluo-api](https://github.com/sele906/beluo-backend.git)

