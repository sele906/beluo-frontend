import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, deleteProfile, sendVerifyEmailApi, checkVerifyCodeApi } from '../../api/chatApi';
import { toast } from 'sonner';
import { useAuth } from '../../hook/AuthContext';
import { BiLeftArrowAlt, BiCheckCircle } from "react-icons/bi";
import Avatar from '../../components/common/Avatar';
import AvatarUpload from '../../components/common/AvatarUpload';
import BirthdaySelect from '../../components/common/BirthdaySelect';

import classes from './MyPageProfile.module.css';

// ── 생년월일 유틸 ──────────────────────────────────────────
const toBirth = (year, month, day) =>
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const parseBirth = (birth) => {
    if (!birth) return null;
    const [year, month, day] = birth.slice(0, 10).split("-");
    if (!year || !month || !day) return null;
    return { year, month: String(Number(month)), day: String(Number(day)) };
};

// ── 검증 규칙 ──────────────────────────────────────────────
const validateName = (v) => v.trim() ? "" : "이름을 입력해주세요.";

const validateNewPw = (v) => {
    if (!v) return "";
    if (v.length < 8) return "8자 이상 입력해주세요.";
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(v)) return "영문과 숫자를 모두 포함해주세요.";
    return "";
};

const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

const validateEmail = (v) => {
    if (!v.trim()) return "이메일을 입력해주세요.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "올바른 이메일 형식이 아닙니다.";
    return "";
};

