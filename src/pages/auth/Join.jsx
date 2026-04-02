import { useRef, useState, useEffect } from "react";
import { BiX, BiUpload } from "react-icons/bi";
import { join as joinApi, sendVerifyEmailApi, checkVerifyCodeApi } from "../../api/chatApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import AvatarUpload from "../../components/common/AvatarUpload";
import BirthdaySelect from "../../components/common/BirthdaySelect";
import EmailVerifyField from "../../components/common/EmailVerifyField";
import classes from "./Join.module.css";

// ── 생년월일 유틸 ──────────────────────────────────────────
const toBirth = (year, month, day) =>
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

// ── 검증 규칙 ──────────────────────────────────────────────
const RULES = {
    name: (v) => {
        if (!v.trim()) return "닉네임을 입력해주세요.";
        if (v.trim().length < 2) return "2자 이상 입력해주세요.";
        if (v.trim().length > 10) return "10자 이하로 입력해주세요.";
        return "";
    },
    email: (v) => {
        if (!v.trim()) return "이메일을 입력해주세요.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "올바른 이메일 형식이 아닙니다.";
        return "";
    },
    password: (v) => {
        if (!v) return "비밀번호를 입력해주세요.";
        if (v.length < 8) return "8자 이상 입력해주세요.";
        if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(v)) return "영문과 숫자를 모두 포함해주세요.";
        return "";
    },
};

