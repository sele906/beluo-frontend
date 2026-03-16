import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BiSearch, BiHeart, BiLeftArrowAlt } from 'react-icons/bi';
import { likedApi, setCancelLiked } from '../../api/chatApi';
import Avatar from '../../components/common/Avatar';

import classes from './MyPageLiked.module.css';

function MyPageLiked() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [liked, setLiked] = useState();

    useEffect(() => {
        async function fetchLikedCharactersInfo() {
            try {
                const data = await likedApi();
                setLiked(data);
            } catch (error) {
                console.error("캐릭터 정보 불러오기 실패:", error);
            }
        }
        fetchLikedCharactersInfo();
    }, []);

    if (!liked) return null;

    const filtered = liked.filter((l) =>
        l.characterName?.includes(query) || l.personality?.includes(query)
    )

    const handleUnlike = async (id) => {
        try {
            await setCancelLiked(id);
            setLiked((prev) => prev.filter((l) => l.id !== id));
        } catch (error) {
            if (error.response?.status !== 401) {
                alert('좋아요 취소에 실패했어요');
            }
        }
    }

    return (
        <div className={classes.page}>

            {/* ── 페이지 헤더 ── */}
            <div className={classes.pageHeader}>
                <button className={classes.backBtn} onClick={() => navigate('/mypage')}><BiLeftArrowAlt/></button>
                <span className={classes.pageTitle}>관심 캐릭터</span>
                <span className={classes.count}>{liked.length}</span>
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
                    <BiHeart className={classes.emptyIcon} />
                    <span className={classes.emptyText}>
                        {query ? `"${query}" 검색 결과가 없어요` : '좋아요한 캐릭터가 없어요'}
                    </span>
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
                                {char.personality && (
                                    <span className={classes.cardDesc}>{char.personality}</span>
                                )}
                            </div>
                            <div className={classes.cardActions}>
                                <button
                                    className={`${classes.actionBtn} ${classes.actionBtnDanger}`}
                                    onClick={(e) => { e.preventDefault(); handleUnlike(char.id); }}
                                >
                                    <BiHeart /> 좋아요 취소
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

        </div>
    )
}

export default MyPageLiked
