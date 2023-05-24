import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Home } from "./pages/index";
import { DefaultLayout } from "./layouts/DefaultLayout";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { VerifyPage } from "./pages/auth/verify";
import App from "./App";
import AppLayout from "./pages/app/layout";
import { IndexPage } from "./pages/app";
import { ContestsIndexPage } from "./pages/app/contests";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        element: <DefaultLayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: '/app',
            element: <AppLayout />,
            children: [
              {
                index: true,
                element: <IndexPage />
              },
              {
                path: '/app/:contestId/',
                element: <ContestsIndexPage />
              }
            ]
          },
        ],
      },
      {
        element: <DefaultLayout />,
        children: [
          {
            path: "/auth?/login",
            element: (
              <>
                <SignedIn>
                  <Navigate to="/" />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            ),
          },
          {
            path: "/auth?/verify",
            element: <VerifyPage />,
          },
        ],
      },
    ],
  },
]);
