import { createContext, useContext, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const API_BASE = "/api/v1";
const api = {
  fetch: (endpoint: string, options: RequestInit = {}) => {
    return fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  },

  getMe: async (): Promise<User> => {
    const res = await api.fetch("/auth/me");
    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
  },

  login: async (email: string, password: string) => {
    const res = await api.fetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  },

  logout: async () => {
    const res = await api.fetch("/auth/logout", { method: "POST" });
    if (!res.ok) throw new Error("Logout failed");
  },
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: api.getMe,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const isAuthenticated = !!user && !error;

  const login = async (email: string, password: string) => {
    await api.login(email, password);
    await queryClient.invalidateQueries({ queryKey: ["auth"] });
  };

  const logout = async () => {
    await api.logout();
    queryClient.clear();
  };

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export default AuthContext;
