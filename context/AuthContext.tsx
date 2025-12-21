"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

/* =========================
   Types
========================= */
export type User = {
  id: string;
  name: string;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =========================
   Helpers
========================= */
function decodeJWT(token: string): any {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/* =========================
   Provider
========================= */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     Load auth on refresh
  ========================= */
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");

    if (!storedToken) {
      setLoading(false);
      return;
    }

    const decoded = decodeJWT(storedToken);
    if (!decoded?.sub || !decoded?.role) {
      localStorage.removeItem("access_token");
      setLoading(false);
      return;
    }

    setToken(storedToken);

    // 🔥 Fetch FULL user info (name, email, role)
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((data) => {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
        });
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  /* =========================
     Login
  ========================= */
  const login = async (newToken: string) => {
    const decoded = decodeJWT(newToken);

    if (!decoded?.sub || !decoded?.role) {
      throw new Error("Invalid token");
    }

    localStorage.setItem("access_token", newToken);
    setToken(newToken);

    // 🔥 Fetch full user after login
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch user");
    }

    const data = await res.json();

    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    });

    if (decoded.role === "ADMIN") {
        router.push("/dashboard/admin");
    } else {
        router.push("/dashboard");
    }

  };

  /* =========================
     Logout
  ========================= */
  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =========================
   Hook
========================= */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
