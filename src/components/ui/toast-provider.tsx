"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3500,
        style: {
          background: "#0D0D0D",
          color: "#FFFFFF",
          border: "1px solid rgba(138, 138, 138, 0.3)",
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: "14px",
          fontWeight: 600,
        },
        success: {
          iconTheme: { primary: "#C4D82E", secondary: "#0D0D0D" },
        },
        error: {
          iconTheme: { primary: "#D64545", secondary: "#FFFFFF" },
        },
      }}
    />
  );
}
