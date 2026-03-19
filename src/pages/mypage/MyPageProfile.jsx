import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi, updateProfile } from '../../api/chatApi';
import { BiLeftArrowAlt, BiCamera } from "react-icons/bi";
import Avatar from '../../components/common/Avatar';

import classes from './MyPageProfile.module.css';

function MyPageProfile() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [user, setUser] = useState();
    const [preview, setPreview] = useState(null);
    const [fileObj, setFileObj] = useState(null);

    const [name, setName] = useState('');
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function fetchUserInfo() {
            try {
                const data = await profileApi();
                setUser(data);
            } catch (error) {
                console.error("유저 정보 불러오기 실패:", error);
            }
        }
        fetchUserInfo();
    }, []);

    useEffect(() => {
        if (user) setName(user.name ?? '');
    }, [user]);

    if (!user) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            alert("파일 크기는 10MB 이하여야 합니다.");
            return;
        }
        setFileObj(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isGoogle && newPw && newPw !== confirmPw) {
            alert("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        setIsSubmitting(true);

        const profileData = {
            name,
            userImgUrl: user.userImgUrl,
            ...((!isGoogle && newPw) && { password: newPw }),
        };

        const formData = new FormData();
        formData.append("user", new Blob([JSON.stringify(profileData)], { type: "application/json" }));
        if (fileObj) {
            formData.append("file", fileObj);
        }

        try {
            await updateProfile(formData);
            alert("저장되었습니다.");
            navigate("/mypage");
        } catch (err) {
            console.error("프로필 수정 실패:", err);
            alert("저장에 실패했어요. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isGoogle = user.provider === 'google';

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
                <div className={classes.avatarClickable} onClick={() => fileInputRef.current?.click()}>
                    {preview ? (
                        <img src={preview} alt="avatar" className={classes.avatarImg} />
                    ) : user.userImgUrl ? (
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
                    )}
                    <div className={classes.avatarOverlay}>
                        <BiCamera size={22} />
                        <span>변경</span>
                    </div>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className={classes.fileInput}
                    onChange={handleFileChange}
                />
            </div>

            {/* ── 폼 카드 ── */}
            <form className={classes.card} onSubmit={handleSubmit}>

                <div className={classes.section}>
                    <span className={classes.sectionTitle}>기본 정보</span>

                    <div className={classes.field}>
                        <label className={classes.label}>이름</label>
                        <input
                            className={classes.input}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="이름을 입력하세요"
                        />
                    </div>

                    <div className={classes.field}>
                        <label className={classes.label}>이메일</label>
                        <input
                            className={`${classes.input} ${classes.inputDisabled}`}
                            type="email"
                            value={user.email}
                            disabled
                        />
                    </div>
                </div>

                {/* 구글 로그인은 비밀번호 변경 불가 */}
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
                                    className={classes.input}
                                    type="password"
                                    value={newPw}
                                    onChange={(e) => setNewPw(e.target.value)}
                                    placeholder="새 비밀번호"
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className={classes.field}>
                                <label className={classes.label}>새 비밀번호 확인</label>
                                <input
                                    className={classes.input}
                                    type="password"
                                    value={confirmPw}
                                    onChange={(e) => setConfirmPw(e.target.value)}
                                    placeholder="새 비밀번호 확인"
                                    autoComplete="new-password"
                                />
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
            <button className={classes.deleteBtn}>회원 탈퇴</button>

        </div>
    );
}

export default MyPageProfile;
