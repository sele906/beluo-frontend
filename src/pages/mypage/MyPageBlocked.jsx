import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiXCircle, BiError, BiLeftArrowAlt } from 'react-icons/bi';
import { blockedApi, setCancelBlocked } from '../../api/chatApi';
import Avatar from '../../components/common/Avatar';
import SearchBar from '../../components/common/SearchBar';

import classes from './MyPageBlocked.module.css';

function MyPageBlocked() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [blocked, setBlocked] = useState();

    useEffect(() => {
        async function fetchBlockedCharactersInfo() {
            try {
                const data = await blockedApi();
                setBlocked(data);
            } catch (error) {
                console.error("캐릭터 정보 불러오기 실패:", error);
            }
        }
        fetchBlockedCharactersInfo();
    }, []);

    if (!blocked) return null;

    const filtered = blocked.filter((b) =>
        b.characterName?.includes(query) || b.summary?.includes(query)
    )

    const handleUnblock = async (id) => {
        try {
            await setCancelBlocked(id);
            setBlocked((prev) => prev.filter((b) => b.id !== id));
        } catch (error) {
            if (error.response?.status !== 401) {
                alert('차단 해제에 실패했어요');
            }
        }
    }

    return (
        <div className={classes.page}>

            {/* ── 페이지 헤더 ── */}
            <div className={classes.pageHeader}>
                <button className={classes.backBtn} onClick={() => navigate('/mypage')}><BiLeftArrowAlt/></button>
                <span className={classes.pageTitle}>차단한 캐릭터</span>
                <span className={classes.count}>{blocked.length}</span>
            </div>

            {/* ── 안내 배너 ── */}
            <div className={classes.banner}>
                <BiError /> 차단한 캐릭터는 채팅 · 관심 · 검색 목록에서 숨겨집니다
            </div>

            {/* ── 검색창 ── */}
            <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="캐릭터 이름으로 검색"
            />

            {/* ── 차단 목록 (리스트) ── */}
            {filtered.length === 0 ? (
                <div className={classes.empty}>
                    <BiXCircle className={classes.emptyIcon} />
                    <span className={classes.emptyText}>
                        {query ? `"${query}" 검색 결과가 없어요` : '차단한 캐릭터가 없어요'}
                    </span>
                </div>
            ) : (
                <div className={classes.list}>
                    {filtered.map((char) => (
                        <div key={char.id} className={classes.listItem}>
                            <div className={classes.listImageWrap}>
                                <Avatar
                                    filePath={char.characterImgUrl}
                                    name={char.characterName}
                                    imgClassName={classes.listImage}
                                    className={classes.listImagePlaceholder}
                                />
                            </div>
                            <div className={classes.listInfo}>
                                <span className={classes.listName}>{char.characterName}</span>
                                {char.summary && (
                                    <span className={classes.listDesc}>{char.summary}</span>
                                )}
                            </div>
                            <button
                                className={classes.unblockBtn}
                                onClick={() => handleUnblock(char.id)}
                            >
                                차단 해제
                            </button>
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}

export default MyPageBlocked
