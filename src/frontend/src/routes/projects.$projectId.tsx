import { createRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../hooks/use-auth";
import ProjectDetailPage from "../pages/ProjectDetailPage";
import { Route as RootRoute } from "./__root";

function ProjectDetailRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <ProjectDetailPage />
    </Layout>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/projects/$projectId",
  component: ProjectDetailRoute,
});
