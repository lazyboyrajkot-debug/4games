import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card.tsx";

const GAMES = [
  {
    to: "/wingo",
    title: "Wingo",
    description: "Predict number, color, or size every 1-10 minutes.",
    icon: "🎯",
    gradient: "from-red-600 to-orange-500",
  },
  {
    to: "/k3",
    title: "K3 Lottery",
    description: "Three dice — bet on sum, size, or odd/even.",
    icon: "🎲",
    gradient: "from-blue-600 to-purple-500",
  },
  {
    to: "/5d",
    title: "5D Lottery",
    description: "Five digits — bet on each position, size, or parity.",
    icon: "🔢",
    gradient: "from-green-600 to-teal-500",
  },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-gradient-to-br from-card to-background border-b border-border px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-black text-2xl">4G</span>
          </div>
          <h1 className="text-4xl font-black text-balance text-foreground mb-2">4Games</h1>
          <p className="text-muted-foreground text-lg">Fast. Fair. Exciting.</p>
        </motion.div>
      </div>
      <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
        {GAMES.map((game, i) => (
          <motion.div
            key={game.to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
          >
            <Card
              className="cursor-pointer hover:border-primary transition-all hover:scale-[1.01] active:scale-[0.99]"
              onClick={() => navigate(game.to)}
            >
              <CardContent className="py-5 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.gradient} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                  {game.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{game.title}</h2>
                  <p className="text-muted-foreground text-sm">{game.description}</p>
                </div>
                <div className="ml-auto text-muted-foreground text-xl">›</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
