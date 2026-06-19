import { useState, useEffect } from "react";
import { getCharacterOverviewList } from "../../api/chatApi";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hook/AuthContext";
import CharacterCard from "../../components/common/CharacterCard";

import classes from "./Main.module.css";

const Section = ({ title, characters }) => (
    <section className={classes.section}>
        <h3 className={classes.sectionTitle}>{title}</h3>
        <div className={classes.cardGrid}>
            {characters.map((m) => (
                <CharacterCard key={m.id} character={m} showTags className={classes.card} />
            ))}
        </div>
    </section>
);

function Main() {
    const { isLoggedIn, logout } = useAuth();
    const location = useLocation();

    const [characterList, setCharacterList] = useState({
        popular: [],
        liked: [],
        recent: []
    });

    useEffect(() => {
        if (location.pathname !== '/') return;
        async function fetchCharacters() {
            try {
                const data = await getCharacterOverviewList();
                setCharacterList(data);
            } catch (error) {
                console.error("캐릭터 목록 불러오기 실패:", error);
            }
        }
        fetchCharacters();
    }, [location.pathname]);

    const showLiked = isLoggedIn && characterList.liked?.length > 0;

    return (
        <>
            <Outlet />
            <div className={classes.main}>

                <div className={classes.betaBanner}>
                    
                    <p className={classes.betaBadge}>BETA</p>
                    <p className={classes.betaTitle}>지금은 베타 기간이에요 (4.1 ~ 5.1)</p>
                    <p className={classes.betaDesc}>매일 50 크레딧 무료 제공!</p>
                </div>

                {showLiked && (
                    <section className={`${classes.section} ${classes.likedSection}`}>
                        <h3 className={classes.sectionTitle}>❤️ 내가 찜한 캐릭터</h3>
                        <div className={classes.cardGrid}>
                            {characterList.liked.map((m) => (
                                <CharacterCard key={m.id} character={m} showTags className={classes.card} />
                            ))}
                        </div>
                    </section>
                )}

                <Section title="🔥 요즘 뜨는 캐릭터" characters={characterList.popular ?? []} />

                <Section title="✨ 신규 캐릭터" characters={characterList.recent ?? []} />
            </div>
        </>
    );
}

export default Main;