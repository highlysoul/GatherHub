import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/api";

interface User {
  email: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      const role =
        (session.user.user_metadata.role as "admin" | "user") || "user";

      setUser({
        email: session.user.email!,
        role,
      });
    }
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<User | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) return null;

    const role = (data.user.user_metadata.role as "admin" | "user") || "user";

    const loggedUser = {
      email: data.user.email!,
      role,
    };

    setUser(loggedUser);

    return loggedUser;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
