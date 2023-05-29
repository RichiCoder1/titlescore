import { useRouteError } from "react-router";

export function RouterErrorBoundary() {
  const error = useRouteError();
  console.error("Route Error", console.error());
  const message =
    error && typeof error === "object" && "message" in error
      ? (error.message as string)
      : error?.toString();
  return (
    <div>
      <span className="text-destructive">{message}</span>
    </div>
  );
}
