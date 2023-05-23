import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Providers } from './Providers.tsx';
import { RouterProvider } from '@tanstack/router';
import { router } from './router.ts';

function App() {
    return (
        <Providers>
            <SignedIn>
                <RouterProvider router={router} />
            </SignedIn>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </Providers>
    );
}

export default App;
