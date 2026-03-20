import { useRef, useState } from "react";
import { BiX, BiUpload } from "react-icons/bi";
import { join as joinApi } from "../../api/chatApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import classes from "./Join.module.css";

function Join() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [fileObj, setFileObj] = useState(null);
    const [dragging, setDragging] = useState(false);

    const handleFileChange = (file) => {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error("파일 크기는 10MB 이하여야 합니다.");
            return;
        }
        setFileObj(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFileChange(e.dataTransfer.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const user = {
            email: e.target.email.value,
            password: e.target.password.value,
            name: e.target.name.value,
        };

        try {
            await joinApi(user, fileObj);
            toast.success("회원가입이 완료되었습니다.");
            navigate("/login");
        } catch (e) {
            toast.error("회원가입에 실패했습니다.");
        }
    };

    return (
        <div className={classes.container}>
            <div className={classes.card}>
                <button className={classes.backBtn} onClick={() => navigate(-1)}><BiX /></button>
                <h1 className={classes.title}>회원가입</h1>
                <p className={classes.subtitle}>계정을 만들어 서비스를 시작하세요</p>

                {/* 프로필 이미지 */}
                <div className={classes.avatarWrap}>
                    <div
                        className={`${classes.avatarClickable} ${dragging ? classes.dragging : ""}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                    >
                        {preview ? (
                            <img src={preview} alt="avatar" className={classes.avatarImg} />
                        ) : (
                            <div className={classes.avatarPlaceholder}>
                                <BiUpload size={22} />
                            </div>
                        )}
                        <div className={classes.avatarOverlay}>
                            <BiUpload size={18} />
                            <span>변경</span>
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className={classes.fileInput}
                        onChange={(e) => handleFileChange(e.target.files[0])}
                    />
                </div>

                <form className={classes.form} onSubmit={handleSubmit}>

                    <div className={classes.field}>
                        <label className={classes.label}>이메일</label>
                        <input
                            className={classes.input}
                            name="email"
                            placeholder="이메일을 입력하세요"
                            autoComplete="email"
                        />
                    </div>

                    <div className={classes.field}>
                        <label className={classes.label}>이름</label>
                        <input
                            className={classes.input}
                            name="name"
                            placeholder="이름을 입력하세요"
                        />
                    </div>

                    <div className={classes.field}>
                        <label className={classes.label}>비밀번호</label>
                        <input
                            className={classes.input}
                            type="password"
                            name="password"
                            placeholder="비밀번호를 입력하세요"
                            autoComplete="new-password"
                        />
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
