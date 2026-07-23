import { useTranslation } from "react-i18next";

/**
 * Per-theme palette from Google's Sign in with Google branding guidelines
 * (https://developers.google.com/identity/branding-guidelines). These hexes are fixed by the
 * guidelines, so they are hardcoded rather than routed through the app's `--color-*` tokens
 * (a premium theme retinting them would put the button out of spec).
 */
const THEMES = {
  light: { fill: "#FFFFFF", stroke: "#747775", text: "#1F1F1F" },
  dark: { fill: "#131314", stroke: "#8E918F", text: "#E3E3E3" },
  neutral: { fill: "#F2F2F2", stroke: "transparent", text: "#1F1F1F" },
} as const;

interface GoogleSignInButtonProps {
  onClick: () => void;
  disabled?: boolean;
  /**
   * Guidelines theme. `light` is the default by choice — the white pill reads as the familiar
   * Google button and pops against the dark backdrop; it is never derived from the OS/browser
   * colour scheme, so the button looks identical for everyone.
   */
  theme?: keyof typeof THEMES;
  className?: string;
}

/**
 * Branding-compliant "Continue with Google" button.
 *
 * Supabase drives the OAuth redirect (`signInWithOAuth`), so Google Identity Services never
 * renders a button of its own — this is the custom-button path of the branding guidelines and
 * every constraint below is load-bearing:
 *   - the four-colour official "G" (never monochrome, never restyled, aspect ratio preserved),
 *   - Roboto Medium 14px / 20px line-height (the Roboto face is loaded in `index.html`),
 *   - 12px before the logo · 10px after the logo · 12px at the end,
 *   - a 1px *inside* stroke (border-box), so the stroke never grows the button.
 * The label is translated (`auth.google` → "Continue with Google" / "Continuar con Google") —
 * that is also how the Spanish requirement is met, since a rendered label localises where the
 * pre-baked English PNG from `signin-assets.zip` could not.
 */
export function GoogleSignInButton({
  onClick,
  disabled,
  theme = "light",
  className = "",
}: GoogleSignInButtonProps) {
  const { t } = useTranslation();
  const { fill, stroke, text } = THEMES[theme];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: fill,
        color: text,
        borderColor: stroke,
        fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
        fontWeight: 500,
        fontSize: "14px",
        lineHeight: "20px",
        paddingLeft: "12px",
        paddingRight: "12px",
      }}
      className={`mx-auto flex h-10 items-center rounded-full border box-border transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-peri/40 disabled:opacity-50 ${className}`}
    >
      {/* Official Google "G" — 18px, untouched colours, intrinsic 1:1 aspect ratio. */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 48 48"
        aria-hidden="true"
        focusable="false"
        className="shrink-0"
      >
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </svg>
      <span className="whitespace-nowrap" style={{ marginLeft: "10px" }}>
        {t("auth.google")}
      </span>
    </button>
  );
}
