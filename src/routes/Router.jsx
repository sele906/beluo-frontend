import { createBrowserRouter } from "react-router-dom";
import Layout, {loader as getConversationList} from "../components/layout/Layout";
import Main from "../pages/main/Main";
import ChatList from "../pages/chat/ChatList";
import Create from "../pages/create/Create";
import MyPage from "../pages/mypage/MyPage";
import ChatRoom from "../pages/chat/ChatRoom";
import Login from "../pages/auth/Login";
import Join from "../pages/auth/Join";
import OAuth2Redirect from "../pages/auth/OAuth2Redirect";
import CharacterDetailModal, {loader as characterDetailLoader} from "../pages/character/CharacterDetailModal";

const Router = createBrowserRouter([
    {path: '/', element: <Layout />, loader: getConversationList, children: [
        
        {path: '/', element: <Main />, children: [
            {path: 'character/:id', element: <CharacterDetailModal />, loader: characterDetailLoader}
        ]},

        // {path: '/search', element: <Search />, children: [
        //     {path: 'character/:id', element: <CharacterDetailModal />}
        // ]},

        // {path: '/mypage', element: <MyPage />, children: [
        //     {path: 'character/:id', element: <CharacterDetailModal />}
        // ]},

        {path: '/chatlist', element: <ChatList />}, 
        
        {path: '/chat', element: <ChatRoom />},
        {path: '/create', element: <Create />},
        {path: '/mypage', element: <MyPage />},

    ]},
    {path: '/login', element: <Login/>},
    {path: '/join', element: <Join/>},
    {path: '/oauth2/redirect', element: <OAuth2Redirect/>},
]);

export default Router;