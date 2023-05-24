import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Outlet } from "react-router";

export default function AppLayout() {
  return (
    <>
      <SignedIn>
        <div className="mx-auto w-full md:max-w-2xl mt-10 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn afterSignInUrl="/app" />
      </SignedOut>
    </>
  );
}
