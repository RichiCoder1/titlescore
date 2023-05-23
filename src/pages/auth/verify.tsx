
import { useUser, useSignIn, RedirectToSignIn } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Navigate, useParams, useResolvedPath } from "react-router-dom";

export const VerifyPage = () => {
  const { token, redirectTo = '/' } = useParams();
  const { signIn, setSession } = useSignIn();
  const { user } = useUser();
  const toPath = useResolvedPath(redirectTo);
  const [signInProcessed, setSignInProcessed] = useState<boolean>(false);

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

        setSession(res.createdSessionId, () => {
          setSignInProcessed(true);
        });
      } catch (err) {
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
