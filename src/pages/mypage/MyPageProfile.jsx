import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../../api/chatApi';
import { BiLeftArrowAlt } from "react-icons/bi";
import Avatar from '../../components/common/Avatar';

import classes from './MyPageProfile.module.css';

function MyPageProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState();

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

    const [name, setName] = useState('');
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');

    useEffect(() => {
        if (user) setName(user.name ?? '');
    }, [user]);

    if (!user) return null;

    const handleSubmit = (e) => {
        e.preventDefault()
        // TODO: API 연동
    }

    return (
        <div className={classes.page}>

            {/* ── 페이지 헤더 ── */}
            <div className={classes.pageHeader}>
                <button className={classes.backBtn} onClick={() => navigate('/mypage')}><BiLeftArrowAlt/></button>
                <span className={classes.pageTitle}>회원정보 수정</span>
            </div>

            {/* ── 아바타 ── */}
            <div className={classes.avatarWrap}>
                <Avatar
                    filePath={user.userImgUrl}
                    name={user.name}
                    imgClassName={classes.avatarImg}
                    size={150}
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
                        />
                    </div>
                </div>

                <button type="submit" className={classes.saveBtn}>저장하기</button>

            </form>

            {/* ── 회원 탈퇴 ── */}
            <button className={classes.deleteBtn}>회원 탈퇴</button>

        </div>
    )
}

export default MyPageProfile
