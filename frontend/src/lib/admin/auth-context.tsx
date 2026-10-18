"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { StaffRole } from "@/lib/server/types";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
}

interface AdminAuthContextValue {
  user: AdminUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasRole: (roles: StaffRole[]) => boolean;
  canAccess: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auth/me");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.user) {
          setUser(json.data.user);
          return;
        }
      }
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Client-side route protection
  useEffect(() => {
    if (loading) return;

    const isLoginPage = pathname === "/admin/login";

    if (!user && !isLoginPage && pathname.startsWith("/admin")) {
      router.replace("/admin/login");
    } else if (user && isLoginPage) {
      router.replace("/admin");
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error?.message || "Invalid email or password.",
        };
      }

      setUser(data.data.user);
      router.replace("/admin");
      return { success: true };
    } catch {
      return {
        success: false,
        error: "Network error occurred. Please check your connection.",
      };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    setUser(null);
    router.replace("/admin/login");
  };

  const hasRole = (roles: StaffRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canAccess = (permission: string) => {
    if (!user) return false;
    if (user.role === "super_admin") return true;

    if (permission.startsWith("staff:") || permission.startsWith("settings:")) {
      return false;
    }

    if (permission.startsWith("audit_logs:")) {
      return user.role === "admin";
    }

    if (user.role === "admin") return true;

    if (user.role === "training_officer") {
      return permission.startsWith("registrations:") || permission.startsWith("follow_ups:") || permission.startsWith("reports:");
    }

    if (user.role === "partnerships_officer") {
      return permission.startsWith("partnerships:") || permission.startsWith("enquiries:") || permission.startsWith("follow_ups:") || permission.startsWith("reports:");
    }

    if (user.role === "content_manager") {
      return permission.startsWith("content:") || permission.startsWith("programmes:") || permission.startsWith("events:") || permission.startsWith("reports:");
    }

    return false;
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === "super_admin",
        login,
        logout,
        hasRole,
        canAccess,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
