import { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { getCharacterDetail, createConversation } from "../../api/chatApi";
import Avatar from '../../components/common/Avatar';

import classes from "./CharacterDetailModal.module.css";

function CharacterDetailModal() {
    const detail = useLoaderData();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleBackdropClick = () => navigate(-1);
    const handleModalClick = (e) => e.stopPropagation();

    const handleStartChat = async () => {
        setIsLoading(true);
        try {
            const sessionId = await createConversation(detail.id);
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
                        filePath={detail.characterFilePath}
                        name={detail.characterName}
                        className={classes.avatarImg}
                    />
                </div>

                {/* 이름 */}
                <h2 className={classes.name}>{detail.characterName}</h2>

                {/* 성격 */}
                <p className={classes.personality}>{detail.personality}</p>

                {/* 태그 */}
                <div className={classes.tags}>
                    {detail.tag?.map((t) => (
                        <span key={t} className={classes.tag}>{t}</span>
                    ))}
                </div>

                {/* 첫 메시지 미리보기 */}
                <div className={classes.firstMessage}>
                    <span className={classes.firstMessageLabel}>첫 인사</span>
                    <p>{detail.firstMessage}</p>
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
