"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface UseAuthOptions {
    redirectTo?: string;
    required?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
    const { redirectTo = "/login", required = true } = options;
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("Candidat");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUserId = Cookies.get("userId");
        const storedUserName = Cookies.get("userName");

        if (required && !storedUserId) {
            router.push(redirectTo);
            return;
        }

        setUserId(storedUserId || null);
        setUserName(storedUserName || "Candidat");
        setIsLoading(false);
    }, [router, redirectTo, required]);

    const logout = () => {
        Cookies.remove("userId");
        Cookies.remove("userName");
        router.push("/login");
    };

    return {
        userId,
        userName,
        isAuthenticated: !!userId,
        isLoading,
        logout
    };
}

export default useAuth;
