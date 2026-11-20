import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-subtle": "var(--color-surface-subtle)",
        border: "var(--color-border)",
        "border-input": "var(--color-border-input)",
        text: "var(--color-text)",
        muted: "var(--color-text-muted)",
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        "on-accent": "var(--color-on-accent)",
        danger: "var(--color-danger)",
        "on-danger": "var(--color-on-danger)",
        "danger-bg": "var(--color-danger-bg)",
        "danger-text": "var(--color-danger-text)",
        success: "var(--color-success)",
        "on-success": "var(--color-on-success)",
        "success-bg": "var(--color-success-bg)",
        "success-text": "var(--color-success-text)",
        warning: "var(--color-warning)",
        "on-warning": "var(--color-on-warning)",
        "warning-bg": "var(--color-warning-bg)",
        "warning-text": "var(--color-warning-text)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};

export default config;
