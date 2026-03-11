import { joinApi } from "../../api/chatApi";
import { useNavigate } from "react-router-dom";

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
            navigate("/login");
        } catch (e) {
            alert("회원가입에 실패했습니다.");
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input name="email"/>
                <input name="password"/>
                <input name="name"/>
                <button>가입하기</button>
            </form>
        </>
    );
}

export default Join;