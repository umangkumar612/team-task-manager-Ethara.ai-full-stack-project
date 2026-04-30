import { createRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import LoginPage from "../pages/LoginPage";
import { Route as RootRoute } from "./__root";

function LoginRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  return <LoginPage />;
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/login",
  component: LoginRoute,
});
