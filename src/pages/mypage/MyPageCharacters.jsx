import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BiSearch } from 'react-icons/bi'
import classes from './MyPageCharacters.module.css'

// 임시 더미 데이터 (추후 API 연동)
const initialCharacters = [
    { id: 1, name: '아리아', personality: '차갑고 냉정하지만 속으로는 따뜻한 마법사' },
    { id: 2, name: '루카스', personality: '밝고 장난기 많은 용사' },
    { id: 3, name: '세라핀', personality: '조용하고 신비로운 음유시인' },
    { id: 4, name: '레나', personality: '호기심 왕성한 연금술사' },
    { id: 5, name: '카엘', personality: '냉철한 판단력을 가진 기사단장' },
]

function MyPageCharacters() {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')

    const filtered = initialCharacters.filter((c) =>
        c.name.includes(query) || c.personality.includes(query)
    )

    return (
        <div className={classes.page}>

            {/* ── 페이지 헤더 ── */}
            <div className={classes.pageHeader}>
                <button className={classes.backBtn} onClick={() => navigate('/mypage')}>←</button>
                <span className={classes.pageTitle}>내 캐릭터</span>
                <span className={classes.count}>{initialCharacters.length}</span>
                <button className={classes.createBtn} onClick={() => navigate('/create')}>+ 새 캐릭터</button>
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
                                <button className={classes.actionBtn}>수정</button>
                                <button className={`${classes.actionBtn} ${classes.actionBtnDanger}`}>삭제</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}

export default MyPageCharacters
