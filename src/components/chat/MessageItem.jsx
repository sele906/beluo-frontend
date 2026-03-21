import Avatar from "../common/Avatar";
import { BiPencil } from "react-icons/bi";
import classes from "./MessageItem.module.css";

/**
 * 확정된 메시지 한 행 (말풍선 + 편집 UI)
 *
 * canEdit  : 편집 버튼 표시 여부
 * isEditing: 현재 이 메시지가 편집 중인지
 */
function MessageItem({ message: m, info, canEdit, isEditing, editValue, onEditChange, onEditSave, onEditCancel, onEditStart, bubbleRef }) {
  const isUser = m.role === "user";

  return (
    <div className={`${classes.row} ${isUser ? classes.rowUser : classes.rowAi}`}>

      {/* 아바타 */}
      <div className={isUser ? classes.userAvatar : classes.aiAvatar}>
        <Avatar
          filePath={isUser ? info.userImgUrl : info.characterImgUrl}
          name={isUser ? info.userName : info.characterName}
          size={isUser ? 72 : 150}
        />
      </div>

      {/* 편집 중 → textarea / 아닐 때 → 말풍선 */}
      {isEditing ? (
        <div className={classes.editArea}>
          <textarea
            className={classes.editInput}
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onEditSave(); }
              if (e.key === "Escape") onEditCancel();
            }}
            autoFocus
          />
          <div className={classes.editActions}>
            <button className={classes.editSaveBtn} onClick={onEditSave}>저장</button>
            <button className={classes.editCancelBtn} onClick={onEditCancel}>취소</button>
          </div>
        </div>
      ) : (
        <div className={classes.msgWrapper}>
          {/* 유저: 버튼이 말풍선 왼쪽 / AI: 버튼이 말풍선 오른쪽 */}
          {isUser && canEdit && <button className={classes.editBtn} onClick={onEditStart}><BiPencil /></button>}
          <div ref={bubbleRef} className={`${classes.bubble} ${isUser ? classes.bubbleUser : classes.bubbleAi}`}>
            {m.content}
          </div>
          {!isUser && canEdit && <button className={classes.editBtn} onClick={onEditStart}><BiPencil /></button>}
        </div>
      )}
    </div>
  );
}

export default MessageItem;
