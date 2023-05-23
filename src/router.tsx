import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Home } from "./pages/index";
import { DefaultLayout } from "./layouts/DefaultLayout";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { VerifyPage } from "./pages/auth/verify";

export const router = createBrowserRouter([
  {
    element: <DefaultLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
  {
    element: <DefaultLayout />,
    children: [
      {
        path: '/auth?/login',
        element: (
          <>
            <SignedIn>
              <Navigate to="/" />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        )
      },
      {
        path: '/auth?/verify',
        element: (
          <VerifyPage />
        )
      }
    ]
  },
]);
