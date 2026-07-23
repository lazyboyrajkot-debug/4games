import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultProviders } from "../components/providers/default.tsx";
import AuthCallback from "./auth/Callback.tsx";
import Index from "./Index.tsx";
import NotFound from "./NotFound.tsx";
import GameLayout from "./layout.tsx";
import WingoGame from "./wingo/page.tsx";
import K3Game from "./k3/page.tsx";
import FiveDGame from "./fived/page.tsx";

export default function App() {
  return (
    <DefaultProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<GameLayout />}>
            <Route path="/wingo" element={<WingoGame />} />
            <Route path="/k3" element={<K3Game />} />
            <Route path="/5d" element={<FiveDGame />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DefaultProviders>
  );
}
