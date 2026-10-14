import React from "react";
import styles from "./Container.module.css";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "narrow" | "wide" | "full";
  className?: string;
  as?: React.ElementType;
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({
  size = "default",
  className = "",
  as: Component = "div",
  children,
  ...props
}) => {
  const containerClasses = [
    styles.container,
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={containerClasses} {...props}>
      {children}
    </Component>
  );
};

export default Container;
