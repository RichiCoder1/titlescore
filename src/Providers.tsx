"use client";

import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "./utils/trpc";
import { useEffect, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const baseUrl = new URL(import.meta.url);
const apiUrl = new URL("/api/trpc", `${baseUrl.protocol}//${baseUrl.host}`);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
      cacheTime: 1000 * 60 * 60 * 24,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

persistQueryClient({
  queryClient,
  persister,
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
      afterSignInUrl="/app"
      afterSignUpUrl="/app"
    >
      <HelmetProvider>
        <ClientProvider>{children}</ClientProvider>
      </HelmetProvider>
    </ClerkProvider>
  );
}

const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();
  const [trpcClient] = useState(() =>
    trpc.createClient({
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
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <CacheInvalidator />
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
};

const CacheInvalidator = () => {
  const { userId, isLoaded } = useAuth();
  const utils = trpc.useContext();
  const { data, isSuccess } = trpc.getUser.useQuery(
    {},
    {
      enabled: isLoaded && userId != null,
    }
  );
  useEffect(() => {
    if (isSuccess && userId && data) {
      if (userId !== data.id) {
        console.info(
          `Received new user, invalidating cache. ${data.id} => ${userId}.`
        );
        queryClient.resetQueries();
      }
    }
  }, [isLoaded, data, userId, isSuccess]);
  useEffect(() => {
    if (isLoaded && !userId && utils.getUser.getData({})) {
      console.info(`User signed out, resetting cache.`);
      queryClient.resetQueries();
    }
  }, [userId, isLoaded]);
  return null;
};
