import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hook/AuthContext";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

function UserOnlyRoute() {
    const { isLoggedIn, isGuest } = useAuth();
    const toasted = useRef(false);

    useEffect(() => {
        if (isLoggedIn && isGuest && !toasted.current) {
            toasted.current = true;
            toast.error("회원 전용 페이지입니다. 로그인 후 이용해주세요.");
        }
    }, [isLoggedIn, isGuest]);

    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (isGuest) return <Navigate to="/" replace />;
    return <Outlet />;
}

export default UserOnlyRoute;
