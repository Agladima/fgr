import React from "react";
import styles from "./Card.module.css";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated" | "interactive" | "dark";
  padding?: "none" | "sm" | "md" | "lg";
  as?: React.ElementType;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = "default",
  padding = "md",
  as: Component = "div",
  className = "",
  children,
  ...props
}) => {
  const cardClasses = [
    styles.card,
    styles[variant],
    styles[`pad-${padding}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={cardClasses} {...props}>
      {children}
    </Component>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div className={`${styles.cardHeader} ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement> & { as?: "h2" | "h3" | "h4" }> = ({
  as: Component = "h3",
  className = "",
  children,
  ...props
}) => (
  <Component className={`${styles.cardTitle} ${className}`} {...props}>
    {children}
  </Component>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <p className={`${styles.cardDescription} ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div className={`${styles.cardContent} ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div className={`${styles.cardFooter} ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
