import { Link, NavLink, useLoaderData } from "react-router-dom";
import { BiHome, BiPlusCircle, BiMessageDetail, BiSolidUser, BiChat } from "react-icons/bi";

import classes from "./Sidebar.module.css";

function Sidebar() {
    const recentConversations = useLoaderData();

    return (
        <>
            {/* ── 웹 메뉴 ── */}
            <div className={classes.sidebarWeb}>

                <div className={classes.createSection}>
                    <Link to="/create" className={classes.createBtn}>
                        <BiPlusCircle className={classes.createIcon} />
                        <span>새 채팅 시작하기</span>
                    </Link>
                </div>

                <div className={classes.chatSection}>
                    <Link to="/chatlist" className={classes.sectionTitle}>
                        <BiMessageDetail />
                        <span>채팅 목록</span>
                    </Link>

                    <div className={classes.recentConversations}>
                        {recentConversations.length === 0 ? (
                            <p className={classes.empty}>최근 대화가 없어요</p>
                        ) : (
                            recentConversations.map((r) => (
                                <Link
                                    key={r.sessionId}
                                    to={`/chat?sessionId=${r.sessionId}&chatName=${r.conversationName}`}
                                    title={r.characterName}
                                    className={classes.chatItem}
                                >
                                    <span className={classes.chatDot} />
                                    <span className={classes.chatName}>{r.conversationName}</span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── 모바일 메뉴 ── */}
            <nav className={classes.sidebarMobile}>
                <NavLink to="/" end className={({ isActive }) => `${classes.navItem} ${isActive ? classes.navItemActive : ""}`}>
                    <span className={classes.navIconWrap}>
                        <BiHome />
                        <span className={classes.navLabel}>홈</span>
                    </span>
                </NavLink>
                <NavLink to="/chatlist" className={({ isActive }) => `${classes.navItem} ${isActive ? classes.navItemActive : ""}`}>
                    <span className={classes.navIconWrap}>
                        <BiMessageDetail />
                        <span className={classes.navLabel}>채팅</span>
                    </span>
                </NavLink>
                <NavLink to="/create" className={({ isActive }) => `${classes.navItem} ${isActive ? classes.navItemActive : ""}`}>
                    <span className={classes.navIconWrap}>
                        <BiPlusCircle />
                        <span className={classes.navLabel}>추가</span>
                    </span>
                </NavLink>
                <NavLink to="/mypage" className={({ isActive }) => `${classes.navItem} ${isActive ? classes.navItemActive : ""}`}>
                    <span className={classes.navIconWrap}>
                        <BiSolidUser />
                        <span className={classes.navLabel}>마이</span>
                    </span>
                </NavLink>
            </nav>
        </>
    );
}

export default Sidebar;

