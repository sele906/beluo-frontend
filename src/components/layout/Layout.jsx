import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet, useLoaderData } from "react-router-dom";

import classes from "./Layout.module.css";

const Layout = () => {

    const { conversations } = useLoaderData();

    return (
        <div className={classes.wrapper}>
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