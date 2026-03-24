// ============================================================
// AuthContext — manages current user session (mock, no backend)
// ============================================================
import React, { createContext, useContext, useState } from "react";
import type { User, Role, AuthContextValue } from "@/types";
import { mockUsers } from "@/data/mockData";

const AuthContext = createContext<AuthContextValue | null>(null);

// Keep a mutable copy of users so registration works in-session
const usersStore: (User & { password: string })[] = [...mockUsers];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Persist session in sessionStorage for page refresh
    const stored = sessionStorage.getItem("hd_user");
    return stored ? JSON.parse(stored) : null;
  });

  /** Login with email + password */
  const login = (email: string, password: string) => {
    const found = usersStore.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return { success: false, message: "Invalid email or password." };
    const { password: _, ...user } = found;
    setCurrentUser(user);
    sessionStorage.setItem("hd_user", JSON.stringify(user));
    return { success: true, message: "Welcome back!" };
  };

  /** Register a new account */
  const register = (name: string, email: string, password: string, role: Role = "user") => {
    if (usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: "An account with this email already exists." };
    }
    const newUser: User & { password: string } = {
      id: `u${Date.now()}`,
      name,
      email,
      password,
      role,
      createdAt: new Date().toISOString(),
    };
    usersStore.push(newUser);
    const { password: _, ...user } = newUser;
    setCurrentUser(user);
    sessionStorage.setItem("hd_user", JSON.stringify(user));
    return { success: true, message: "Account created successfully!" };
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem("hd_user");
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, isAuthenticated: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

/** Hook to access auth context */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
