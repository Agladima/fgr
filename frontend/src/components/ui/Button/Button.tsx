import React from "react";
import Link from "next/link";
import styles from "./Button.module.css";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "outline-pearl"
  | "ghost"
  | "link";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  external?: boolean;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      href,
      external,
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const buttonClasses = [
      styles.button,
      styles[variant],
      styles[size],
      fullWidth ? styles.fullWidth : "",
      isLoading ? styles.loading : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const content = (
      <>
        {isLoading && (
          <span className={styles.spinner} aria-hidden="true">
            <svg
              className={styles.spinnerSvg}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className={styles.spinnerCircle}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className={styles.spinnerTrack}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        {!isLoading && leftIcon && <span className={styles.icon}>{leftIcon}</span>}
        <span className={styles.label}>{children}</span>
        {!isLoading && rightIcon && <span className={styles.icon}>{rightIcon}</span>}
      </>
    );

    if (href) {
      if (external) {
        return (
          <a
            href={href}
            className={buttonClasses}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={disabled || isLoading}
          >
            {content}
          </a>
        );
      }
      return (
        <Link
          href={href}
          className={buttonClasses}
          aria-disabled={disabled || isLoading}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={props.type || "button"}
        className={buttonClasses}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
