import classes from './ConfirmDeleteModal.module.css';

function ConfirmDeleteModal({ onConfirm, onClose }) {
    return (
        <div className={classes.backdrop} onClick={onClose}>
            <div className={classes.modal} onClick={(e) => e.stopPropagation()}>
                <h3 className={classes.title}>채팅방 삭제</h3>
                <p className={classes.desc}>
                    채팅방을 삭제하면 모든 대화 내용이 사라져요.<br />
                    정말 삭제하시겠어요?
                </p>
                <div className={classes.buttons}>
                    <button type="button" className={classes.cancelBtn} onClick={onClose}>
                        취소
                    </button>
                    <button type="button" className={classes.deleteBtn} onClick={onConfirm}>
                        삭제
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDeleteModal;
