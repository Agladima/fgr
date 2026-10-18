"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import styles from "./Header.module.css";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import MobileNav from "../MobileNav";
import {
  DESKTOP_NAV_ITEMS,
  MAIN_NAV_ITEMS,
  PRIMARY_CTAS,
} from "@/lib/constants/navigation";
import { Menu, X, ArrowUpRight, ChevronDown } from "lucide-react";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReduceMotion = useReducedMotion();


  // Close menus on route change during render
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* Accessible skip link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Minimal Top Brand Bar */}
      <div className={styles.topBar}>
        <Container size="wide" className={styles.topBarContainer}>
          <div className={styles.taglineBox}>
            <span className={styles.taglineDot} />
            <span className={styles.taglineText}>
              Workforce Development &amp; Career Hub • Calabar, Cross River State
            </span>
          </div>
          <div className={styles.topBarLinks}>
            <Link href="/news-events" className={styles.topBarLink}>
              Latest Cohort Updates
            </Link>
            <span className={styles.topBarDivider}>|</span>
            <Link href="/contact" className={styles.topBarLink}>
              Support &amp; Inquiries
            </Link>
          </div>
        </Container>
      </div>

      {/* Main Spacious Navigation Header */}
      <header
        className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}
      >
        <Container size="wide" className={styles.headerContainer}>
          {/* Logo without redundant "FGR" text */}
          <Link
            href="/"
            className={styles.logoLink}
            aria-label="FGR Career Development Center Home"
          >
            <div className={styles.logoMark}>
              <span className={styles.logoMarkFGR}>FGR</span>
            </div>
            <div className={styles.logoTextGroup}>
              <span className={styles.logoTitle}>CAREER DEVELOPMENT</span>
              <span className={styles.logoSubtitle}>CENTER</span>
            </div>
          </Link>

          {/* Desktop Navigation Links — Streamlined & Spacious */}
          <nav className={styles.desktopNav} aria-label="Main Navigation">
            <ul className={styles.navList}>
              {DESKTOP_NAV_ITEMS.map((item) => {
                const hasChildren = Boolean(item.children?.length);
                const isChildActive =
                  hasChildren &&
                  item.children?.some((child) => pathname.startsWith(child.href));
                const isActive = item.href
                  ? item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href)
                  : isChildActive;

                if (hasChildren) {
                  const isOpen = openDropdown === item.label;
                  return (
                    <li
                      key={item.label}
                      className={styles.navItem}
                      onMouseEnter={() => handleMouseEnter(item.label)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        type="button"
                        className={`${styles.navLink} ${styles.dropdownTrigger} ${
                          isActive ? styles.navLinkActive : ""
                        }`}
                        aria-expanded={isOpen}
                        onClick={() =>
                          setOpenDropdown(isOpen ? null : item.label)
                        }
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          size={15}
                          className={`${styles.chevron} ${
                            isOpen ? styles.chevronOpen : ""
                          }`}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={
                              shouldReduceMotion
                                ? { opacity: 0 }
                                : { opacity: 0, y: 8, x: "-50%" }
                            }
                            animate={
                              shouldReduceMotion
                                ? { opacity: 1 }
                                : { opacity: 1, y: 0, x: "-50%" }
                            }
                            exit={
                              shouldReduceMotion
                                ? { opacity: 0 }
                                : { opacity: 0, y: 6, x: "-50%" }
                            }
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className={styles.dropdownMenu}
                          >
                            <div className={styles.dropdownInner}>
                              {item.children?.map((child) => {
                                const isSubActive = pathname.startsWith(child.href);
                                return (
                                  <Link
                                    key={child.href}
                                    href={child.href}
                                    className={`${styles.dropdownItem} ${
                                      isSubActive ? styles.dropdownItemActive : ""
                                    }`}
                                  >
                                    <span className={styles.dropdownItemTitle}>
                                      {child.label}
                                    </span>
                                    {child.description && (
                                      <span className={styles.dropdownItemDesc}>
                                        {child.description}
                                      </span>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                }

                return (
                  <li key={item.label} className={styles.navItem}>
                    <Link
                      href={item.href || "/"}
                      className={`${styles.navLink} ${
                        isActive ? styles.navLinkActive : ""
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Desktop Actions — Clear Visual Hierarchy */}
          <div className={styles.actionGroup}>
            <Link
              href={PRIMARY_CTAS.partner.href}
              className={styles.partnerLink}
            >
              {PRIMARY_CTAS.partner.label}
            </Link>

            <Button
              variant="primary"
              size="sm"
              href={PRIMARY_CTAS.register.href}
              rightIcon={<ArrowUpRight size={15} />}
              className={styles.registerBtn}
            >
              {PRIMARY_CTAS.register.label}
            </Button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className={styles.mobileMenuToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={
              mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </Container>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={MAIN_NAV_ITEMS}
        currentPath={pathname}
      />
    </>
  );
};

export default Header;
