import { createContext, useContext, useState, useEffect } from "react";
import { getProfile } from "../api/chatApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(
        localStorage.getItem("isLoggedIn") === "true"
    );
    const [isGuest, setIsGuest] = useState(
        localStorage.getItem("isGuest") === "true"
    );

    useEffect(() => {
        if (!isLoggedIn) return;
        getProfile().catch(() => {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("isGuest");
            setIsLoggedIn(false);
            setIsGuest(false);
        });
    }, []);

    const login = () => {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.removeItem("isGuest");
        setIsLoggedIn(true);
        setIsGuest(false);
    };

    const guestLogin = () => {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("isGuest", "true");
        setIsLoggedIn(true);
        setIsGuest(true);
    };

    const logout = () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("isGuest");
        setIsLoggedIn(false);
        setIsGuest(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, isGuest, login, guestLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}