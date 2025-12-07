import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  coins: number;
  level: number;
  experience: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addCoins: (amount: number) => void;
  addExperience: (amount: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user: User) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updates: Partial<User>) =>
        set((state: AuthState) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      addCoins: (amount: number) =>
        set((state: AuthState) => ({
          user: state.user
            ? { ...state.user, coins: state.user.coins + amount }
            : null,
        })),
      addExperience: (amount: number) =>
        set((state: AuthState) => {
          if (!state.user) return state;
          const newExp = state.user.experience + amount;
          const newLevel = Math.floor(newExp / 1000) + 1;
          return {
            user: {
              ...state.user,
              experience: newExp,
              level: newLevel,
            },
          };
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
