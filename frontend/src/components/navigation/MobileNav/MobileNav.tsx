"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./MobileNav.module.css";
import Button from "@/components/ui/Button";
import { NavItem, PRIMARY_CTAS, SITE_METADATA } from "@/lib/constants/navigation";
import { X, ArrowUpRight, ChevronRight, Phone, Mail, MapPin } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import logoImage from "@/assets/images/fgr logo.jpeg";

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  currentPath: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  navItems,
  currentPath,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const drawerVariants = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      transition: {
        type: "spring" as const,
        damping: 30,
        stiffness: 280,
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
        delayChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
    exit: {
      x: "100%",
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.22,
        ease: [0.4, 0, 1, 1] as const,
      },
    },
  };

  const navItemVariants = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.3,
        ease: [0.21, 0.47, 0.32, 0.98] as const,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="mobile-navigation-drawer"
          className={styles.backdrop}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          onClick={onClose}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.18 }}
        >
          <motion.div
            className={styles.drawer}
            onClick={(e) => e.stopPropagation()}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Drawer Header */}
            <div className={styles.drawerHeader}>
              <div className={styles.logoGroup}>
                <div className={styles.logoMark}>
                  <Image src={logoImage} alt="FGR" fill sizes="38px" />
                </div>
                <div className={styles.brandInfo}>
                  <span className={styles.brandTitle}>FGR CAREER DEVELOPMENT</span>
                  <span className={styles.brandSubtitle}>CENTER</span>
                </div>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Tagline Banner */}
            <div className={styles.taglineBox}>
              <span className={styles.taglineDot} />
              <span className={styles.tagline}>{SITE_METADATA.tagline}</span>
            </div>

            {/* Navigation Links */}
            <nav className={styles.nav} aria-label="Mobile Navigation Links">
              <ul className={styles.navList}>
                {navItems.map((item) => {
                  const itemHref = item.href || "/";
                  const isActive =
                    itemHref === "/"
                      ? currentPath === "/"
                      : currentPath.startsWith(itemHref);

                  return (
                    <motion.li
                      key={itemHref + item.label}
                      className={styles.navItem}
                      variants={navItemVariants}
                    >
                      <Link
                        href={itemHref}
                        className={`${styles.navLink} ${
                          isActive ? styles.navLinkActive : ""
                        }`}
                        onClick={onClose}
                      >
                        <span>{item.label}</span>
                        <ChevronRight size={16} className={styles.navLinkIcon} />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            {/* Action Buttons */}
            <div className={styles.actionContainer}>
              <Button
                variant="primary"
                size="md"
                fullWidth
                href={PRIMARY_CTAS.register.href}
                rightIcon={<ArrowUpRight size={16} />}
                onClick={onClose}
              >
                {PRIMARY_CTAS.register.label}
              </Button>
              <Button
                variant="secondary"
                size="md"
                fullWidth
                href={PRIMARY_CTAS.partner.href}
                onClick={onClose}
              >
                {PRIMARY_CTAS.partner.label}
              </Button>
            </div>

            {/* Institutional Contact Placeholders */}
            <div className={styles.drawerFooter}>
              <div className={styles.contactItem}>
                <Mail size={14} className={styles.contactIcon} />
                <span>info@fgrcdc.org.ng</span>
              </div>
              <div className={styles.contactItem}>
                <Phone size={14} className={styles.contactIcon} />
                <span>+234 (0) 800 000 0000 (Placeholder)</span>
              </div>
              <div className={styles.contactItem}>
                <MapPin size={14} className={styles.contactIcon} />
                <span>Headquarters, Career Hub (Placeholder)</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileNav;
