"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "@/lib/admin/auth-context";
import styles from "../admin-common.module.css";
import {
  UserPlus,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface StaffMember {
  id: string;
  email: string;
  full_name: string;
  job_title?: string;
  role: "super_admin" | "admin" | "training_officer" | "partnerships_officer" | "content_manager";
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

export default function StaffManagementPage() {
  const { user } = useAdminAuth();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdStaffInfo, setCreatedStaffInfo] = useState<{
    email: string;
    fullName: string;
    password?: string;
    emailDelivered?: boolean;
  } | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    jobTitle: "",
    password: "",
    role: "admin" as StaffMember["role"],
  });

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/staff");
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Access restricted. Super Admin permissions required to manage staff.");
        }
        throw new Error("Failed to load staff profiles.");
      }

      const json = await res.json();
      if (json.success) {
        setStaffList(json.data.staff || []);
      } else {
        setError(json.message || "Failed to load staff.");
      }
    } catch (err) {
      setError((err as Error).message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStaff();
  }, [fetchStaff]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) return;

    try {
      setCreating(true);
      setCreateError(null);
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          jobTitle: form.jobTitle,
          password: form.password,
          temporaryPassword: form.password,
          role: form.role,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setModalOpen(false);
        setCreatedStaffInfo({
          email: form.email,
          fullName: form.fullName,
          password: json.data?.provisionalPassword || form.password,
          emailDelivered: json.data?.emailDelivered,
        });
        setForm({ fullName: "", email: "", jobTitle: "", password: "", role: "admin" });
        fetchStaff();
      } else {
        setCreateError(json.message || "Failed to provision staff member.");
      }
    } catch {
      setCreateError("Error communicating with server.");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (member: StaffMember) => {
    if (member.id === user?.id) {
      alert("Security policy: You cannot deactivate your own account.");
      return;
    }

    const nextActive = !member.is_active;
    const actionWord = nextActive ? "reactivate" : "deactivate";
    if (!confirm(`Are you sure you want to ${actionWord} ${member.full_name}?`)) return;

    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive }),
      });

      if (res.ok) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === member.id ? { ...s, is_active: nextActive } : s))
        );
      } else {
        const json = await res.json();
        alert(json.message || "Failed to update staff status.");
      }
    } catch {
      alert("Error updating status.");
    }
  };

  const handleChangeRole = async (member: StaffMember, nextRole: StaffMember["role"]) => {
    if (member.id === user?.id) {
      alert("You cannot change your own role.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });

      if (res.ok) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === member.id ? { ...s, role: nextRole } : s))
        );
      } else {
        const json = await res.json().catch(() => null);
        alert(json?.message || "Failed to update role.");
        // Re-fetch to reset select to current DB state
        fetchStaff();
      }
    } catch (err) {
      console.error(err);
      alert("Network error updating role.");
      fetchStaff();
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Never logged in";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrap}>
          <h2>Staff & Role Administration</h2>
          <p className={styles.pageSubtitle}>
            Provision authorized staff accounts, assign granular role permissions, and audit access state.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={() => setModalOpen(true)} className={styles.btnPrimary}>
            <UserPlus size={15} /> Add Staff Member
          </button>
        </div>
      </div>

      {createdStaffInfo && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            padding: "16px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: "#166534", fontSize: "14px" }}>
                Staff Account Successfully Provisioned for {createdStaffInfo.fullName}
              </strong>
              <p style={{ margin: "4px 0 0 0", color: "#15803d", fontSize: "13px", lineHeight: 1.5 }}>
                {createdStaffInfo.emailDelivered
                  ? `An onboarding email with login credentials and a direct password reset link was dispatched to ${createdStaffInfo.email}.`
                  : `Account created for ${createdStaffInfo.email}. Temporary password: `}
                {createdStaffInfo.password && (
                  <code style={{ background: "#dcfce7", color: "#14532d", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, marginLeft: 6 }}>
                    {createdStaffInfo.password}
                  </code>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setCreatedStaffInfo(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#166534" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error ? (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "16px 20px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AlertTriangle size={18} />
          {error}
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Job Title</th>
                  <th>Email</th>
                  <th>Permission Level</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      Loading staff accounts...
                    </td>
                  </tr>
                ) : staffList.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      No staff members registered.
                    </td>
                  </tr>
                ) : (
                  staffList.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#141b22" }}>
                          {m.full_name} {m.id === user?.id && <span style={{ fontSize: "11px", color: "#2563eb" }}>(You)</span>}
                        </div>
                      </td>
                      <td style={{ fontSize: "13px", color: "#334155" }}>
                        {m.job_title || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>—</span>}
                      </td>
                      <td style={{ fontSize: "13px", color: "#334155" }}>{m.email}</td>
                      <td>
                        <select
                          className={styles.selectInput}
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          value={m.role}
                          disabled={m.id === user?.id}
                          onChange={(e) =>
                            handleChangeRole(m, e.target.value as StaffMember["role"])
                          }
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Administrator</option>
                          <option value="training_officer">Training Officer</option>
                          <option value="partnerships_officer">Partnerships Officer</option>
                          <option value="content_manager">Content Manager</option>
                        </select>
                      </td>
                      <td>
                        {m.is_active ? (
                          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                            <span className={styles.badgeDot} /> Active
                          </span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeDanger}`}>
                            <span className={styles.badgeDot} /> Deactivated
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: "12px", color: "#64748b" }}>
                        {formatDate(m.last_login_at)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {m.id !== user?.id && (
                          <button
                            onClick={() => handleToggleActive(m)}
                            className={m.is_active ? styles.btnDanger : styles.btnSecondary}
                            style={{ padding: "5px 10px", fontSize: "11.5px" }}
                          >
                            {m.is_active ? "Deactivate" : "Reactivate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provision Staff Modal */}
      {modalOpen && (
        <div className={styles.drawerOverlay} onClick={() => setModalOpen(false)}>
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "#ffffff",
              borderRadius: "10px",
              margin: "auto",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#141b22" }}>
                Provision New Staff User
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>

            {createError && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                }}
              >
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateStaff} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Staff Full Name *
                </label>
                <input
                  type="text"
                  required
                  className={styles.searchInput}
                  style={{ paddingLeft: "12px" }}
                  placeholder="e.g. Samuel Adekunle"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  className={styles.searchInput}
                  style={{ paddingLeft: "12px" }}
                  placeholder="staff@fgrcareer.org"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Job Title / Position *
                </label>
                <input
                  type="text"
                  required
                  className={styles.searchInput}
                  style={{ paddingLeft: "12px" }}
                  placeholder="e.g. IT Manager, CEO, Programme Coordinator"
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className={styles.searchInput}
                  style={{ paddingLeft: "12px" }}
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Assigned Staff Role *
                </label>
                <select
                  className={styles.selectInput}
                  style={{ width: "100%" }}
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value as StaffMember["role"] })
                  }
                >
                  <option value="admin">Administrator (Operations & Content)</option>
                  <option value="training_officer">Training Officer (Registrations & Cohorts)</option>
                  <option value="partnerships_officer">Partnerships Officer (Organizations & Outreach)</option>
                  <option value="content_manager">Content Manager (Website, News, Resources)</option>
                  <option value="super_admin">Super Administrator (Full System Authority)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={styles.btnSecondary}
                >
                  Cancel
                </button>
                <button type="submit" disabled={creating} className={styles.btnPrimary}>
                  {creating ? "Creating..." : "Provision Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