function Join() {
    const navigate = useNavigate();
    const timerRef = useRef(null);

    const [preview, setPreview] = useState(null);
    const [fileObj, setFileObj] = useState(null);

    // 폼 필드 state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [birthYear, setBirthYear] = useState(null);
    const [birthMonth, setBirthMonth] = useState(null);
    const [birthDay, setBirthDay] = useState(null);

    // 이메일 인증
    const [verifyStep, setVerifyStep] = useState("none"); // none | sent | verified
    const [verifyCode, setVerifyCode] = useState("");
    const [timeLeft, setTimeLeft] = useState(0);

    // 에러
    const [errors, setErrors] = useState({});

    useEffect(() => () => clearInterval(timerRef.current), []);

    // ── 에러 단일 세팅 ──
    const setFieldError = (field, msg) =>
        setErrors(prev => msg ? { ...prev, [field]: msg } : (({ [field]: _, ...rest }) => rest)(prev));

    // ── blur 시 검증 ──
    const handleBlur = (field, value) => setFieldError(field, RULES[field]?.(value) ?? "");

    // ── onChange + 에러 즉시 재검증 ──
    const handleChange = (field, value, setter) => {
        setter(value);
        if (errors[field]) setFieldError(field, RULES[field]?.(value) ?? "");
    };

    // ── 타이머 ──
    const startTimer = () => {
        setTimeLeft(300);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(timerRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendVerify = async () => {
        const err = RULES.email(email);
        if (err) { setFieldError("email", err); return; }
        try {
            await sendVerifyEmailApi(email);
            setVerifyStep("sent");
            setVerifyCode("");
            startTimer();
            setFieldError("email", "");
            toast.success("인증번호가 발송되었습니다.");
        } catch (e) {
            toast.error(e.response?.data || "인증번호 발송에 실패했습니다.");
        }
    };

    const handleCheckVerify = async () => {
        if (verifyCode.length < 6) return;
        try {
            await checkVerifyCodeApi(email, verifyCode);
            clearInterval(timerRef.current);
            setVerifyStep("verified");
            setFieldError("email", "");
            toast.success("이메일 인증이 완료되었습니다.");
        } catch (e) {
            toast.error(e.response?.data || "인증번호가 올바르지 않습니다.");
        }
    };

    const handleFileChange = (file) => {
        setFileObj(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    // ── 전체 검증 후 제출 ──
    const handleSubmit = async (e) => {
        e.preventDefault();

        const nameErr = RULES.name(name);
        const emailErr = !email.trim() ? "이메일을 입력해주세요."
            : RULES.email(email) || (verifyStep !== "verified" ? "이메일 인증을 완료해주세요." : "");
        const passwordErr = RULES.password(password);
        const birthdayErr = (!birthYear || !birthMonth || !birthDay)
            ? "생년월일을 모두 선택해주세요." : "";

        const newErrors = {};
        if (nameErr) newErrors.name = nameErr;
        if (birthdayErr) newErrors.birthday = birthdayErr;
        if (emailErr) newErrors.email = emailErr;
        if (passwordErr) newErrors.password = passwordErr;

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            const birth = birthYear && birthMonth && birthDay
                ? toBirth(birthYear.value, birthMonth.value, birthDay.value)
                : undefined;
            await joinApi({ email, password, name, ...(birth && { birth }) }, fileObj);
            toast.success("회원가입이 완료되었습니다.");
            navigate("/login");
        } catch (e) {
            toast.error(e.response?.data || "회원가입에 실패했습니다.");
        }
    };

    return (
        <div className={classes.container}>
            <div className={classes.card}>
                <button className={classes.backBtn} onClick={() => navigate(-1)}><BiX /></button>
                <h1 className={classes.title}>회원가입</h1>
                <p className={classes.subtitle}>계정을 만들어 서비스를 시작하세요</p>

                {/* 프로필 이미지 */}
                <p className={classes.profileLabel}>프로필 설정</p>
                <div className={classes.avatarWrap}>
                    <AvatarUpload
                        preview={preview}
                        onChange={handleFileChange}
                        fallback={
                            <div className={classes.avatarPlaceholder}>
                                <BiUpload size={22} />
                            </div>
                        }
                        overlayContent={<span>추가</span>}
                        size={80}
                    />
                </div>

                <form className={classes.form} onSubmit={handleSubmit} noValidate>

                    {/* 닉네임 */}
                    <div className={classes.field}>
                        <label className={classes.label}>닉네임</label>
                        <span className={classes.fieldHint}>캐릭터가 나를 부를 이름이에요</span>
                        <input
                            className={`${classes.input} ${errors.name ? classes.inputError : ""}`}
                            value={name}
                            onChange={(e) => handleChange("name", e.target.value, setName)}
                            onBlur={(e) => handleBlur("name", e.target.value)}
                            placeholder="닉네임을 입력하세요"
                            maxLength={10}
                        />
                        {errors.name && <span className={classes.errorMsg}>{errors.name}</span>}
                    </div>

                    {/* 생년월일 */}
                    <div className={classes.field}>
                        <label className={classes.label}>생년월일</label>
                        <BirthdaySelect
                            year={birthYear}
                            month={birthMonth}
                            day={birthDay}
                            onYearChange={(opt) => { setBirthYear(opt); setFieldError("birthday", ""); }}
                            onMonthChange={(opt) => { setBirthMonth(opt); setFieldError("birthday", ""); }}
                            onDayChange={(opt) => { setBirthDay(opt); setFieldError("birthday", ""); }}
                            isError={!!errors.birthday}
                        />
                        {errors.birthday && <span className={classes.errorMsg}>{errors.birthday}</span>}
                    </div>

                    {/* 이메일 */}
                    <div className={classes.field}>
                        <label className={classes.label}>이메일</label>
                        <EmailVerifyField
                            value={email}
                            onChange={(v) => { handleChange("email", v, setEmail); setVerifyStep("none"); }}
                            onBlur={(v) => handleBlur("email", v)}
                            verifyStep={verifyStep}
                            sendLabel={verifyStep === "sent" ? "재발송" : "인증번호 받기"}
                            onSend={handleSendVerify}
                            code={verifyCode}
                            onCodeChange={setVerifyCode}
                            onConfirm={handleCheckVerify}
                            timeLeft={timeLeft}
                            error={errors.email}
                            placeholder="이메일을 입력하세요"
                        />
                    </div>

                    {/* 비밀번호 */}
                    <div className={classes.field}>
                        <label className={classes.label}>비밀번호</label>
                        <input
                            className={`${classes.input} ${errors.password ? classes.inputError : ""}`}
                            type="password"
                            value={password}
                            onChange={(e) => handleChange("password", e.target.value, setPassword)}
                            onBlur={(e) => handleBlur("password", e.target.value)}
                            placeholder="영문+숫자 8자 이상"
                            autoComplete="new-password"
                        />
                        {errors.password && <span className={classes.errorMsg}>{errors.password}</span>}
                    </div>

                    <button className={classes.button} type="submit">
                        가입하기
                    </button>

                </form>
            </div>
        </div>
    );
}

export default Join;
