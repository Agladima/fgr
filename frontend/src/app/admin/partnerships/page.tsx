"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "../admin-common.module.css";
import { useAdminNotification } from "@/lib/admin/notification-context";
import {
  Search,
  Eye,
  X,
  Send,
  Mail,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface PartnershipEnquiry {
  id: string;
  organisation_name: string;
  contact_person: string;
  email: string;
  phone: string;
  website?: string;
  organisation_type: string;
  interests?: string[];
  other_interest?: string;
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

export default function PartnershipsManagementPage() {
  const { showError } = useAdminNotification();
  const [partnerships, setPartnerships] = useState<PartnershipEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected Record & Drawer State
  const [selectedRecord, setSelectedRecord] = useState<PartnershipEnquiry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Internal Notes State
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const fetchPartnerships = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "15",
      });

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const res = await fetch(`/api/admin/partnerships?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch partnership enquiries.");

      const json = await res.json();
      if (json.success) {
        setPartnerships(json.data.partnerships || []);
        setTotalPages(json.data.pagination.totalPages || 1);
        setTotalCount(json.data.pagination.total || 0);
      } else {
        setError(json.message || "Failed to load partnerships.");
      }
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, typeFilter, searchTerm]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPartnerships();
  }, [fetchPartnerships]);

  const handleOpenDrawer = (record: PartnershipEnquiry) => {
    setSelectedRecord(record);
    setNewStatus(record.status);
    setStatusMessage(null);
    setDrawerOpen(true);
    fetchNotes(record.id);
  };

  const fetchNotes = async (recordId: string) => {
    try {
      setLoadingNotes(true);
      const res = await fetch(`/api/admin/notes?recordType=partnership&recordId=${recordId}`);
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
      const res = await fetch(`/api/admin/partnerships/${selectedRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setStatusMessage({ text: "Status updated.", type: "success" });
        setSelectedRecord({ ...selectedRecord, status: newStatus });
        setPartnerships((prev) =>
          prev.map((p) => (p.id === selectedRecord.id ? { ...p, status: newStatus } : p))
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
          recordType: "partnership",
          recordId: selectedRecord.id,
          content: newNoteContent.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setNewNoteContent("");
        fetchNotes(selectedRecord.id);
      } else {
        showError(json.message || "Failed to add internal note.");
      }
    } catch (err) {
      console.error(err);
      showError("Error adding note.");
    } finally {
      setAddingNote(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return (
          <span className={`${styles.badge} ${styles.badgePending}`}>
            <span className={styles.badgeDot} />
            New
          </span>
        );
      case "partnered":
        return (
          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
            <span className={styles.badgeDot} />
            Partnered
          </span>
        );
      case "reviewing":
      case "contacted":
        return (
          <span className={`${styles.badge} ${styles.badgeInfo}`}>
            <span className={styles.badgeDot} />
            {status}
          </span>
        );
      case "declined":
        return (
          <span className={`${styles.badge} ${styles.badgeDanger}`}>
            <span className={styles.badgeDot} />
            Declined
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
          <h2>Partnership Enquiries</h2>
          <p className={styles.pageSubtitle}>
            Manage organizational collaborations, sponsorship proposals, institution partnerships, and pipeline stages.
          </p>
        </div>
        <div className={styles.headerActions}>
          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
            {totalCount} total proposal{totalCount === 1 ? "" : "s"}
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
            placeholder="Search organisation, contact person, email..."
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
            <option value="new">New</option>
            <option value="reviewing">Reviewing</option>
            <option value="contacted">Contacted</option>
            <option value="partnered">Partnered</option>
            <option value="declined">Declined</option>
            <option value="archived">Archived</option>
          </select>

          <select
            className={styles.selectInput}
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Sectors</option>
            <option value="corporate">Corporate / Employer</option>
            <option value="ngo">NGO / Civil Society</option>
            <option value="government">Government Agency</option>
            <option value="education">Educational Institution</option>
            <option value="other">Other</option>
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
                <th>Organisation</th>
                <th>Contact Representative</th>
                <th>Sector</th>
                <th>Status</th>
                <th>Received</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    Loading partnerships...
                  </td>
                </tr>
              ) : partnerships.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    No partnership proposals found.
                  </td>
                </tr>
              ) : (
                partnerships.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "#141b22" }}>{p.organisation_name}</div>
                      {p.website && (
                        <a
                          href={p.website.startsWith("http") ? p.website : `https://${p.website}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: "12px", color: "#2563eb", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px" }}
                        >
                          Visit website <ExternalLink size={11} />
                        </a>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: "#141b22" }}>{p.contact_person}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{p.email}</div>
                    </td>
                    <td style={{ fontSize: "13px", textTransform: "capitalize" }}>
                      {p.organisation_type}
                    </td>
                    <td>{getStatusBadge(p.status)}</td>
                    <td style={{ fontSize: "12px", color: "#64748b" }}>
                      {formatDate(p.created_at)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleOpenDrawer(p)}
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
                <h3 className={styles.drawerTitle}>Partnership Proposal</h3>
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
                    Pipeline Stage
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
                    <option value="new">New</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="contacted">Contacted</option>
                    <option value="partnered">Partnered</option>
                    <option value="declined">Declined</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updatingStatus || newStatus === selectedRecord.status}
                    className={styles.btnPrimary}
                  >
                    {updatingStatus ? "Saving..." : "Update Stage"}
                  </button>
                </div>
              </div>

              {/* Organisation Info */}
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Organisation Details</h4>
                <div className={styles.detailGrid}>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Organisation Name</span>
                    <span className={styles.detailVal}>{selectedRecord.organisation_name}</span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Sector / Classification</span>
                    <span className={styles.detailVal} style={{ textTransform: "capitalize" }}>
                      {selectedRecord.organisation_type}
                    </span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Contact Representative</span>
                    <span className={styles.detailVal}>{selectedRecord.contact_person}</span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Contact Email</span>
                    <a
                      href={`mailto:${selectedRecord.email}`}
                      className={styles.detailVal}
                      style={{ color: "#2563eb", textDecoration: "none" }}
                    >
                      {selectedRecord.email}
                    </a>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Contact Phone</span>
                    <a
                      href={`tel:${selectedRecord.phone}`}
                      className={styles.detailVal}
                      style={{ color: "#2563eb", textDecoration: "none" }}
                    >
                      {selectedRecord.phone}
                    </a>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.detailLabel}>Website</span>
                    {selectedRecord.website ? (
                      <a
                        href={
                          selectedRecord.website.startsWith("http")
                            ? selectedRecord.website
                            : `https://${selectedRecord.website}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className={styles.detailVal}
                        style={{ color: "#2563eb", textDecoration: "none" }}
                      >
                        {selectedRecord.website}
                      </a>
                    ) : (
                      <span className={styles.detailVal}>Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Proposal & Collaboration Details */}
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Collaboration Proposal</h4>
                {selectedRecord.interests && selectedRecord.interests.length > 0 && (
                  <div style={{ marginBottom: "12px" }}>
                    <span className={styles.detailLabel}>Areas of Interest:</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                      {selectedRecord.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: "#e2e8f0",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            color: "#334155",
                            fontWeight: 500,
                          }}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className={styles.detailLabel}>Proposed Collaboration Scope:</span>
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
                    placeholder="Add an internal note or meeting summary..."
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
                href={`mailto:${selectedRecord.email}?subject=FGR%20Partnership%20Enquiry%20-%20${encodeURIComponent(selectedRecord.organisation_name)}`}
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
