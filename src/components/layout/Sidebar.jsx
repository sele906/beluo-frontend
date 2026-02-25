import { Link } from "react-router-dom";

import classes from "./Sidebar.module.css";

function Sidebar() {
    return (
        <>
            <div className={classes.sidebarWeb}>
                <p><Link to="/create">Create</Link></p>
                <p><Link to="/chatlist">Chatlist</Link></p>
            </div>

            <div className={classes.sidebarMobile}>
                <p><Link to="/">Home</Link></p>
                <p><Link to="/chatlist">Chatlist</Link></p>
                <p><Link to="/create">Create</Link></p>
                <p><Link to="/mypage">Mypage</Link></p>
            </div>
        </>
    );
}

export default Sidebar;