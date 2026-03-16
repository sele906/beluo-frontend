import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BiSearch } from 'react-icons/bi'
import classes from './MyPageBlocked.module.css'

// 임시 더미 데이터 (추후 API 연동)
const initialCharacters = [
    { id: 20, name: '쉐도우', personality: '어둠 속에서 활동하는 암살자' },
    { id: 21, name: '고스트', personality: '존재 자체가 불분명한 수수께끼의 인물' },
]

function MyPageBlocked() {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [blocked, setBlocked] = useState(initialCharacters)

    const filtered = blocked.filter((c) =>
        c.name.includes(query) || c.personality.includes(query)
    )

    const handleUnblock = (id) => {
        setBlocked((prev) => prev.filter((c) => c.id !== id))
    }

    return (
        <div className={classes.page}>

            {/* ── 페이지 헤더 ── */}
            <div className={classes.pageHeader}>
                <button className={classes.backBtn} onClick={() => navigate('/mypage')}>←</button>
                <span className={classes.pageTitle}>차단한 캐릭터</span>
                <span className={classes.count}>{blocked.length}</span>
            </div>

            {/* ── 안내 배너 ── */}
            <div className={classes.banner}>
                ⚠ 차단한 캐릭터는 채팅 목록과 검색에 표시되지 않습니다
            </div>

            {/* ── 검색창 ── */}
            <div className={classes.searchWrap}>
                <BiSearch className={classes.searchIcon} />
                <input
                    className={classes.searchInput}
                    type="text"
                    placeholder="캐릭터 이름으로 검색"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                    <button className={classes.clearBtn} onClick={() => setQuery('')}>✕</button>
                )}
            </div>

            {/* ── 차단 목록 (리스트) ── */}
            {filtered.length === 0 ? (
                <div className={classes.empty}>
                    <span className={classes.emptyIcon}>🚫</span>
                    <span className={classes.emptyText}>
                        {query ? `"${query}" 검색 결과가 없어요` : '차단한 캐릭터가 없어요'}
                    </span>
                </div>
            ) : (
                <div className={classes.list}>
                    {filtered.map((char) => (
                        <div key={char.id} className={classes.listItem}>
                            <div className={classes.listImageWrap}>
                                {char.imageUrl
                                    ? <img src={char.imageUrl} alt={char.name} className={classes.listImage} />
                                    : <div className={classes.listImagePlaceholder}>{char.name.charAt(0)}</div>
                                }
                            </div>
                            <div className={classes.listInfo}>
                                <span className={classes.listName}>{char.name}</span>
                                {char.personality && (
                                    <span className={classes.listDesc}>{char.personality}</span>
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
