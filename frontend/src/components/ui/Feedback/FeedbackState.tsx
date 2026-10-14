"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import styles from "./FeedbackState.module.css";
import Button from "../Button";
import { CheckCircle2, AlertTriangle, AlertCircle, Inbox, Loader2 } from "lucide-react";

export type FeedbackType = "loading" | "error" | "empty" | "success";

export interface FeedbackStateProps {
  type: FeedbackType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export const FeedbackState: React.FC<FeedbackStateProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion();

  const getIcon = () => {
    switch (type) {
      case "loading":
        return <Loader2 className={styles.spinner} />;
      case "success":
        return <CheckCircle2 className={styles.iconSuccess} />;
      case "error":
        return <AlertCircle className={styles.iconError} />;
      case "empty":
        return <Inbox className={styles.iconEmpty} />;
    }
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`${styles.container} ${styles[type]} ${className}`}
      role={type === "error" ? "alert" : "status"}
    >
      <div className={styles.iconWrapper}>{getIcon()}</div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {(actionLabel && (onAction || actionHref)) && (
        <div className={styles.actionWrapper}>
          <Button
            variant="primary"
            size="sm"
            href={actionHref}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default FeedbackState;
