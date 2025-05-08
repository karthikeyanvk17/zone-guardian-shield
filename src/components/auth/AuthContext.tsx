
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";

interface User {
  id: string;
  email: string;
  role: "admin" | "user";
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, isAdmin: boolean) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const users = {
  admin: {
    id: "admin-123",
    email: "admin@captureshield.com",
    password: "admin123",
    role: "admin" as const,
    name: "Admin User"
  },
  user: {
    id: "user-123",
    email: "user@captureshield.com",
    password: "user123",
    role: "user" as const,
    name: "Regular User"
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing user session in localStorage
    const storedUser = localStorage.getItem("captureShield_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("captureShield_user");
      }
    }
  }, []);

  const login = async (email: string, password: string, isAdmin: boolean) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const targetUser = isAdmin ? users.admin : users.user;

    if (email === targetUser.email && password === targetUser.password) {
      const { password: _, ...userWithoutPassword } = targetUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem("captureShield_user", JSON.stringify(userWithoutPassword));
      toast.success(`Welcome back, ${userWithoutPassword.name}!`);
    } else {
      toast.error("Invalid credentials. Please try again.");
      throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("captureShield_user");
    toast.info("You have been logged out");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
