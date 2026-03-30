import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hook/AuthContext";
import { getProfile } from "../../api/chatApi";

function OAuth2Redirect() {
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        async function processLogin() {
            login();
            try {
                const profile = await getProfile();
                if (!profile.name || !profile.birth) {
                    navigate("/oauth2/join", { replace: true });
                } else {
                    navigate("/", { replace: true });
                }
            } catch {
                navigate("/", { replace: true });
            }
        }
        processLogin();
    }, []);

    return null;
}

export default OAuth2Redirect;
