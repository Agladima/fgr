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
  Download,
  FileText,
  Upload,
  Lock,
  Unlock,
  ExternalLink,
  X,
} from "lucide-react";

export interface ResourceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  file_url?: string | null;
  external_link?: string | null;
  cover_image_url?: string | null;
  format: string;
  is_confidential?: boolean;
  order_index?: number;
  status: "active" | "draft" | "archived";
  created_at: string;
}

const CATEGORIES = [
  "Career Resources",
  "Entrepreneurship & Business Resources",
  "Digital Skills Resources",
  "Funding & Opportunity Resources",
  "Organisational Resources",
  "Reports & Publications",
];

const FORMATS = ["PDF", "DOCX", "XLSX", "PPTX", "Link", "Video"];

export default function ResourcesCMSPage() {
  const { showError, showSuccess } = useAdminNotification();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal & Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "Career Resources",
    description: "",
    file_url: "",
    external_link: "",
    cover_image_url: "",
    format: "PDF",
    is_confidential: false,
    order_index: 0,
    status: "active" as ResourceItem["status"],
  });

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/content/resources");
      if (!res.ok) throw new Error("Failed to load resources.");
      const json = await res.json();
      if (json.success) {
        setResources(json.data || []);
      }
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      title: "",
      category: "Career Resources",
      description: "",
      file_url: "",
      external_link: "",
      cover_image_url: "",
      format: "PDF",
      is_confidential: false,
      order_index: resources.length + 1,
      status: "active",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (resItem: ResourceItem) => {
    setEditingId(resItem.id);
    setForm({
      title: resItem.title,
      category: resItem.category,
      description: resItem.description,
      file_url: resItem.file_url || "",
      external_link: resItem.external_link || "",
      cover_image_url: resItem.cover_image_url || "",
      format: resItem.format || "PDF",
      is_confidential: Boolean(resItem.is_confidential),
      order_index: resItem.order_index || 0,
      status: resItem.status,
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "resources");
      fd.append("alt_text", form.title || file.name);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to upload document.");

      setForm((prev) => ({
        ...prev,
        file_url: json.data.url,
        format: file.name.split(".").pop()?.toUpperCase() || prev.format,
      }));
      showSuccess("Document uploaded successfully.");
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      showError("Please complete the title and description.");
      return;
    }

    try {
      setSaving(true);
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        file_url: form.file_url.trim() || null,
        external_link: form.external_link.trim() || null,
        cover_image_url: form.cover_image_url.trim() || null,
        format: form.format,
        is_confidential: form.is_confidential,
        order_index: Number(form.order_index) || 0,
        status: form.status,
      };

      if (editingId) {
        payload.id = editingId;
      }

      const res = await fetch("/api/admin/content/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to save resource.");

      showSuccess(editingId ? "Resource updated successfully." : "Resource added successfully.");
      setModalOpen(false);
      fetchResources();
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (resItem: ResourceItem, newStatus: ResourceItem["status"]) => {
    try {
      const res = await fetch(`/api/admin/content/resources/${resItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to update resource status.");

      showSuccess(`Resource status updated to ${newStatus}.`);
      fetchResources();
    } catch (err) {
      showError((err as Error).message);
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch =
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [resources, search, statusFilter, categoryFilter]);

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrap}>
          <h2>Resources & Publications Management</h2>
          <p className={styles.pageSubtitle}>
            Manage downloadable toolkits, guides, policy research papers, and learning materials.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/resources" target="_blank" className={styles.btnSecondary}>
            <ExternalLink size={15} /> View Public Page
          </Link>
          <button onClick={handleOpenCreate} className={styles.btnPrimary}>
            <Plus size={16} /> Add Resource
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search resources by title or description..."
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
            <option value="active">Active (Published)</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.selectInput}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingBox}>Loading resources...</div>
        ) : filteredResources.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateTitle}>No resources listed</div>
            <p className={styles.emptyStateText}>Add your first downloadable guide or toolkit.</p>
            <button onClick={handleOpenCreate} className={styles.btnPrimary}>
              <Plus size={16} /> Add Resource
            </button>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "36%" }}>Resource Title</th>
                  <th style={{ width: "20%" }}>Category</th>
                  <th style={{ width: "12%" }}>Format</th>
                  <th style={{ width: "14%" }}>Status & Access</th>
                  <th style={{ width: "18%", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((resItem) => (
                  <tr key={resItem.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: "#141b22", fontSize: "14px" }}>
                          {resItem.title}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: 2, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {resItem.description}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "#334155", fontWeight: 600 }}>
                        {resItem.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "11.5px", fontWeight: 700, background: "#f1f5f9", padding: "3px 7px", borderRadius: 4, color: "#475569" }}>
                        {resItem.format}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {resItem.status === "active" ? (
                          <span className={`${styles.badge} ${styles.badgeSuccess}`}><span className={styles.badgeDot} /> Active</span>
                        ) : resItem.status === "draft" ? (
                          <span className={`${styles.badge} ${styles.badgePending}`}><span className={styles.badgeDot} /> Draft</span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeNeutral}`}><span className={styles.badgeDot} /> Archived</span>
                        )}
                        {resItem.is_confidential && (
                          <span style={{ fontSize: "10.5px", color: "#b91c1c", display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <Lock size={10} /> Confidential (Restricted)
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        {(resItem.file_url || resItem.external_link) && (
                          <a
                            href={resItem.file_url || resItem.external_link || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Download / Open"
                            className={styles.btnSecondary}
                            style={{ padding: "6px 8px" }}
                          >
                            <Download size={14} />
                          </a>
                        )}

                        <button
                          onClick={() => handleOpenEdit(resItem)}
                          title="Edit"
                          className={styles.btnSecondary}
                          style={{ padding: "6px 8px" }}
                        >
                          <Edit2 size={14} />
                        </button>

                        {resItem.status === "archived" ? (
                          <button
                            onClick={() => handleStatusChange(resItem, "active")}
                            title="Restore"
                            className={styles.btnSecondary}
                            style={{ padding: "6px 8px", color: "#0284c7" }}
                          >
                            <RotateCcw size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(resItem, "archived")}
                            title="Archive"
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

      {/* Drawer */}
      {modalOpen && (
        <div className={styles.drawerOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.drawer} style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>
                {editingId ? "Edit Resource" : "Add Resource"}
              </h3>
              <button onClick={() => setModalOpen(false)} className={styles.drawerClose}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className={styles.drawerBody}>
              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern CV Architecture & ATS Guide"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={styles.searchInput}
                  style={{ paddingLeft: "12px" }}
                />
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={styles.selectInput}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>File Format</label>
                  <select
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value })}
                    className={styles.selectInput}
                  >
                    {FORMATS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summary of what this document contains..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={styles.searchInput}
                  style={{ padding: "10px 12px", minHeight: "80px", resize: "vertical" }}
                />
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Document Upload or File URL</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="https://... or upload PDF / DOCX"
                    value={form.file_url}
                    onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px", flex: 1 }}
                  />
                  <label className={styles.btnSecondary} style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                    <Upload size={14} />
                    {uploadingFile ? "Uploading..." : "Upload File"}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>External Link (Alternative)</label>
                <input
                  type="text"
                  placeholder="https://... (if hosted externally)"
                  value={form.external_link}
                  onChange={(e) => setForm({ ...form, external_link: e.target.value })}
                  className={styles.searchInput}
                  style={{ paddingLeft: "12px" }}
                />
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ResourceItem["status"] })}
                    className={styles.selectInput}
                  >
                    <option value="active">Active (Published on site)</option>
                    <option value="draft">Draft (Private)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Confidential Protection</label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", fontSize: "13px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.is_confidential}
                      onChange={(e) => setForm({ ...form, is_confidential: e.target.checked })}
                    />
                    Mark as Internal / Confidential (Hide from public)
                  </label>
                </div>
              </div>

              <div className={styles.drawerFooter} style={{ padding: 0, marginTop: "10px", background: "none" }}>
                <button type="button" onClick={() => setModalOpen(false)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={styles.btnPrimary}>
                  {saving ? "Saving..." : editingId ? "Update Resource" : "Add Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
