import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, LogOut, Menu, User } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useCallerUserProfile } from "../hooks/use-backend";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { logout, isAuthenticated } = useAuth();
  const { data: profile, isLoading } = useCallerUserProfile();

  const displayName = profile?.displayName ?? "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      data-ocid="header"
      className="flex h-16 items-center gap-4 bg-card border-b border-border px-4 lg:px-6 shadow-sm"
    >
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Open sidebar"
        data-ocid="header.menu_button"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* App title */}
      <div className="flex items-center gap-2">
        <h1 className="font-display text-lg font-bold text-foreground tracking-tight hidden sm:block">
          Team Task Manager
        </h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User menu */}
      {isAuthenticated && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-ocid="header.user_menu"
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {isLoading ? (
                    <Skeleton className="h-8 w-8 rounded-full" />
                  ) : (
                    initials
                  )}
                </AvatarFallback>
              </Avatar>
              {isLoading ? (
                <Skeleton className="h-4 w-20 hidden sm:block" />
              ) : (
                <span className="text-sm font-medium text-foreground hidden sm:block max-w-[120px] truncate">
                  {displayName}
                </span>
              )}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              <span className="truncate">{displayName}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive cursor-pointer"
              data-ocid="header.logout_button"
            >
              <LogOut className="h-3.5 w-3.5 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
