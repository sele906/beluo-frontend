import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet, useLoaderData, useLocation } from "react-router-dom";

import classes from "./Layout.module.css";

const Layout = () => {

    const { conversations } = useLoaderData();
    const location = useLocation();
    const isChatRoom = location.pathname === '/chat';

    return (
        <div className={`${classes.wrapper} ${isChatRoom ? classes.chatMode : ''}`}>
            <div className={classes.header}>
                <Header />
            </div>
            
            <div className={classes.sidebar}>
                <Sidebar conversations={conversations}/>
            </div>

            <div className={classes.main}>
                <Outlet />
            </div>
        </div>
    );
}

export default Layout;