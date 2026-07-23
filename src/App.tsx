import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "./components/ui/sonner.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import GameLayout from "./pages/layout.tsx";
import WingoGame from "./pages/wingo/page.tsx";
import K3Game from "./pages/k3/page.tsx";
import FiveDGame from "./pages/fived/page.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route element={<GameLayout />}>
          <Route path="/wingo" element={<WingoGame />} />
          <Route path="/k3" element={<K3Game />} />
          <Route path="/5d" element={<FiveDGame />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
