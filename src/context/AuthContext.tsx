import React, { createContext, useContext, useState, useEffect } from "react";
import {
  AuthContextType,
  User,
  LoginCredentials,
  RegisterUserData,
} from "../types";
import { authService } from "../services/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      const { user, token } = await authService.login(credentials);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during login"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterUserData) => {
    try {
      setIsLoading(true);
      setError(null);
      const { user, token } = await authService.register(userData);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during registration"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during logout"
      );
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isLoading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
