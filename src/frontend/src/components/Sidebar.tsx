import { Link, useRouter } from "@tanstack/react-router";
import { CheckSquare, FolderKanban, LayoutDashboard, X } from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  const isActive = (href: string) => {
    if (href === "/") return currentPath === "/";
    return currentPath.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          onKeyUp={(e) => e.key === "Escape" && onClose()}
          role="button"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        data-ocid="sidebar"
        className={`
          fixed inset-y-0 left-0 z-30 flex w-60 flex-col
          bg-[oklch(var(--sidebar))] text-[oklch(var(--sidebar-foreground))]
          border-r border-[oklch(var(--sidebar-border))]
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-[oklch(var(--sidebar-border))]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(var(--sidebar-primary))]">
            <CheckSquare className="h-4 w-4 text-[oklch(var(--sidebar-primary-foreground))]" />
          </div>
          <span className="font-display text-lg font-bold text-[oklch(var(--sidebar-foreground))] tracking-tight">
            Team Task Manager
          </span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto lg:hidden rounded-md p-1 hover:bg-[oklch(var(--sidebar-accent))] transition-colors"
            aria-label="Close sidebar"
            data-ocid="sidebar.close_button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-2 mb-2 text-xs font-semibold uppercase tracking-widest text-[oklch(var(--sidebar-foreground)/0.4)]">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                data-ocid={`sidebar.${item.label.toLowerCase()}.link`}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                  transition-colors duration-150
                  ${
                    active
                      ? "bg-[oklch(var(--sidebar-accent))] text-[oklch(var(--sidebar-accent-foreground))]"
                      : "text-[oklch(var(--sidebar-foreground)/0.7)] hover:bg-[oklch(var(--sidebar-accent)/0.5)] hover:text-[oklch(var(--sidebar-foreground))]"
                  }
                `}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
                {active && (
                  <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[oklch(var(--sidebar-primary))] text-[oklch(var(--sidebar-primary-foreground))]">
                    Active
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[oklch(var(--sidebar-border))]">
          <p className="text-xs text-[oklch(var(--sidebar-foreground)/0.4)] text-center">
            Team Task Manager
          </p>
        </div>
      </aside>
    </>
  );
}
