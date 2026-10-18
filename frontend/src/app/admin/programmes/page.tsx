"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "../admin-common.module.css";
import {
  Plus,
  Edit2,
  Trash2,
  X,
} from "lucide-react";

interface Programme {
  id: string;
  slug: string;
  title: string;
  pillar_number: number;
  pillar_name: string;
  summary: string;
  description?: string;
  duration?: string;
  target_audience?: string;
  status: "draft" | "published" | "archived";
  created_at: string;
}

export default function ProgrammesManagementPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    pillar_number: 1,
    pillar_name: "",
    summary: "",
    description: "",
    duration: "",
    target_audience: "",
    status: "published" as "draft" | "published" | "archived",
  });

  const fetchProgrammes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/content/programmes");
      if (!res.ok) throw new Error("Failed to load programmes.");

      const json = await res.json();
      if (json.success) {
        setProgrammes(json.data || []);
      } else {
        setError(json.message || "Failed to load programmes.");
      }
    } catch (err) {
      setError((err as Error).message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProgrammes();
  }, [fetchProgrammes]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      title: "",
      slug: "",
      pillar_number: programmes.length + 1,
      pillar_name: "",
      summary: "",
      description: "",
      duration: "6 Weeks",
      target_audience: "Youth and early-career jobseekers",
      status: "published",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Programme) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      pillar_number: p.pillar_number,
      pillar_name: p.pillar_name,
      summary: p.summary,
      description: p.description || "",
      duration: p.duration || "",
      target_audience: p.target_audience || "",
      status: p.status,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.summary) {
      alert("Please fill in Title, Slug, and Summary.");
      return;
    }

    try {
      setSaving(true);
      const url = editingId
        ? `/api/admin/content/programmes/${editingId}`
        : `/api/admin/content/programmes`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setModalOpen(false);
        fetchProgrammes();
      } else {
        alert(json.message || "Failed to save programme.");
      }
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Programme) => {
    if (!confirm(`Are you sure you want to delete "${p.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/content/programmes/${p.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProgrammes((prev) => prev.filter((item) => item.id !== p.id));
      } else {
        alert("Failed to delete programme.");
      }
    } catch {
    }
  };

  const handleToggleStatus = async (p: Programme) => {
    const nextStatus = p.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/admin/content/programmes/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setProgrammes((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, status: nextStatus } : item))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrap}>
          <h2>Programmes Management</h2>
          <p className={styles.pageSubtitle}>
            Publish and update strategic curriculum tracks, pillars, course duration, and target audience descriptions.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={handleOpenCreate} className={styles.btnPrimary}>
            <Plus size={15} /> Add Programme
          </button>
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

      {/* Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pillar</th>
                <th>Programme Title</th>
                <th>Target Audience</th>
                <th>Duration</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    Loading programmes...
                  </td>
                </tr>
              ) : programmes.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    No programmes created yet.
                  </td>
                </tr>
              ) : (
                programmes.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span
                        style={{
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: 700,
                          fontSize: "12px",
                        }}
                      >
                        Pillar {p.pillar_number}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#141b22" }}>{p.title}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>/{p.slug}</div>
                    </td>
                    <td style={{ fontSize: "13px", color: "#334155" }}>
                      {p.target_audience || "General"}
                    </td>
                    <td style={{ fontSize: "13px", color: "#334155" }}>
                      {p.duration || "Flexible"}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(p)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                        }}
                        title="Click to toggle publish status"
                      >
                        {p.status === "published" ? (
                          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                            <span className={styles.badgeDot} /> Published
                          </span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                            <span className={styles.badgeDot} /> Draft
                          </span>
                        )}
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className={styles.btnSecondary}
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                          title="Edit programme"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className={styles.btnDanger}
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                          title="Delete programme"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className={styles.drawerOverlay} onClick={() => setModalOpen(false)}>
          <div
            style={{
              width: "100%",
              maxWidth: "600px",
              background: "#ffffff",
              borderRadius: "10px",
              margin: "auto",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#141b22" }}>
                {editingId ? "Edit Programme" : "Add New Programme"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Programme Title *
                  </label>
                  <input
                    type="text"
                    required
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                    placeholder="e.g. Employability & Workplace Readiness"
                    value={form.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                      setForm({
                        ...form,
                        title,
                        slug: editingId ? form.slug : slug,
                      });
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Pillar Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                    value={form.pillar_number}
                    onChange={(e) => setForm({ ...form, pillar_number: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Pillar Category Name
                  </label>
                  <input
                    type="text"
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                    placeholder="e.g. Career Transition & Soft Skills"
                    value={form.pillar_name}
                    onChange={(e) => setForm({ ...form, pillar_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Summary / Overview *
                </label>
                <textarea
                  rows={2}
                  required
                  className={styles.searchInput}
                  style={{ paddingLeft: "12px", height: "auto" }}
                  placeholder="Short introductory summary for cards and search snippets..."
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Duration
                  </label>
                  <input
                    type="text"
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                    placeholder="e.g. 6 Weeks, 40 Hours"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Target Audience
                  </label>
                  <input
                    type="text"
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                    placeholder="e.g. Graduates, professionals"
                    value={form.target_audience}
                    onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Publishing Status
                </label>
                <select
                  className={styles.selectInput}
                  style={{ width: "100%" }}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Programme["status"] })}
                >
                  <option value="published">Published (Visible on website)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="archived">Archived</option>
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
                <button type="submit" disabled={saving} className={styles.btnPrimary}>
                  {saving ? "Saving..." : editingId ? "Update Programme" : "Publish Programme"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
