import { BiChevronLeft, BiChevronRight, BiRefresh, BiCheck } from "react-icons/bi";
import classes from "./ReplyControls.module.css";

/**
 * AI 응답 슬라이더 컨트롤
 * - 1개일 때: reload 아이콘
 * - 2개 이상 or 재생성 중: ◀ N/M ▶ (▶는 마지막에서 regenerate)
 * - 확정(BiCheck): 타이핑/재생성 완료 후 오른쪽 끝에 표시
 */
function ReplyControls({ replies, replyIdx, isTyping, isRegenerating, onConfirm, onRegenerate, onPrev, onNext }) {
  const total = replies.length + (isRegenerating ? 1 : 0);
  const showNav = replies.length > 1 || isRegenerating;
  const isAtLast = replyIdx >= total - 1;
  const busy = isTyping || isRegenerating;

  return (
    <div className={classes.replyControls}>

      {showNav ? (
        <>
          <button className={classes.replyNavBtn} onClick={onPrev} disabled={replyIdx === 0 || busy}>
            <BiChevronLeft />
          </button>
          <span className={classes.replyNavText}>{replyIdx + 1} / {total}</span>
          <button
            className={classes.replyNavBtn}
            onClick={isAtLast ? onRegenerate : onNext}
            disabled={busy}
          >
            <BiChevronRight />
          </button>
        </>
      ) : (
        <button className={classes.regenBtn} onClick={onRegenerate} disabled={busy}>
          <BiRefresh />
        </button>
      )}

      {!busy && (
        <button className={classes.confirmBtn} onClick={onConfirm}>
          <BiCheck />
        </button>
      )}

    </div>
  );
}

export default ReplyControls;
