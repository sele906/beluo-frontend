import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { mypageOverviewApi } from '../../api/chatApi';
import Avatar from '../../components/common/Avatar';
import { BiChevronRight, BiRightArrowAlt } from 'react-icons/bi';
import classes from './MyPage.module.css';

function MyPage() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null);
    const [myCharacters, setMyCharacters] = useState(null);
    const [likedCharacters, setLikedCharacters] = useState(null);

    useEffect(() => {
        async function fetchUserInfo() {
            try {
                const data = await mypageOverviewApi();
                setUser(data.info);
                setMyCharacters(data.created);
                setLikedCharacters(data.liked);
            } catch (error) {
                console.error("유저 정보 불러오기 실패:", error);
            }
        }
        fetchUserInfo();
    }, []);

    if (!user) return <Outlet />

    return (
        <div className={classes.page}>

            <Outlet />

            {/* ── 프로필 카드 ── */}
            <div className={classes.profileCard}>
                <div className={classes.avatar}>
                    <Avatar
                        filePath={user.userImgUrl}
                        name={user.name}
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

            {/* ── 설정 목록 ── */}
            <div className={classes.menuList}>
                <button className={classes.menuItem} onClick={() => navigate('/mypage/blocked')}>
                    <span>차단한 캐릭터</span>
                    <BiChevronRight className={classes.menuChevron} />
                </button>
                <button className={classes.menuItem} onClick={() => navigate('/mypage/inquiry')}>
                    <span>문의사항</span>
                    <BiChevronRight className={classes.menuChevron} />
                </button>
            </div>

        </div>
    )
}

function PreviewSection({ title, items, emptyMsg, onMore }) {
    return (
        <div className={classes.section}>
            <div className={classes.sectionHeader}>
                <span className={classes.sectionTitle}>{title}</span>
                <button className={classes.moreBtn} onClick={onMore}>전체보기 <BiRightArrowAlt/></button>
            </div>
            {(items ?? []).length === 0 ? (
                <p className={classes.empty}>{emptyMsg}</p>
            ) : (
                <div className={classes.cardGrid}>
                    {(items ?? []).map((item) => (
                        <Link key={item.id} className={classes.charCard} to={`character/${item.id}`}>
                            <div className={classes.charImageWrap}>
                                {item.characterImgUrl
                                    ? <img src={item.characterImgUrl} alt={item.characterName} className={classes.charImage} />
                                    : <div className={classes.charImagePlaceholder}>{item.characterName?.charAt(0)}</div>
                                }
                            </div>
                            <div className={classes.charBody}>
                                <span className={classes.charName}>{item.characterName}</span>
                                {item.summary && (
                                    <span className={classes.charDesc}>{item.summary}</span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyPage;
