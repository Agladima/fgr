"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import styles from "../../admin-common.module.css";
import { useAdminNotification } from "@/lib/admin/notification-context";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  X,
} from "lucide-react";

export interface ImpactMetricItem {
  id: string;
  metric_key: string;
  label: string;
  value: string;
  display_format?: string | null;
  description?: string | null;
  reporting_period?: string | null;
  order_index?: number;
  is_verified: boolean;
  status?: "published" | "draft" | "archived";
  updated_at?: string;
}

export default function ImpactMetricsCMSPage() {
  const { showError, showSuccess } = useAdminNotification();
  const [metrics, setMetrics] = useState<ImpactMetricItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    metric_key: "",
    label: "",
    value: "",
    display_format: "+",
    description: "",
    reporting_period: "2024 - 2026",
    order_index: 0,
    is_verified: true,
    status: "published" as "published" | "draft" | "archived",
  });

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/content/impact");
      if (!res.ok) throw new Error("Failed to load impact metrics.");
      const json = await res.json();
      if (json.success) {
        setMetrics(json.data || []);
      }
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      metric_key: "",
      label: "",
      value: "",
      display_format: "+",
      description: "Verified institutional count",
      reporting_period: "2024 - 2026",
      order_index: metrics.length + 1,
      is_verified: true,
      status: "published",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (m: ImpactMetricItem) => {
    setEditingId(m.id);
    setForm({
      metric_key: m.metric_key,
      label: m.label,
      value: m.value,
      display_format: m.display_format || "+",
      description: m.description || "",
      reporting_period: m.reporting_period || "2024 - 2026",
      order_index: m.order_index || 0,
      is_verified: Boolean(m.is_verified),
      status: m.status || "published",
    });
    setModalOpen(true);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      label: val,
      metric_key: !editingId
        ? val.toLowerCase().replace(/[^a-z0-9\s_]/g, "").replace(/\s+/g, "_").slice(0, 40)
        : prev.metric_key,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim() || !form.value.trim()) {
      showError("Please complete the metric label and value.");
      return;
    }

    try {
      setSaving(true);
      const payload: Record<string, unknown> = {
        metric_key: form.metric_key.trim(),
        label: form.label.trim(),
        value: form.value.trim(),
        display_format: form.display_format.trim() || null,
        description: form.description.trim() || null,
        reporting_period: form.reporting_period.trim() || null,
        order_index: Number(form.order_index) || 0,
        is_verified: form.is_verified,
        status: form.status,
      };

      if (editingId) {
        payload.id = editingId;
      }

      const res = await fetch("/api/admin/content/impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to save metric.");

      showSuccess(editingId ? "Impact metric updated successfully." : "Impact metric added successfully.");
      setModalOpen(false);
      fetchMetrics();
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const filteredMetrics = useMemo(() => {
    return metrics.filter((m) => {
      return (
        !search ||
        m.label.toLowerCase().includes(search.toLowerCase()) ||
        m.value.toLowerCase().includes(search.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [metrics, search]);

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrap}>
          <h2>Impact Metrics Management</h2>
          <p className={styles.pageSubtitle}>
            Configure verified figures and indicators displayed across the public website and reports.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/impact" target="_blank" className={styles.btnSecondary}>
            <ExternalLink size={15} /> View on Public Site
          </Link>
          <button onClick={handleOpenCreate} className={styles.btnPrimary}>
            <Plus size={16} /> Add Metric
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search metric label or value..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingBox}>Loading impact metrics...</div>
        ) : filteredMetrics.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateTitle}>No metrics configured</div>
            <p className={styles.emptyStateText}>Add verified metric outcomes to showcase on the website.</p>
            <button onClick={handleOpenCreate} className={styles.btnPrimary}>
              <Plus size={16} /> Add Metric
            </button>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "32%" }}>Metric Label & Key</th>
                  <th style={{ width: "20%" }}>Reported Value</th>
                  <th style={{ width: "20%" }}>Reporting Period</th>
                  <th style={{ width: "16%" }}>Verification Status</th>
                  <th style={{ width: "12%", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMetrics.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: "#141b22", fontSize: "14px" }}>
                          {m.label}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          <code>{m.metric_key}</code>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#16587b" }}>
                        {m.value}
                      </div>
                      {m.description && (
                        <div style={{ fontSize: "11.5px", color: "#64748b" }}>{m.description}</div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: "13px", color: "#475569" }}>
                        {m.reporting_period || "All-time"}
                      </span>
                    </td>
                    <td>
                      {m.is_verified ? (
                        <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                          <ShieldCheck size={12} /> Verified
                        </span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgePending}`}>
                          Unverified
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => handleOpenEdit(m)}
                        title="Edit Metric"
                        className={styles.btnSecondary}
                        style={{ padding: "6px 8px" }}
                      >
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer */}
      {modalOpen && (
        <div className={styles.drawerOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.drawer} style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>
                {editingId ? "Edit Impact Metric" : "Add Impact Metric"}
              </h3>
              <button onClick={() => setModalOpen(false)} className={styles.drawerClose}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className={styles.drawerBody}>
              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Metric Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. People Trained or Businesses Supported"
                  value={form.label}
                  onChange={handleLabelChange}
                  className={styles.searchInput}
                  style={{ paddingLeft: "12px" }}
                />
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Database Key *</label>
                  <input
                    type="text"
                    required
                    value={form.metric_key}
                    onChange={(e) => setForm({ ...form, metric_key: e.target.value })}
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                  />
                </div>

                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Reported Value *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2,500+ or 45"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                  />
                </div>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Reporting Period</label>
                  <input
                    type="text"
                    placeholder="e.g. 2024 - 2026"
                    value={form.reporting_period}
                    onChange={(e) => setForm({ ...form, reporting_period: e.target.value })}
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                  />
                </div>

                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Display Order</label>
                  <input
                    type="number"
                    value={form.order_index}
                    onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                  />
                </div>
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Metric Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional context or outcome verification source..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={styles.searchInput}
                  style={{ padding: "10px 12px", minHeight: "60px", resize: "vertical" }}
                />
              </div>

              <div className={styles.detailField}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
                  <input
                    type="checkbox"
                    checked={form.is_verified}
                    onChange={(e) => setForm({ ...form, is_verified: e.target.checked })}
                  />
                  Mark as officially verified organizational figure
                </label>
              </div>

              <div className={styles.drawerFooter} style={{ padding: 0, marginTop: "10px", background: "none" }}>
                <button type="button" onClick={() => setModalOpen(false)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={styles.btnPrimary}>
                  {saving ? "Saving..." : editingId ? "Update Metric" : "Save Metric"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
