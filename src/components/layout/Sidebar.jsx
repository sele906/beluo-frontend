import { Link } from "react-router-dom";
import { useLoaderData } from "react-router-dom";

import classes from "./Sidebar.module.css";

function Sidebar() {
    const recentConversations = useLoaderData();

    return (
        <>
            <div className={classes.sidebarWeb}>
                <div><Link to="/create">Create</Link></div>
                <div>
                    <Link to="/chatlist">Chatlist</Link>
                    <div className={classes.recentConversations}>
                        {recentConversations.map((r) => 
                            <p key={r.sessionId}>
                                <Link to={`/chat?sessionId=${r.sessionId}&chatName=${r.conversationName}`} title={r.characterName}>{r.conversationName}</Link>
                            </p>
                        )}
                    </div>
                </div>
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

