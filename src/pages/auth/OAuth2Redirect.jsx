import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hook/AuthContext";

function OAuth2Redirect() {
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const role = new URLSearchParams(window.location.search).get("role");
        login(role);
        navigate("/", { replace: true });
    }, []);

    return null;
}

export default OAuth2Redirect;
