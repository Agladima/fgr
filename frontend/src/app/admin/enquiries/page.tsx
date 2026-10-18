"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "../admin-common.module.css";
import {
  Search,
  Eye,
  X,
  Send,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ContactEnquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface InternalNote {
  id: string;
  author_name: string;
  author_role: string;
  content: string;
  created_at: string;
}

export default function EnquiriesManagementPage() {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected Record & Drawer State
  const [selectedRecord, setSelectedRecord] = useState<ContactEnquiry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Internal Notes State
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const fetchEnquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "15",
      });

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const res = await fetch(`/api/admin/enquiries?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch enquiries.");

      const json = await res.json();
      if (json.success) {
        setEnquiries(json.data.enquiries || []);
        setTotalPages(json.data.pagination.totalPages || 1);
        setTotalCount(json.data.pagination.total || 0);
      } else {
        setError(json.message || "Failed to load enquiries.");
      }
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleOpenDrawer = (record: ContactEnquiry) => {
    setSelectedRecord(record);
    setNewStatus(record.status);
    setStatusMessage(null);
    setDrawerOpen(true);
    fetchNotes(record.id);

    // If message was unread, optionally auto-mark in_review if desired
  };

  const fetchNotes = async (recordId: string) => {
    try {
      setLoadingNotes(true);
      const res = await fetch(`/api/admin/notes?recordType=enquiry&recordId=${recordId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setNotes(json.data.notes || []);
        }
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedRecord || newStatus === selectedRecord.status) return;

    try {
      setUpdatingStatus(true);
      setStatusMessage(null);
      const res = await fetch(`/api/admin/enquiries/${selectedRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setStatusMessage({ text: "Status updated.", type: "success" });
        setSelectedRecord({ ...selectedRecord, status: newStatus });
        setEnquiries((prev) =>
          prev.map((e) => (e.id === selectedRecord.id ? { ...e, status: newStatus } : e))
        );
      } else {
        setStatusMessage({ text: json.message || "Failed to update status.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: (err as Error).message || "Update error.", type: "error" });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !newNoteContent.trim()) return;

    try {
      setAddingNote(true);
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordType: "enquiry",
          recordId: selectedRecord.id,
          content: newNoteContent.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setNewNoteContent("");
        fetchNotes(selectedRecord.id);
      } else {
        alert(json.message || "Failed to add note.");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding note.");
    } finally {
      setAddingNote(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "unread":
        return (
          <span className={`${styles.badge} ${styles.badgePending}`}>
            <span className={styles.badgeDot} />
            Unread
          </span>
        );
      case "responded":
        return (
          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
            <span className={styles.badgeDot} />
            Responded
          </span>
        );
      case "in_review":
        return (
          <span className={`${styles.badge} ${styles.badgeInfo}`}>
            <span className={styles.badgeDot} />
            In Review
          </span>
        );
      case "archived":
        return (
          <span className={`${styles.badge} ${styles.badgeNeutral}`}>
            <span className={styles.badgeDot} />
            Archived
          </span>
        );
      default:
        return (
          <span className={`${styles.badge} ${styles.badgeNeutral}`}>
            <span className={styles.badgeDot} />
            {status}
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
          <h2>Contact Messages & Enquiries</h2>
          <p className={styles.pageSubtitle}>
            Read visitor enquiries, track response status, collaborate on answers, and maintain correspondence logs.
          </p>
        </div>
        <div className={styles.headerActions}>
          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
            {totalCount} total message{totalCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search sender, email, subject, message text..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className={styles.filterControls}>
          <select
            className={styles.selectInput}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="unread">Unread</option>
            <option value="in_review">In Review</option>
            <option value="responded">Responded</option>
            <option value="archived">Archived</option>
          </select>
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
                <th>Sender</th>
                <th>Subject</th>
                <th>Message Snippet</th>
                <th>Status</th>
                <th>Received</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    Loading contact messages...
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    No messages found matching the current filter.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr key={enq.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "#141b22" }}>{enq.full_name}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{enq.email}</div>
                    </td>
                    <td style={{ fontWeight: 500, fontSize: "13px" }}>{enq.subject}</td>
                    <td style={{ fontSize: "13px", color: "#64748b", maxWidth: "260px" }}>
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {enq.message}
                      </div>
                    </td>
                    <td>{getStatusBadge(enq.status)}</td>
                    <td style={{ fontSize: "12px", color: "#64748b" }}>
                      {formatDate(enq.created_at)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleOpenDrawer(enq)}
                        className={styles.btnSecondary}
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--color-border-default, #e2e8f0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f8fafc",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          <div>
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className={styles.btnSecondary}
              style={{ padding: "6px 12px" }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className={styles.btnSecondary}
              style={{ padding: "6px 12px" }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && selectedRecord && (
        <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h3 className={styles.drawerTitle}>Message Details</h3>
                {getStatusBadge(selectedRecord.status)}
              </div>
              <button
                className={styles.drawerClose}
                onClick={() => setDrawerOpen(false)}
                title="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Status Update Control */}
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#1e40af", textTransform: "uppercase" }}>
                    Response Status
                  </span>
                  {statusMessage && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: statusMessage.type === "success" ? "#16a34a" : "#dc2626",
                        fontWeight: 600,
                      }}
                    >
                      {statusMessage.text}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <select
                    className={styles.selectInput}
                    style={{ flex: 1 }}
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="unread">Unread</option>
                    <option value="in_review">In Review</option>
                    <option value="responded">Responded</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updatingStatus || newStatus === selectedRecord.status}
                    className={styles.btnPrimary}
                  >
                    {updatingStatus ? "Saving..." : "Update Status"}
                  </button>
                </div>
              </div>

              {/* Sender Info */}
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Sender Information</h4>
                <div className={styles.detailGrid}>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Full Name</span>
                    <span className={styles.detailVal}>{selectedRecord.full_name}</span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Email Address</span>
                    <a
                      href={`mailto:${selectedRecord.email}`}
                      className={styles.detailVal}
                      style={{ color: "#2563eb", textDecoration: "none" }}
                    >
                      {selectedRecord.email}
                    </a>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Phone Number</span>
                    <span className={styles.detailVal}>
                      {selectedRecord.phone ? (
                        <a
                          href={`tel:${selectedRecord.phone}`}
                          style={{ color: "#2563eb", textDecoration: "none" }}
                        >
                          {selectedRecord.phone}
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Received Timestamp</span>
                    <span className={styles.detailVal}>{formatDate(selectedRecord.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Subject & Message Body</h4>
                <div style={{ marginBottom: "10px" }}>
                  <span className={styles.detailLabel}>Subject:</span>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#141b22", marginTop: "2px" }}>
                    {selectedRecord.subject}
                  </div>
                </div>

                <div>
                  <span className={styles.detailLabel}>Message:</span>
                  <p
                    style={{
                      margin: "6px 0 0 0",
                      fontSize: "13.5px",
                      lineHeight: 1.6,
                      color: "#1e293b",
                      background: "#ffffff",
                      padding: "14px 16px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedRecord.message}
                  </p>
                </div>
              </div>

              {/* Internal Notes */}
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Internal Staff Notes ({notes.length})</h4>

                <form onSubmit={handleAddNote} style={{ marginBottom: "16px" }}>
                  <textarea
                    rows={2}
                    placeholder="Add notes about correspondence or phone follow-up..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      fontSize: "13px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                    <button
                      type="submit"
                      disabled={addingNote || !newNoteContent.trim()}
                      className={styles.btnSecondary}
                      style={{ fontSize: "12px", padding: "6px 12px" }}
                    >
                      <Send size={12} />
                      {addingNote ? "Adding..." : "Add Note"}
                    </button>
                  </div>
                </form>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {loadingNotes ? (
                    <div style={{ fontSize: "12.5px", color: "#94a3b8" }}>Loading notes...</div>
                  ) : notes.length === 0 ? (
                    <div style={{ fontSize: "12.5px", color: "#94a3b8" }}>No internal notes added yet.</div>
                  ) : (
                    notes.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          padding: "10px 12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "11.5px",
                            color: "#64748b",
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ fontWeight: 600, color: "#141b22" }}>
                            {n.author_name} ({n.author_role.replace("_", " ")})
                          </span>
                          <span>{formatDate(n.created_at)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: "13px", color: "#334155", whiteSpace: "pre-wrap" }}>
                          {n.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className={styles.drawerFooter}>
              <a
                href={`mailto:${selectedRecord.email}?subject=Re:%20${encodeURIComponent(selectedRecord.subject)}`}
                className={styles.btnPrimary}
              >
                <Mail size={14} /> Send Email Reply
              </a>
              <button onClick={() => setDrawerOpen(false)} className={styles.btnSecondary}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
