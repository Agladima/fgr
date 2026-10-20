"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import styles from "./notification.module.css";

interface AdminNotificationContextValue {
  showError: (message: string) => void;
  clearError: () => void;
}

const AdminNotificationContext = createContext<AdminNotificationContextValue | undefined>(undefined);

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const timeout = window.setTimeout(() => setError(null), 7000);
    return () => window.clearTimeout(timeout);
  }, [error]);

  return (
    <AdminNotificationContext.Provider value={{ showError: setError, clearError: () => setError(null) }}>
      {children}
      {error && (
        <div className={styles.popup} role="alert" aria-live="assertive">
          <AlertCircle size={21} className={styles.icon} aria-hidden="true" />
          <div className={styles.content}>
            <strong className={styles.title}>Something went wrong</strong>
            <p>{error}</p>
          </div>
          <button type="button" className={styles.close} onClick={() => setError(null)} aria-label="Dismiss error">
            <X size={18} />
          </button>
        </div>
      )}
    </AdminNotificationContext.Provider>
  );
}

export function useAdminNotification() {
  const context = useContext(AdminNotificationContext);
  if (!context) throw new Error("useAdminNotification must be used within AdminNotificationProvider");
  return context;
}
