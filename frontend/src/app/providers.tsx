// =============================================================
// FILE: src/app/providers.tsx
// Amaç: Redux + NextAuth Session provider'larını sarmalamak
// =============================================================

"use client";

import { SessionProvider } from "next-auth/react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReduxProvider store={store}>{children}</ReduxProvider>
    </SessionProvider>
  );
}
