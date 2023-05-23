import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './utils/trpc';
import { useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
    throw new Error('Missing Publishable Key');
}
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider publishableKey={clerkPublishableKey}>
            <HelmetProvider>
                <ClientProvider>{children}</ClientProvider>
            </HelmetProvider>
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
                    url: new URL('/api/trpc', import.meta.url).toString(),
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
