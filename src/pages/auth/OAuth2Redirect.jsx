import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function OAuth2Redirect() {
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        login();
        navigate("/", { replace: true });
    }, []);

    return null;
}

export default OAuth2Redirect;
