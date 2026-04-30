import { useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/use-auth";
import { useCallerUserProfile } from "../hooks/use-backend";
import Header from "./Header";
import ProfileSetupModal from "./ProfileSetupModal";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const {
    data: profile,
    isLoading: profileLoading,
    isFetched,
  } = useCallerUserProfile();

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && profile === null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main
          className="flex-1 overflow-y-auto bg-background p-4 lg:p-6"
          data-ocid="main.content"
        >
          {children}
        </main>

        <footer className="bg-muted/40 border-t border-border px-6 py-3">
          <p className="text-caption text-center">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>

      {showProfileSetup && <ProfileSetupModal />}
    </div>
  );
}
