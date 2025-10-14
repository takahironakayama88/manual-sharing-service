import { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export default function Card({
  children,
  padding = "md",
  hover = false,
  className,
  ...props
}: CardProps) {
  const baseStyles = "bg-white rounded-lg border border-gray-200 shadow-sm";

  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const hoverStyles = hover ? "hover:shadow-md transition-shadow cursor-pointer" : "";

  return (
    <div className={clsx(baseStyles, paddingStyles[padding], hoverStyles, className)} {...props}>
      {children}
    </div>
  );
}
