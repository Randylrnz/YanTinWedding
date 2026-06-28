"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, className = "", disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-lato font-700 tracking-widest uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-full";

    const variants = {
      primary:
        "bg-burgundy text-white border-2 border-burgundy hover:bg-burgundy-dark hover:border-burgundy-dark active:scale-95 shadow-lg shadow-burgundy/20",
      secondary:
        "bg-transparent text-burgundy border-2 border-burgundy hover:bg-burgundy hover:text-white active:scale-95",
      ghost:
        "bg-transparent text-brown border-2 border-transparent hover:border-champagne-dark hover:bg-champagne/40 active:scale-95",
      danger:
        "bg-transparent text-red-700 border-2 border-red-300 hover:bg-red-50 active:scale-95",
    };

    const sizes = {
      sm: "px-5 py-2 text-xs gap-1.5",
      md: "px-7 py-3 text-sm gap-2",
      lg: "px-10 py-4 text-base gap-2",
      xl: "px-14 py-5 text-lg gap-3",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
