"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-accent text-accent-ink hover:brightness-110",
  secondary:
    "border border-line-strong bg-surface-raised text-ink hover:border-accent/60 hover:text-accent",
  danger:
    "border border-danger/40 bg-danger/10 text-danger hover:border-danger/70 hover:bg-danger/15",
  ghost: "border border-transparent text-muted hover:text-ink",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const Button = ({
  variant = "secondary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
    {...props}
  />
);

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
};

export const TextField = ({
  id,
  label,
  hint,
  className = "",
  ...props
}: TextFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={id}
      className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted"
    >
      {label}
    </label>
    <input
      id={id}
      className={`min-h-11 w-full rounded-lg border border-line bg-canvas px-3 font-mono text-sm text-ink transition-colors duration-200 placeholder:text-muted/50 focus:border-accent disabled:opacity-50 ${className}`}
      {...props}
    />
    {hint ? <p className="text-[11px] text-muted">{hint}</p> : null}
  </div>
);
