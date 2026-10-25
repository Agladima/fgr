"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../../admin-common.module.css";
import { useAdminNotification } from "@/lib/admin/notification-context";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Upload,
  X,
  Clock,
  Sparkles,
} from "lucide-react";

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content?: string | null;
  author: string;
  featured_image_url?: string | null;
  status: "draft" | "published" | "archived";
  published_at?: string | null;
  created_at: string;
  updated_at?: string;
}

const CATEGORIES = [
  "Admissions",
  "Training & Workshops",
  "Partnership News",
  "Announcement",
  "Institutional",
  "Career Development",
];

export default function NewsCMSPage() {
  const { showError, showSuccess } = useAdminNotification();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal & Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedArticleForPreview, setSelectedArticleForPreview] = useState<NewsArticle | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "Announcement",
    summary: "",
    content: "",
    author: "FGR Communications",
    featured_image_url: "",
    status: "published" as "draft" | "published" | "archived",
    published_at: "",
  });

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/content/news");
      if (!res.ok) throw new Error("Failed to load news articles.");
      const json = await res.json();
      if (json.success) {
        setArticles(json.data || []);
      }
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      title: "",
      slug: "",
      category: "Announcement",
      summary: "",
      content: "",
      author: "FGR Communications",
      featured_image_url: "",
      status: "published",
      published_at: new Date().toISOString().slice(0, 16),
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (article: NewsArticle) => {
    setEditingId(article.id);
    setForm({
      title: article.title,
      slug: article.slug,
      category: article.category,
      summary: article.summary,
      content: article.content || "",
      author: article.author || "FGR Communications",
      featured_image_url: article.featured_image_url || "",
      status: article.status,
      published_at: article.published_at
        ? new Date(article.published_at).toISOString().slice(0, 16)
        : "",
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "news");
      fd.append("alt_text", form.title || "News article image");

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to upload image.");
      }

      setForm((prev) => ({ ...prev, featured_image_url: json.data.url }));
      showSuccess("Image uploaded successfully.");
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim()) {
      showError("Please complete the required title and summary fields.");
      return;
    }

    try {
      setSaving(true);
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        category: form.category,
        summary: form.summary.trim(),
        content: form.content.trim() || null,
        author: form.author.trim() || "FGR Communications",
        featured_image_url: form.featured_image_url.trim() || null,
        status: form.status,
        published_at: form.published_at ? new Date(form.published_at).toISOString() : new Date().toISOString(),
      };

      if (editingId) {
        payload.id = editingId;
      }

      const res = await fetch("/api/admin/content/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to save article.");
      }

      showSuccess(editingId ? "Article updated successfully." : "Article created successfully.");
      setModalOpen(false);
      fetchArticles();
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (article: NewsArticle, newStatus: "draft" | "published" | "archived") => {
    const actionLabel = newStatus === "published" ? "publish" : newStatus === "archived" ? "archive" : "unpublish";
    if (!confirm(`Are you sure you want to ${actionLabel} "${article.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/content/news/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || `Failed to ${actionLabel} article.`);

      showSuccess(`Article ${newStatus} successfully.`);
      fetchArticles();
    } catch (err) {
      showError((err as Error).message);
    }
  };

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchesSearch =
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.summary.toLowerCase().includes(search.toLowerCase()) ||
        a.author.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || a.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [articles, search, statusFilter, categoryFilter]);

  return (
    <div>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrap}>
          <h2>News & Articles Management</h2>
          <p className={styles.pageSubtitle}>
            Publish announcements, cohort updates, and editorial articles on the live website.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/news-events" target="_blank" className={styles.btnSecondary}>
            <ExternalLink size={15} />
            View Public Page
          </Link>
          <button onClick={handleOpenCreate} className={styles.btnPrimary}>
            <Plus size={16} />
            Create Article
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#e0f2fe", color: "#0369a1" }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div className={styles.statValue}>{articles.length}</div>
            <div className={styles.statLabel}>Total Articles</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#dcfce7", color: "#166534" }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className={styles.statValue}>{articles.filter((a) => a.status === "published").length}</div>
            <div className={styles.statLabel}>Live on Public Site</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#fef3c7", color: "#92400e" }}>
            <Clock size={20} />
          </div>
          <div>
            <div className={styles.statValue}>{articles.filter((a) => a.status === "draft").length}</div>
            <div className={styles.statLabel}>Drafts in Progress</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#f1f5f9", color: "#475569" }}>
            <Archive size={20} />
          </div>
          <div>
            <div className={styles.statValue}>{articles.filter((a) => a.status === "archived").length}</div>
            <div className={styles.statLabel}>Archived Records</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by title, summary, or author..."
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

      {/* Table Card */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingBox}>Loading articles...</div>
        ) : filteredArticles.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateTitle}>No articles found</div>
            <p className={styles.emptyStateText}>
              {search || statusFilter !== "all"
                ? "Try adjusting your search query or status filter."
                : "Get started by creating your first news or announcement article."}
            </p>
            <button onClick={handleOpenCreate} className={styles.btnPrimary}>
              <Plus size={16} /> Create Article
            </button>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "38%" }}>Article Title & Summary</th>
                  <th style={{ width: "16%" }}>Category</th>
                  <th style={{ width: "14%" }}>Author</th>
                  <th style={{ width: "12%" }}>Status</th>
                  <th style={{ width: "20%", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article) => {
                  return (
                    <tr key={article.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {article.featured_image_url && (
                            <div style={{ width: 44, height: 44, position: "relative", borderRadius: 6, overflow: "hidden", flexShrink: 0, border: "1px solid #e2e8f0" }}>
                              <Image src={article.featured_image_url} alt="" fill sizes="44px" style={{ objectFit: "cover" }} />
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, color: "var(--color-text-heading, #141b22)" }}>
                              {article.title}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b", marginTop: 2, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {article.summary}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#16587b", background: "rgba(22, 88, 123, 0.08)", padding: "3px 8px", borderRadius: 4 }}>
                          {article.category}
                        </span>
                      </td>
                      <td style={{ fontSize: "13px", color: "#475569" }}>
                        {article.author}
                      </td>
                      <td>
                        {article.status === "published" ? (
                          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                            <span className={styles.badgeDot} /> Published
                          </span>
                        ) : article.status === "draft" ? (
                          <span className={`${styles.badge} ${styles.badgePending}`}>
                            <span className={styles.badgeDot} /> Draft
                          </span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                            <span className={styles.badgeDot} /> Archived
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <button
                            onClick={() => {
                              setSelectedArticleForPreview(article);
                              setPreviewOpen(true);
                            }}
                            title="Preview Article"
                            className={styles.btnSecondary}
                            style={{ padding: "6px 8px" }}
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(article)}
                            title="Edit Article"
                            className={styles.btnSecondary}
                            style={{ padding: "6px 8px" }}
                          >
                            <Edit2 size={14} />
                          </button>

                          {article.status === "published" ? (
                            <button
                              onClick={() => handleStatusChange(article, "draft")}
                              title="Unpublish (Convert to Draft)"
                              className={styles.btnSecondary}
                              style={{ padding: "6px 8px", color: "#d97706" }}
                            >
                              <XCircle size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(article, "published")}
                              title="Publish Live"
                              className={styles.btnSecondary}
                              style={{ padding: "6px 8px", color: "#16a34a" }}
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}

                          {article.status === "archived" ? (
                            <button
                              onClick={() => handleStatusChange(article, "published")}
                              title="Restore Article"
                              className={styles.btnSecondary}
                              style={{ padding: "6px 8px", color: "#0284c7" }}
                            >
                              <RotateCcw size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(article, "archived")}
                              title="Archive Article"
                              className={styles.btnSecondary}
                              style={{ padding: "6px 8px", color: "#64748b" }}
                            >
                              <Archive size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Drawer Modal */}
      {modalOpen && (
        <div className={styles.drawerOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>
                {editingId ? "Edit Article" : "Create News Article"}
              </h3>
              <button onClick={() => setModalOpen(false)} className={styles.drawerClose}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className={styles.drawerBody}>
              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026 Workforce Development Cohort Opened"
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
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Summary / Description (Shown on cards) *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Brief summary introducing the article..."
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className={styles.searchInput}
                  style={{ padding: "10px 12px", minHeight: "80px", resize: "vertical" }}
                />
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Full Article Content (Optional)</label>
                <textarea
                  rows={6}
                  placeholder="Complete article paragraphs, announcements, and key details..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className={styles.searchInput}
                  style={{ padding: "10px 12px", minHeight: "130px", resize: "vertical" }}
                />
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Author</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                  />
                </div>

                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Publication Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" | "archived" })}
                    className={styles.selectInput}
                  >
                    <option value="published">Published (Visible on site)</option>
                    <option value="draft">Draft (Private)</option>
                    <option value="archived">Archived (Preserved)</option>
                  </select>
                </div>
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Featured Image</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="https://... or upload from device"
                    value={form.featured_image_url}
                    onChange={(e) => setForm({ ...form, featured_image_url: e.target.value })}
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px", flex: 1 }}
                  />
                  <label className={styles.btnSecondary} style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                    <Upload size={14} />
                    {uploadingImage ? "Uploading..." : "Upload"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
                {form.featured_image_url && (
                  <div style={{ marginTop: "10px", position: "relative", width: "100%", height: 160, borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                    <Image src={form.featured_image_url} alt="Preview" fill style={{ objectFit: "cover" }} />
                  </div>
                )}
              </div>

              <div className={styles.drawerFooter} style={{ padding: 0, marginTop: "10px", background: "none" }}>
                <button type="button" onClick={() => setModalOpen(false)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={styles.btnPrimary}>
                  {saving ? "Saving..." : editingId ? "Update Article" : "Save Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewOpen && selectedArticleForPreview && (
        <div className={styles.drawerOverlay} onClick={() => setPreviewOpen(false)}>
          <div className={styles.drawer} style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>Article Public Preview</h3>
              <button onClick={() => setPreviewOpen(false)} className={styles.drawerClose}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.drawerBody}>
              {selectedArticleForPreview.featured_image_url && (
                <div style={{ position: "relative", width: "100%", height: "240px", borderRadius: "10px", overflow: "hidden", marginBottom: "16px" }}>
                  <Image src={selectedArticleForPreview.featured_image_url} alt="" fill style={{ objectFit: "cover" }} />
                </div>
              )}
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#16587b", textTransform: "uppercase" }}>
                {selectedArticleForPreview.category} • {selectedArticleForPreview.author}
              </span>
              <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "8px 0", color: "#141b22" }}>
                {selectedArticleForPreview.title}
              </h1>
              <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.6, fontWeight: 500 }}>
                {selectedArticleForPreview.summary}
              </p>
              {selectedArticleForPreview.content && (
                <div style={{ fontSize: "14.5px", color: "#334155", lineHeight: 1.7, marginTop: "16px", whiteSpace: "pre-wrap" }}>
                  {selectedArticleForPreview.content}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
