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
    const [isAdmin, setIsAdmin] = useState(
        localStorage.getItem("isAdmin") === "true"
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

    const login = (role) => {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.removeItem("isGuest");
        setIsLoggedIn(true);
        setIsGuest(false);
        setAdmin(role === "ADMIN");
    };

    const guestLogin = (role) => {
        localStorage.setItem("isLoggedIn", "true");
        const guest = role === "GUEST";
        if (guest) {
            localStorage.setItem("isGuest", "true");
        } else {
            localStorage.removeItem("isGuest");
        }
        setIsLoggedIn(true);
        setIsGuest(guest);
    };

    const setAdmin = (value) => {
        if (value) {
            localStorage.setItem("isAdmin", "true");
        } else {
            localStorage.removeItem("isAdmin");
        }
        setIsAdmin(value);
    };

    const logout = () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("isGuest");
        localStorage.removeItem("isAdmin");
        setIsLoggedIn(false);
        setIsGuest(false);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, isGuest, isAdmin, login, guestLogin, setAdmin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}