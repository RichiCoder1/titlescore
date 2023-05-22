import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './utils/trpc';
import { useState } from 'react';

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
    throw new Error('Missing Publishable Key');
}
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!import.meta.env.VITE_API_URL) {
  throw new Error('Missing API URL');
}
const apiUrl = import.meta.env.VITE_API_URL;

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider publishableKey={clerkPublishableKey}>
            <ClientProvider>{children}</ClientProvider>
        </ClerkProvider>
    );
}

const ClientProvider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient());
    const { getToken } = useAuth();
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: apiUrl,
                    // You can pass any HTTP headers you wish here
                    async headers() {
                        return {
                            authorization: `Bearer ${await getToken()}`,
                        };
                    },
                }),
            ],
        })
    );
    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </trpc.Provider>
    );
};
