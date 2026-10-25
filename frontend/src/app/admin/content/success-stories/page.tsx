"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../../admin-common.module.css";
import { useAdminNotification } from "@/lib/admin/notification-context";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
  Sparkles,
  Quote,
  Upload,
  Eye,
  ExternalLink,
  X,
} from "lucide-react";

export interface SuccessStoryItem {
  id: string;
  name: string;
  title?: string | null;
  programme_name: string;
  role_after?: string | null;
  quote?: string | null;
  story?: string | null;
  challenge?: string | null;
  experience?: string | null;
  outcome?: string | null;
  avatar_url?: string | null;
  order_index?: number;
  status: "published" | "active" | "draft" | "archived" | "hidden";
  created_at: string;
}

export default function SuccessStoriesCMSPage() {
  const { showError, showSuccess } = useAdminNotification();
  const [stories, setStories] = useState<SuccessStoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal & Preview States
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selectedStory, setSelectedStory] = useState<SuccessStoryItem | null>(null);

  const [form, setForm] = useState({
    name: "",
    title: "",
    programme_name: "Employability & Career Development",
    role_after: "",
    quote: "",
    story: "",
    avatar_url: "",
    order_index: 0,
    status: "published" as "published" | "draft" | "archived",
  });

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/content/stories");
      if (!res.ok) throw new Error("Failed to load success stories.");
      const json = await res.json();
      if (json.success) {
        setStories(json.data || []);
      }
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      name: "",
      title: "",
      programme_name: "Employability & Career Development",
      role_after: "Secured employment in corporate administration",
      quote: "The hands-on simulation gave me the confidence to excel in employer interviews.",
      story: "Detailed trajectory of the participant's career growth...",
      avatar_url: "",
      order_index: stories.length + 1,
      status: "published",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (storyItem: SuccessStoryItem) => {
    setEditingId(storyItem.id);
    setForm({
      name: storyItem.name,
      title: storyItem.title || "",
      programme_name: storyItem.programme_name,
      role_after: storyItem.role_after || storyItem.outcome || "",
      quote: storyItem.quote || "",
      story: storyItem.story || storyItem.experience || "",
      avatar_url: storyItem.avatar_url || "",
      order_index: storyItem.order_index || 0,
      status: (storyItem.status === "active" ? "published" : storyItem.status) as "published" | "draft" | "archived",
    });
    setModalOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "avatars");
      fd.append("alt_text", form.name || "Participant portrait");

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to upload photo.");

      setForm((prev) => ({ ...prev, avatar_url: json.data.url }));
      showSuccess("Participant photo uploaded.");
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.programme_name.trim()) {
      showError("Please provide the participant's name and programme.");
      return;
    }

    try {
      setSaving(true);
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        title: form.title.trim() || null,
        programme_name: form.programme_name.trim(),
        role_after: form.role_after.trim() || null,
        outcome: form.role_after.trim() || null,
        quote: form.quote.trim() || null,
        story: form.story.trim() || null,
        experience: form.story.trim() || null,
        avatar_url: form.avatar_url.trim() || null,
        order_index: Number(form.order_index) || 0,
        status: form.status,
      };

      if (editingId) {
        payload.id = editingId;
      }

      const res = await fetch("/api/admin/content/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to save story.");

      showSuccess(editingId ? "Story updated successfully." : "Story added successfully.");
      setModalOpen(false);
      fetchStories();
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (storyItem: SuccessStoryItem, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/content/stories/${storyItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to update story status.");

      showSuccess(`Story updated to ${newStatus}.`);
      fetchStories();
    } catch (err) {
      showError((err as Error).message);
    }
  };

  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.programme_name.toLowerCase().includes(search.toLowerCase()) ||
        (s.quote && s.quote.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        s.status === statusFilter ||
        (statusFilter === "published" && s.status === "active");

      return matchesSearch && matchesStatus;
    });
  }, [stories, search, statusFilter]);

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrap}>
          <h2>Success Stories Management</h2>
          <p className={styles.pageSubtitle}>
            Highlight verified graduate transformations, employment outcomes, and participant testimonials.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/impact" target="_blank" className={styles.btnSecondary}>
            <ExternalLink size={15} /> View on Impact Page
          </Link>
          <button onClick={handleOpenCreate} className={styles.btnPrimary}>
            <Plus size={16} /> Add Story
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by participant name, programme, or quote..."
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
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingBox}>Loading stories...</div>
        ) : filteredStories.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateTitle}>No success stories found</div>
            <p className={styles.emptyStateText}>Add verified outcomes from your graduates.</p>
            <button onClick={handleOpenCreate} className={styles.btnPrimary}>
              <Plus size={16} /> Add Story
            </button>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "32%" }}>Participant & Programme</th>
                  <th style={{ width: "24%" }}>Career Outcome / Role</th>
                  <th style={{ width: "22%" }}>Quote Excerpt</th>
                  <th style={{ width: "10%" }}>Status</th>
                  <th style={{ width: "12%", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStories.map((storyItem) => (
                  <tr key={storyItem.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {storyItem.avatar_url ? (
                          <div style={{ width: 40, height: 40, position: "relative", borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "1px solid #e2e8f0" }}>
                            <Image src={storyItem.avatar_url} alt="" fill sizes="40px" style={{ objectFit: "cover" }} />
                          </div>
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e0f2fe", color: "#0369a1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>
                            {storyItem.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: "#141b22", fontSize: "14px" }}>
                            {storyItem.name}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>
                            {storyItem.programme_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "13px", color: "#334155", fontWeight: 600 }}>
                        {storyItem.role_after || storyItem.outcome || "Cohort Graduate"}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "12.5px", color: "#64748b", fontStyle: "italic", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        &ldquo;{storyItem.quote || "N/A"}&rdquo;
                      </div>
                    </td>
                    <td>
                      {storyItem.status === "published" || storyItem.status === "active" ? (
                        <span className={`${styles.badge} ${styles.badgeSuccess}`}><span className={styles.badgeDot} /> Published</span>
                      ) : storyItem.status === "draft" ? (
                        <span className={`${styles.badge} ${styles.badgePending}`}><span className={styles.badgeDot} /> Draft</span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeNeutral}`}><span className={styles.badgeDot} /> Archived</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <button
                          onClick={() => {
                            setSelectedStory(storyItem);
                            setPreviewOpen(true);
                          }}
                          title="Preview"
                          className={styles.btnSecondary}
                          style={{ padding: "6px 8px" }}
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(storyItem)}
                          title="Edit"
                          className={styles.btnSecondary}
                          style={{ padding: "6px 8px" }}
                        >
                          <Edit2 size={14} />
                        </button>

                        {storyItem.status === "archived" ? (
                          <button
                            onClick={() => handleStatusChange(storyItem, "published")}
                            title="Restore"
                            className={styles.btnSecondary}
                            style={{ padding: "6px 8px", color: "#0284c7" }}
                          >
                            <RotateCcw size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(storyItem, "archived")}
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
                {editingId ? "Edit Success Story" : "Add Success Story"}
              </h3>
              <button onClick={() => setModalOpen(false)} className={styles.drawerClose}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className={styles.drawerBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Participant Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Okon"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                  />
                </div>

                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Associated Programme *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Employability & Career Development"
                    value={form.programme_name}
                    onChange={(e) => setForm({ ...form, programme_name: e.target.value })}
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                  />
                </div>
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Career Progression / Role After</label>
                <input
                  type="text"
                  placeholder="e.g. Operations Assistant at Regional Infrastructure Firm"
                  value={form.role_after}
                  onChange={(e) => setForm({ ...form, role_after: e.target.value })}
                  className={styles.searchInput}
                  style={{ paddingLeft: "12px" }}
                />
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Key Quotation</label>
                <textarea
                  rows={2}
                  placeholder="Direct quotation reflecting the impact of the training..."
                  value={form.quote}
                  onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  className={styles.searchInput}
                  style={{ padding: "10px 12px", minHeight: "65px", resize: "vertical" }}
                />
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Full Transformation Story</label>
                <textarea
                  rows={4}
                  placeholder="Describe the initial challenge, the learning experience, and final career milestone..."
                  value={form.story}
                  onChange={(e) => setForm({ ...form, story: e.target.value })}
                  className={styles.searchInput}
                  style={{ padding: "10px 12px", minHeight: "95px", resize: "vertical" }}
                />
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Participant Portrait / Photo</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="https://... or upload photo"
                    value={form.avatar_url}
                    onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px", flex: 1 }}
                  />
                  <label className={styles.btnSecondary} style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                    <Upload size={14} />
                    {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Status *</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "published" | "draft" | "archived" })}
                  className={styles.selectInput}
                >
                  <option value="published">Published (Displayed on site)</option>
                  <option value="draft">Draft (Private)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className={styles.drawerFooter} style={{ padding: 0, marginTop: "10px", background: "none" }}>
                <button type="button" onClick={() => setModalOpen(false)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={styles.btnPrimary}>
                  {saving ? "Saving..." : editingId ? "Update Story" : "Save Story"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewOpen && selectedStory && (
        <div className={styles.drawerOverlay} onClick={() => setPreviewOpen(false)}>
          <div className={styles.drawer} style={{ maxWidth: "540px" }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>Story Public Preview</h3>
              <button onClick={() => setPreviewOpen(false)} className={styles.drawerClose}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.drawerBody}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {selectedStory.avatar_url ? (
                  <div style={{ width: 64, height: 64, position: "relative", borderRadius: "50%", overflow: "hidden", border: "2px solid #16587b" }}>
                    <Image src={selectedStory.avatar_url} alt="" fill style={{ objectFit: "cover" }} />
                  </div>
                ) : null}
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>{selectedStory.name}</h3>
                  <div style={{ fontSize: "13px", color: "#16587b", fontWeight: 600 }}>{selectedStory.programme_name}</div>
                  <div style={{ fontSize: "12.5px", color: "#64748b" }}>{selectedStory.role_after || selectedStory.outcome}</div>
                </div>
              </div>

              {selectedStory.quote && (
                <div style={{ marginTop: 20, padding: 16, background: "rgba(22, 88, 123, 0.05)", borderRadius: 8, borderLeft: "3px solid #16587b", fontStyle: "italic", color: "#1e293b", fontSize: "14px" }}>
                  &ldquo;{selectedStory.quote}&rdquo;
                </div>
              )}

              {selectedStory.story && (
                <div style={{ marginTop: 16, fontSize: "14px", color: "#334155", lineHeight: 1.7 }}>
                  {selectedStory.story}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
