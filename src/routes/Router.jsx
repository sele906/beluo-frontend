import { createBrowserRouter } from "react-router-dom";
import Layout, {loader as getConversationList} from "../components/layout/Layout";
import Main from "../pages/main/Main";
import ChatList from "../pages/chat/ChatList";
import Create from "../pages/create/Create";
import MyPage from "../pages/mypage/MyPage";
import ChatRoom from "../pages/chat/ChatRoom";

const Router = createBrowserRouter([
    {path: '/', element: <Layout />, loader: getConversationList, children: [
        {path: '/', element: <Main />},
        {path: '/chatlist', element: <ChatList />},
        {path: '/create', element: <Create />},
        {path: '/mypage', element: <MyPage />},

        {path: '/chat', element: <ChatRoom />}
    ]}
]);

export default Router;