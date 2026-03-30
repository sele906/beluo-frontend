import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, oauthJoin } from "../../api/chatApi";
import { toast } from "sonner";
import { BiUpload } from "react-icons/bi";
import AvatarUpload from "../../components/common/AvatarUpload";
import BirthdaySelect from "../../components/common/BirthdaySelect";
import classes from "./Join.module.css";

const toBirth = (year, month, day) =>
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const RULES = {
    name: (v) => {
        if (!v.trim()) return "닉네임을 입력해주세요.";
        if (v.trim().length < 2) return "2자 이상 입력해주세요.";
        if (v.trim().length > 10) return "10자 이하로 입력해주세요.";
        return "";
    },
};

function OAuth2Join() {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userImgUrl, setUserImgUrl] = useState(null);
    const [preview, setPreview] = useState(null);
    const [fileObj, setFileObj] = useState(null);
    const [name, setName] = useState("");
    const [birthYear, setBirthYear] = useState(null);
    const [birthMonth, setBirthMonth] = useState(null);
    const [birthDay, setBirthDay] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        getProfile()
            .then((profile) => {
                if (profile.name) setName(profile.name);
                if (profile.userImgUrl) {
                    setUserImgUrl(profile.userImgUrl);
                    setPreview(profile.userImgUrl);
                }
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    const setFieldError = (field, msg) =>
        setErrors(prev => msg ? { ...prev, [field]: msg } : (({ [field]: _, ...rest }) => rest)(prev));

    const handleChange = (field, value, setter) => {
        setter(value);
        if (errors[field]) setFieldError(field, RULES[field]?.(value) ?? "");
    };

    const handleFileChange = (file) => {
        setFileObj(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const nameErr = RULES.name(name);
        const birthdayErr = (!birthYear || !birthMonth || !birthDay)
            ? "생년월일을 모두 선택해주세요." : "";

        const newErrors = {};
        if (nameErr) newErrors.name = nameErr;
        if (birthdayErr) newErrors.birthday = birthdayErr;
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setIsSubmitting(true);
        try {
            const birth = toBirth(birthYear.value, birthMonth.value, birthDay.value);
            await oauthJoin(name, birth, fileObj);
            navigate("/", { replace: true });
        } catch {
            toast.error("정보 저장에 실패했어요. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return null;

    return (
        <div className={classes.container}>
            <div className={classes.card}>
                <h1 className={classes.title}>회원가입</h1>
                <p className={classes.subtitle}>서비스 이용을 위해 추가 정보를 입력해주세요</p>

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
                        overlayContent={<span>변경</span>}
                        size={80}
                    />
                </div>

                <form className={classes.form} onSubmit={handleSubmit} noValidate>
                    <div className={classes.field}>
                        <label className={classes.label}>닉네임</label>
                        <span className={classes.fieldHint}>캐릭터가 나를 부를 이름이에요</span>
                        <input
                            className={`${classes.input} ${errors.name ? classes.inputError : ""}`}
                            value={name}
                            onChange={(e) => handleChange("name", e.target.value, setName)}
                            onBlur={(e) => setFieldError("name", RULES.name(e.target.value))}
                            placeholder="닉네임을 입력하세요"
                            maxLength={10}
                        />
                        {errors.name && <span className={classes.errorMsg}>{errors.name}</span>}
                    </div>

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

                    <button className={classes.button} type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "저장 중..." : "시작하기"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default OAuth2Join;
