import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Route as RootRoute } from "./routes/__root";
import { Route as DashboardRoute } from "./routes/dashboard";
import { Route as IndexRoute } from "./routes/index";
import { Route as LoginRoute } from "./routes/login";
import { Route as ProjectsRoute } from "./routes/projects";
import { Route as ProjectDetailRoute } from "./routes/projects.$projectId";
import { Route as ProjectTasksRoute } from "./routes/projects.$projectId.tasks";

const routeTree = RootRoute.addChildren([
  IndexRoute,
  LoginRoute,
  DashboardRoute,
  ProjectsRoute,
  ProjectDetailRoute,
  ProjectTasksRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
