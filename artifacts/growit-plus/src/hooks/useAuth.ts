import { useState, useEffect } from "react";

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  profileImage: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/user", { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        setUser(data ?? null);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: () => {
      const returnTo = encodeURIComponent(window.location.pathname);
      window.location.href = `/api/login?returnTo=${returnTo}`;
    },
    logout: () => {
      window.location.href = "/api/logout";
    },
  };
}
