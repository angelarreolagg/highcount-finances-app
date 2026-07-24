import { create } from "zustand";

/**
 * Whether the active backend (`infrastructure/di/container.ts`) matches the current session.
 *
 * `repositories` is a live binding that `setBackend` swaps on every auth change, so between the
 * auth event and the end of activation any read hits the OUTGOING backend — e.g. the empty local
 * store right after a sign-in, which is what used to bounce returning users into the setup wizard.
 * Consumers read it as `backendReady` off the auth context.
 *
 * Kept in a store rather than component state for the same reason as `themeTransitionStore`: the
 * flag is lowered synchronously inside an effect, and a React setState there trips the React
 * Compiler's cascading-render rule.
 */
interface BackendState {
  ready: boolean;
  setReady: (ready: boolean) => void;
}

export const useBackendStore = create<BackendState>((set) => ({
  ready: true, // bootstrapBackend() activates the initial session before the first render
  setReady: (ready) => set({ ready }),
}));
