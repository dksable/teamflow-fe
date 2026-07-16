import { Toaster } from "sonner";

import { AppRoutes } from "./routes/AppRoutes";

export function App() {
  return (
    <>
      <AppRoutes />
      <Toaster richColors position="top-right" />
    </>
  );
}
