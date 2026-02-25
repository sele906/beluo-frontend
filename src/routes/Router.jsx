import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Main from "../pages/main/Main";
import ChatList from "../pages/chat/ChatList";
import Create from "../pages/create/Create";
import MyPage from "../pages/mypage/MyPage";

const Router = createBrowserRouter([
    {path: '/', element: <Layout />, children: [
        {path: '/', element: <Main />},
        {path: '/chatlist', element: <ChatList />},
        {path: '/create', element: <Create />},
        {path: '/mypage', element: <MyPage />}
    ]}
]);

export default Router;