"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AdminAuthProvider } from "@/lib/admin/auth-context";
import { AdminNotificationProvider } from "@/lib/admin/notification-context";
import AdminShell from "@/components/admin/AdminShell/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicAdminPage = pathname === "/admin/login" || pathname === "/admin/reset-password";

  return (
    <AdminAuthProvider>
      <AdminNotificationProvider>
        {isPublicAdminPage ? children : <AdminShell>{children}</AdminShell>}
      </AdminNotificationProvider>
    </AdminAuthProvider>
  );
}
