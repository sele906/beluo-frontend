import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hook/AuthContext";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

function AdminOnlyRoute() {
    const { isLoggedIn, isAdmin } = useAuth();
    const toasted = useRef(false);

    useEffect(() => {
        if (isLoggedIn && !isAdmin && !toasted.current) {
            toasted.current = true;
            toast.error("관리자 전용 페이지입니다.");
        }
    }, [isLoggedIn, isAdmin]);

    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/mypage" replace />;
    return <Outlet />;
}

export default AdminOnlyRoute;