function MyPageProfile() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const emailTimerRef = useRef(null);
    const emailInputRef = useRef(null);

    const [user, setUser] = useState();
    const [preview, setPreview] = useState(null);
    const [fileObj, setFileObj] = useState(null);

    // 폼 필드
    const [name, setName] = useState('');
    const [birthYear, setBirthYear] = useState(null);
    const [birthMonth, setBirthMonth] = useState(null);
    const [birthDay, setBirthDay] = useState(null);
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');

    // 이메일 변경 인증
    const [emailEditing, setEmailEditing] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailVerifyStep, setEmailVerifyStep] = useState('none'); // none | sent | verified
    const [emailVerifyCode, setEmailVerifyCode] = useState('');
    const [emailTimeLeft, setEmailTimeLeft] = useState(0);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        async function fetchUserInfo() {
            try {
                const data = await getProfile();
                setUser(data);
            } catch (error) {
                console.error("유저 정보 불러오기 실패:", error);
            }
        }
        fetchUserInfo();
    }, []);

    useEffect(() => {
        if (!user) return;
        setName(user.name ?? '');
        setNewEmail(user.email ?? '');
        const parsed = parseBirth(user.birth);
        if (parsed) {
            setBirthYear ({ value: parsed.year,  label: `${parsed.year}년`  });
            setBirthMonth({ value: parsed.month, label: `${parsed.month}월` });
            setBirthDay  ({ value: parsed.day,   label: `${parsed.day}일`   });
        }
    }, [user]);

    useEffect(() => () => clearInterval(emailTimerRef.current), []);

    if (!user) return null;

    const isGoogle = user.provider === 'google';

    // ── 타이머 ──
    const startEmailTimer = () => {
        setEmailTimeLeft(300);
        clearInterval(emailTimerRef.current);
        emailTimerRef.current = setInterval(() => {
            setEmailTimeLeft(prev => {
                if (prev <= 1) { clearInterval(emailTimerRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    // ── 이메일 인증 ──
    const handleSendEmailVerify = async () => {
        const err = validateEmail(newEmail);
        if (err) { setFieldError('newEmail', err); return; }
        try {
            await sendVerifyEmailApi(newEmail);
            setEmailVerifyStep('sent');
            setEmailVerifyCode('');
            startEmailTimer();
            setFieldError('newEmail', '');
            toast.success('인증번호가 발송되었습니다.');
        } catch (e) {
            toast.error(e.response?.data || '인증번호 발송에 실패했습니다.');
        }
    };

    const handleCheckEmailVerify = async () => {
        if (emailVerifyCode.length < 6) return;
        try {
            await checkVerifyCodeApi(newEmail, emailVerifyCode);
            clearInterval(emailTimerRef.current);
            setEmailVerifyStep('verified');
            setEmailEditing(false);
            setFieldError('newEmail', '');
            toast.success('이메일 인증이 완료되었습니다.');
        } catch (e) {
            toast.error(e.response?.data || '인증번호가 올바르지 않습니다.');
        }
    };

    // ── 에러 단일 세팅 ──
    const setFieldError = (field, msg) =>
        setErrors(prev => msg ? { ...prev, [field]: msg } : (({ [field]: _, ...rest }) => rest)(prev));

    // ── onChange 시 에러 재검증 ──
    const handleNameChange = (v) => {
        setName(v);
        if (errors.name) setFieldError("name", validateName(v));
    };

    const handleNewPwChange = (v) => {
        setNewPw(v);
        if (errors.newPw) setFieldError("newPw", validateNewPw(v));
        if (errors.confirmPw) setFieldError("confirmPw", v !== confirmPw ? "비밀번호가 일치하지 않습니다." : "");
    };

    const handleConfirmPwChange = (v) => {
        setConfirmPw(v);
        if (errors.confirmPw) setFieldError("confirmPw", newPw !== v ? "비밀번호가 일치하지 않습니다." : "");
    };

    const handleFileChange = (file) => {
        setFileObj(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        const nameErr = validateName(name);
        if (nameErr) newErrors.name = nameErr;

        if (!isGoogle && newEmail !== user.email && emailVerifyStep !== 'verified') newErrors.newEmail = "이메일 인증을 완료해주세요.";

        if (!isGoogle && newPw) {
            const newPwErr = validateNewPw(newPw);
            if (newPwErr) newErrors.newPw = newPwErr;
            else if (newPw !== confirmPw) newErrors.confirmPw = "비밀번호가 일치하지 않습니다.";
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setIsSubmitting(true);

        const profileData = {
            name,
            userImgUrl: user.userImgUrl,
            provider: user.provider,
            ...(birthYear && birthMonth && birthDay && {
                birth: toBirth(birthYear.value, birthMonth.value, birthDay.value),
            }),
            ...(!isGoogle && emailVerifyStep === 'verified' && { email: newEmail }),
            ...(!isGoogle && newPw && { password: newPw }),
        };

        const formData = new FormData();
        formData.append("user", new Blob([JSON.stringify(profileData)], { type: "application/json" }));
        if (fileObj) formData.append("file", fileObj);

        try {
            await updateProfile(formData);
            toast.success("저장되었습니다.");
            navigate("/mypage");
        } catch (err) {
            console.error("프로필 수정 실패:", err);
            toast.error(err.response?.data || "저장에 실패했어요. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProfile = async () => {
        if (!window.confirm("정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
        try {
            await deleteProfile();
            logout();
            toast.success("회원 탈퇴가 완료되었습니다.");
            navigate("/");
        } catch (err) {
            console.error("회원 탈퇴 실패:", err);
            toast.error(err.response?.data || "탈퇴에 실패했어요. 다시 시도해주세요.");
        }
    };

    return (
        <div className={classes.page}>

            {/* ── 페이지 헤더 ── */}
            <div className={classes.pageHeader}>
                <button className={classes.backBtn} onClick={() => navigate('/mypage')}>
                    <BiLeftArrowAlt />
                </button>
                <span className={classes.pageTitle}>회원정보 수정</span>
            </div>

            {/* ── 아바타 ── */}
            <div className={classes.avatarWrap}>
                <AvatarUpload
                    preview={preview}
                    onChange={handleFileChange}
                    fallback={
                        user.userImgUrl ? (
                            <Avatar
                                filePath={user.userImgUrl}
                                name={user.name}
                                imgClassName={classes.avatarImg}
                                size={150}
                            />
                        ) : (
                            <div className={classes.avatarPlaceholder}>
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                        )
                    }
                    size={96}
                />
                <span className={classes.creditBadge}>{(user.credit ?? 0).toLocaleString()} 크레딧</span>
            </div>

            {/* ── 폼 카드 ── */}
            <form className={classes.card} onSubmit={handleSubmit} noValidate>

                {/* 기본 정보 */}
                <div className={classes.section}>
                    <span className={classes.sectionTitle}>기본 정보</span>

                    <div className={classes.field}>
                        <label className={classes.label}>이름</label>
                        <input
                            className={`${classes.input} ${errors.name ? classes.inputError : ""}`}
                            type="text"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            onBlur={(e) => setFieldError("name", validateName(e.target.value))}
                            placeholder="이름을 입력하세요"
                            maxLength={10}
                        />
                        {errors.name && <span className={classes.errorMsg}>{errors.name}</span>}
                    </div>

                    <div className={classes.field}>
                        <label className={classes.label}>이메일</label>

                        <div className={classes.inlineRow}>
                            <input
                                ref={emailInputRef}
                                className={`${classes.input} ${(!emailEditing || emailVerifyStep === 'verified') ? classes.inputDisabled : ''} ${errors.newEmail ? classes.inputError : ''}`}
                                type="email"
                                value={newEmail}
                                disabled={!emailEditing || emailVerifyStep === 'verified'}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setNewEmail(v);
                                    setEmailVerifyStep('none');
                                    setEmailVerifyCode('');
                                    if (errors.newEmail) setFieldError('newEmail', validateEmail(v));
                                }}
                                autoComplete="email"
                            />

                            {/* 변경하기 */}
                            {!isGoogle && !emailEditing && emailVerifyStep !== 'verified' && (
                                <button
                                    type="button"
                                    className={classes.verifyBtn}
                                    onClick={() => {
                                        setEmailEditing(true);
                                        setTimeout(() => emailInputRef.current?.focus(), 0);
                                    }}
                                >
                                    변경하기
                                </button>
                            )}

                            {/* 인증하기 / 재발송 */}
                            {!isGoogle && emailEditing && newEmail !== user.email && emailVerifyStep !== 'verified' && (
                                <button
                                    type="button"
                                    className={classes.verifyBtn}
                                    onClick={handleSendEmailVerify}
                                    disabled={!newEmail.trim()}
                                >
                                    {emailVerifyStep === 'sent' ? '재발송' : '인증하기'}
                                </button>
                            )}

                            {/* 인증 완료 */}
                            {emailVerifyStep === 'verified' && (
                                <div className={classes.verifiedBadge}>
                                    <BiCheckCircle size={15} />
                                    인증 완료
                                </div>
                            )}
                        </div>

                        {/* 인증코드 입력 */}
                        {emailVerifyStep === 'sent' && (
                            <div className={classes.inlineRow}>
                                <div className={classes.codeWrap}>
                                    <input
                                        className={classes.input}
                                        value={emailVerifyCode}
                                        onChange={(e) => setEmailVerifyCode(e.target.value.replace(/\D/g, ''))}
                                        placeholder="인증번호 6자리"
                                        maxLength={6}
                                        inputMode="numeric"
                                    />
                                    {emailTimeLeft > 0 && (
                                        <span className={classes.timer}>{formatTime(emailTimeLeft)}</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className={classes.verifyBtn}
                                    onClick={handleCheckEmailVerify}
                                    disabled={emailVerifyCode.length < 6}
                                >
                                    확인
                                </button>
                            </div>
                        )}

                        {errors.newEmail && <span className={classes.errorMsg}>{errors.newEmail}</span>}
                    </div>
                </div>

                <div className={classes.divider} />

                {/* 생년월일 */}
                <div className={classes.section}>
                    <span className={classes.sectionTitle}>생년월일</span>

                    <div className={classes.field}>
                        <BirthdaySelect
                            year={birthYear}
                            month={birthMonth}
                            day={birthDay}
                            onYearChange={setBirthYear}
                            onMonthChange={setBirthMonth}
                            onDayChange={setBirthDay}
                        />
                    </div>
                </div>

                {/* 비밀번호 변경 (구글 제외) */}
                {!isGoogle && (
                    <>
                        <div className={classes.divider} />

                        <div className={classes.section}>
                            <span className={classes.sectionTitle}>비밀번호 변경</span>
                            <p className={classes.sectionDesc}>변경하지 않으려면 비워두세요</p>

                            <div className={classes.field}>
                                <label className={classes.label}>현재 비밀번호</label>
                                <input
                                    className={classes.input}
                                    type="password"
                                    value={currentPw}
                                    onChange={(e) => setCurrentPw(e.target.value)}
                                    placeholder="현재 비밀번호"
                                    autoComplete="current-password"
                                />
                            </div>

                            <div className={classes.field}>
                                <label className={classes.label}>새 비밀번호</label>
                                <input
                                    className={`${classes.input} ${errors.newPw ? classes.inputError : ""}`}
                                    type="password"
                                    value={newPw}
                                    onChange={(e) => handleNewPwChange(e.target.value)}
                                    onBlur={(e) => setFieldError("newPw", validateNewPw(e.target.value))}
                                    placeholder="영문+숫자 8자 이상"
                                    autoComplete="new-password"
                                />
                                {errors.newPw && <span className={classes.errorMsg}>{errors.newPw}</span>}
                            </div>

                            <div className={classes.field}>
                                <label className={classes.label}>새 비밀번호 확인</label>
                                <input
                                    className={`${classes.input} ${errors.confirmPw ? classes.inputError : ""}`}
                                    type="password"
                                    value={confirmPw}
                                    onChange={(e) => handleConfirmPwChange(e.target.value)}
                                    onBlur={() => setFieldError("confirmPw", newPw && newPw !== confirmPw ? "비밀번호가 일치하지 않습니다." : "")}
                                    placeholder="새 비밀번호 확인"
                                    autoComplete="new-password"
                                />
                                {errors.confirmPw && <span className={classes.errorMsg}>{errors.confirmPw}</span>}
                            </div>
                        </div>
                    </>
                )}

                {isGoogle && (
                    <>
                        <div className={classes.divider} />
                        <p className={classes.googleNotice}>
                            Google 계정으로 로그인했습니다. 비밀번호 변경은 Google에서 관리해주세요.
                        </p>
                    </>
                )}

                <button type="submit" className={classes.saveBtn} disabled={isSubmitting}>
                    {isSubmitting ? "저장 중..." : "저장하기"}
                </button>

            </form>

            {/* ── 회원 탈퇴 ── */}
            <button className={classes.deleteBtn} onClick={handleDeleteProfile}>회원 탈퇴</button>

        </div>
    );
}

export default MyPageProfile;
