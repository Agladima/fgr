"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import styles from "./notification.module.css";

interface AdminNotificationContextValue {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  clearError: () => void;
}

const AdminNotificationContext = createContext<AdminNotificationContextValue | undefined>(undefined);

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const timeout = window.setTimeout(() => setError(null), 7000);
    return () => window.clearTimeout(timeout);
  }, [error]);

  useEffect(() => {
    if (!success) return;
    const timeout = window.setTimeout(() => setSuccess(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [success]);

  const handleShowError = (msg: string) => {
    setSuccess(null);
    setError(msg);
  };

  const handleShowSuccess = (msg: string) => {
    setError(null);
    setSuccess(msg);
  };

  return (
    <AdminNotificationContext.Provider
      value={{
        showError: handleShowError,
        showSuccess: handleShowSuccess,
        clearError: () => {
          setError(null);
          setSuccess(null);
        },
      }}
    >
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
      {success && (
        <div className={`${styles.popup} ${styles.popupSuccess}`} role="status" aria-live="polite">
          <CheckCircle2 size={21} className={`${styles.icon} ${styles.iconSuccess}`} aria-hidden="true" />
          <div className={styles.content}>
            <strong className={styles.title}>Success</strong>
            <p>{success}</p>
          </div>
          <button type="button" className={styles.close} onClick={() => setSuccess(null)} aria-label="Dismiss message">
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
