import { useState } from "react";
import reactLogo from "../assets/react.svg";
import viteLogo from "/favicon.svg";
import "./index.css";
import { trpc } from "../utils/trpc";
import { rootRoute } from "./root";
import { Route } from "@tanstack/router";

export const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home
});

function Home() {
  const [count, setCount] = useState(0);
  const helloQuery = trpc.hello.hello.useQuery();

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <pre>{helloQuery.data}</pre>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}
