import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const {
    login,
    clear,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    identity,
  } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    clear();
    queryClient.clear();
  };

  const currentPrincipalId = identity?.getPrincipal().toString() ?? null;

  return {
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    identity,
    currentPrincipalId,
    login: handleLogin,
    logout: handleLogout,
  };
}
