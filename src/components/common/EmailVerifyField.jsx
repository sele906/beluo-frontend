import { BiCheckCircle } from 'react-icons/bi';
import classes from './EmailVerifyField.module.css';

const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

function EmailVerifyField({
    value,
    onChange,
    onBlur,
    verifyStep,       // 'none' | 'sent' | 'verified'
    sendLabel,
    onSend,
    code,
    onCodeChange,
    onConfirm,
    timeLeft,
    error,
    placeholder = '이메일을 입력하세요',
    autoFocus = false,
    showActions = true,
}) {
    return (
        <div className={classes.wrap}>
            <div className={classes.row}>
                <input
                    className={`${classes.input} ${error ? classes.inputError : ''}`}
                    type="email"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur ? (e) => onBlur(e.target.value) : undefined}
                    placeholder={placeholder}
                    disabled={showActions && verifyStep === 'verified'}
                    autoComplete="email"
                    autoFocus={autoFocus}
                />
                {showActions && (verifyStep !== 'verified' ? (
                    <button
                        type="button"
                        className={classes.verifyBtn}
                        onClick={onSend}
                        disabled={!value.trim()}
                    >
                        {sendLabel}
                    </button>
                ) : (
                    <div className={classes.verifiedBadge}>
                        <BiCheckCircle size={15} />
                        인증 완료
                    </div>
                ))}
            </div>

            {showActions && verifyStep === 'sent' && (
                <div className={classes.row}>
                    <div className={classes.codeWrap}>
                        <input
                            className={classes.input}
                            value={code}
                            onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, ''))}
                            placeholder="인증번호 6자리"
                            maxLength={6}
                            inputMode="numeric"
                        />
                        {timeLeft > 0 && (
                            <span className={classes.timer}>{formatTime(timeLeft)}</span>
                        )}
                    </div>
                    <button
                        type="button"
                        className={classes.verifyBtn}
                        onClick={onConfirm}
                        disabled={code.length < 6}
                    >
                        확인
                    </button>
                </div>
            )}

            {error && <span className={classes.errorMsg}>{error}</span>}
        </div>
    );
}

export default EmailVerifyField;
