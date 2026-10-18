"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/lib/admin/auth-context";
import styles from "./admin-common.module.css";
import {
  GraduationCap,
  Inbox,
  Handshake,
  FileText,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
  PlusCircle,
  RefreshCw,
} from "lucide-react";

interface OverviewStats {
  registrations: { total: number; pending: number };
  contactEnquiries: { total: number; unread: number };
  partnerships: { total: number; new: number };
  content: {
    programmes: number;
    articles: number;
    events: number;
    resources: number;
  };
}

interface RecentRegistration {
  id: string;
  full_name: string;
  email: string;
  programme: string;
  status: string;
  created_at: string;
}

interface RecentEnquiry {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  status: string;
  created_at: string;
}

export default function AdminOverviewPage() {
  const { user } = useAdminAuth();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [recentRegistrations, setRecentRegistrations] = useState<RecentRegistration[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<RecentEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [statsRes, regsRes, enqRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/registrations?limit=5"),
        fetch("/api/admin/enquiries?limit=5"),
      ]);

      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        if (statsJson.success) setStats(statsJson.data);
      }

      if (regsRes.ok) {
        const regsJson = await regsRes.json();
        if (regsJson.success) {
          setRecentRegistrations(regsJson.data.registrations || []);
        }
      }

      if (enqRes.ok) {
        const enqJson = await enqRes.json();
        if (enqJson.success) {
          setRecentEnquiries(enqJson.data.enquiries || []);
        }
      }
    } catch (err) {
      setError("Failed to load dashboard data. Please check connection.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "unread":
      case "new":
        return (
          <span className={`${styles.badge} ${styles.badgePending}`}>
            <span className={styles.badgeDot} />
            {status}
          </span>
        );
      case "accepted":
      case "partnered":
      case "responded":
      case "shortlisted":
        return (
          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
            <span className={styles.badgeDot} />
            {status}
          </span>
        );
      case "under_review":
      case "reviewed":
      case "in_review":
        return (
          <span className={`${styles.badge} ${styles.badgeInfo}`}>
            <span className={styles.badgeDot} />
            {status}
          </span>
        );
      case "rejected":
      case "declined":
        return (
          <span className={`${styles.badge} ${styles.badgeDanger}`}>
            <span className={styles.badgeDot} />
            {status}
          </span>
        );
      default:
        return (
          <span className={`${styles.badge} ${styles.badgeNeutral}`}>
            <span className={styles.badgeDot} />
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
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
          <h2>Welcome back, {user?.fullName || "Staff Member"}</h2>
          <p className={styles.pageSubtitle}>
            Overview of training admissions, partnership proposals, messages, and website operations.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={handleRefresh}
            className={styles.btnSecondary}
            disabled={refreshing}
            title="Refresh metrics"
          >
            <RefreshCw size={15} className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <Link href="/admin/registrations" className={styles.btnPrimary}>
            <GraduationCap size={15} />
            Review Registrations
          </Link>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "13.5px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div
            className={styles.statIconWrap}
            style={{ background: "#eff6ff", color: "#2563eb" }}
          >
            <GraduationCap size={22} />
          </div>
          <div>
            <div className={styles.statValue}>
              {loading ? "..." : stats?.registrations.total || 0}
            </div>
            <div className={styles.statLabel}>
              Total Registrations ({stats?.registrations.pending || 0} pending)
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIconWrap}
            style={{ background: "#ecfdf5", color: "#059669" }}
          >
            <Inbox size={22} />
          </div>
          <div>
            <div className={styles.statValue}>
              {loading ? "..." : stats?.contactEnquiries.total || 0}
            </div>
            <div className={styles.statLabel}>
              Contact Inquiries ({stats?.contactEnquiries.unread || 0} unread)
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIconWrap}
            style={{ background: "#fef3c7", color: "#d97706" }}
          >
            <Handshake size={22} />
          </div>
          <div>
            <div className={styles.statValue}>
              {loading ? "..." : stats?.partnerships.total || 0}
            </div>
            <div className={styles.statLabel}>
              Partnership Inquiries ({stats?.partnerships.new || 0} new)
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIconWrap}
            style={{ background: "#f3e8ff", color: "#7c3aed" }}
          >
            <FileText size={22} />
          </div>
          <div>
            <div className={styles.statValue}>
              {loading
                ? "..."
                : (stats?.content.programmes || 0) +
                  (stats?.content.events || 0) +
                  (stats?.content.articles || 0) +
                  (stats?.content.resources || 0)}
            </div>
            <div className={styles.statLabel}>
              Published Content Units ({stats?.content.programmes || 0} programmes)
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Operational Tables */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        {/* Recent Registrations Card */}
        <div className={styles.tableCard}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--color-border-default, #e2e8f0)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#141b22" }}>
                Recent Training Registrations
              </h3>
              <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
                Latest prospective trainee submissions
              </p>
            </div>
            <Link
              href="/admin/registrations"
              style={{
                fontSize: "12.5px",
                fontWeight: 600,
                color: "var(--color-primary, #202833)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                textDecoration: "none",
              }}
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Programme</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                      {loading ? "Loading registrations..." : "No registrations recorded yet."}
                    </td>
                  </tr>
                ) : (
                  recentRegistrations.map((reg) => (
                    <tr key={reg.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#141b22" }}>{reg.full_name}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{reg.email}</div>
                      </td>
                      <td style={{ fontSize: "13px" }}>{reg.programme}</td>
                      <td>{getStatusBadge(reg.status)}</td>
                      <td style={{ fontSize: "12px", color: "#64748b" }}>
                        {formatDate(reg.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Contact Enquiries Card */}
        <div className={styles.tableCard}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--color-border-default, #e2e8f0)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#141b22" }}>
                Recent Contact Messages
              </h3>
              <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
                Inbound visitor questions & requests
              </p>
            </div>
            <Link
              href="/admin/enquiries"
              style={{
                fontSize: "12.5px",
                fontWeight: 600,
                color: "var(--color-primary, #202833)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                textDecoration: "none",
              }}
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {recentEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                      {loading ? "Loading inquiries..." : "No contact messages recorded yet."}
                    </td>
                  </tr>
                ) : (
                  recentEnquiries.map((enq) => (
                    <tr key={enq.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#141b22" }}>{enq.full_name}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{enq.email}</div>
                      </td>
                      <td style={{ fontSize: "13px" }}>{enq.subject}</td>
                      <td>{getStatusBadge(enq.status)}</td>
                      <td style={{ fontSize: "12px", color: "#64748b" }}>
                        {formatDate(enq.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Operational Quick Actions & Environment Health */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--color-border-default, #e2e8f0)",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 700, color: "#141b22" }}>
            Quick Actions
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link
              href="/admin/follow-ups"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "6px",
                background: "#f8fafc",
                color: "#334155",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <PlusCircle size={16} color="#0284c7" />
              Create Follow-Up Task
            </Link>
            <Link
              href="/admin/content"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "6px",
                background: "#f8fafc",
                color: "#334155",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <Calendar size={16} color="#7c3aed" />
              Manage Website Content & Events
            </Link>
            <Link
              href="/admin/reports"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "6px",
                background: "#f8fafc",
                color: "#334155",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <FileText size={16} color="#059669" />
              Export Registrations (CSV)
            </Link>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--color-border-default, #e2e8f0)",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 700, color: "#141b22" }}>
            System Infrastructure
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>PostgreSQL Database</span>
              <span style={{ color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={14} /> Connected
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Row Level Security (RLS)</span>
              <span style={{ color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={14} /> Active
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Email Notifications</span>
              <span style={{ color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={14} /> Resend Configured
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Current Role</span>
              <span style={{ textTransform: "capitalize", fontWeight: 700, color: "#141b22" }}>
                {user?.role.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
