"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import styles from "../admin-common.module.css";
import { useAdminNotification } from "@/lib/admin/notification-context";
import {
  Newspaper,
  BookOpen,
  Calendar,
  FolderDown,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  ArrowRight,
  Plus,
  ExternalLink,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";

interface ContentCounts {
  news: number;
  newsPublished: number;
  programmes: number;
  programmesOpen: number;
  events: number;
  eventsUpcoming: number;
  resources: number;
  stories: number;
  impactMetrics: number;
  mediaFiles: number;
}

export default function ContentManagementHubPage() {
  const { showError } = useAdminNotification();
  const [counts, setCounts] = useState<ContentCounts>({
    news: 0,
    newsPublished: 0,
    programmes: 0,
    programmesOpen: 0,
    events: 0,
    eventsUpcoming: 0,
    resources: 0,
    stories: 0,
    impactMetrics: 0,
    mediaFiles: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchHubStats = useCallback(async () => {
    try {
      setLoading(true);
      const [newsRes, progRes, evtRes, resRes, storyRes, impRes, medRes] = await Promise.all([
        fetch("/api/admin/content/news"),
        fetch("/api/admin/content/programmes"),
        fetch("/api/admin/content/events"),
        fetch("/api/admin/content/resources"),
        fetch("/api/admin/content/stories"),
        fetch("/api/admin/content/impact"),
        fetch("/api/admin/media"),
      ]);

      const [newsData, progData, evtData, resData, storyData, impData, medData] = await Promise.all([
        newsRes.ok ? newsRes.json() : { data: [] },
        progRes.ok ? progRes.json() : { data: [] },
        evtRes.ok ? evtRes.json() : { data: [] },
        resRes.ok ? resRes.json() : { data: [] },
        storyRes.ok ? storyRes.json() : { data: [] },
        impRes.ok ? impRes.json() : { data: [] },
        medRes.ok ? medRes.json() : { data: [] },
      ]);

      const newsList = newsData.data || [];
      const progList = progData.data || [];
      const evtList = evtData.data || [];

      setCounts({
        news: newsList.length,
        newsPublished: newsList.filter((n: { status: string }) => n.status === "published").length,
        programmes: progList.length,
        programmesOpen: progList.filter((p: { status: string }) => p.status === "open" || p.status === "published").length,
        events: evtList.length,
        eventsUpcoming: evtList.filter((e: { status: string }) => e.status === "upcoming" || e.status === "published").length,
        resources: (resData.data || []).length,
        stories: (storyData.data || []).length,
        impactMetrics: (impData.data || []).length,
        mediaFiles: (medData.data || []).length,
      });
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchHubStats();
  }, [fetchHubStats]);

  const cmsSections = [
    {
      title: "News & Articles",
      desc: "Publish cohort announcements, admissions press releases, and editorial updates.",
      href: "/admin/content/news",
      publicHref: "/news-events",
      icon: Newspaper,
      color: "#16587b",
      bg: "#e0f2fe",
      stat: `${counts.newsPublished} published / ${counts.news} total`,
    },
    {
      title: "Programmes",
      desc: "Manage strategic training pillars, application dates, eligibility, and cohorts.",
      href: "/admin/content/programmes",
      publicHref: "/programmes",
      icon: BookOpen,
      color: "#0284c7",
      bg: "#e0f2fe",
      stat: `${counts.programmesOpen} active / ${counts.programmes} total`,
    },
    {
      title: "Events",
      desc: "Schedule and manage workshops, seminars, orientations, and graduation ceremonies.",
      href: "/admin/content/events",
      publicHref: "/news-events",
      icon: Calendar,
      color: "#0d9488",
      bg: "#ccfbf1",
      stat: `${counts.eventsUpcoming} upcoming / ${counts.events} total`,
    },
    {
      title: "Resources & Publications",
      desc: "Manage downloadable career guides, toolkits, research studies, and policy briefs.",
      href: "/admin/content/resources",
      publicHref: "/resources",
      icon: FolderDown,
      color: "#7c3aed",
      bg: "#f3e8ff",
      stat: `${counts.resources} documents & links`,
    },
    {
      title: "Success Stories",
      desc: "Manage verified graduate outcomes, employer placements, and testimonials.",
      href: "/admin/content/success-stories",
      publicHref: "/impact",
      icon: Sparkles,
      color: "#d97706",
      bg: "#fef3c7",
      stat: `${counts.stories} verified stories`,
    },
    {
      title: "Impact Metrics",
      desc: "Update official indicators like people trained, businesses supported, and partnerships.",
      href: "/admin/content/impact",
      publicHref: "/impact",
      icon: TrendingUp,
      color: "#16a34a",
      bg: "#dcfce7",
      stat: `${counts.impactMetrics} indicators`,
    },
    {
      title: "Media Library",
      desc: "Central repository of uploaded images, logos, and approved documents with public URLs.",
      href: "/admin/content/media",
      icon: ImageIcon,
      color: "#475569",
      bg: "#f1f5f9",
      stat: `${counts.mediaFiles} files hosted`,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleWrap}>
          <h2>Website Content Management Hub</h2>
          <p className={styles.pageSubtitle}>
            Central control for all public-facing pages, training streams, articles, and indicators.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/" target="_blank" className={styles.btnSecondary}>
            <ExternalLink size={15} /> View Website
          </Link>
          <Link href="/admin/content/news" className={styles.btnPrimary}>
            <Plus size={16} /> New Article
          </Link>
        </div>
      </div>

      {/* Global Status Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#e0f2fe", color: "#16587b" }}>
            <Layers size={22} />
          </div>
          <div>
            <div className={styles.statValue}>
              {loading ? "..." : counts.news + counts.programmes + counts.events + counts.resources + counts.stories}
            </div>
            <div className={styles.statLabel}>Total Managed Content Items</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#dcfce7", color: "#166534" }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className={styles.statValue}>
              {loading ? "..." : counts.newsPublished + counts.programmesOpen + counts.eventsUpcoming}
            </div>
            <div className={styles.statLabel}>Active Public Records</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#fef3c7", color: "#92400e" }}>
            <Clock size={22} />
          </div>
          <div>
            <div className={styles.statValue}>
              {loading ? "..." : counts.news - counts.newsPublished}
            </div>
            <div className={styles.statLabel}>Pending Drafts & Reviews</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#f1f5f9", color: "#475569" }}>
            <ImageIcon size={22} />
          </div>
          <div>
            <div className={styles.statValue}>{loading ? "..." : counts.mediaFiles}</div>
            <div className={styles.statLabel}>Media Assets in Storage</div>
          </div>
        </div>
      </div>

      {/* Sections Grid */}
      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "24px 0 16px 0", color: "#141b22" }}>
        Content Sections
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {cmsSections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.title}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 8,
                      background: sec.bg,
                      color: sec.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: sec.color, background: sec.bg, padding: "3px 8px", borderRadius: 4 }}>
                    {sec.stat}
                  </span>
                </div>

                <h4 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0", color: "#141b22" }}>
                  {sec.title}
                </h4>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                  {sec.desc}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
                {sec.publicHref ? (
                  <Link
                    href={sec.publicHref}
                    target="_blank"
                    style={{ fontSize: "12px", color: "#64748b", display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}
                  >
                    <ExternalLink size={12} /> Public view
                  </Link>
                ) : <span />}

                <Link
                  href={sec.href}
                  className={styles.btnPrimary}
                  style={{ fontSize: "12.5px", padding: "7px 12px", gap: 6 }}
                >
                  Manage {sec.title} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
