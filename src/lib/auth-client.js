import { createAuthClient } from 'better-auth/react';
import { usernameClient } from 'better-auth/client/plugins';

const API_BASE = import.meta.env.VITE_API_URL || 'https://masjidconnectgy.com';

export const authClient = createAuthClient({
  baseURL: `${API_BASE}/api/auth`,
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [
    usernameClient(),
  ],
});

export const { signIn, signUp, signOut, useSession, updateUser, changePassword } = authClient;
