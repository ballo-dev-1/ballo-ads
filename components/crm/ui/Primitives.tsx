"use client";

import React, { PropsWithChildren } from "react";

export interface HealthBarProps {
  score: number;
  showLabel?: boolean;
  showScore?: boolean;
}

export function HealthBar({ score, showLabel = true, showScore = true }: HealthBarProps) {
  const color = score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#EF4444";
  const label = score >= 70 ? "Healthy" : score >= 40 ? "At risk" : "Critical";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(score, 100)}%`, background: color }}
        />
      </div>
      {showScore && (
        <span className="text-[11.5px] font-semibold tabular-nums" style={{ color }}>
          {score}
        </span>
      )}
      {showLabel && (
        <span className="text-[11px]" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  );
}

type BadgeVariant = "blue" | "green" | "red" | "amber" | "purple" | "slate";

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  blue: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  green: "bg-green-500/10 text-green-300 border-green-500/20",
  red: "bg-red-500/10 text-red-300 border-red-500/20",
  amber: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  purple: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  slate: "bg-slate-500/10 text-slate-300 border-slate-500/20",
};

export function Badge({ children, variant = "slate", className = "" }: PropsWithChildren<{ variant?: BadgeVariant; className?: string }>) {
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${BADGE_CLASSES[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function PlanBadge({ plan }: { plan: string }) {
  const variantMap: Record<string, BadgeVariant> = { Standard: "slate", Pro: "blue", Enterprise: "purple" };
  return <Badge variant={variantMap[plan] || "slate"}>{plan}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    active: { label: "Active", variant: "green" },
    at_risk: { label: "At risk", variant: "red" },
    churned: { label: "Churned", variant: "slate" },
    suspended: { label: "Suspended", variant: "amber" },
  };
  const s = map[status] || map.active;
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function Spinner({ size = 16, color = "#3B82F6" }: { size?: number; color?: string }) {
  return (
    <div
      className="rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
      style={{ width: size, height: size, borderColor: `${color}40`, borderTopColor: color }}
    />
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "text-white border-transparent hover:brightness-110 active:brightness-95",
  secondary:
    "bg-white/[0.06] text-slate-300 border-white/[0.1] hover:bg-white/[0.1] hover:text-white rounded-lg",
  ghost:
    "bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-white/[0.05] rounded-lg",
  danger:
    "bg-red-500/10 text-red-300 border-red-500/20 hover:bg-red-500/15 rounded-lg",
};

const BTN_SIZE: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-[12px]",
  md: "px-4 py-2 text-[13px]",
  lg: "px-5 py-2.5 text-[14px]",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({
  variant = "secondary",
  size = "md",
  loading,
  children,
  className = "",
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isPrimary = variant === "primary";
  return (
    <button
      className={`inline-flex items-center gap-1.5 font-medium border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${
        isPrimary ? "rounded-full" : ""
      } ${BTN_VARIANT[variant]} ${BTN_SIZE[size]} ${className}`}
      disabled={disabled || loading}
      style={
        isPrimary
          ? {
              background: "var(--brand-color-3)",
              boxShadow: "0 6px 20px -6px color-mix(in srgb, var(--brand-color-3) 55%, transparent)",
              ...style,
            }
          : style
      }
      {...rest}
    >
      {loading ? <Spinner size={12} /> : null}
      {children}
    </button>
  );
}

export function EmptyState({
  icon = "📋",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="text-[36px] mb-3 opacity-40">{icon}</div>
      <div className="text-[14px] font-semibold text-slate-300 font-syne mb-1.5">{title}</div>
      {description && <div className="text-[12.5px] text-slate-500 max-w-xs mb-5">{description}</div>}
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  width = 520,
}: PropsWithChildren<{ title: string; subtitle?: string; onClose: () => void; footer?: React.ReactNode; width?: number }>) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="relative crm-card max-h-[88vh] flex flex-col"
        style={{ width: Math.min(width, typeof window === "undefined" ? width : window.innerWidth - 32) }}
      >
        <div className="px-6 pt-5 pb-4 border-b border-white/[0.08] flex items-start gap-3 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-[15.5px] font-bold text-slate-200 font-syne">{title}</h2>
            {subtitle && <p className="text-[12px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.08] transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-white/[0.08] flex justify-end gap-2 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function FormField({
  label,
  children,
  hint,
}: PropsWithChildren<{ label: string; hint?: string }>) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="block text-[11.5px] font-medium text-slate-300 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[10.5px] text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`crm-input ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`crm-input resize-none ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`crm-input ${props.className ?? ""}`}>
      {props.children}
    </select>
  );
}

export function ClientAvatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = [
    "bg-blue-500/20 text-blue-300",
    "bg-green-500/20 text-green-300",
    "bg-amber-500/20 text-amber-300",
    "bg-purple-500/20 text-purple-300",
    "bg-pink-500/20 text-pink-300",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className={`rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${color}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}
