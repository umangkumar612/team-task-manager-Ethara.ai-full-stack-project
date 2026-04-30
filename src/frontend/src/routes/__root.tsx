import { Outlet, createRootRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { useAuth } from "../hooks/use-auth";

function RootLayout() {
  const { isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login") {
        navigate({ to: "/login" });
      }
    }
  }, [isAuthenticated, isInitializing, navigate]);

  return (
    <>
      <Outlet />
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
