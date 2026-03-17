import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { BiSearch, BiPlus, BiLeftArrowAlt } from 'react-icons/bi';
import { charactersApi } from '../../api/chatApi';
import Avatar from '../../components/common/Avatar';

import classes from './MyPageCharacters.module.css';

function MyPageCharacters() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [character, setCharacters] = useState();

    useEffect(() => {
        async function fetchCharactersInfo() {
            try {
                const data = await charactersApi();
                setCharacters(data);
            } catch (error) {
                console.error("캐릭터 정보 불러오기 실패:", error);
            }
        }
        fetchCharactersInfo();
    }, []);

    if (!character) return null;

    const filtered = character.filter((c) =>
        c.characterName?.includes(query) || c.personality?.includes(query)
    )

    return (
        <div className={classes.page}>

            <Outlet />

            {/* ── 페이지 헤더 ── */}
            <div className={classes.pageHeader}>
                <button className={classes.backBtn} onClick={() => navigate('/mypage')}><BiLeftArrowAlt/></button>
                <span className={classes.pageTitle}>내 캐릭터</span>
                <span className={classes.count}>{character.length}</span>
                <button className={classes.createBtn} onClick={() => navigate('/create')}>
                    <BiPlus />새 캐릭터
                </button>
            </div>

            {/* ── 검색창 ── */}
            <div className={classes.searchWrap}>
                <BiSearch className={classes.searchIcon} />
                <input
                    className={classes.searchInput}
                    type="text"
                    placeholder="캐릭터 이름, 성격으로 검색"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                    <button className={classes.clearBtn} onClick={() => setQuery('')}>✕</button>
                )}
            </div>

            {/* ── 캐릭터 그리드 ── */}
            {filtered.length === 0 ? (
                <div className={classes.empty}>
                    <span className={classes.emptyIcon}>🔮</span>
                    <span className={classes.emptyText}>
                        {query ? `"${query}" 검색 결과가 없어요` : '아직 만든 캐릭터가 없어요'}
                    </span>
                    {!query && (
                        <button className={classes.emptyBtn} onClick={() => navigate('/create')}>
                            첫 캐릭터 만들기
                        </button>
                    )}
                </div>
            ) : (
                <div className={classes.grid}>
                    {filtered.map((char) => (
                        <Link key={char.id} className={classes.card} to={"/character/" + char.id}>
                            <div className={classes.cardImageWrap}>
                                <Avatar
                                    filePath={char.characterImgUrl}
                                    name={char.characterName}
                                    imgClassName={classes.cardImage}
                                    className={classes.cardImagePlaceholder}
                                />
                            </div>
                            <div className={classes.cardBody}>
                                <span className={classes.cardName}>{char.characterName}</span>
                                {char.summary && (
                                    <span className={classes.cardDesc}>{char.summary}</span>
                                )}
                            </div>
                            <div className={classes.cardActions}>
                                <button className={classes.actionBtn}>수정</button>
                                <button className={`${classes.actionBtn} ${classes.actionBtnDanger}`}>삭제</button>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

        </div>
    )
}

export default MyPageCharacters
