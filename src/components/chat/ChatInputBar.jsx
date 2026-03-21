import { BiRightArrowAlt } from "react-icons/bi";
import classes from "./ChatInputBar.module.css";

/**
 * 하단 입력창 + 전송 버튼
 */
function ChatInputBar({ value, onChange, onSend, disabled }) {
  return (
    <div className={classes.inputBar}>
      <input
        className={classes.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        placeholder="메시지를 입력하세요..."
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      <button
        className={classes.sendBtn}
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="전송"
      >
        <BiRightArrowAlt />
      </button>
    </div>
  );
}

export default ChatInputBar;
