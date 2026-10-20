"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "../admin-common.module.css";
import { useAdminNotification } from "@/lib/admin/notification-context";
import {
  Plus,
  Edit2,
  Trash2,
  MapPin,
  ExternalLink,
  X,
} from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  category: string;
  description: string;
  event_date: string;
  location: string;
  registration_url?: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  created_at: string;
}

export default function EventsManagementPage() {
  const { showError } = useAdminNotification();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "Workshop",
    description: "",
    event_date: "",
    location: "FGR Center / Hybrid",
    registration_url: "",
    status: "upcoming" as EventItem["status"],
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/content/events");
      if (!res.ok) throw new Error("Failed to load events.");

      const json = await res.json();
      if (json.success) {
        setEvents(json.data || []);
      } else {
        setError(json.message || "Failed to load events.");
      }
    } catch (err) {
      setError((err as Error).message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvents();
  }, [fetchEvents]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      title: "",
      category: "Workshop",
      description: "",
      event_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
      location: "FGR Training Hall & Zoom",
      registration_url: "",
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
      status: evt.status,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.event_date || !form.location) {
      showError("Please fill in Title, Event Date, and Location.");
      return;
    }

    try {
      setSaving(true);
      const url = editingId
        ? `/api/admin/content/events/${editingId}`
        : `/api/admin/content/events`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          event_date: new Date(form.event_date).toISOString(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setModalOpen(false);
        fetchEvents();
      } else {
        showError(json.message || "Failed to save event.");
      }
    } catch {
      showError("Error saving event.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (evt: EventItem) => {
    if (!confirm(`Are you sure you want to delete "${evt.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/content/events/${evt.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setEvents((prev) => prev.filter((item) => item.id !== evt.id));
      } else {
        showError("Failed to delete event.");
      }
    } catch {
      showError("Error deleting event.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return (
          <span className={`${styles.badge} ${styles.badgeInfo}`}>
            <span className={styles.badgeDot} /> Upcoming
          </span>
        );
      case "ongoing":
        return (
          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
            <span className={styles.badgeDot} /> In Progress
          </span>
        );
      case "completed":
        return (
          <span className={`${styles.badge} ${styles.badgeNeutral}`}>
            <span className={styles.badgeDot} /> Completed
          </span>
        );
      default:
        return (
          <span className={`${styles.badge} ${styles.badgeDanger}`}>
            <span className={styles.badgeDot} /> Cancelled
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrap}>
          <h2>Events & Workshops Management</h2>
          <p className={styles.pageSubtitle}>
            Schedule masterclasses, open days, employer mixers, and career orientation bootcamps.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={handleOpenCreate} className={styles.btnPrimary}>
            <Plus size={15} /> Add Event
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

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Event Title</th>
                <th>Category</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    Loading events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    No events scheduled yet. Click &quot;Add Event&quot; to create one.
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "#141b22" }}>{evt.title}</div>
                      {evt.registration_url && (
                        <a
                          href={evt.registration_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: "12px", color: "#2563eb", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px" }}
                        >
                          Registration Link <ExternalLink size={11} />
                        </a>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          background: "#f1f5f9",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          color: "#334155",
                          fontWeight: 500,
                        }}
                      >
                        {evt.category}
                      </span>
                    </td>
                    <td style={{ fontSize: "13px", color: "#334155" }}>
                      {formatDate(evt.event_date)}
                    </td>
                    <td style={{ fontSize: "13px", color: "#64748b" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={13} /> {evt.location}
                      </span>
                    </td>
                    <td>{getStatusBadge(evt.status)}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          onClick={() => handleOpenEdit(evt)}
                          className={styles.btnSecondary}
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                          title="Edit event"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(evt)}
                          className={styles.btnDanger}
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                          title="Delete event"
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
                {editingId ? "Edit Event" : "Create New Event"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  className={styles.searchInput}
                  style={{ paddingLeft: "12px" }}
                  placeholder="e.g. Annual Youth Career Summit 2026"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Category
                  </label>
                  <select
                    className={styles.selectInput}
                    style={{ width: "100%" }}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Bootcamp">Bootcamp</option>
                    <option value="Career Fair">Career Fair</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Panel Discussion">Panel Discussion</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Status
                  </label>
                  <select
                    className={styles.selectInput}
                    style={{ width: "100%" }}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as EventItem["status"] })}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className={styles.selectInput}
                    style={{ width: "100%" }}
                    value={form.event_date}
                    onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Location / Platform *
                  </label>
                  <input
                    type="text"
                    required
                    className={styles.searchInput}
                    style={{ paddingLeft: "12px" }}
                    placeholder="e.g. FGR Tech Lab, Abuja / Zoom"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Registration Link (Optional)
                </label>
                <input
                  type="url"
                  className={styles.searchInput}
                  style={{ paddingLeft: "12px" }}
                  placeholder="https://..."
                  value={form.registration_url}
                  onChange={(e) => setForm({ ...form, registration_url: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Description & Agenda
                </label>
                <textarea
                  rows={3}
                  className={styles.searchInput}
                  style={{ paddingLeft: "12px", height: "auto" }}
                  placeholder="Event details, target attendees, guest speakers..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
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
                  {saving ? "Saving..." : editingId ? "Update Event" : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
