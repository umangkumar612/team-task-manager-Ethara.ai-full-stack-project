import { createRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../hooks/use-auth";
import TasksPage from "../pages/TasksPage";
import { Route as RootRoute } from "./__root";

function ProjectTasksRoute() {
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
      <TasksPage />
    </Layout>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/projects/$projectId/tasks",
  component: ProjectTasksRoute,
});
