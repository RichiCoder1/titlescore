"use client";

import {
  ClerkProvider,
  useAuth,
  useClerk,
} from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "./utils/trpc";
import { useEffect, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { atom } from "nanostores";
import { useNavigate } from "react-router-dom";

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const baseUrl = new URL(import.meta.url);
const apiUrl = new URL("/api/trpc", `${baseUrl.protocol}//${baseUrl.host}`);

const clerkAtom = atom<ReturnType<typeof useClerk> | null>(null);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [darkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [variables] = useState(() => {
    const style = getComputedStyle(document.body);
    return {
      colorBackground: `hsl(${style.getPropertyValue("--card")})`,
      colorPrimary: `hsl(${style.getPropertyValue("--card")})`,
    };
  });
  const navigate = useNavigate();
  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      navigate={navigate}
      appearance={{
        baseTheme: darkMode ? dark : undefined,
        layout: {
          logoImageUrl: "/favicon.svg",
        },
        variables,
      }}
    >
      <HelmetProvider>
        <ClientProvider>{children}</ClientProvider>
      </HelmetProvider>
    </ClerkProvider>
  );
}

const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();
  const [trpcClient] = useState(() =>  trpc.createClient({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: apiUrl.toString(),
        // You can pass any HTTP headers you wish here
        async headers() {
          const token = await getToken({ template: "default" });
          return {
            authorization: `Bearer ${token}`,
          };
        },
      }),
    ],
  }));
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
