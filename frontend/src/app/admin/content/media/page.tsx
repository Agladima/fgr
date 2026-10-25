"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import styles from "../../admin-common.module.css";
import { useAdminNotification } from "@/lib/admin/notification-context";
import {
  Upload,
  Search,
  Copy,
  Check,
  Trash2,
  Edit2,
  FileText,
  File,
  Image as ImageIcon,
  ExternalLink,
  X,
  Sparkles,
} from "lucide-react";

interface MediaItem {
  id: string;
  bucket_name: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  alt_text?: string | null;
  public_url: string;
  created_at: string;
}

export default function MediaLibraryCMSPage() {
  const { showError, showSuccess } = useAdminNotification();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [altTextModalOpen, setAltTextModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [altTextInput, setAltTextInput] = useState("");
  const [savingAlt, setSavingAlt] = useState(false);

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/media");
      if (!res.ok) throw new Error("Failed to load media files.");
      const json = await res.json();
      if (json.success) {
        setMedia(json.data || []);
      }
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fd = new FormData();
        fd.append("file", file);
        fd.append("alt_text", file.name.replace(/\.[^/.]+$/, ""));

        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: fd,
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || `Failed to upload ${file.name}`);
        }
      }

      showSuccess("File(s) uploaded successfully.");
      fetchMedia();
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleCopyUrl = (item: MediaItem) => {
    if (!item.public_url) return;
    navigator.clipboard.writeText(item.public_url);
    setCopiedId(item.id);
    showSuccess("Public URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenEditAlt = (item: MediaItem) => {
    setEditingMedia(item);
    setAltTextInput(item.alt_text || "");
    setAltTextModalOpen(true);
  };

  const handleSaveAlt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;

    try {
      setSavingAlt(true);
      const res = await fetch(`/api/admin/media/${editingMedia.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt_text: altTextInput.trim() }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to update alt text.");

      showSuccess("Alternative text updated.");
      setAltTextModalOpen(false);
      fetchMedia();
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setSavingAlt(false);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.file_name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/media/${item.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to delete media.");

      showSuccess("Media file deleted.");
      fetchMedia();
    } catch (err) {
      showError((err as Error).message);
    }
  };

  const filteredMedia = useMemo(() => {
    return media.filter((m) => {
      const q = search.toLowerCase();
      return (
        !search ||
        m.file_name.toLowerCase().includes(q) ||
        (m.alt_text && m.alt_text.toLowerCase().includes(q)) ||
        m.mime_type.toLowerCase().includes(q)
      );
    });
  }, [media, search]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrap}>
          <h2>Media Library</h2>
          <p className={styles.pageSubtitle}>
            Upload and organize photos, posters, and documents used across website content.
          </p>
        </div>
        <div className={styles.headerActions}>
          <label className={styles.btnPrimary} style={{ cursor: "pointer" }}>
            <Upload size={16} />
            {uploading ? "Uploading..." : "Upload Media"}
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search files by name or alt text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
          {filteredMedia.length} {filteredMedia.length === 1 ? "file" : "files"}
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className={styles.loadingBox}>Loading media files...</div>
      ) : filteredMedia.length === 0 ? (
        <div className={styles.tableCard}>
          <div className={styles.emptyState}>
            <div className={styles.emptyStateTitle}>No media files found</div>
            <p className={styles.emptyStateText}>
              Upload images (JPG, PNG, WebP) or documents (PDF, DOCX) to get started.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          {filteredMedia.map((item) => {
            const isImage = item.mime_type.startsWith("image/");
            return (
              <div
                key={item.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "transform 0.15s ease",
                }}
              >
                {/* Media Thumbnail */}
                <div style={{ height: 160, position: "relative", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isImage && item.public_url ? (
                    <Image
                      src={item.public_url}
                      alt={item.alt_text || item.file_name}
                      fill
                      sizes="280px"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "#64748b" }}>
                      <FileText size={38} style={{ color: "#16587b" }} />
                      <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>
                        {item.file_name.split(".").pop()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div
                      title={item.file_name}
                      style={{
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#141b22",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.file_name}
                    </div>

                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                      <span>{formatFileSize(item.file_size)}</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>

                    {item.alt_text && (
                      <div style={{ fontSize: "11.5px", color: "#475569", marginTop: 6, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        Alt: {item.alt_text}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                    <button
                      onClick={() => handleCopyUrl(item)}
                      title="Copy Public URL"
                      className={styles.btnSecondary}
                      style={{ padding: "5px 8px", fontSize: "11.5px", gap: 4 }}
                    >
                      {copiedId === item.id ? <Check size={13} style={{ color: "#16a34a" }} /> : <Copy size={13} />}
                      {copiedId === item.id ? "Copied" : "Copy URL"}
                    </button>

                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={() => handleOpenEditAlt(item)}
                        title="Edit Alt Text"
                        className={styles.btnSecondary}
                        style={{ padding: "5px 6px" }}
                      >
                        <Edit2 size={13} />
                      </button>

                      <a
                        href={item.public_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open file"
                        className={styles.btnSecondary}
                        style={{ padding: "5px 6px" }}
                      >
                        <ExternalLink size={13} />
                      </a>

                      <button
                        onClick={() => handleDelete(item)}
                        title="Delete file"
                        className={styles.btnDanger}
                        style={{ padding: "5px 6px" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Alt Text Modal */}
      {altTextModalOpen && editingMedia && (
        <div className={styles.drawerOverlay} onClick={() => setAltTextModalOpen(false)}>
          <div className={styles.drawer} style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>Edit Media Metadata</h3>
              <button onClick={() => setAltTextModalOpen(false)} className={styles.drawerClose}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAlt} className={styles.drawerBody}>
              <div className={styles.detailField}>
                <label className={styles.detailLabel}>File Name</label>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                  {editingMedia.file_name}
                </div>
              </div>

              <div className={styles.detailField}>
                <label className={styles.detailLabel}>Alternative Text (for screen readers and SEO)</label>
                <textarea
                  rows={3}
                  placeholder="Describe this image accurately..."
                  value={altTextInput}
                  onChange={(e) => setAltTextInput(e.target.value)}
                  className={styles.searchInput}
                  style={{ padding: "10px 12px", resize: "vertical" }}
                />
              </div>

              <div className={styles.drawerFooter} style={{ padding: 0, marginTop: "10px", background: "none" }}>
                <button type="button" onClick={() => setAltTextModalOpen(false)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" disabled={savingAlt} className={styles.btnPrimary}>
                  {savingAlt ? "Saving..." : "Save Metadata"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
