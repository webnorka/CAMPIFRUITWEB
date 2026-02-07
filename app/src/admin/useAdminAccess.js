import { useAuth } from './AuthProvider';

/**
 * Hook for checking admin access status.
 * Returns { isAdmin, isAuthenticated, loading, user }
 */
export function useAdminAccess() {
    const { isAdmin, isAuthenticated, loading, user } = useAuth();

    return {
        isAdmin,
        isAuthenticated,
        loading,
        user,
        canAccessAdmin: isAuthenticated && isAdmin,
    };
}
