import { useState, useEffect } from "react";
import { Link, Outlet, useSearchParams } from "react-router-dom";
import { getCharacterList } from "../../api/chatApi";
import Avatar from "../../components/common/Avatar";

import classes from './CharacterList.module.css';

function CharacterList() {
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("q") ?? "";

    const [characters, setCharacters] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!keyword.trim()) return;
        setIsLoading(true);
        getCharacterList(keyword)
            .then((data) => setCharacters(data.characters ?? []))
            .catch((err) => console.error("검색 실패:", err))
            .finally(() => setIsLoading(false));
    }, [keyword]);

    return (
        <>
            <Outlet />
            <div className={classes.page}>

                <div className={classes.header}>
                    <span className={classes.keyword}>"{keyword}"</span>
                    <span className={classes.count}>검색 결과 {characters.length}개</span>
                </div>

                {isLoading ? (
                    <div className={classes.empty}>불러오는 중...</div>
                ) : characters.length === 0 ? (
                    <div className={classes.empty}>
                        <span className={classes.emptyIcon}>🔍</span>
                        <span>검색 결과가 없어요</span>
                    </div>
                ) : (
                    <div className={classes.grid}>
                        {characters.map((char) => (
                            <Link key={char.id} className={classes.card} to={`character/${char.id}`}>
                                <div className={classes.cardImageWrap}>
                                    <Avatar
                                        filePath={char.characterImgUrl}
                                        name={char.characterName}
                                        imgClassName={classes.cardImage}
                                        card={true}
                                    />
                                </div>
                                <div className={classes.cardBody}>
                                    <span className={classes.cardName}>{char.characterName}</span>
                                    {char.summary && (
                                        <span className={classes.cardDesc}>{char.summary}</span>
                                    )}
                                    <div className={classes.cardTags}>
                                        {char.tag?.map((t) => (
                                            <span key={t} className={classes.tag}>#{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

            </div>
        </>
    );
}

export default CharacterList;
