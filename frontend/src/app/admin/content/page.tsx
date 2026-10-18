"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "../admin-common.module.css";
import {
  FileText,
  Download,
  Award,
  Sparkles,
  Plus,
  Trash2,
  X,
  ExternalLink,
} from "lucide-react";

type ContentTab = "news" | "resources" | "impact" | "stories";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  author: string;
  status: "draft" | "published" | "archived";
  published_at?: string;
  created_at: string;
}

interface ResourceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  file_url?: string;
  format: string;
  status: "active" | "archived";
}

interface ImpactMetricItem {
  id: string;
  metric_key: string;
  label: string;
  metric_value: string;
  order_index: number;
  is_active: boolean;
}

interface SuccessStoryItem {
  id: string;
  name: string;
  programme_attended: string;
  role_after: string;
  quote?: string;
  story: string;
  status: "published" | "draft";
}

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<ContentTab>("news");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab Data
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [resourceList, setResourceList] = useState<ResourceItem[]>([]);
  const [impactList, setImpactList] = useState<ImpactMetricItem[]>([]);
  const [storyList, setStoryList] = useState<SuccessStoryItem[]>([]);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [newsForm, setNewsForm] = useState({
    title: "",
    slug: "",
    category: "Announcement",
    excerpt: "",
    author: "FGR Communications",
    status: "published" as "draft" | "published" | "archived",
  });

  const [resourceForm, setResourceForm] = useState({
    title: "",
    category: "Curriculum Guide",
    description: "",
    file_url: "",
    format: "PDF",
    status: "active" as "active" | "archived",
  });

  const [impactForm, setImpactForm] = useState({
    metric_key: "",
    label: "",
    metric_value: "",
    order_index: 0,
    is_active: true,
  });

  const [storyForm, setStoryForm] = useState({
    name: "",
    programme_attended: "Employability Skills",
    role_after: "",
    quote: "",
    story: "",
    status: "published" as "published" | "draft",
  });

  const fetchTabData = useCallback(async (tab: ContentTab) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/content/${tab}`);
      if (!res.ok) throw new Error(`Failed to load ${tab}.`);

      const json = await res.json();
      if (json.success) {
        if (tab === "news") setNewsList(json.data || []);
        if (tab === "resources") setResourceList(json.data || []);
        if (tab === "impact") setImpactList(json.data || []);
        if (tab === "stories") setStoryList(json.data || []);
      }
    } catch (err) {
      setError((err as Error).message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTabData(activeTab);
  }, [activeTab, fetchTabData]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingId(null);
    if (activeTab === "news") {
      setNewsForm({
        title: "",
        slug: "",
        category: "Announcement",
        excerpt: "",
        author: "FGR Communications",
        status: "published",
      });
    } else if (activeTab === "resources") {
      setResourceForm({
        title: "",
        category: "Curriculum Guide",
        description: "",
        file_url: "",
        format: "PDF",
        status: "active",
      });
    } else if (activeTab === "impact") {
      setImpactForm({
        metric_key: "",
        label: "",
        metric_value: "100+",
        order_index: impactList.length + 1,
        is_active: true,
      });
    } else if (activeTab === "stories") {
      setStoryForm({
        name: "",
        programme_attended: "Employability Skills",
        role_after: "",
        quote: "",
        story: "",
        status: "published",
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const url = editingId
        ? `/api/admin/content/${activeTab}/${editingId}`
        : `/api/admin/content/${activeTab}`;
      const method = editingId ? "PATCH" : "POST";

      let body = {};
      if (activeTab === "news") body = newsForm;
      if (activeTab === "resources") body = resourceForm;
      if (activeTab === "impact") body = impactForm;
      if (activeTab === "stories") body = storyForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setModalOpen(false);
        fetchTabData(activeTab);
      } else {
        alert(json.message || "Failed to save record.");
      }
    } catch {
      alert("Error saving record.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/content/${activeTab}/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchTabData(activeTab);
      } else {
        alert("Failed to delete record.");
      }
    } catch {
      alert("Error deleting record.");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrap}>
          <h2>Website Content Hub</h2>
          <p className={styles.pageSubtitle}>
            Manage public news updates, downloadable guides, verified impact numbers, and alumni success stories.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={handleOpenCreate} className={styles.btnPrimary}>
            <Plus size={15} /> Add {activeTab === "news" ? "Article" : activeTab === "resources" ? "Resource" : activeTab === "impact" ? "Impact Metric" : "Success Story"}
          </button>
        </div>
      </div>

      {/* Content Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--color-border-default, #e2e8f0)",
          marginBottom: "20px",
          paddingBottom: "1px",
        }}
      >
        <button
          onClick={() => setActiveTab("news")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            border: "none",
            background: "none",
            fontSize: "13.5px",
            fontWeight: activeTab === "news" ? 700 : 500,
            color: activeTab === "news" ? "var(--color-primary, #202833)" : "#64748b",
            borderBottom: activeTab === "news" ? "2px solid var(--color-primary, #202833)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          <FileText size={16} /> News & Announcements
        </button>

        <button
          onClick={() => setActiveTab("resources")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            border: "none",
            background: "none",
            fontSize: "13.5px",
            fontWeight: activeTab === "resources" ? 700 : 500,
            color: activeTab === "resources" ? "var(--color-primary, #202833)" : "#64748b",
            borderBottom: activeTab === "resources" ? "2px solid var(--color-primary, #202833)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          <Download size={16} /> Resources & Guides
        </button>

        <button
          onClick={() => setActiveTab("impact")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            border: "none",
            background: "none",
            fontSize: "13.5px",
            fontWeight: activeTab === "impact" ? 700 : 500,
            color: activeTab === "impact" ? "var(--color-primary, #202833)" : "#64748b",
            borderBottom: activeTab === "impact" ? "2px solid var(--color-primary, #202833)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          <Award size={16} /> Impact Metrics
        </button>

        <button
          onClick={() => setActiveTab("stories")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            border: "none",
            background: "none",
            fontSize: "13.5px",
            fontWeight: activeTab === "stories" ? 700 : 500,
            color: activeTab === "stories" ? "var(--color-primary, #202833)" : "#64748b",
            borderBottom: activeTab === "stories" ? "2px solid var(--color-primary, #202833)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          <Sparkles size={16} /> Success Stories
        </button>
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

      {/* Tab 1: News Articles */}
      {activeTab === "news" && (
        <div className={styles.tableCard}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Article Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      Loading articles...
                    </td>
                  </tr>
                ) : newsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      No news articles published yet. Click &quot;Add Article&quot; to post news.
                    </td>
                  </tr>
                ) : (
                  newsList.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#141b22" }}>{item.title}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>/{item.slug}</div>
                      </td>
                      <td>
                        <span style={{ background: "#f1f5f9", padding: "3px 8px", borderRadius: "4px", fontSize: "12px" }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ fontSize: "13px", color: "#334155" }}>{item.author}</td>
                      <td>
                        {item.status === "published" ? (
                          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                            <span className={styles.badgeDot} /> Published
                          </span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                            <span className={styles.badgeDot} /> Draft
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className={styles.btnDanger}
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Resources */}
      {activeTab === "resources" && (
        <div className={styles.tableCard}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Resource Title</th>
                  <th>Category</th>
                  <th>Format</th>
                  <th>Link</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      Loading resources...
                    </td>
                  </tr>
                ) : resourceList.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      No resources available. Click &quot;Add Resource&quot; to upload or link guides.
                    </td>
                  </tr>
                ) : (
                  resourceList.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#141b22" }}>{item.title}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{item.description}</div>
                      </td>
                      <td>
                        <span style={{ background: "#f1f5f9", padding: "3px 8px", borderRadius: "4px", fontSize: "12px" }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ fontSize: "13px", fontWeight: 600 }}>{item.format}</td>
                      <td>
                        {item.file_url ? (
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: "12px", color: "#2563eb", display: "inline-flex", alignItems: "center", gap: "3px" }}
                          >
                            Open File <ExternalLink size={11} />
                          </a>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>No URL</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className={styles.btnDanger}
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Impact Metrics */}
      {activeTab === "impact" && (
        <div className={styles.tableCard}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Display Label</th>
                  <th>Metric Value</th>
                  <th>Database Key</th>
                  <th>Active Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      Loading metrics...
                    </td>
                  </tr>
                ) : impactList.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      No impact metrics found.
                    </td>
                  </tr>
                ) : (
                  impactList.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: "#141b22" }}>{item.label}</td>
                      <td>
                        <span
                          style={{
                            background: "#ecfdf5",
                            color: "#047857",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontWeight: 800,
                            fontSize: "14px",
                          }}
                        >
                          {item.metric_value}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>
                        {item.metric_key}
                      </td>
                      <td>
                        {item.is_active ? (
                          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                            <span className={styles.badgeDot} /> Active
                          </span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                            <span className={styles.badgeDot} /> Inactive
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleDelete(item.id, item.label)}
                          className={styles.btnDanger}
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Success Stories */}
      {activeTab === "stories" && (
        <div className={styles.tableCard}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Alumni Name</th>
                  <th>Programme Attended</th>
                  <th>Career Placement</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      Loading success stories...
                    </td>
                  </tr>
                ) : storyList.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      No success stories yet. Click &quot;Add Success Story&quot; to share alumni impact.
                    </td>
                  </tr>
                ) : (
                  storyList.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: "#141b22" }}>{item.name}</td>
                      <td style={{ fontSize: "13px", color: "#334155" }}>{item.programme_attended}</td>
                      <td style={{ fontSize: "13px", color: "#047857", fontWeight: 600 }}>{item.role_after}</td>
                      <td>
                        {item.status === "published" ? (
                          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                            <span className={styles.badgeDot} /> Published
                          </span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                            <span className={styles.badgeDot} /> Draft
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className={styles.btnDanger}
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {modalOpen && (
        <div className={styles.drawerOverlay} onClick={() => setModalOpen(false)}>
          <div
            style={{
              width: "100%",
              maxWidth: "550px",
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
                Add New {activeTab === "news" ? "Article" : activeTab === "resources" ? "Resource" : activeTab === "impact" ? "Impact Metric" : "Success Story"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {activeTab === "news" && (
                <>
                  <div>
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Article Title *
                    </label>
                    <input
                      type="text"
                      required
                      className={styles.searchInput}
                      style={{ paddingLeft: "12px" }}
                      value={newsForm.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                        setNewsForm({ ...newsForm, title, slug });
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
                      value={newsForm.slug}
                      onChange={(e) => setNewsForm({ ...newsForm, slug: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Excerpt / Summary
                    </label>
                    <textarea
                      rows={3}
                      className={styles.searchInput}
                      style={{ paddingLeft: "12px", height: "auto" }}
                      value={newsForm.excerpt}
                      onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                    />
                  </div>
                </>
              )}

              {activeTab === "resources" && (
                <>
                  <div>
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Resource Title *
                    </label>
                    <input
                      type="text"
                      required
                      className={styles.searchInput}
                      style={{ paddingLeft: "12px" }}
                      value={resourceForm.title}
                      onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Description
                    </label>
                    <textarea
                      rows={2}
                      className={styles.searchInput}
                      style={{ paddingLeft: "12px", height: "auto" }}
                      value={resourceForm.description}
                      onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                      File or Document URL
                    </label>
                    <input
                      type="url"
                      className={styles.searchInput}
                      style={{ paddingLeft: "12px" }}
                      placeholder="https://..."
                      value={resourceForm.file_url}
                      onChange={(e) => setResourceForm({ ...resourceForm, file_url: e.target.value })}
                    />
                  </div>
                </>
              )}

              {activeTab === "impact" && (
                <>
                  <div>
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Metric Key (Internal Identifier) *
                    </label>
                    <input
                      type="text"
                      required
                      className={styles.searchInput}
                      style={{ paddingLeft: "12px" }}
                      placeholder="e.g. graduates_trained"
                      value={impactForm.metric_key}
                      onChange={(e) => setImpactForm({ ...impactForm, metric_key: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Display Label *
                    </label>
                    <input
                      type="text"
                      required
                      className={styles.searchInput}
                      style={{ paddingLeft: "12px" }}
                      placeholder="e.g. Youth Trained & Certified"
                      value={impactForm.label}
                      onChange={(e) => setImpactForm({ ...impactForm, label: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Metric Number / Stat *
                    </label>
                    <input
                      type="text"
                      required
                      className={styles.searchInput}
                      style={{ paddingLeft: "12px" }}
                      placeholder="e.g. 2,500+ or 85%"
                      value={impactForm.metric_value}
                      onChange={(e) => setImpactForm({ ...impactForm, metric_value: e.target.value })}
                    />
                  </div>
                </>
              )}

              {activeTab === "stories" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                        Alumni Name *
                      </label>
                      <input
                        type="text"
                        required
                        className={styles.searchInput}
                        style={{ paddingLeft: "12px" }}
                        value={storyForm.name}
                        onChange={(e) => setStoryForm({ ...storyForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                        Role Placed In *
                      </label>
                      <input
                        type="text"
                        required
                        className={styles.searchInput}
                        style={{ paddingLeft: "12px" }}
                        placeholder="e.g. Associate Data Analyst"
                        value={storyForm.role_after}
                        onChange={(e) => setStoryForm({ ...storyForm, role_after: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Testimonial Quote
                    </label>
                    <input
                      type="text"
                      className={styles.searchInput}
                      style={{ paddingLeft: "12px" }}
                      placeholder='"The FGR coaching transformed my career..."'
                      value={storyForm.quote}
                      onChange={(e) => setStoryForm({ ...storyForm, quote: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                      Full Story / Background
                    </label>
                    <textarea
                      rows={3}
                      className={styles.searchInput}
                      style={{ paddingLeft: "12px", height: "auto" }}
                      value={storyForm.story}
                      onChange={(e) => setStoryForm({ ...storyForm, story: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={styles.btnSecondary}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={styles.btnPrimary}>
                  {saving ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
