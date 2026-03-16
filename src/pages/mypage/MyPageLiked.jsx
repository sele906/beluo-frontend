import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BiSearch } from 'react-icons/bi'
import classes from './MyPageLiked.module.css'

// 임시 더미 데이터 (추후 API 연동)
const initialCharacters = [
    { id: 10, name: '카이', personality: '거친 말투의 용병, 하지만 동료에게는 헌신적' },
    { id: 11, name: '엘레나', personality: '왕국 최고의 치유사, 항상 미소를 잃지 않음' },
    { id: 12, name: '다크로드', personality: '세상을 지배하려는 야망을 가진 마왕' },
    { id: 13, name: '미나', personality: '호기심 많은 탐험가' },
]

function MyPageLiked() {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [liked, setLiked] = useState(initialCharacters)

    const filtered = liked.filter((c) =>
        c.name.includes(query) || c.personality.includes(query)
    )

    const handleUnlike = (id) => {
        setLiked((prev) => prev.filter((c) => c.id !== id))
    }

    return (
        <div className={classes.page}>

            {/* ── 페이지 헤더 ── */}
            <div className={classes.pageHeader}>
                <button className={classes.backBtn} onClick={() => navigate('/mypage')}>←</button>
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
                    <span className={classes.emptyIcon}>♡</span>
                    <span className={classes.emptyText}>
                        {query ? `"${query}" 검색 결과가 없어요` : '좋아요한 캐릭터가 없어요'}
                    </span>
                </div>
            ) : (
                <div className={classes.grid}>
                    {filtered.map((char) => (
                        <div key={char.id} className={classes.card}>
                            <div className={classes.cardImageWrap}>
                                {char.imageUrl
                                    ? <img src={char.imageUrl} alt={char.name} className={classes.cardImage} />
                                    : <div className={classes.cardImagePlaceholder}>{char.name.charAt(0)}</div>
                                }
                            </div>
                            <div className={classes.cardBody}>
                                <span className={classes.cardName}>{char.name}</span>
                                {char.personality && (
                                    <span className={classes.cardDesc}>{char.personality}</span>
                                )}
                            </div>
                            <div className={classes.cardActions}>
                                <button
                                    className={`${classes.actionBtn} ${classes.actionBtnDanger}`}
                                    onClick={() => handleUnlike(char.id)}
                                >
                                    ♥ 좋아요 취소
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}

export default MyPageLiked
