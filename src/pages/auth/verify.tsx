import { useUser, useSignIn, RedirectToSignIn } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Navigate, useResolvedPath, useSearchParams } from "react-router-dom";

export const VerifyPage = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const redirectTo = params.get("redirectTo") ?? "/";
  const { signIn, setSession } = useSignIn();
  const { user } = useUser();
  const toPath = useResolvedPath(redirectTo);
  const [signInProcessed, setSignInProcessed] = useState<boolean>(false);

  console.log({ user, token, redirectTo });

  useEffect(() => {
    if (!signIn || !setSession || !token) {
      return;
    }

    const signInFunc = async () => {
      try {
        const res = await signIn.create({
          strategy: "ticket",
          ticket: token,
        });

        await setSession(res.createdSessionId, () => {
          setSignInProcessed(true);
        });
      } catch (err) {
        console.error(err);
        setSignInProcessed(true);
      }
    };

    signInFunc();
  }, [signIn, setSession]);

  if (!token) {
    return <RedirectToSignIn />;
  }

  if (!signInProcessed) {
    return <div>Verifying token...</div>;
  }

  if (!user) {
    return <RedirectToSignIn />;
  }

  return <Navigate to={toPath} />;
};
