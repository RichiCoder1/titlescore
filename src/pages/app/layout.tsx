import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Outlet, useLocation } from "react-router";

export default function AppLayout() {
  return (
    <>
      <SignedIn>
        <div className="mx-auto mt-10 w-full px-4 sm:px-6 md:max-w-4xl lg:px-8">
          <Outlet />
        </div>
      </SignedIn>
      <SignInRedirect />
    </>
  );
}

function SignInRedirect() {
  const loc = useLocation();
  return (
    <SignedOut>
      <RedirectToSignIn
        redirectUrl={`${loc.pathname}${loc.search}${loc.hash}`}
      />
    </SignedOut>
  );
}
