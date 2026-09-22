import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Staff, AccountType } from '@/types';

interface AuthState {
  account: Staff | null;
  accountType: AccountType | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (
    account: Staff,
    accountType: AccountType,
    accessToken: string,
    refreshToken: string,
  ) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      account: null,
      accountType: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (account, accountType, accessToken, refreshToken) =>
        set({ account, accountType, accessToken, refreshToken }),
      clearAuth: () =>
        set({
          account: null,
          accountType: null,
          accessToken: null,
          refreshToken: null,
        }),
      isAuthenticated: () => !!get().accessToken && !!get().account,
    }),
    { name: 'deliver-admin-auth' },
  ),
);
