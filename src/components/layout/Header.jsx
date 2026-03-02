import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiSearch, BiX, BiLogIn, BiLogOut } from "react-icons/bi";
import classes from "./Header.module.css";
import logo from "../../assets/logo.svg";

// 로그인 상태는 나중에 실제 auth 연결하면 교체
const isLoggedIn = false;

function Header() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const navigate = useNavigate();

    const handleSearchSubmit = (e) => {
        if (e.key === "Enter" && searchValue.trim()) {
            // 나중에 검색 라우트 연결
            navigate(`/search?q=${searchValue.trim()}`);
        }
    };

    const handleSearchClose = () => {
        setSearchOpen(false);
        setSearchValue("");
    };

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

                {/* 로그인 / 로그아웃 */}
                {isLoggedIn ? (
                    <button className={classes.authBtn} onClick={() => {}}>
                        <BiLogOut />
                        <span>로그아웃</span>
                    </button>
                ) : (
                    <Link to="/login" className={`${classes.authBtn} ${classes.authBtnLogin}`}>
                        <BiLogIn />
                        <span>로그인</span>
                    </Link>
                )}

            </div>
        </header>
    );
}

export default Header;
