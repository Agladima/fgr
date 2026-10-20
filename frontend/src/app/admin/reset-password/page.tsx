"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import styles from "../login/login.module.css";
import { Lock, AlertCircle, ArrowRight, Loader2, ShieldCheck, CheckCircle2, Mail, ArrowLeft } from "lucide-react";

export default function AdminResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Request mode (if user visits directly without a token)
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [requestEmail, setRequestEmail] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if the URL hash contains access_token or type=recovery
    const hash = window.location.hash;
    const search = window.location.search;

    const isRecovery =
      hash.includes("type=recovery") ||
      hash.includes("access_token=") ||
      search.includes("code=") ||
      search.includes("token=");

    setHasToken(isRecovery);

    // Initialize Supabase browser listener
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnon) {
      const supabase = createClient(supabaseUrl, supabaseAnon);
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
          setHasToken(true);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please ensure both fields are identical.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnon) {
        throw new Error("Supabase configuration is missing.");
      }

      const supabase = createClient(supabaseUrl, supabaseAnon);
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw new Error(updateError.message || "Failed to update password.");
      }

      // Sign out of recovery session so they log in fresh
      await supabase.auth.signOut();
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message || "Failed to update password. Your reset link may have expired.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!requestEmail.trim()) {
      setError("Please enter your staff email address.");
      return;
    }

    setRequesting(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnon) {
        throw new Error("Supabase configuration is missing.");
      }

      const supabase = createClient(supabaseUrl, supabaseAnon);
      const origin = window.location.origin;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(requestEmail.trim(), {
        redirectTo: `${origin}/admin/reset-password`,
      });

      if (resetError) {
        throw new Error(resetError.message);
      }

      setRequestSent(true);
    } catch (err) {
      setError((err as Error).message || "Could not send password reset email.");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.brandHeader}>
          <span className={styles.brandBadge}>Staff Security</span>
          <h1 className={styles.brandTitle}>
            {success ? "Password Updated" : hasToken === false && !requestSent ? "Reset Password" : "Set New Password"}
          </h1>
          <p className={styles.brandSubtitle}>
            {success
              ? "Your password has been changed successfully"
              : hasToken === false && !requestSent
              ? "Request a password reset link for your account"
              : "Choose a secure permanent password for your CRM account"}
          </p>
        </div>

        {error && (
          <div className={styles.errorBanner} role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#f0fdf4",
                border: "2px solid #bbf7d0",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <p style={{ fontSize: "14px", color: "#334155", lineHeight: 1.6, margin: "0 0 24px 0" }}>
              Your account password has been updated. You can now use your new password to sign into the CRM.
            </p>
            <Link
              href="/admin/login?reason=password_updated"
              className={styles.submitBtn}
              style={{ textDecoration: "none", display: "flex", justifyContent: "center" }}
            >
              <span>Proceed to CRM Sign In</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : requestSent ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#f0fdf4",
                border: "2px solid #bbf7d0",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
              }}
            >
              <Mail size={28} />
            </div>
            <p style={{ fontSize: "14px", color: "#334155", lineHeight: 1.6, margin: "0 0 16px 0" }}>
              If a staff account exists for <strong>{requestEmail}</strong>, an email containing a password reset link has been dispatched.
            </p>
            <Link
              href="/admin/login"
              style={{
                fontSize: "13.5px",
                color: "var(--color-primary, #16587b)",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <ArrowLeft size={14} />
              <span>Return to Login</span>
            </Link>
          </div>
        ) : hasToken === false ? (
          // Request Reset Form
          <form onSubmit={handleRequestReset} className={styles.form} noValidate>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="request-email">
                Your Staff Email Address
              </label>
              <div className={styles.inputWrapper}>
                <Mail size={16} className={styles.inputIcon} aria-hidden="true" />
                <input
                  id="request-email"
                  type="email"
                  className={styles.input}
                  placeholder="name@fgrcareer.org"
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={requesting}
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={requesting}>
              {requesting ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  <span>Sending reset link...</span>
                </>
              ) : (
                <>
                  <span>Send Password Reset Link</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div style={{ textAlign: "center", marginTop: 4 }}>
              <Link
                href="/admin/login"
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <ArrowLeft size={13} />
                <span>Back to sign in</span>
              </Link>
            </div>
          </form>
        ) : (
          // Set New Password Form (Arrived from email link)
          <form onSubmit={handleUpdatePassword} className={styles.form} noValidate>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="new-password">
                New Password (minimum 8 characters)
              </label>
              <div className={styles.inputWrapper}>
                <Lock size={16} className={styles.inputIcon} aria-hidden="true" />
                <input
                  id="new-password"
                  type="password"
                  className={styles.input}
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="confirm-password">
                Confirm New Password
              </label>
              <div className={styles.inputWrapper}>
                <Lock size={16} className={styles.inputIcon} aria-hidden="true" />
                <input
                  id="confirm-password"
                  type="password"
                  className={styles.input}
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  <span>Saving new password...</span>
                </>
              ) : (
                <>
                  <span>Save Password & Continue</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <div className={styles.footerNote}>
          <p style={{ margin: "0 0 6px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <ShieldCheck size={14} color="var(--color-primary, #16587b)" />
            <span>Encrypted internal staff access</span>
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
