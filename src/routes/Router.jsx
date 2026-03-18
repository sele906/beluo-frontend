import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { getConversationList } from "../api/chatApi";

import Main from "../pages/main/Main";
import CharacterList from "../pages/main/CharacterList";

import ChatList from "../pages/chat/ChatList";
import ChatRoom from "../pages/chat/ChatRoom";

import Create from "../pages/create/Create";

import MyPage from "../pages/mypage/MyPage";
import MyPageProfile from "../pages/mypage/MyPageProfile";
import MyPageCharacters from "../pages/mypage/MyPageCharacters";
import MyPageCharactersEdit from "../pages/mypage/MyPageCharactersEdit";
import MyPageLiked from "../pages/mypage/MyPageLiked";
import MyPageBlocked from "../pages/mypage/MyPageBlocked";

import Login from "../pages/auth/Login";
import Join from "../pages/auth/Join";
import OAuth2Redirect from "../pages/auth/OAuth2Redirect";

import CharacterDetailModal, {loader as characterDetailLoader} from "../pages/character/CharacterDetailModal";

const Router = createBrowserRouter([
    {path: '/', element: <Layout />, loader: async () => ({
      conversations: await getConversationList()
    }), children: [
        
        // 메인
        {path: '/', element: <Main />, children: [
            {path: 'character/:id', element: <CharacterDetailModal />, loader: characterDetailLoader}
        ]},

        {path: '/search', element: <CharacterList />, children: [
            {path: 'character/:id', element: <CharacterDetailModal />}
        ]},

        //채팅 목록
        {path: '/chatlist', element: <ChatList />}, 

        {path: '/chat', element: <ChatRoom />},

        //추가하기
        {path: '/create', element: <Create />},

        //마이페이지
        { path: '/mypage', element: <MyPage />, children: [
            {path: 'character/:id', element: <CharacterDetailModal />, loader: characterDetailLoader}
        ]},

        { path: '/mypage/profile', element: <MyPageProfile /> },

        { path: '/mypage/characters', element: <MyPageCharacters />, children: [
            {path: 'character/:id', element: <CharacterDetailModal />, loader: characterDetailLoader}
        ]},
        { path: '/mypage/character/:id/edit', element: <MyPageCharactersEdit /> },

        { path: '/mypage/liked', element: <MyPageLiked />, children: [
            {path: 'character/:id', element: <CharacterDetailModal />, loader: characterDetailLoader}
        ]},

        { path: '/mypage/blocked', element: <MyPageBlocked /> },

    ]},
    {path: '/login', element: <Login/>},
    {path: '/join', element: <Join/>},
    {path: '/oauth2/redirect', element: <OAuth2Redirect/>},
]);

export default Router;