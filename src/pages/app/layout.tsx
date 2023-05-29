import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Suspense } from "react";
import { Outlet, useLocation } from "react-router";
import { PuffLoader } from "react-spinners";

export default function AppLayout() {
  return (
    <>
      <SignedIn>
        <div className="relative mx-auto mt-10 w-full px-4 sm:px-6 md:max-w-4xl lg:px-8">
          <Suspense fallback={<DefaultFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </SignedIn>
      <SignInRedirect />
    </>
  );
}

function DefaultFallback() {
  return (
    <div className="h-full">
      a aslk;jdaslkdj
      <PuffLoader className="h-10 w-10" />
    </div>
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
