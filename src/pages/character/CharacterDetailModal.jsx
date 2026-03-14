import { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { getCharacterDetail, createConversation, setAddLiked, setCancelLiked } from "../../api/chatApi";
import { BiHeart, BiSolidHeart } from "react-icons/bi";
import { useAuth } from "../../hook/AuthContext";
import Avatar from '../../components/common/Avatar';

import classes from "./CharacterDetailModal.module.css";

function CharacterDetailModal() {
    const { isLoggedIn, logout } = useAuth();
    const detail = useLoaderData();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [liked, setLiked] = useState(detail.liked ?? false);
    const [likeCount, setLikeCount] = useState(detail.character.likeCount ?? 0);

    const handleLike = async () => {
        if (!isLoggedIn) {
            alert('로그인이 필요한 서비스입니다.');
            return;
        }
        try {
            if (liked) {
                await setCancelLiked(detail.character.id);
            } else {
                await setAddLiked(detail.character.id);
            }
            setLiked(prev => !prev);
            setLikeCount(prev => liked ? prev - 1 : prev + 1);
        } catch (error) {
            if (error.response?.status !== 401) {
                alert('좋아요 처리에 실패했어요');
            }
        }
    };

    const handleBackdropClick = () => navigate(-1);
    const handleModalClick = (e) => e.stopPropagation();

    const handleStartChat = async () => {
        if (!isLoggedIn) {
            alert('로그인이 필요한 서비스입니다.');
            return;
        }
        setIsLoading(true);
        try {
            const sessionId = await createConversation(detail.character.id);
            navigate(`/chat?sessionId=${sessionId}`);
        } catch (error) {
            console.error("대화 생성 실패:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={classes.backdrop} onClick={handleBackdropClick}>
            <div className={classes.modal} onClick={handleModalClick}>

                {/* 아바타 */}
                <div className={classes.avatar}>
                    <Avatar
                        filePath={detail.character.characterImgUrl}
                        name={detail.character.characterName}
                        className={classes.avatarImg}
                    />
                </div>

                {/* 이름 */}
                <div className={classes.nameInfo}>
                    <h2 className={classes.name}>{detail.character.characterName}</h2>
                    <p className={classes.userId}>@ {detail.character.userId}</p>
                </div>
                
                {/* 성격 */}
                <p className={classes.summary}>{detail.character.summary}</p>

                {/* 좋아요 */}
                <button
                    className={`${classes.like} ${liked ? classes.liked : ''}`}
                    onClick={handleLike}
                >
                    {liked ? <BiSolidHeart /> : <BiHeart />}
                    <span>{likeCount}</span>
                </button>

                {/* 태그 */}
                <div className={classes.tags}>
                    {detail.character.tag?.map((t) => (
                        <span key={t} className={classes.tag}>{t}</span>
                    ))}
                </div>

                {/* 첫 메시지 미리보기 */}
                <div className={classes.firstMessage}>
                    <span className={classes.firstMessageLabel}>첫 인사</span>
                    <p>{detail.character.firstMessage}</p>
                </div>

                {/* 대화하기 버튼 */}
                <button
                    className={classes.chatBtn}
                    onClick={handleStartChat}
                    disabled={isLoading}
                >
                    {isLoading ? "생성 중..." : "대화 시작하기"}
                </button>

            </div>
        </div>
    );
}

export default CharacterDetailModal;

export async function loader({params}) {
    return await getCharacterDetail(params.id);
}
