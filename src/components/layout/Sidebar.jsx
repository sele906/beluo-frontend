import { Link, NavLink, useLoaderData } from "react-router-dom";
import { BiHome, BiPlusCircle, BiMessageDetail, BiSolidUser, } from "react-icons/bi";
import Avatar from "../../components/common/Avatar";

import classes from "./Sidebar.module.css";

function Sidebar({conversations}) {

    return (
        <>
            {/* ── 웹 메뉴 ── */}
            <div className={classes.sidebarWeb}>

                <div className={classes.createSection}>
                    <Link to="/create" className={classes.createBtn}>
                        <BiPlusCircle className={classes.createIcon} />
                        <span>새 캐릭터 만들기</span>
                    </Link>
                </div>

                <div className={classes.chatSection}>
                    <Link to="/chatlist" className={classes.sectionTitle}>
                        <BiMessageDetail />
                        <span>채팅 목록</span>
                    </Link>

                    <div className={classes.recentConversations}>
                        {conversations.length === 0 ? (
                            <p className={classes.empty}>최근 대화가 없어요</p>
                        ) : (
                            conversations.map((r) => (
                                <Link
                                    key={r.sessionId}
                                    to={`/chat/${r.sessionId}`}
                                    title={r.characterName}
                                    className={classes.chatItem}
                                >
                                    {/* 아바타 */}
                                    <div className={classes.avatar}>
                                        <Avatar
                                            filePath={r.characterImgUrl}
                                            name={r.characterName}
                                            size={200}
                                        />
                                    </div>

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

