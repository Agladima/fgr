"use client";

import React, { useEffect, useState } from "react";
import styles from "../admin-common.module.css";
import { useAdminNotification } from "@/lib/admin/notification-context";
import {
  Download,
  FileSpreadsheet,
} from "lucide-react";

interface StatsData {
  registrations: { total: number; pending: number };
  contactEnquiries: { total: number; unread: number };
  partnerships: { total: number; new: number };
  content: { programmes: number; articles: number; events: number; resources: number };
}

export default function ReportsAndExportPage() {
  const { showError } = useAdminNotification();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setStats(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, []);

  // CSV Generator Helper
  const exportToCSV = async (type: "registrations" | "partnerships" | "enquiries") => {
    try {
      setExporting(type);
      const res = await fetch(`/api/admin/${type}?limit=1000`);
      if (!res.ok) throw new Error(`Failed to fetch ${type} for export.`);

      const json = await res.json();
      const records = json.data[type] || [];

      if (records.length === 0) {
        showError("No records available to export.");
        return;
      }

      // Extract keys and format CSV
      const headers = Object.keys(records[0]).filter(
        (key) => typeof records[0][key] !== "object" || records[0][key] === null
      );

      const csvRows = [
        headers.join(","),
        ...records.map((row: Record<string, unknown>) =>
          headers
            .map((h) => {
              const val = row[h];
              if (val === null || val === undefined) return '""';
              const escaped = String(val).replace(/"/g, '""');
              return `"${escaped}"`;
            })
            .join(",")
        ),
      ];

      const csvString = csvRows.join("\r\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fgr_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      showError((err as Error).message || "Export error.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrap}>
          <h2>Reports & Analytics</h2>
          <p className={styles.pageSubtitle}>
            Aggregated metrics, admissions breakdown, and on-demand spreadsheet (CSV) exports.
          </p>
        </div>
      </div>

      {/* KPI Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div>
            <div className={styles.statValue}>
              {loading ? "..." : stats?.registrations.total || 0}
            </div>
            <div className={styles.statLabel}>Total Training Registrations</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div>
            <div className={styles.statValue}>
              {loading ? "..." : stats?.partnerships.total || 0}
            </div>
            <div className={styles.statLabel}>Total Partnership Proposals</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div>
            <div className={styles.statValue}>
              {loading ? "..." : stats?.contactEnquiries.total || 0}
            </div>
            <div className={styles.statLabel}>Total Contact Enquiries</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div>
            <div className={styles.statValue}>
              {loading
                ? "..."
                : (stats?.content.programmes || 0) + (stats?.content.articles || 0)}
            </div>
            <div className={styles.statLabel}>Website Core Units</div>
          </div>
        </div>
      </div>

      {/* Export Hub Card */}
      <div className={styles.tableCard} style={{ marginBottom: "24px" }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--color-border-default, #e2e8f0)",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#141b22" }}>
            Operational Data Exports
          </h3>
          <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
            Download live records into CSV formats compatible with Excel, Google Sheets, or institutional reporting software.
          </p>
        </div>

        <div
          style={{
            padding: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Registrations Export */}
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "18px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "14px",
              background: "#fafbfd",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <FileSpreadsheet size={18} color="#2563eb" />
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#141b22" }}>
                  Training Applicants
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
                Full candidate details, screening status, contact numbers, education level, and timestamps.
              </p>
            </div>
            <button
              onClick={() => exportToCSV("registrations")}
              disabled={exporting !== null}
              className={styles.btnPrimary}
            >
              <Download size={14} />
              {exporting === "registrations" ? "Generating CSV..." : "Export Registrations (CSV)"}
            </button>
          </div>

          {/* Partnerships Export */}
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "18px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "14px",
              background: "#fafbfd",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <FileSpreadsheet size={18} color="#d97706" />
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#141b22" }}>
                  Partnership Inquiries
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
                Organization names, sectors, lead representative emails, proposal message, and collaboration tags.
              </p>
            </div>
            <button
              onClick={() => exportToCSV("partnerships")}
              disabled={exporting !== null}
              className={styles.btnSecondary}
            >
              <Download size={14} />
              {exporting === "partnerships" ? "Generating CSV..." : "Export Partnerships (CSV)"}
            </button>
          </div>

          {/* Enquiries Export */}
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "18px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "14px",
              background: "#fafbfd",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <FileSpreadsheet size={18} color="#059669" />
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#141b22" }}>
                  Contact Messages
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
                General inquiries, questions, sender credentials, response timestamps, and review state.
              </p>
            </div>
            <button
              onClick={() => exportToCSV("enquiries")}
              disabled={exporting !== null}
              className={styles.btnSecondary}
            >
              <Download size={14} />
              {exporting === "enquiries" ? "Generating CSV..." : "Export Messages (CSV)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
