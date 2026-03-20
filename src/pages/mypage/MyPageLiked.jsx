import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { BiHeart, BiLeftArrowAlt } from 'react-icons/bi';
import { getLikedCharacters, cancelLike } from '../../api/chatApi';
import { toast } from 'sonner';
import CharacterCard from '../../components/common/CharacterCard';
import SearchBar from '../../components/common/SearchBar';

import classes from './MyPageLiked.module.css';

function MyPageLiked() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [liked, setLiked] = useState();

    useEffect(() => {
        async function fetchLikedCharactersInfo() {
            try {
                const data = await getLikedCharacters();
                setLiked(data);
            } catch (error) {
                console.error("캐릭터 정보 불러오기 실패:", error);
            }
        }
        fetchLikedCharactersInfo();
    }, []);

    if (!liked) return null;

    const filtered = liked.filter((l) =>
        l.characterName?.includes(query) || l.summary?.includes(query)
    )

    const handleUnlike = async (id) => {
        try {
            await cancelLike(id);
            setLiked((prev) => prev.filter((l) => l.id !== id));
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error('좋아요 취소에 실패했어요');
            }
        }
    }

    return (
        <div className={classes.page}>

            <Outlet />

            {/* ── 페이지 헤더 ── */}
            <div className={classes.pageHeader}>
                <button className={classes.backBtn} onClick={() => navigate('/mypage')}><BiLeftArrowAlt/></button>
                <span className={classes.pageTitle}>관심 캐릭터</span>
                <span className={classes.count}>{liked.length}</span>
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
                    <BiHeart className={classes.emptyIcon} />
                    <span className={classes.emptyText}>
                        {query ? `"${query}" 검색 결과가 없어요` : '좋아요한 캐릭터가 없어요'}
                    </span>
                </div>
            ) : (
                <div className={classes.grid}>
                    {filtered.map((char) => (
                        <CharacterCard
                            key={char.id}
                            character={char}
                            actions={
                                <button
                                    className={`${classes.actionBtn} ${classes.actionBtnDanger}`}
                                    onClick={() => handleUnlike(char.id)}
                                >
                                    <BiHeart /> 좋아요 취소
                                </button>
                            }
                        />
                    ))}
                </div>
            )}

        </div>
    )
}

export default MyPageLiked
