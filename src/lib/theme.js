/**
 * Theme configuration for the application
 * Based on ChatGPT's design system
 */

export const theme = {
  colors: {
    // Main backgrounds
    background: {
      primary: "#202123", // Sidebar
      secondary: "#343541", // Main chat area
      tertiary: "#444654", // Bot messages
    },

    // Text colors
    text: {
      primary: "#ECECF1", // Main text
      secondary: "#8E8EA0", // Secondary text
      disabled: "#565869", // Disabled state
    },

    // Brand colors
    brand: {
      primary: "#10A37F", // Primary brand color (buttons, accents)
      hover: "#0E8F6F", // Hover state
    },

    // UI elements
    ui: {
      border: "rgba(255,255,255,0.1)",
      hover: "rgba(255,255,255,0.05)",
      active: "rgba(255,255,255,0.1)",
      input: "#40414F",
    },

    // Message backgrounds
    message: {
      user: "#343541",
      assistant: "#444654",
    },

    // Status colors
    status: {
      success: "#10A37F",
      error: "#EF4444",
      warning: "#F59E0B",
    },
  },

  typography: {
    fonts: {
      body: '"Söhne", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
      mono: '"Söhne Mono", Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    },
    sizes: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
    },
  },

  layout: {
    sidebar: {
      width: "260px",
      mobileBreakpoint: "768px",
    },
    container: {
      maxWidth: "48rem", // ChatGPT's max content width
      padding: {
        x: "1rem",
        y: "1.5rem",
      },
    },
  },

  transitions: {
    default: "200ms ease-in-out",
    fast: "100ms ease-in-out",
    slow: "300ms ease-in-out",
  },

  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  },
};
