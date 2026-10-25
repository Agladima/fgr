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
  XCircle,
  ExternalLink,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  X,
  AlertCircle,
  CheckSquare,
} from "lucide-react";

export interface Programme {
  id: string;
  slug: string;
  title: string;
  pillar_number: number;
  pillar_name: string;
  summary: string;
  description?: string | null;
  areas?: string[] | null;
  outcomes?: string[] | null;
  target_audience?: string | null;
  duration?: string | null;
  delivery_modalities?: string[] | null;
  application_open_date?: string | null;
  application_close_date?: string | null;
  eligibility?: string | null;
  application_instructions?: string | null;
  registration_url?: string | null;
  order_index?: number;
  status: "draft" | "published" | "open" | "closing_soon" | "closed" | "completed" | "archived";
  created_at: string;
  updated_at?: string;
}

const PILLARS = [
  { num: 1, name: "PILLAR 01: Employability & Career Development" },
  { num: 2, name: "PILLAR 02: Technical & Vocational Skills" },
  { num: 3, name: "PILLAR 03: Digital Skills & Innovation" },
  { num: 4, name: "PILLAR 04: Entrepreneurship & Business Development" },
  { num: 5, name: "PILLAR 05: Leadership & Professional Development" },
];

export default function ProgrammesCMSPage() {
  const { showError, showSuccess } = useAdminNotification();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal & Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewProgramme, setPreviewProgramme] = useState<Programme | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    pillar_number: 1,
    pillar_name: "PILLAR 01: Employability & Career Development",
    summary: "",
    description: "",
    target_audience: "Youth, graduates, and early-career jobseekers",
    duration: "6 Weeks",
    areasText: "",
    outcomesText: "",
    modalitiesText: "Classroom training, Practical sessions, Mentorship",
    application_open_date: "",
    application_close_date: "",
    eligibility: "",
    application_instructions: "Complete the online application or visit Calabar Hub.",
    registration_url: "/register",
    status: "published" as Programme["status"],
  });

  const fetchProgrammes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/content/programmes");
      if (!res.ok) throw new Error("Failed to load programmes.");
      const json = await res.json();
      if (json.success) {
        setProgrammes(json.data || []);
      }
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchProgrammes();
  }, [fetchProgrammes]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      title: "",
      slug: "",
      pillar_number: programmes.length + 1,
      pillar_name: PILLARS[0].name,
      summary: "",
      description: "",
      target_audience: "Youth, graduates, and working professionals",
      duration: "6 - 8 Weeks",
      areasText: "Career guidance, CV preparation, Interview readiness, Corporate ethics",
      outcomesText: "Verified certificate of completion, Direct employer referrals, Portfolio review",
      modalitiesText: "Classroom sessions, Workshops, Online learning, Mentorship",
      application_open_date: new Date().toISOString().slice(0, 10),
      application_close_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      eligibility: "Open to motivated youth and adult learners committed to full attendance.",
      application_instructions: "Fill out the registration form before the deadline.",
      registration_url: "/register",
      status: "open",
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
      target_audience: p.target_audience || "",
      duration: p.duration || "",
      areasText: (p.areas || []).join(", "),
      outcomesText: (p.outcomes || []).join(", "),
      modalitiesText: (p.delivery_modalities || []).join(", "),
      application_open_date: p.application_open_date ? p.application_open_date.slice(0, 10) : "",
      application_close_date: p.application_close_date ? p.application_close_date.slice(0, 10) : "",
      eligibility: p.eligibility || "",
      application_instructions: p.application_instructions || "",
      registration_url: p.registration_url || "",
      status: p.status,
    });
    setModalOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: !editingId ? val.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80) : prev.slug,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim()) {
      showError("Please complete the required title and summary fields.");
      return;
    }

    try {
      setSaving(true);
      const areas = form.areasText.split(",").map((s) => s.trim()).filter(Boolean);
      const outcomes = form.outcomesText.split(",").map((s) => s.trim()).filter(Boolean);
      const delivery_modalities = form.modalitiesText.split(",").map((s) => s.trim()).filter(Boolean);

      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        pillar_number: Number(form.pillar_number) || 1,
        pillar_name: form.pillar_name,
        summary: form.summary.trim(),
        description: form.description.trim() || null,
        target_audience: form.target_audience.trim() || null,
        duration: form.duration.trim() || null,
        areas,
        outcomes,
        delivery_modalities,
        application_open_date: form.application_open_date ? new Date(form.application_open_date).toISOString() : null,
        application_close_date: form.application_close_date ? new Date(form.application_close_date).toISOString() : null,
        eligibility: form.eligibility.trim() || null,
        application_instructions: form.application_instructions.trim() || null,
        registration_url: form.registration_url.trim() || null,
        status: form.status,
      };

      if (editingId) {
        payload.id = editingId;
      }

      const res = await fetch("/api/admin/content/programmes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to save programme.");
      }

      showSuccess(editingId ? "Programme updated successfully." : "Programme created successfully.");
      setModalOpen(false);
      fetchProgrammes();
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatus = async (p: Programme, newStatus: Programme["status"]) => {
    try {
      const res = await fetch(`/api/admin/content/programmes/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to update status.");

      showSuccess(`Programme status changed to "${newStatus}".`);
      fetchProgrammes();
    } catch (err) {
      showError((err as Error).message);
    }
  };

  const filteredProgrammes = useMemo(() => {
    return programmes.filter((p) => {
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.summary.toLowerCase().includes(search.toLowerCase()) ||
        p.pillar_name.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [programmes, search, statusFilter]);

  const getStatusBadge = (status: Programme["status"]) => {
    switch (status) {
      case "open":
      case "published":
        return <span className={`${styles.badge} ${styles.badgeSuccess}`}><span className={styles.badgeDot} /> {status === "open" ? "Applications Open" : "Published"}</span>;
      case "closing_soon":
        return <span className={`${styles.badge} ${styles.badgePending}`}><span className={styles.badgeDot} /> Closing Soon</span>;
      case "closed":
        return <span className={`${styles.badge} ${styles.badgeDanger}`}><span className={styles.badgeDot} /> Applications Closed</span>;
      case "completed":
        return <span className={`${styles.badge} ${styles.badgeInfo}`}><span className={styles.badgeDot} /> Cohort Completed</span>;
      case "draft":
        return <span className={`${styles.badge} ${styles.badgeNeutral}`}><span className={styles.badgeDot} /> Draft</span>;
      case "archived":
      default:
        return <span className={`${styles.badge} ${styles.badgeNeutral}`}><span className={styles.badgeDot} /> Archived</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrap}>
          <h2>Programmes Management</h2>
          <p className={styles.pageSubtitle}>
            Manage strategic pillars, application openings, deadlines, and cohort delivery statuses.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/programmes" target="_blank" className={styles.btnSecondary}>
            <ExternalLink size={15} /> View Public Page
          </Link>
          <button onClick={handleOpenCreate} className={styles.btnPrimary}>
            <Plus size={16} /> Create Programme
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#e0f2fe", color: "#0369a1" }}>
            <BookOpen size={20} />
          </div>
          <div>
            <div className={styles.statValue}>{programmes.length}</div>
            <div className={styles.statLabel}>Total Programmes</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#dcfce7", color: "#166534" }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className={styles.statValue}>
              {programmes.filter((p) => p.status === "open" || p.status === "published" || p.status === "closing_soon").length}
            </div>
            <div className={styles.statLabel}>Active Public Programmes</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#fee2e2", color: "#991b1b" }}>
            <XCircle size={20} />
          </div>
          <div>
            <div className={styles.statValue}>{programmes.filter((p) => p.status === "closed").length}</div>
            <div className={styles.statLabel}>Closed Registrations</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#f1f5f9", color: "#475569" }}>
            <Archive size={20} />
          </div>
          <div>
            <div className={styles.statValue}>{programmes.filter((p) => p.status === "archived").length}</div>
            <div className={styles.statLabel}>Archived Programmes</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by programme title or pillar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterControls}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.selectInput}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open for Applications</option>
            <option value="closing_soon">Closing Soon</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
            <option value="completed">Completed</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingBox}>Loading programmes...</div>
        ) : filteredProgrammes.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateTitle}>No programmes found</div>
            <p className={styles.emptyStateText}>Create a new programme or adjust your filters.</p>
            <button onClick={handleOpenCreate} className={styles.btnPrimary}>
              <Plus size={16} /> Create Programme
            </button>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "36%" }}>Programme & Pillar</th>
                  <th style={{ width: "16%" }}>Duration / Modality</th>
                  <th style={{ width: "16%" }}>Application Deadline</th>
                  <th style={{ width: "14%" }}>Status</th>
                  <th style={{ width: "18%", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProgrammes.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#16587b", textTransform: "uppercase" }}>
                          {p.pillar_name}
                        </span>
                        <div style={{ fontWeight: 700, color: "#141b22", fontSize: "14px" }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: 2, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {p.summary}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>{p.duration || "Self-Paced"}</div>
                      <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                        {(p.delivery_modalities || []).slice(0, 2).join(", ")}
                      </div>
                    </td>
                    <td>
                      {p.application_close_date ? (
                        <div style={{ fontSize: "12.5px", color: "#475569" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Calendar size={13} style={{ color: "#94a3b8" }} />
                            {new Date(p.application_close_date).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>Ongoing / Rolling</span>
                      )}
                    </td>
                    <td>{getStatusBadge(p.status)}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <button
                          onClick={() => {
                            setPreviewProgramme(p);
                            setPreviewOpen(true);
                          }}
                          title="Preview"
                          className={styles.btnSecondary}
                          style={{ padding: "6px 8px" }}
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Programme"
                          className={styles.btnSecondary}
                          style={{ padding: "6px 8px" }}
                        >
                          <Edit2 size={14} />
                        </button>

                        {p.status === "open" ? (
                          <button
                            onClick={() => handleQuickStatus(p, "closed")}
                            title="Close Registration"
                            className={styles.btnSecondary}
                            style={{ padding: "6px 8px", color: "#dc2626" }}
                          >
                            <XCircle size={14} />
                          </button>
                        ) : p.status === "closed" ? (
                          <button
                            onClick={() => handleQuickStatus(p, "open")}
                            title="Re-open Registration"
                            className={styles.btnSecondary}
                            style={{ padding: "6px 8px", color: "#16a34a" }}
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        ) : null}

                        {p.status === "archived" ? (
                          <button
                            onClick={() => handleQuickStatus(p, "published")}
                            title="Restore Programme"
                            className={styles.btnSecondary}
                            style={{ padding: "6px 8px", color: "#0284c7" }}
                          >
                            <RotateCcw size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickStatus(p, "archived")}
                            title="Archive Programme"
                            className={styles.btnSecondary}
                            style={{ padding: "6px 8px", color: "#64748b" }}
                          >
                            <Archive size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Drawer */}
      {modalOpen && (
        <div className={styles.drawerOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.drawer} style={{ maxWidth: "620px" }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>
                {editingId ? "Edit Programme" : "Create Programme"}
              </h3>
              <button onClick={() => setModalOpen(false)} className={styles.drawerClose}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className={styles.drawerBody}>
              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Programme Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Employability & Workplace Readiness"
                  value={form.title}
                  onChange={handleTitleChange}
                  className={styles.searchInput}
                  style={{ paddingLeft: "12px" }}
                />
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                  />
                </div>

                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Pillar *</label>
                  <select
                    value={form.pillar_name}
                    onChange={(e) => {
                      const sel = PILLARS.find((p) => p.name === e.target.value);
                      setForm({
                        ...form,
                        pillar_name: e.target.value,
                        pillar_number: sel ? sel.num : 1,
                      });
                    }}
                    className={styles.selectInput}
                  >
                    {PILLARS.map((p) => (
                      <option key={p.num} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Summary (Shown on cards & overview) *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="High-level summary of the training stream..."
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className={styles.searchInput}
                  style={{ padding: "10px 12px", minHeight: "60px", resize: "vertical" }}
                />
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Full Description</label>
                <textarea
                  rows={4}
                  placeholder="Comprehensive curriculum outline, objectives, and competencies..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={styles.searchInput}
                  style={{ padding: "10px 12px", minHeight: "90px", resize: "vertical" }}
                />
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Target Audience</label>
                  <input
                    type="text"
                    placeholder="e.g. Youth, undergraduates, career changers"
                    value={form.target_audience}
                    onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                  />
                </div>

                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 6 Weeks (Hybrid)"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                  />
                </div>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Application Open Date</label>
                  <input
                    type="date"
                    value={form.application_open_date}
                    onChange={(e) => setForm({ ...form, application_open_date: e.target.value })}
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                  />
                </div>

                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Application Close Date</label>
                  <input
                    type="date"
                    value={form.application_close_date}
                    onChange={(e) => setForm({ ...form, application_close_date: e.target.value })}
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                  />
                </div>
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Key Training Areas (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Career planning, Interview readiness, Workplace ethics"
                  value={form.areasText}
                  onChange={(e) => setForm({ ...form, areasText: e.target.value })}
                  className={styles.searchInput}
                  style={{ paddingLeft: "12px" }}
                />
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Expected Outcomes (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Recognized certificate, Direct partner referrals"
                  value={form.outcomesText}
                  onChange={(e) => setForm({ ...form, outcomesText: e.target.value })}
                  className={styles.searchInput}
                  style={{ paddingLeft: "12px" }}
                />
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Registration URL</label>
                  <input
                    type="text"
                    placeholder="/register or external link"
                    value={form.registration_url}
                    onChange={(e) => setForm({ ...form, registration_url: e.target.value })}
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                  />
                </div>

                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Programme["status"] })}
                    className={styles.selectInput}
                  >
                    <option value="open">Open (Accepting Applications)</option>
                    <option value="closing_soon">Closing Soon</option>
                    <option value="published">Published</option>
                    <option value="closed">Closed (Applications Disabled)</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft (Private)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className={styles.drawerFooter} style={{ padding: 0, marginTop: "10px", background: "none" }}>
                <button type="button" onClick={() => setModalOpen(false)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={styles.btnPrimary}>
                  {saving ? "Saving..." : editingId ? "Update Programme" : "Create Programme"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewOpen && previewProgramme && (
        <div className={styles.drawerOverlay} onClick={() => setPreviewOpen(false)}>
          <div className={styles.drawer} style={{ maxWidth: "640px" }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>Programme Preview</h3>
              <button onClick={() => setPreviewOpen(false)} className={styles.drawerClose}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.drawerBody}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#16587b", textTransform: "uppercase" }}>
                {previewProgramme.pillar_name}
              </span>
              <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "8px 0", color: "#141b22" }}>
                {previewProgramme.title}
              </h1>
              <div style={{ marginBottom: 16 }}>{getStatusBadge(previewProgramme.status)}</div>

              <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.6 }}>
                {previewProgramme.summary}
              </p>

              {previewProgramme.description && (
                <div style={{ marginTop: 16, fontSize: "14px", color: "#334155", lineHeight: 1.6 }}>
                  {previewProgramme.description}
                </div>
              )}

              {previewProgramme.areas && previewProgramme.areas.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", color: "#16587b", marginBottom: 8 }}>
                    Programme Areas
                  </h4>
                  <ul style={{ paddingLeft: 20, margin: 0, fontSize: "13.5px", color: "#334155", lineHeight: 1.6 }}>
                    {previewProgramme.areas.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ marginTop: 24, padding: "14px 16px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#141b22" }}>
                  Registration Link:{" "}
                  <span style={{ color: "#16587b" }}>{previewProgramme.registration_url || "/register"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
