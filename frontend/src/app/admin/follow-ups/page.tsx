"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "../admin-common.module.css";
import {
  Plus,
  Calendar,
  CheckCircle2,
  Filter,
  X,
} from "lucide-react";

interface FollowUpTask {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  assigned_to_profile?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
  created_by_profile?: {
    full_name: string;
  };
  related_type: string;
  related_id?: string;
  due_date?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  created_at: string;
}

export default function FollowUpsPage() {
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Create Task Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    dueDate: "",
    relatedType: "general" as "registration" | "partnership" | "enquiry" | "programme" | "event" | "general",
  });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);

      const res = await fetch(`/api/admin/follow-ups?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load follow-up tasks.");

      const json = await res.json();
      if (json.success) {
        setTasks(json.data.tasks || []);
      } else {
        setError(json.message || "Failed to load tasks.");
      }
    } catch (err) {
      setError((err as Error).message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, [fetchTasks]);

  const handleToggleComplete = async (task: FollowUpTask) => {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    try {
      const res = await fetch(`/api/admin/follow-ups/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
        );
      }
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    try {
      setCreating(true);
      const res = await fetch("/api/admin/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskForm.title.trim(),
          description: taskForm.description.trim() || undefined,
          priority: taskForm.priority,
          dueDate: taskForm.dueDate || undefined,
          relatedType: taskForm.relatedType,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setModalOpen(false);
        setTaskForm({
          title: "",
          description: "",
          priority: "medium",
          dueDate: "",
          relatedType: "general",
        });
        fetchTasks();
      } else {
        alert(json.message || "Failed to create task.");
      }
    } catch {
      alert("Error creating task.");
    } finally {
      setCreating(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <span
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Urgent
          </span>
        );
      case "high":
        return (
          <span
            style={{
              background: "#ffedd5",
              color: "#9a3412",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            High
          </span>
        );
      case "medium":
        return (
          <span
            style={{
              background: "#e0f2fe",
              color: "#0369a1",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Medium
          </span>
        );
      default:
        return (
          <span
            style={{
              background: "#f1f5f9",
              color: "#475569",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Low
          </span>
        );
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "No date set";
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
          <h2>Follow-Up Tasks & Action Items</h2>
          <p className={styles.pageSubtitle}>
            Track admissions outreach, partner meeting reminders, message replies, and team deliverables.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={() => setModalOpen(true)} className={styles.btnPrimary}>
            <Plus size={15} />
            Create Follow-Up Task
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748b" }}>
          <Filter size={15} />
          <strong>Filter Tasks:</strong>
        </div>

        <div className={styles.filterControls}>
          <select
            className={styles.selectInput}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            className={styles.selectInput}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
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

      {/* Task List Card */}
      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle2 size={36} color="#94a3b8" />
            <h4 className={styles.emptyStateTitle}>All caught up!</h4>
            <p className={styles.emptyStateText}>
              There are no follow-up tasks matching the current filters. Create a new task to stay organized.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {tasks.map((task) => {
              const isCompleted = task.status === "completed";
              return (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--color-border-default, #e2e8f0)",
                    background: isCompleted ? "#fbfcfd" : "#ffffff",
                    gap: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => handleToggleComplete(task)}
                      style={{
                        marginTop: "3px",
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                        accentColor: "var(--color-primary, #202833)",
                      }}
                      title={isCompleted ? "Mark pending" : "Mark completed"}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: isCompleted ? "#94a3b8" : "#141b22",
                          textDecoration: isCompleted ? "line-through" : "none",
                        }}
                      >
                        {task.title}
                      </div>

                      {task.description && (
                        <p
                          style={{
                            margin: "4px 0 0 0",
                            fontSize: "12.5px",
                            color: isCompleted ? "#94a3b8" : "#64748b",
                            lineHeight: 1.4,
                          }}
                        >
                          {task.description}
                        </p>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          marginTop: "8px",
                          fontSize: "12px",
                          color: "#64748b",
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={13} /> Due: {formatDate(task.due_date)}
                        </span>
                        <span style={{ textTransform: "capitalize" }}>
                          Category: <strong>{task.related_type}</strong>
                        </span>
                        {task.created_by_profile && (
                          <span>Created by {task.created_by_profile.full_name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {getPriorityBadge(task.priority)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {modalOpen && (
        <div className={styles.drawerOverlay} onClick={() => setModalOpen(false)}>
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "#ffffff",
              borderRadius: "10px",
              margin: "auto",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#141b22" }}>
                Create Follow-Up Task
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  className={styles.searchInput}
                  style={{ paddingLeft: "12px" }}
                  placeholder="e.g. Call candidate about interview scheduling"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Description / Context
                </label>
                <textarea
                  rows={3}
                  className={styles.searchInput}
                  style={{ paddingLeft: "12px", height: "auto" }}
                  placeholder="Provide background context or notes..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Priority
                  </label>
                  <select
                    className={styles.selectInput}
                    style={{ width: "100%" }}
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, priority: e.target.value as FollowUpTask["priority"] })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    className={styles.selectInput}
                    style={{ width: "100%" }}
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Record Association
                </label>
                <select
                  className={styles.selectInput}
                  style={{ width: "100%" }}
                  value={taskForm.relatedType}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, relatedType: e.target.value as typeof taskForm.relatedType })
                  }
                >
                  <option value="general">General Operation</option>
                  <option value="registration">Training Registration</option>
                  <option value="partnership">Partnership Enquiry</option>
                  <option value="enquiry">Contact Message</option>
                  <option value="programme">Programme Management</option>
                  <option value="event">Event Coordination</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={styles.btnSecondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !taskForm.title.trim()}
                  className={styles.btnPrimary}
                >
                  {creating ? "Creating..." : "Save Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
