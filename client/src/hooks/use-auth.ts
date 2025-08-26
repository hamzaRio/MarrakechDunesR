import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/lib/env";

interface User {
  id: string;
  username: string;
  role: string;
}

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/user`, {
      credentials: "include"
    });
    if (res.status === 401) return null; // expected when logged out
    if (!res.ok) return null;
    return (await res.json()) as User;
  } catch {
    return null;
  }
}

export function useAuth() {
  const { data, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchCurrentUser,
    retry: false,
  });

  return {
    user: data,
    isLoading,
    isAuthenticated: !!data,
    error,
  };
}
