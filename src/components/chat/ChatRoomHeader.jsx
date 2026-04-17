import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../common/Avatar";
import ChatNameEditModal from "../common/ChatNameEditModal";
import ConfirmDeleteModal from "../common/ConfirmDeleteModal";
import { BiChevronLeft, BiDotsVerticalRounded } from "react-icons/bi";
import { deleteConversation } from "../../api/chatApi";
import { toast } from "sonner";
import classes from "../../pages/chat/ChatRoom.module.css";

// 상단 타이틀 바 + 케밥 메뉴 + 이름 변경 / 삭제 모달
// kebabOpen, activeModal 상태를 자체적으로 관리하므로 ChatRoom과 완전히 분리됨
function ChatRoomHeader({ info, sessionId, onNameUpdate }) {
    const navigate = useNavigate();
    const [kebabOpen, setKebabOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null); // 'rename' | 'delete'
    const kebabRef = useRef(null);

    // 케밥 메뉴 외부 클릭 시 닫기
    useEffect(() => {
        if (!kebabOpen) return;
        const handleClickOutside = (e) => {
            if (kebabRef.current && !kebabRef.current.contains(e.target)) setKebabOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [kebabOpen]);

    const handleDelete = async () => {
        try {
            await deleteConversation(sessionId);
            navigate("/chatlist");
        } catch (err) {
            toast.error(err.response?.data || "삭제에 실패했어요. 다시 시도해주세요.");
        }
    };

    return (
        <>
            {activeModal === "rename" && (
                <ChatNameEditModal
                    sessionId={sessionId}
                    conversationName={info.conversationName}
                    onNameUpdate={onNameUpdate}
                    onClose={() => setActiveModal(null)}
                />
            )}
            {activeModal === "delete" && (
                <ConfirmDeleteModal
                    onConfirm={handleDelete}
                    onClose={() => setActiveModal(null)}
                />
            )}

            <div className={classes.topBar}>
                <button className={classes.backBtn} onClick={() => navigate("/chatlist")}>
                    <BiChevronLeft />
                </button>
                <div className={classes.topAvatar}>
                    <Avatar filePath={info.characterImgUrl} name={info.characterName} size={150} />
                </div>
                <span className={classes.topName}>{info.conversationName}</span>
                <div className={classes.kebabWrapper} ref={kebabRef}>
                    <button className={classes.kebabBtn} onClick={() => setKebabOpen(o => !o)}>
                        <BiDotsVerticalRounded />
                    </button>
                    {kebabOpen && (
                        <div className={classes.dropdown}>
                            <button
                                className={classes.dropdownItem}
                                onClick={() => { setKebabOpen(false); setActiveModal("rename"); }}
                            >
                                이름 변경
                            </button>
                            <button
                                className={`${classes.dropdownItem} ${classes.dropdownItemDanger}`}
                                onClick={() => { setKebabOpen(false); setActiveModal("delete"); }}
                            >
                                채팅방 삭제
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default ChatRoomHeader;
