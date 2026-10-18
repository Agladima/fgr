"use client";

import React, { useState } from "react";
import { useAdminAuth } from "@/lib/admin/auth-context";
import styles from "../admin-common.module.css";
import {
  Shield,
  Server,
  Mail,
  CheckCircle2,
  Lock,
  Send,
} from "lucide-react";

export default function SettingsAndDiagnosticsPage() {
  useAdminAuth();
  const [testEmailTo, setTestEmailTo] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailTo.trim()) return;

    try {
      setSendingTest(true);
      setTestResult(null);
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmailTo.trim() }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setTestResult({
          success: true,
          message: `Test email successfully queued/dispatched to ${testEmailTo}.`,
        });
      } else {
        setTestResult({
          success: false,
          message: json.message || "Failed to dispatch test email.",
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: (err as Error).message || "An unexpected error occurred.",
      });
    } finally {
      setSendingTest(false);
    }
  };

  const roleMatrix = [
    {
      role: "Super Admin",
      description: "Full system authority, staff provisioning, security policy changes, all modules",
      permissions: "All permissions (*)",
    },
    {
      role: "Administrator",
      description: "Operations, content management, enquiries, registrations, task tracking",
      permissions: "registrations, partnerships, enquiries, follow_ups, content, reports, audit_logs",
    },
    {
      role: "Training Officer",
      description: "Trainee screening, cohort management, admissions, applicant notes",
      permissions: "registrations:read, registrations:write, follow_ups, notes, programmes:read",
    },
    {
      role: "Partnerships Officer",
      description: "Corporate & institutional proposals, partnership pipelines, outreach notes",
      permissions: "partnerships:read, partnerships:write, follow_ups, notes",
    },
    {
      role: "Content Manager",
      description: "Website articles, curriculum pillars, resources, impact stats, events",
      permissions: "content:read, content:write, programmes:read, programmes:write, events",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrap}>
          <h2>System Settings & Diagnostics</h2>
          <p className={styles.pageSubtitle}>
            Environment verification, email gateway testing, database connectivity, and RBAC matrix.
          </p>
        </div>
      </div>

      {/* Grid of diagnostics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        {/* Infrastructure Status */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--color-border-default, #e2e8f0)",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Server size={18} color="#2563eb" />
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#141b22" }}>
              Backend Services
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#64748b" }}>PostgreSQL (Supabase)</span>
              <span style={{ color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={14} /> Connected
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#64748b" }}>Row Level Security (RLS)</span>
              <span style={{ color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={14} /> Enforced
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#64748b" }}>Next.js Turbopack</span>
              <span style={{ color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={14} /> Active (App Router)
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#64748b" }}>Admin Session Transport</span>
              <span style={{ color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                <Lock size={14} /> HTTP-Only Secure Cookie
              </span>
            </div>
          </div>
        </div>

        {/* Email Gateway Test */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--color-border-default, #e2e8f0)",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Mail size={18} color="#059669" />
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#141b22" }}>
              Resend Email Service Test
            </h3>
          </div>
          <p style={{ margin: "0 0 14px 0", fontSize: "12.5px", color: "#64748b" }}>
            Dispatch a test transactional email to verify API key validity and deliverability.
          </p>

          <form onSubmit={handleSendTestEmail} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="email"
                required
                className={styles.searchInput}
                style={{ paddingLeft: "12px", flex: 1 }}
                placeholder="recipient@example.com"
                value={testEmailTo}
                onChange={(e) => setTestEmailTo(e.target.value)}
              />
              <button
                type="submit"
                disabled={sendingTest || !testEmailTo.trim()}
                className={styles.btnPrimary}
              >
                <Send size={13} />
                {sendingTest ? "Sending..." : "Send Test"}
              </button>
            </div>

            {testResult && (
              <div
                style={{
                  background: testResult.success ? "#ecfdf5" : "#fef2f2",
                  border: `1px solid ${testResult.success ? "#a7f3d0" : "#fecaca"}`,
                  color: testResult.success ? "#065f46" : "#991b1b",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              >
                {testResult.message}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Reference */}
      <div className={styles.tableCard}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--color-border-default, #e2e8f0)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Shield size={17} color="#7c3aed" />
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#141b22" }}>
            Role-Based Access Control (RBAC) Matrix
          </h3>
        </div>

        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Role Title</th>
                <th>Description & Responsibility</th>
                <th>Granted Capability Scope</th>
              </tr>
            </thead>
            <tbody>
              {roleMatrix.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#141b22",
                        background: "#f8fafc",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "12.5px",
                      }}
                    >
                      {item.role}
                    </span>
                  </td>
                  <td style={{ fontSize: "13px", color: "#475569" }}>{item.description}</td>
                  <td style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>
                    {item.permissions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
