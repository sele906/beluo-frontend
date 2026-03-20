import { createContext, useContext, useState, useEffect } from "react";
import { getProfile } from "../api/chatApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(
        localStorage.getItem("isLoggedIn") === "true"
    );

    useEffect(() => {
        if (!isLoggedIn) return;
        getProfile().catch(() => {
            localStorage.removeItem("isLoggedIn");
            setIsLoggedIn(false);
        });
    }, []);

    const login = () => {
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout
}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}