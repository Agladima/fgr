import React from "react";
import styles from "./Badge.module.css";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "outline";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "primary",
  size = "md",
  dot = false,
  icon,
  className = "",
  children,
  ...props
}) => {
  const badgeClasses = [
    styles.badge,
    styles[variant],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={badgeClasses} {...props}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.text}>{children}</span>
    </span>
  );
};

export default Badge;
