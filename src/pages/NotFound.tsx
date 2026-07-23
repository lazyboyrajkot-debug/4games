import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-black text-foreground">404</h1>
        <p className="text-muted-foreground">Page not found</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    </div>
  );
}
