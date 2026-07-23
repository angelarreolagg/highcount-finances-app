import { useEffect } from "react";
import { useProfile } from "../hooks/useProfile";
import { isPremiumTheme, DEFAULT_THEME } from "./themes";

/** Background color written to <meta name="theme-color"> so the mobile chrome matches the theme. */
const META_COLOR: Record<string, string> = {
  excel: "#eef3ee",
  casino: "#08301c",
};

/**
 * Applies the effective theme to <html data-theme>, mirroring how i18n keeps <html lang> in sync.
 * The theme comes from `useProfile` — the cloud profile when signed in (synced across devices),
 * else the local store. Premium themes only take effect for a signed-in account; a guest who
 * previously picked one is rendered as the default until they sign in.
 */
export function useApplyTheme(): void {
  const { theme, signedIn } = useProfile();
  const effective = !signedIn && isPremiumTheme(theme) ? DEFAULT_THEME : theme;

  useEffect(() => {
    document.documentElement.dataset.theme = effective;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", META_COLOR[effective] ?? "#05060e");
  }, [effective]);
}
