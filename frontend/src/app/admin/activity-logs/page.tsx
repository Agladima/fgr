"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "../admin-common.module.css";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  actor_email: string;
  actor_role: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [actionFilter, setActionFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected Log Details Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "25",
      });

      if (actionFilter !== "all") params.append("action", actionFilter);
      if (resourceFilter !== "all") params.append("resource", resourceFilter);

      const res = await fetch(`/api/admin/activity-logs?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 403) throw new Error("Access restricted to Admins and Super Admins.");
        throw new Error("Failed to load audit logs.");
      }

      const json = await res.json();
      if (json.success) {
        setLogs(json.data.logs || []);
        setTotalPages(json.data.pagination.totalPages || 1);
        setTotalCount(json.data.pagination.total || 0);
      } else {
        setError(json.message || "Failed to load activity logs.");
      }
    } catch (err) {
      setError((err as Error).message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, actionFilter, resourceFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, [fetchLogs]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getActionBadgeClass = (action: string) => {
    if (action.includes("login") || action.includes("auth")) {
      return styles.badgeInfo;
    }
    if (action.includes("delete")) {
      return styles.badgeDanger;
    }
    if (action.includes("update") || action.includes("patch")) {
      return styles.badgePending;
    }
    return styles.badgeSuccess;
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrap}>
          <h2>Activity & Audit Logs</h2>
          <p className={styles.pageSubtitle}>
            Immutable audit record of all administrative actions, staff sign-ins, record edits, and status changes.
          </p>
        </div>
        <div className={styles.headerActions}>
          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
            {totalCount} recorded event{totalCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748b" }}>
          <Filter size={15} />
          <strong>Filter Events:</strong>
        </div>

        <div className={styles.filterControls}>
          <select
            className={styles.selectInput}
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Actions</option>
            <option value="auth.login">Staff Logins (auth.login)</option>
            <option value="auth.logout">Staff Logouts (auth.logout)</option>
            <option value="registration.status_update">Registration Status Updates</option>
            <option value="partnership.status_update">Partnership Status Updates</option>
            <option value="enquiry.status_update">Message Status Updates</option>
            <option value="note.create">Internal Notes Added</option>
            <option value="staff.create">Staff Created</option>
          </select>

          <select
            className={styles.selectInput}
            value={resourceFilter}
            onChange={(e) => {
              setResourceFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Resources</option>
            <option value="session">Authentication Sessions</option>
            <option value="registration">Training Registrations</option>
            <option value="partnership">Partnership Proposals</option>
            <option value="enquiry">Contact Messages</option>
            <option value="staff">Staff Accounts</option>
            <option value="programmes">Programmes</option>
            <option value="events">Events</option>
          </select>
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
          }}
        >
          {error}
        </div>
      )}

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Staff Actor</th>
                <th>Action</th>
                <th>Resource Target</th>
                <th>Client IP</th>
                <th style={{ textAlign: "right" }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    No audit log records match the current filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: "12.5px", color: "#475569", whiteSpace: "nowrap" }}>
                      {formatDate(log.created_at)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#141b22", fontSize: "13px" }}>
                        {log.actor_email}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#64748b", textTransform: "capitalize" }}>
                        {log.actor_role.replace("_", " ")}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${getActionBadgeClass(log.action)}`}>
                        <span className={styles.badgeDot} />
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: "13px", color: "#334155" }}>
                      {log.resource_type ? (
                        <span>
                          <strong>{log.resource_type}</strong>
                          {log.resource_id && (
                            <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>
                              {log.resource_id.slice(0, 8)}...
                            </span>
                          )}
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>
                      {log.ip_address || "internal"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {log.details && Object.keys(log.details).length > 0 ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className={styles.btnSecondary}
                          style={{ padding: "4px 8px", fontSize: "11.5px" }}
                        >
                          <Info size={12} /> View
                        </button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#cbd5e1" }}>None</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--color-border-default, #e2e8f0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f8fafc",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          <div>
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className={styles.btnSecondary}
              style={{ padding: "6px 12px" }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className={styles.btnSecondary}
              style={{ padding: "6px 12px" }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedLog(null)}>
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#ffffff",
              borderRadius: "10px",
              margin: "auto",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#141b22" }}>
                Audit Payload Details
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: "13px", color: "#475569" }}>
              Action: <strong>{selectedLog.action}</strong> by <strong>{selectedLog.actor_email}</strong> at{" "}
              {formatDate(selectedLog.created_at)}
            </div>

            <pre
              style={{
                background: "#0f172a",
                color: "#38bdf8",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "monospace",
                overflowX: "auto",
                maxHeight: "300px",
                margin: 0,
              }}
            >
              {JSON.stringify(selectedLog.details, null, 2)}
            </pre>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setSelectedLog(null)} className={styles.btnSecondary}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
