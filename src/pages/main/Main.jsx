import { useState, useEffect } from "react";
import { getCharacterOverviewList } from "../../api/chatApi";
import { Link, Outlet, useLocation } from "react-router-dom";
import Avatar from "../../components/common/Avatar";
import { useAuth } from "../../hook/AuthContext";

import classes from "./Main.module.css";

const CharacterCard = ({ character }) => (
    <div className={classes.card}>
    <Link className={classes.cardLink} to={`/character/${character.id}`}>
        <div className={classes.cardImageWrap}>
            <Avatar
                filePath={character.characterImgUrl}
                name={character.characterName}
                imgClassName={classes.cardImage}
                card={true}
                size={300}
            />
        </div>
        <div className={classes.cardBody}>
            <h4 className={classes.cardName}>{character.characterName}</h4>
            <p className={classes.cardPersonality}>{character.summary}</p>
            <div className={classes.cardTags}>
                {character.tag?.map((t) => (
                    <span key={t} className={classes.tag}>#{t}</span>
                ))}
            </div>
        </div>
    </Link>
    </div>
);

const Section = ({ title, characters }) => (
    <section className={classes.section}>
        <h3 className={classes.sectionTitle}>{title}</h3>
        <div className={classes.cardGrid}>
            {characters.map((m) => (
                <CharacterCard key={m.id} character={m} />
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

                {showLiked && (
                    <section className={`${classes.section} ${classes.likedSection}`}>
                        <h3 className={classes.sectionTitle}>❤️ 내가 찜한 캐릭터</h3>
                        <div className={classes.cardGrid}>
                            {characterList.liked.map((m) => (
                                <CharacterCard key={m.id} character={m} />
                            ))}
                        </div>
                    </section>
                )}

                <Section title="🔥 요즘 뜨는 캐릭터" characters={characterList.popular} />

                <Section title="✨ 신규 캐릭터" characters={characterList.recent} />
            </div>
        </>
    );
}

export default Main;