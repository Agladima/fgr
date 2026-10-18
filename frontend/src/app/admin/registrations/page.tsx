"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "../admin-common.module.css";
import {
  Search,
  Eye,
  X,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Registration {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  programme: string;
  status: string;
  location?: string;
  education_level?: string;
  employment_status?: string;
  reason?: string;
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

export default function RegistrationsManagementPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [programmeFilter, setProgrammeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected Record & Drawer State
  const [selectedRecord, setSelectedRecord] = useState<Registration | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Internal Notes State
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "15",
      });

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (programmeFilter !== "all") params.append("programme", programmeFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const res = await fetch(`/api/admin/registrations?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch registrations.");

      const json = await res.json();
      if (json.success) {
        setRegistrations(json.data.registrations || []);
        setTotalPages(json.data.pagination.totalPages || 1);
        setTotalCount(json.data.pagination.total || 0);
      } else {
        setError(json.message || "Failed to load registrations.");
      }
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, programmeFilter, searchTerm]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Open Drawer and fetch notes
  const handleOpenDrawer = async (record: Registration) => {
    setSelectedRecord(record);
    setNewStatus(record.status);
    setStatusMessage(null);
    setDrawerOpen(true);
    fetchNotes(record.id);
  };

  const fetchNotes = async (recordId: string) => {
    try {
      setLoadingNotes(true);
      const res = await fetch(`/api/admin/notes?recordType=registration&recordId=${recordId}`);
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
      const res = await fetch(`/api/admin/registrations/${selectedRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setStatusMessage({ text: "Status updated successfully.", type: "success" });
        setSelectedRecord({ ...selectedRecord, status: newStatus });
        // Update local list
        setRegistrations((prev) =>
          prev.map((r) => (r.id === selectedRecord.id ? { ...r, status: newStatus } : r))
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
          recordType: "registration",
          recordId: selectedRecord.id,
          content: newNoteContent.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setNewNoteContent("");
        fetchNotes(selectedRecord.id);
      } else {
        alert(json.message || "Failed to add internal note.");
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
      case "pending":
        return (
          <span className={`${styles.badge} ${styles.badgePending}`}>
            <span className={styles.badgeDot} />
            Pending
          </span>
        );
      case "accepted":
      case "shortlisted":
        return (
          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
            <span className={styles.badgeDot} />
            {status}
          </span>
        );
      case "reviewed":
      case "under_review":
        return (
          <span className={`${styles.badge} ${styles.badgeInfo}`}>
            <span className={styles.badgeDot} />
            {status}
          </span>
        );
      case "rejected":
        return (
          <span className={`${styles.badge} ${styles.badgeDanger}`}>
            <span className={styles.badgeDot} />
            Rejected
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
          <h2>Training Registrations</h2>
          <p className={styles.pageSubtitle}>
            Review candidate applications, manage cohort admissions, update screening statuses, and leave staff notes.
          </p>
        </div>
        <div className={styles.headerActions}>
          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
            {totalCount} total applicant{totalCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name, email, phone, location..."
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
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="accepted">Accepted</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            className={styles.selectInput}
            value={programmeFilter}
            onChange={(e) => {
              setProgrammeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Programmes</option>
            <option value="Employability Skills">Employability Skills</option>
            <option value="Digital Literacy & Tech">Digital Literacy & Tech</option>
            <option value="Leadership & Management">Leadership & Management</option>
            <option value="Entrepreneurship">Entrepreneurship</option>
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
                <th>Applicant</th>
                <th>Contact</th>
                <th>Programme</th>
                <th>Location</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    Loading candidate registrations...
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    No registrations found matching the filters.
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "#141b22" }}>{reg.full_name}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{reg.employment_status || "Applicant"}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: "13px" }}>{reg.email}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{reg.phone}</div>
                    </td>
                    <td style={{ fontSize: "13px", fontWeight: 500 }}>{reg.programme}</td>
                    <td style={{ fontSize: "13px", color: "#64748b" }}>{reg.location || "N/A"}</td>
                    <td>{getStatusBadge(reg.status)}</td>
                    <td style={{ fontSize: "12px", color: "#64748b" }}>
                      {formatDate(reg.created_at)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleOpenDrawer(reg)}
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

        {/* Pagination Bar */}
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

      {/* Slide-out Detail Drawer */}
      {drawerOpen && selectedRecord && (
        <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h3 className={styles.drawerTitle}>Registration Details</h3>
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
              {/* Status Update Control Card */}
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
                    Admission Status
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
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="accepted">Accepted</option>
                    <option value="waitlisted">Waitlisted</option>
                    <option value="rejected">Rejected</option>
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

              {/* Applicant Profile Information */}
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Applicant Profile</h4>
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
                    <a
                      href={`tel:${selectedRecord.phone}`}
                      className={styles.detailVal}
                      style={{ color: "#2563eb", textDecoration: "none" }}
                    >
                      {selectedRecord.phone}
                    </a>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Residential Location</span>
                    <span className={styles.detailVal}>{selectedRecord.location || "Not specified"}</span>
                  </div>
                </div>
              </div>

              {/* Academic & Background */}
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Education & Career Background</h4>
                <div className={styles.detailGrid}>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Programme Selected</span>
                    <span className={styles.detailVal}>{selectedRecord.programme}</span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Highest Education</span>
                    <span className={styles.detailVal}>{selectedRecord.education_level || "Not specified"}</span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Current Employment Status</span>
                    <span className={styles.detailVal}>{selectedRecord.employment_status || "Not specified"}</span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Application Date</span>
                    <span className={styles.detailVal}>{formatDate(selectedRecord.created_at)}</span>
                  </div>
                </div>

                {selectedRecord.reason && (
                  <div style={{ marginTop: "14px" }}>
                    <span className={styles.detailLabel}>Reason / Motivation Statement</span>
                    <p
                      style={{
                        margin: "6px 0 0 0",
                        fontSize: "13px",
                        lineHeight: 1.5,
                        color: "#334155",
                        background: "#ffffff",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {selectedRecord.reason}
                    </p>
                  </div>
                )}
              </div>

              {/* Internal Staff Notes */}
              <div className={styles.detailSection}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <h4 className={styles.detailSectionTitle} style={{ margin: 0 }}>
                    Internal Staff Notes ({notes.length})
                  </h4>
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} style={{ marginBottom: "16px" }}>
                  <textarea
                    rows={2}
                    placeholder="Add an internal note or interview evaluation..."
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

                {/* Notes List */}
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
