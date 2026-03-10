import { testLogin } from "../../api/chatApi";

function TestLogin() {

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        const res = await testLogin(formData);
        console.log(res);
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input name="id" />
                <input name="pwd" />
                <button type="submit">확인</button>
            </form>
        </>
    );
}

export default TestLogin;