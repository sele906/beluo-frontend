import { BiX } from "react-icons/bi";
import { joinApi } from "../../api/chatApi";
import { useNavigate } from "react-router-dom";
import classes from "./Join.module.css";

function Join() {

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            email: e.target.email.value,
            password: e.target.password.value,
            name: e.target.name.value
        };

        try {
            await joinApi(data);
            alert("회원가입이 완료되었습니다.");
            navigate("/login");
        } catch (e) {
            alert("회원가입에 실패했습니다.");
        }
    };

    return (
        <div className={classes.container}>
            <div className={classes.card}>
                <button className={classes.backBtn} onClick={() => navigate(-1)}><BiX /></button>
                <h1 className={classes.title}>회원가입</h1>
                <p className={classes.subtitle}>
                    계정을 만들어 서비스를 시작하세요
                </p>

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