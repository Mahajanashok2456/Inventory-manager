import React, { useState, useMemo, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { IconButton, Box } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import Orders from "./components/Orders";
import Analytics from "./components/Analytics";
import "./App.css";

// Enhanced color palette for better dark mode
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === "dark" ? "#6366f1" : "#4f46e5",
      light: mode === "dark" ? "#818cf8" : "#6366f1",
      dark: mode === "dark" ? "#4338ca" : "#3730a3",
      contrastText: "#ffffff",
    },
    secondary: {
      main: mode === "dark" ? "#ec4899" : "#db2777",
      light: mode === "dark" ? "#f472b6" : "#ec4899",
      dark: mode === "dark" ? "#be185d" : "#9d174d",
      contrastText: "#ffffff",
    },
    success: {
      main: mode === "dark" ? "#10b981" : "#059669",
      light: mode === "dark" ? "#34d399" : "#10b981",
      dark: mode === "dark" ? "#047857" : "#065f46",
    },
    warning: {
      main: mode === "dark" ? "#f59e0b" : "#d97706",
      light: mode === "dark" ? "#fbbf24" : "#f59e0b",
      dark: mode === "dark" ? "#d97706" : "#92400e",
    },
    error: {
      main: mode === "dark" ? "#ef4444" : "#dc2626",
      light: mode === "dark" ? "#f87171" : "#ef4444",
      dark: mode === "dark" ? "#dc2626" : "#991b1b",
    },
    background: {
      default: mode === "dark" ? "#0f172a" : "#f8fafc",
      paper: mode === "dark" ? "#1e293b" : "#ffffff",
      alt: mode === "dark" ? "#334155" : "#f1f5f9",
    },
    text: {
      primary: mode === "dark" ? "#f1f5f9" : "#0f172a",
      secondary: mode === "dark" ? "#cbd5e1" : "#475569",
      disabled: mode === "dark" ? "#64748b" : "#94a3b8",
    },
    divider: mode === "dark" ? "#334155" : "#e2e8f0",
    action: {
      hover:
        mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
      selected:
        mode === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
      disabled:
        mode === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.26)",
      disabledBackground:
        mode === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
    },
    grey: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
      letterSpacing: "-0.025em",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
      letterSpacing: "-0.025em",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
      letterSpacing: "-0.025em",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
      letterSpacing: "-0.025em",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.125rem",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows:
    mode === "dark"
      ? [
          "none",
          "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)",
          "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
          "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
          "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
          ...Array(20).fill("0 25px 50px -12px rgba(0, 0, 0, 0.4)"),
        ]
      : [
          "none",
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          ...Array(20).fill("0 25px 50px -12px rgba(0, 0, 0, 0.25)"),
        ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          transition:
            "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor:
              mode === "dark"
                ? "rgba(148, 163, 184, 0.4)"
                : "rgba(148, 163, 184, 0.3)",
            borderRadius: "4px",
            "&:hover": {
              backgroundColor:
                mode === "dark"
                  ? "rgba(148, 163, 184, 0.6)"
                  : "rgba(148, 163, 184, 0.5)",
            },
          },
        },
        html: {
          height: "100%",
        },
        "#root": {
          height: "100%",
          minHeight: "100vh",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
          textTransform: "none",
          fontSize: "0.875rem",
          padding: "8px 16px",
          boxShadow: "none",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow:
              mode === "dark"
                ? "0 4px 12px rgba(0, 0, 0, 0.3)"
                : "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
        },
        contained: {
          background:
            mode === "dark"
              ? `linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)`
              : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          "&:hover": {
            background:
              mode === "dark"
                ? `linear-gradient(135deg, #5b5cf6 0%, #7c3aed 100%)`
                : `linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)`,
          },
        },
        outlined: {
          borderWidth: 2,
          "&:hover": {
            borderWidth: 2,
            backgroundColor:
              mode === "dark"
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.04)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid",
          borderColor: mode === "dark" ? "#334155" : "#e2e8f0",
          boxShadow:
            mode === "dark"
              ? "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)"
              : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow:
              mode === "dark"
                ? "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)"
                : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          transition:
            "background-color 0.2s ease-in-out, border-color 0.2s ease-in-out",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          background:
            mode === "dark"
              ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
              : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          "& .MuiTableCell-head": {
            fontWeight: 700,
            fontSize: "0.875rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: mode === "dark" ? "#f1f5f9" : "#0f172a",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: mode === "dark" ? "#334155" : "#f8fafc",
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background:
            mode === "dark"
              ? "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)"
              : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          borderRight: "1px solid",
          borderColor: mode === "dark" ? "#334155" : "#e2e8f0",
          transition:
            "background 0.2s ease-in-out, border-color 0.2s ease-in-out",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background:
            mode === "dark"
              ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderBottom: "1px solid",
          borderColor: mode === "dark" ? "#334155" : "#e2e8f0",
          boxShadow:
            mode === "dark"
              ? "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)"
              : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          transition:
            "background 0.2s ease-in-out, border-color 0.2s ease-in-out",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor:
              mode === "dark"
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.04)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          transition: "all 0.2s ease-in-out",
        },
      },
    },
  },
});

function App() {
  const [mode, setMode] = useState(() => {
    // Check localStorage first, then system preference
    const savedMode = localStorage.getItem("themeMode");
    if (savedMode) return savedMode;

    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return systemPrefersDark ? "dark" : "light";
  });

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  const toggleColorMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
  };

  // Listen for system theme changes only if user hasn't set a preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      // Only follow system preference if user hasn't manually set a theme
      if (!localStorage.getItem("themeMode")) {
        setMode(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Add theme class to body for any remaining CSS that needs it
  useEffect(() => {
    document.body.className = mode === "dark" ? "dark-mode" : "light-mode";

    // Set meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        mode === "dark" ? "#0f172a" : "#ffffff"
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = mode === "dark" ? "#0f172a" : "#ffffff";
      document.getElementsByTagName("head")[0].appendChild(meta);
    }
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Box
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 1300, // Higher than drawer
        }}
      >
        <IconButton
          onClick={toggleColorMode}
          sx={{
            backgroundColor: "background.paper",
            color: "text.primary",
            boxShadow: 3,
            border: 1,
            borderColor: "divider",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: "action.hover",
              transform: "scale(1.05)",
              boxShadow: 4,
            },
            "&:active": {
              transform: "scale(0.95)",
            },
          }}
          aria-label={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
        >
          {mode === "light" ? <Brightness4 /> : <Brightness7 />}
        </IconButton>
      </Box>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
