import { createAuthClient } from 'better-auth/react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://masjidconnectgy.com';

export const authClient = createAuthClient({
  baseURL: `${API_BASE}/api/auth`,
  fetchOptions: {
    credentials: 'include',
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;
