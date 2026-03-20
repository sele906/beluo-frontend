import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { BiPlus, BiLeftArrowAlt, BiPen } from 'react-icons/bi';
import { getMyCharacters, deleteCharacter } from '../../api/chatApi';
import CharacterCard from '../../components/common/CharacterCard';
import SearchBar from '../../components/common/SearchBar';

import classes from './MyPageCharacters.module.css';

function MyPageCharacters() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [character, setCharacters] = useState();

    useEffect(() => {
        async function fetchCharactersInfo() {
            try {
                const data = await getMyCharacters();
                setCharacters(data);
            } catch (error) {
                console.error("캐릭터 정보 불러오기 실패:", error);
            }
        }
        fetchCharactersInfo();
    }, []);

    if (!character) return null;

    const filtered = character.filter((c) =>
        c.characterName?.includes(query) || c.summary?.includes(query)
    )

    async function handleDelete(id) {
    if (!window.confirm("캐릭터를 삭제하시겠습니까?")) return;

    try {
        await deleteCharacter(id);

            // UI에서 바로 제거 (핵심)
            setCharacters((prev) => prev.filter((c) => c.id !== id));

        } catch (error) {
            console.error("삭제 실패:", error);
        }
    }

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
            <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="캐릭터 이름, 성격으로 검색"
            />

            {/* ── 캐릭터 그리드 ── */}
            {filtered.length === 0 ? (
                <div className={classes.empty}>
                    <BiPen className={classes.emptyIcon} />
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
                        <CharacterCard
                            key={char.id}
                            character={char}
                            actions={
                                <>
                                    <button
                                        className={classes.actionBtn}
                                        onClick={() => navigate(`/mypage/character/${char.id}/edit`)}
                                    >수정</button>
                                    <button
                                        className={`${classes.actionBtn} ${classes.actionBtnDanger}`}
                                        onClick={() => handleDelete(char.id)}
                                    >삭제</button>
                                </>
                            }
                        />
                    ))}
                </div>
            )}

        </div>
    )
}

export default MyPageCharacters
