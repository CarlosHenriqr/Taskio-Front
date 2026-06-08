import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export function Logo({
  subtitle,
  className = "",
  icon = "check",
}: {
  subtitle?: string;
  className?: string;
  icon?: "check" | "home";
}) {
  return (
    <Link to="/" className={`group flex items-center gap-2.5 ${className}`}>
      <div className="relative grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
        {icon === "home" ? (
          <Home className="h-4 w-4" />
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l4 4L19 6" />
          </svg>
        )}
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-bold tracking-tight">TASKIO</span>
        {subtitle && <span className="mt-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{subtitle}</span>}
      </div>
    </Link>
  );
}
