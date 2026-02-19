import { createAuthClient } from 'better-auth/react';
import { usernameClient } from 'better-auth/client/plugins';
import { API_BASE } from '../config';


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
