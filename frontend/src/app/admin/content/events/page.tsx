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
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Upload,
  X,
  Eye,
} from "lucide-react";

export interface EventItem {
  id: string;
  title: string;
  category: string;
  description: string;
  event_date: string;
  location: string;
  registration_url?: string | null;
  featured_image_url?: string | null;
  status: "draft" | "published" | "upcoming" | "ongoing" | "completed" | "cancelled" | "archived";
  created_at: string;
}

const CATEGORIES = [
  "Workshop",
  "Bootcamp",
  "Seminar",
  "Roundtable",
  "Information Session",
  "Cohort Orientation",
];

export default function EventsCMSPage() {
  const { showError, showSuccess } = useAdminNotification();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal & Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "Workshop",
    description: "",
    event_date: "",
    location: "FGR Training Center, Calabar",
    registration_url: "/contact?subject=Event+Registration",
    featured_image_url: "",
    status: "upcoming" as EventItem["status"],
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/content/events");
      if (!res.ok) throw new Error("Failed to load events.");
      const json = await res.json();
      if (json.success) {
        setEvents(json.data || []);
      }
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      title: "",
      category: "Workshop",
      description: "",
      event_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 16),
      location: "FGR Training Center, Calabar & Virtual Access",
      registration_url: "/contact?subject=Event+Registration",
      featured_image_url: "",
      status: "upcoming",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (evt: EventItem) => {
    setEditingId(evt.id);
    setForm({
      title: evt.title,
      category: evt.category,
      description: evt.description,
      event_date: evt.event_date ? new Date(evt.event_date).toISOString().slice(0, 16) : "",
      location: evt.location,
      registration_url: evt.registration_url || "",
      featured_image_url: evt.featured_image_url || "",
      status: evt.status,
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "events");
      fd.append("alt_text", form.title || "Event poster");

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to upload image.");

      setForm((prev) => ({ ...prev, featured_image_url: json.data.url }));
      showSuccess("Event image uploaded.");
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.event_date) {
      showError("Please complete the event title, description, and event date.");
      return;
    }

    try {
      setSaving(true);
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        event_date: new Date(form.event_date).toISOString(),
        location: form.location.trim(),
        registration_url: form.registration_url.trim() || null,
        featured_image_url: form.featured_image_url.trim() || null,
        status: form.status,
      };

      if (editingId) {
        payload.id = editingId;
      }

      const res = await fetch("/api/admin/content/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to save event.");

      showSuccess(editingId ? "Event updated successfully." : "Event created successfully.");
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (evt: EventItem, newStatus: EventItem["status"]) => {
    try {
      const res = await fetch(`/api/admin/content/events/${evt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to update event status.");

      showSuccess(`Event updated to ${newStatus}.`);
      fetchEvents();
    } catch (err) {
      showError((err as Error).message);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        !search ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [events, search, statusFilter, categoryFilter]);

  const getStatusBadge = (status: EventItem["status"]) => {
    switch (status) {
      case "upcoming":
      case "published":
        return <span className={`${styles.badge} ${styles.badgeSuccess}`}><span className={styles.badgeDot} /> Upcoming</span>;
      case "ongoing":
        return <span className={`${styles.badge} ${styles.badgeInfo}`}><span className={styles.badgeDot} /> In Progress</span>;
      case "completed":
        return <span className={`${styles.badge} ${styles.badgeNeutral}`}><span className={styles.badgeDot} /> Completed</span>;
      case "cancelled":
        return <span className={`${styles.badge} ${styles.badgeDanger}`}><span className={styles.badgeDot} /> Cancelled</span>;
      case "draft":
        return <span className={`${styles.badge} ${styles.badgePending}`}><span className={styles.badgeDot} /> Draft</span>;
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
          <h2>Events Management</h2>
          <p className={styles.pageSubtitle}>
            Publish and schedule workshops, masterclasses, roundtables, and graduation ceremonies.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/news-events" target="_blank" className={styles.btnSecondary}>
            <ExternalLink size={15} /> View Public Page
          </Link>
          <button onClick={handleOpenCreate} className={styles.btnPrimary}>
            <Plus size={16} /> Create Event
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#e0f2fe", color: "#0369a1" }}>
            <Calendar size={20} />
          </div>
          <div>
            <div className={styles.statValue}>{events.length}</div>
            <div className={styles.statLabel}>Total Events</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#dcfce7", color: "#166534" }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className={styles.statValue}>{events.filter((e) => e.status === "upcoming" || e.status === "published").length}</div>
            <div className={styles.statLabel}>Upcoming Events</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#f1f5f9", color: "#475569" }}>
            <Clock size={20} />
          </div>
          <div>
            <div className={styles.statValue}>{events.filter((e) => e.status === "completed").length}</div>
            <div className={styles.statLabel}>Past / Completed</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#fef3c7", color: "#92400e" }}>
            <Archive size={20} />
          </div>
          <div>
            <div className={styles.statValue}>{events.filter((e) => e.status === "draft" || e.status === "archived").length}</div>
            <div className={styles.statLabel}>Drafts & Archived</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by event title or location..."
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
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">In Progress</option>
            <option value="completed">Completed</option>
            <option value="draft">Drafts</option>
            <option value="cancelled">Cancelled</option>
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
          <div className={styles.loadingBox}>Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateTitle}>No events scheduled</div>
            <p className={styles.emptyStateText}>Create an event or adjust your search filter.</p>
            <button onClick={handleOpenCreate} className={styles.btnPrimary}>
              <Plus size={16} /> Create Event
            </button>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "36%" }}>Event & Description</th>
                  <th style={{ width: "16%" }}>Date & Time</th>
                  <th style={{ width: "18%" }}>Venue / Location</th>
                  <th style={{ width: "12%" }}>Status</th>
                  <th style={{ width: "18%", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((evt) => (
                  <tr key={evt.id}>
                    <td>
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#16587b", textTransform: "uppercase" }}>
                          {evt.category}
                        </span>
                        <div style={{ fontWeight: 700, color: "#141b22", fontSize: "14px" }}>
                          {evt.title}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: 2, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {evt.description}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                        {new Date(evt.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                        {new Date(evt.event_date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "12.5px", color: "#475569", display: "flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={13} style={{ color: "#94a3b8", flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {evt.location}
                        </span>
                      </div>
                    </td>
                    <td>{getStatusBadge(evt.status)}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <button
                          onClick={() => handleOpenEdit(evt)}
                          title="Edit Event"
                          className={styles.btnSecondary}
                          style={{ padding: "6px 8px" }}
                        >
                          <Edit2 size={14} />
                        </button>

                        {evt.status === "upcoming" ? (
                          <button
                            onClick={() => handleStatusChange(evt, "completed")}
                            title="Mark Completed"
                            className={styles.btnSecondary}
                            style={{ padding: "6px 8px", color: "#16a34a" }}
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        ) : null}

                        {evt.status === "archived" ? (
                          <button
                            onClick={() => handleStatusChange(evt, "upcoming")}
                            title="Restore Event"
                            className={styles.btnSecondary}
                            style={{ padding: "6px 8px", color: "#0284c7" }}
                          >
                            <RotateCcw size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(evt, "archived")}
                            title="Archive Event"
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
                {editingId ? "Edit Event" : "Create Event"}
              </h3>
              <button onClick={() => setModalOpen(false)} className={styles.drawerClose}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className={styles.drawerBody}>
              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Youth Employability & Digital Skills Masterclass"
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
                  <label className={styles.detailLabel}>Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.event_date}
                    onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                  />
                </div>
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Venue / Location / Online Access *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FGR Training Hall, Calabar or Zoom Webinar link"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className={styles.searchInput}
                  style={{ paddingLeft: "12px" }}
                />
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Event Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Key talking points, facilitators, workshop outcomes..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={styles.searchInput}
                  style={{ padding: "10px 12px", minHeight: "90px", resize: "vertical" }}
                />
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailField}>
                  <label className={styles.detailLabel}>Registration Link (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://... or /contact"
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
                    onChange={(e) => setForm({ ...form, status: e.target.value as EventItem["status"] })}
                    className={styles.selectInput}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Featured Poster / Image</label>
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
              </div>

              <div className={styles.drawerFooter} style={{ padding: 0, marginTop: "10px", background: "none" }}>
                <button type="button" onClick={() => setModalOpen(false)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={styles.btnPrimary}>
                  {saving ? "Saving..." : editingId ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
