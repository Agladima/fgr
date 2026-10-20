"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/admin/auth-context";
import styles from "./AdminShell.module.css";
import {
  LayoutDashboard,
  GraduationCap,
  Handshake,
  Inbox,
  CheckSquare,
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  Users,
  History,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import logoImage from "@/assets/images/fgr logo.jpeg";

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const { user, loading, logout, canAccess } = useAdminAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading || !user) {
    return null;
  }

  const navGroups = [
    {
      title: "Operations",
      items: [
        { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
        { label: "Registrations", href: "/admin/registrations", icon: GraduationCap, perm: "registrations:read" },
        { label: "Partnerships", href: "/admin/partnerships", icon: Handshake, perm: "partnerships:read" },
        { label: "Contact Messages", href: "/admin/enquiries", icon: Inbox, perm: "enquiries:read" },
        { label: "Follow-Up Tasks", href: "/admin/follow-ups", icon: CheckSquare, perm: "follow_ups:read" },
      ],
    },
    {
      title: "Programmes & Content",
      items: [
        { label: "Programmes", href: "/admin/programmes", icon: BookOpen, perm: "programmes:read" },
        { label: "Events", href: "/admin/events", icon: Calendar, perm: "events:read" },
        { label: "Website Content", href: "/admin/content", icon: FileText, perm: "content:read" },
      ],
    },
    {
      title: "Administration",
      items: [
        { label: "Reports & Analytics", href: "/admin/reports", icon: BarChart3, perm: "reports:read" },
        { label: "Staff & Roles", href: "/admin/staff", icon: Users, perm: "staff:manage" },
        { label: "Activity Logs", href: "/admin/activity-logs", icon: History, perm: "audit_logs:read" },
        { label: "Settings", href: "/admin/settings", icon: Settings, perm: "settings:manage" },
      ],
    },
  ];

  const getPageTitle = () => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.exact ? pathname === item.href : pathname.startsWith(item.href)) {
          return item.label;
        }
      }
    }
    return "Operations CRM";
  };

  return (
    <div className={styles.shellLayout}>
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`${styles.sidebar} ${mobileMenuOpen ? styles.sidebarOpen : ""}`}
        aria-label="Admin Navigation"
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.brandWrap}>
            <div className={styles.brandLogo}>
              <Image src={logoImage} alt="FGR" fill sizes="36px" />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>Career Center</span>
              <span className={styles.brandSub}>Operations CRM</span>
            </div>
          </div>
        </div>

        {/* Current Staff User Card */}
        {user && (
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.fullName || user.email}</div>
              <span className={styles.roleBadge}>
                {user.jobTitle || "Staff Member"}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className={styles.navSection}>
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => !item.perm || canAccess(item.perm));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className={styles.navGroup}>
                <div className={styles.navGroupTitle}>{group.title}</div>
                {visibleItems.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon size={18} style={{ flexShrink: 0 }} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className={styles.sidebarFooter}>
          <Link href="/" target="_blank" className={styles.footerBtn}>
            <ExternalLink size={15} />
            <span>View Public Website</span>
          </Link>
          <button onClick={() => logout()} className={styles.footerBtn}>
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainWrapper}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              className={styles.menuToggle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className={styles.pageHeading}>{getPageTitle()}</h1>
          </div>

          <div className={styles.topbarRight}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }} />
              <span>Live Database Connected</span>
            </div>
          </div>
        </header>

        <main className={styles.contentContainer}>{children}</main>
      </div>
    </div>
  );
}
