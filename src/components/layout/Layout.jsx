import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

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