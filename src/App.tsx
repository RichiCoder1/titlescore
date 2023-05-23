import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Providers } from "./Providers";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { Notifications } from "./components/Notifications";

function App() {
  return (
    <Providers>
      <SignedIn>
        <RouterProvider router={router} />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <Notifications />
    </Providers>
  );
}

export default App;
