import { loginApi } from "../../api/chatApi";
import { useAuth } from "../../hook/AuthContext";
import { useNavigate } from "react-router-dom";
import { BiLogoGoogle } from "react-icons/bi";

import classes from "./Login.module.css";

function Login() {

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            email: e.target.email.value,
            password: e.target.password.value
        };

        try {
            await loginApi(data);
            login();
            navigate("/");
        } catch (e) {
            alert("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    };

    function toGoogle() {
        window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;
    }

    return (
        <div className={classes.container}>
            <div className={classes.card}>
                <h1 className={classes.title}>로그인</h1>
                <p className={classes.subtitle}>계속하려면 로그인하세요</p>

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
                        <label className={classes.label}>비밀번호</label>
                        <input
                            className={classes.input}
                            name="password"
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            autoComplete="current-password"
                        />
                    </div>

                    <button className={classes.button} type="submit">
                        로그인
                    </button>
                </form>

                <div className={classes.divider}>또는</div>

                <button className={classes.googleButton} onClick={toGoogle}>
                    <BiLogoGoogle className={classes.googleIcon} />
                    구글로 로그인
                </button>
            </div>
        </div>
    );
}

export default Login;
