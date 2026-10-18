"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAdminAuth } from "@/lib/admin/auth-context";
import { Clock, ShieldAlert, LogOut, CheckCircle2 } from "lucide-react";
import styles from "./InactivityWatcher.module.css";

// 5 minutes of total inactivity before logout
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
// Show warning 30 seconds before logout
const WARNING_THRESHOLD_MS = 30 * 1000;
const STORAGE_KEY = "fgr_admin_last_activity";

export default function InactivityWatcher() {
  const { user, logout } = useAdminAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  const lastActivityRef = useRef<number>(Date.now());
  const warningActiveRef = useRef<boolean>(false);

  // Updates activity timestamp (throttled to at most once per second)
  const recordActivity = useCallback(() => {
    const now = Date.now();
    // Only update if at least 1 second has passed
    if (now - lastActivityRef.current >= 1000) {
      lastActivityRef.current = now;
      try {
        localStorage.setItem(STORAGE_KEY, now.toString());
      } catch {
        // Ignore localStorage quota/access errors
      }

      // If warning modal was open, user activity automatically dismisses it
      if (warningActiveRef.current) {
        warningActiveRef.current = false;
        setShowWarning(false);
      }
    }
  }, []);

  // Handle explicit "Stay Signed In" button click
  const handleStaySignedIn = () => {
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      localStorage.setItem(STORAGE_KEY, now.toString());
    } catch {
      // Ignore
    }
    warningActiveRef.current = false;
    setShowWarning(false);
  };

  // Handle explicit "Log Out Now"
  const handleLogoutNow = () => {
    setShowWarning(false);
    logout();
  };

  useEffect(() => {
    if (!user) {
      setShowWarning(false);
      return;
    }

    // Initialize current timestamp
    const initialTime = Date.now();
    lastActivityRef.current = initialTime;
    try {
      localStorage.setItem(STORAGE_KEY, initialTime.toString());
    } catch {
      // Ignore
    }

    // Listen to user interaction events across the window
    const events: (keyof WindowEventMap)[] = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleEvent = () => {
      recordActivity();
    };

    events.forEach((evt) => {
      window.addEventListener(evt, handleEvent, { passive: true });
    });

    // Cross-tab synchronization via storage event
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const remoteTime = parseInt(e.newValue, 10);
        if (!isNaN(remoteTime) && remoteTime > lastActivityRef.current) {
          lastActivityRef.current = remoteTime;
          if (warningActiveRef.current) {
            warningActiveRef.current = false;
            setShowWarning(false);
          }
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Periodic checker running every second
    const intervalId = window.setInterval(() => {
      let lastActive = lastActivityRef.current;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed) && parsed > lastActive) {
            lastActive = parsed;
            lastActivityRef.current = parsed;
          }
        }
      } catch {
        // Fallback to local ref
      }

      const elapsed = Date.now() - lastActive;
      const remainingMs = INACTIVITY_TIMEOUT_MS - elapsed;

      if (remainingMs <= 0) {
        // Timeout expired — trigger logout
        warningActiveRef.current = false;
        setShowWarning(false);
        logout("timeout");
      } else if (remainingMs <= WARNING_THRESHOLD_MS) {
        // Warning zone
        const secs = Math.max(1, Math.ceil(remainingMs / 1000));
        setSecondsRemaining(secs);
        if (!warningActiveRef.current) {
          warningActiveRef.current = true;
          setShowWarning(true);
        }
      } else {
        // Normal active state
        if (warningActiveRef.current) {
          warningActiveRef.current = false;
          setShowWarning(false);
        }
      }
    }, 1000);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleEvent);
      });
      window.removeEventListener("storage", handleStorageChange);
      window.clearInterval(intervalId);
    };
  }, [user, logout, recordActivity]);

  if (!showWarning || !user) {
    return null;
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="timeout-title">
      <div className={styles.modal}>
        <div className={styles.iconWrap}>
          <Clock size={28} />
        </div>

        <h3 id="timeout-title" className={styles.title}>
          Session Inactivity Warning
        </h3>

        <p className={styles.description}>
          You have been inactive on the CRM. For security and to protect confidential records, your session will automatically terminate in:
        </p>

        <div className={styles.countdownBadge}>
          <span className={styles.pulseDot} />
          <span>Logging out in {secondsRemaining} second{secondsRemaining === 1 ? "" : "s"}</span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.stayBtn}
            onClick={handleStaySignedIn}
            autoFocus
          >
            <CheckCircle2 size={16} />
            <span>Stay Signed In</span>
          </button>

          <button
            type="button"
            className={styles.signOutBtn}
            onClick={handleLogoutNow}
          >
            <LogOut size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
            <span>Sign Out Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
