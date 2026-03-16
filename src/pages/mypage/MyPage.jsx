import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { userInfoApi } from '../../api/chatApi';
import Avatar from '../../components/common/Avatar';
import classes from './MyPage.module.css';

const myCharacters = [
    { id: 1, name: '아리아', personality: '차갑고 냉정하지만 속으로는 따뜻한 마법사' },
    { id: 2, name: '루카스', personality: '밝고 장난기 많은 용사' },
    { id: 3, name: '세라핀', personality: '조용하고 신비로운 음유시인', imageUrl: null },
]

const likedCharacters = [
    { id: 10, name: '카이', personality: '거친 말투의 용병, 하지만 동료에게는 헌신적' },
    { id: 11, name: '엘레나', personality: '왕국 최고의 치유사, 항상 미소를 잃지 않음' },
    { id: 12, name: '다크로드', personality: '세상을 지배하려는 야망을 가진 마왕' },
    { id: 13, name: '미나', personality: '호기심 많은 탐험가' },
]

const blockedCharacters = [
    { id: 20, name: '???', personality: '' },
]

function MyPage() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function fetchUserInfo() {
            try {
                const data = await userInfoApi();
                console.log(data);
                setUser(data);
            } catch (error) {
                console.error("유저 정보 불러오기 실패:", error);
            }
        }
        fetchUserInfo();
    }, []);

    if (!user) return null

    const initial = user.name?.charAt(0) ?? '?'

    return (
        <div className={classes.page}>

            {/* ── 프로필 + 통계 묶음 ── */}
            <div className={classes.profileBlock}>
            <div className={classes.profileCard}>
                <div className={classes.avatar}>
                    <Avatar
                        filePath={user.userImgUrl}
                        name={user.name}
                        imgClassName={classes.avatarImg}
                        size={128}
                    />
                </div>
                <div className={classes.profileInfo}>
                    <span className={classes.name}>{user.name}</span>
                    <span className={classes.email}>{user.email}</span>
                </div>
                <button className={classes.editBtn} onClick={() => navigate('/mypage/profile')}>
                    회원정보 수정
                </button>
            </div>

            {/* ── 통계 카드 3개 ── */}
            <div className={classes.statRow}>
                <button className={classes.statCard} onClick={() => navigate('/mypage/characters')}>
                    <span className={classes.statNum}>{myCharacters.length}</span>
                    <span className={classes.statLabel}>내 캐릭터</span>
                </button>
                <button className={classes.statCard} onClick={() => navigate('/mypage/liked')}>
                    <span className={classes.statNum}>{likedCharacters.length}</span>
                    <span className={classes.statLabel}>관심 캐릭터</span>
                </button>
                <button className={`${classes.statCard} ${classes.statCardDanger}`} onClick={() => navigate('/mypage/blocked')}>
                    <span className={classes.statNum}>{blockedCharacters.length}</span>
                    <span className={classes.statLabel}>차단한 캐릭터</span>
                </button>
            </div>
            </div>

            {/* ── 내 캐릭터 미리보기 ── */}
            <PreviewSection
                title="내 캐릭터"
                items={myCharacters}
                emptyMsg="아직 만든 캐릭터가 없어요"
                onMore={() => navigate('/mypage/characters')}
            />

            {/* ── 관심 캐릭터 미리보기 ── */}
            <PreviewSection
                title="관심 캐릭터"
                items={likedCharacters}
                emptyMsg="좋아요한 캐릭터가 없어요"
                onMore={() => navigate('/mypage/liked')}
            />

        </div>
    )
}

function PreviewSection({ title, items, emptyMsg, onMore }) {
    return (
        <div className={classes.section}>
            <div className={classes.sectionHeader}>
                <span className={classes.sectionTitle}>{title}</span>
                <button className={classes.moreBtn} onClick={onMore}>전체보기 →</button>
            </div>
            {items.length === 0 ? (
                <p className={classes.empty}>{emptyMsg}</p>
            ) : (
                <div className={classes.cardGrid}>
                    {items.map((item) => (
                        <div key={item.id} className={classes.charCard}>
                            <div className={classes.charImageWrap}>
                                {item.imageUrl
                                    ? <img src={item.imageUrl} alt={item.name} className={classes.charImage} />
                                    : <div className={classes.charImagePlaceholder}>{item.name?.charAt(0)}</div>
                                }
                            </div>
                            <div className={classes.charBody}>
                                <span className={classes.charName}>{item.name}</span>
                                {item.personality && (
                                    <span className={classes.charDesc}>{item.personality}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyPage
