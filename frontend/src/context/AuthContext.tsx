"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../services/authService";
import type { Usuario } from "../types/parking";

interface AuthState {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: Usuario) => void;
  logout: () => void;
  updateUser: (user: Usuario) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const router = useRouter();

  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser && storedUser !== "undefined") {
        try {
          const user = JSON.parse(storedUser);
          
          if (!user || !user.rol_id) {
            throw new Error("Datos de usuario incompletos");
          }

          // Restaurar cookies para el proxy (middleware)
          document.cookie = `token=${storedToken}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `roleId=${user.rol_id}; path=/; max-age=86400; SameSite=Lax`;

          setState({
            user: user,
            token: storedToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error al restaurar sesión:", error);
          // Solo cerrar sesión si los datos están realmente corruptos
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    verifySession();
  }, []);

  const login = (token: string, user: Usuario) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // Set cookie for middleware
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `roleId=${user.rol_id}; path=/; max-age=86400; SameSite=Lax`;

    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = "roleId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push("/");
  };

  const updateUser = (user: Usuario) => {
    localStorage.setItem("user", JSON.stringify(user));
    setState((prev) => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}