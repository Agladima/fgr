"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/lib/admin/auth-context";
import styles from "./login.module.css";
import { Mail, Lock, AlertCircle, ArrowRight, Loader2, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [timeoutNotice, setTimeoutNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("reason") === "timeout") {
        setTimeoutNotice(
          "Your session was automatically signed out due to 5 minutes of inactivity for security. Please sign in again."
        );
      } else if (params.get("reason") === "password_updated") {
        setSuccessNotice(
          "Your password has been successfully updated. Please log in with your new password."
        );
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTimeoutNotice(null);
    setSuccessNotice(null);

    if (!email.trim() || !password) {
      setError("Please enter both email address and password.");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || "Login failed. Please verify your credentials.");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.brandHeader}>
          <span className={styles.brandBadge}>Internal Access</span>
          <h1 className={styles.brandTitle}>FGR Operations CRM</h1>
          <p className={styles.brandSubtitle}>Staff and administrator portal sign-in</p>
        </div>

        {successNotice && (
          <div className={styles.successBanner} role="status">
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 2, color: "#16a34a" }} />
            <span>{successNotice}</span>
          </div>
        )}

        {timeoutNotice && (
          <div className={styles.warningBanner} role="status">
            <Clock size={18} style={{ flexShrink: 0, marginTop: 2, color: "#d97706" }} />
            <span>{timeoutNotice}</span>
          </div>
        )}

        {error && (
          <div className={styles.errorBanner} role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">
              Staff Email Address
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.inputIcon} aria-hidden="true" />
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="name@fgrcareer.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className={styles.label} htmlFor="password">
                Password
              </label>
              <Link
                href="/admin/reset-password"
                style={{ fontSize: "12px", color: "var(--color-primary, #16587b)", textDecoration: "none" }}
              >
                Forgot password?
              </Link>
            </div>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} aria-hidden="true" />
              <input
                id="password"
                type="password"
                className={styles.input}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to CRM</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className={styles.footerNote}>
          <p style={{ margin: "0 0 6px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <ShieldCheck size={14} color="var(--color-primary, #16587b)" />
            <span>Restricted Access: Authorized FGR Staff Only</span>
          </p>
          <p style={{ margin: 0 }}>
            Return to public portal:{" "}
            <Link href="/" className={styles.footerLink}>
              fgrcareer.org
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
