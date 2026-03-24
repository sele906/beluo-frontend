import Avatar from "../common/Avatar";
import ReplyControls from "./ReplyControls";
import classes from "./PendingReplySlider.module.css";
import rowClasses from "./MessageItem.module.css";
import { renderWithItalics } from "./MessageItem";

/**
 * 미확정 AI 응답 슬라이더 + 컨트롤 (같은 column 안에 배치)
 */
function PendingReplySlider({
  content, info, replyIdx, slideDir, onTouchStart, onTouchEnd, width,
  replies, isTyping, isRegenerating, onConfirm, onRegenerate, onPrev, onNext,
}) {
  return (
    <div
      className={`${rowClasses.row} ${rowClasses.rowAi}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        key={replyIdx}
        className={`${classes.slideGroup} ${slideDir === "left" ? classes.slideGroupLeft : ""}`}
      >
        <div className={rowClasses.aiAvatar}>
          <Avatar filePath={info.characterImgUrl} name={info.characterName} size={150} />
        </div>

        <div className={classes.sliderColumn} style={replyIdx >= replies.length ? { width: 88 } : width ? { width } : undefined}>
          <div className={classes.repliesSlider}>
            <div className={classes.replySlide}>
              {renderWithItalics(content, classes.italic)}
            </div>
          </div>

          {replies.length > 0 && (
            <ReplyControls
              replies={replies}
              replyIdx={replyIdx}
              isTyping={isTyping}
              isRegenerating={isRegenerating}
              onConfirm={onConfirm}
              onRegenerate={onRegenerate}
              onPrev={onPrev}
              onNext={onNext}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PendingReplySlider;
