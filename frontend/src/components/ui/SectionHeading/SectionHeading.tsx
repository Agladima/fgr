import React from "react";
import styles from "./SectionHeading.module.css";
import Badge from "../Badge";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  align?: "left" | "center" | "right";
  theme?: "light" | "dark";
  titleAs?: "h1" | "h2" | "h3";
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  align = "left",
  theme = "light",
  titleAs: TitleTag = "h2",
  className = "",
}) => {
  const containerClasses = [
    styles.container,
    styles[align],
    styles[theme],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      {eyebrow && (
        <div className={styles.eyebrowWrapper}>
          <Badge variant={theme === "dark" ? "secondary" : "primary"} size="sm">
            {eyebrow}
          </Badge>
        </div>
      )}
      <TitleTag className={styles.title}>{title}</TitleTag>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
};

export default SectionHeading;
