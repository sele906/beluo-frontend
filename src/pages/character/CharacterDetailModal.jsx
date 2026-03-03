import { useLoaderData, useNavigate } from 'react-router-dom';
import { getCharacterDetail } from "../../api/chatApi";
import classes from "./CharacterDetailModal.module.css";

function CharacterDetailModal() {
    const detail = useLoaderData();
    const navigate = useNavigate();

    const handleBackdropClick = () => navigate(-1);
    const handleModalClick = (e) => e.stopPropagation();

    return (
        <div className={classes.backdrop} onClick={handleBackdropClick}>
            <div className={classes.modal} onClick={handleModalClick}>

                {/* 아바타 */}
                <div className={classes.avatar}>
                    {detail.characterName?.charAt(0).toUpperCase()}
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
                    onClick={() => navigate(`/chat?sessionId=NEW&chatName=${detail.characterName}&characterId=${detail.id}`)}
                >
                    대화 시작하기
                </button>

            </div>
        </div>
    );
}

export default CharacterDetailModal;

export async function loader({params}) {
    return await getCharacterDetail(params.id);
}
