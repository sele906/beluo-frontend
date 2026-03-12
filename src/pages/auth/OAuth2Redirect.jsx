import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hook/AuthContext";

function OAuth2Redirect() {
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        async function processLogin() {
            await login();
            navigate("/", { replace: true });
        }

        processLogin();
    }, []);

    return null;
}

export default OAuth2Redirect;
