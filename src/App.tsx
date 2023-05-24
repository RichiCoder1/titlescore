import { Providers } from "./Providers";
import { Notifications } from "./components/Notifications";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <Providers>
      <Outlet />
      <Notifications/>
    </Providers>
  );
}

export default App;
