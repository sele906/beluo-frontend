import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiSearch, BiX, BiSolidUser, BiUser, BiLogIn, BiLogOut } from "react-icons/bi";
import { useAuth } from "../../hook/AuthContext";
import { logoutApi } from "../../api/chatApi";

import classes from "./Header.module.css";
import logo from "../../assets/logo.svg";

function Header() {
    const { isLoggedIn, logout } = useAuth();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const navigate = useNavigate();

    const handleSearchSubmit = (e) => {
        if (e.key === "Enter" && searchValue.trim()) {
            navigate(`/search?q=${searchValue.trim()}`);
        }
    };

    const handleSearchClose = () => {
        setSearchOpen(false);
        setSearchValue("");
    };

    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch (e) {
            console.error(e);
        } finally {
            logout();
            navigate("/");
        }
    };

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const closeMenu = () => setUserMenuOpen(false);
    const menuItems = [
        { to: "/mypage", icon: <BiUser />, label: "마이메뉴" },
        { icon: <BiLogOut />, label: "로그아웃", onClick: handleLogout },
    ];

    return (
        <header className={classes.header}>

            {/* 로고 */}
            <Link to="/" className={classes.logo}>
                <img src={logo} alt="BELUO" className={classes.logoImg} />
            </Link>

            {/* 우측 액션 */}
            <div className={classes.actions}>

                {/* 검색 */}
                <div className={`${classes.searchWrap} ${searchOpen ? classes.searchOpen : ""}`}>
                    {searchOpen && (
                        <input
                            className={classes.searchInput}
                            type="text"
                            placeholder="검색..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleSearchSubmit}
                            autoFocus
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />
                    )}
                    <button
                        className={classes.iconBtn}
                        onClick={() => searchOpen ? handleSearchClose() : setSearchOpen(true)}
                        aria-label="search"
                    >
                        {searchOpen ? <BiX /> : <BiSearch />}
                    </button>
                </div>

                {isLoggedIn ? (
                    <div className={classes.userMenu}>
                        <button className={classes.iconBtn} onClick={() => setUserMenuOpen(prev => !prev)}>
                            <BiSolidUser />
                        </button>

                        {userMenuOpen && (
                            <div className={classes.dropdown}>
                                {menuItems.map(({ to, icon, label, onClick }) =>
                                    to ? (
                                        <Link key={label} to={to} className={classes.dropdownItem} onClick={closeMenu}>
                                            {icon} {label}
                                        </Link>
                                    ) : (
                                        <button key={label} className={classes.dropdownItem} onClick={onClick}>
                                            {icon} {label}
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className={`${classes.authBtn} ${classes.authBtnLogin}`}>
                        <BiLogIn /><span>로그인</span>
                    </Link>
                )}

            </div>
        </header>
    );
}

export default Header;
