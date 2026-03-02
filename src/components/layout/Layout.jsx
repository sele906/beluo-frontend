import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { getConversationList } from "../../api/chatApi";

import classes from "./Layout.module.css";

const Layout = () => {

    return (
        <div className={classes.wrapper}>
            <div className={classes.header}>
                <Header />
            </div>
            
            <div className={classes.sidebar}>
                <Sidebar />
            </div>

            <div className={classes.main}>
                <Outlet />
            </div>
        </div>
    );
}

export default Layout;

export async function loader() {
  return await getConversationList();
}