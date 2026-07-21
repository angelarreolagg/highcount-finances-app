import { QueryClient } from "@tanstack/react-query";

/**
 * The app-wide Tanstack Query client, exported as a singleton so the auth layer can
 * `queryClient.clear()` when the active backend changes (sign in / out) — otherwise
 * cached local data would leak into a cloud session and vice versa.
 */
export const queryClient = new QueryClient();
