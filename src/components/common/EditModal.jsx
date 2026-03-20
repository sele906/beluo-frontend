import { useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { updateConversationName } from '../../api/chatApi';
import { toast } from 'sonner';

import classes from './EditModal.module.css';

function EditModal() {
    const { id: sessionId } = useParams();
    const navigate = useNavigate();
    const { conversationName, onNameUpdate } = useOutletContext();

    const [name, setName] = useState(conversationName ?? '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setIsSubmitting(true);
        try {
            await updateConversationName(sessionId, name.trim());
            onNameUpdate(name.trim());
            navigate(-1);
        } catch (err) {
            console.error('이름 변경 실패:', err);
            toast.error('이름 변경에 실패했어요. 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={classes.backdrop} onClick={() => navigate(-1)}>
            <div className={classes.modal} onClick={(e) => e.stopPropagation()}>
                <h3 className={classes.title}>채팅방 이름 변경</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        className={classes.input}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="채팅방 이름을 입력하세요"
                        autoFocus
                    />
                    <div className={classes.buttons}>
                        <button type="button" className={classes.cancelBtn} onClick={() => navigate(-1)}>
                            취소
                        </button>
                        <button type="submit" className={classes.submitBtn} disabled={isSubmitting || !name.trim()}>
                            {isSubmitting ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditModal;
