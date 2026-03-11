import { useState, useEffect } from "react";
import { getCharacterList } from "../../api/chatApi";
import { Link, Outlet } from "react-router-dom";
import Avatar from "../../components/common/Avatar";
import { useAuth } from "../../hook/AuthContext";

import classes from "./Main.module.css";

const CharacterCard = ({ character }) => (
    <div className={classes.card}>
    <Link className={classes.cardLink} to={"/character/" + character.id}>
        <div className={classes.cardImageWrap}>
            <Avatar
                filePath={character.characterImgUrl}
                name={character.characterName}
                imgClassName={classes.cardImage}
                placeholderClassName={classes.cardImagePlaceholder}
            />
        </div>
        <div className={classes.cardBody}>
            <h4 className={classes.cardName}>{character.characterName}</h4>
            <p className={classes.cardPersonality}>{character.personality}</p>
            <div className={classes.cardTags}>
                {character.tag?.map((t) => (
                    <span key={t} className={classes.tag}>{t}</span>
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

    const [characterList, setCharacterList] = useState({
        popular: [],
        liked: [],
        recent: []
    });

    useEffect(() => {
        async function fetchCharacters() {
            try {
                const data = await getCharacterList();
                setCharacterList(data);
            } catch (error) {
                console.error("캐릭터 목록 불러오기 실패:", error);
            }
        }
        fetchCharacters();
    }, []);

    const showLiked = isLoggedIn && characterList.liked?.length > 0;

    return (
        <>
            <Outlet />
            <div className={classes.main}>

                {showLiked && (
                    <Section title="❤️ 관심순" characters={characterList.liked} />
                )}

                <Section title="🔥 인기순" characters={characterList.popular} />
                
                <Section title="✨ 신규순" characters={characterList.recent} />
            </div>
        </>
    );
}

export default Main;