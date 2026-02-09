import React from "react";
import { motion } from "framer-motion";
import { Award, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AVAILABLE_BADGES = [
  { id: "first_steps", name: "First Steps", description: "Complete your first lesson", icon: "🎯", color: "from-blue-400 to-blue-500" },
  { id: "module_master", name: "Module Master", description: "Complete a full module", icon: "📚", color: "from-purple-400 to-purple-500" },
  { id: "perfect_score", name: "Perfect Score", description: "Get 100% on a quiz", icon: "💯", color: "from-green-400 to-green-500" },
  { id: "speed_demon", name: "Speed Demon", description: "Complete a lesson in under 10 minutes", icon: "⚡", color: "from-yellow-400 to-yellow-500" },
  { id: "week_warrior", name: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", color: "from-orange-400 to-orange-500" },
  { id: "quiz_conqueror", name: "Quiz Conqueror", description: "Pass 10 quizzes", icon: "🏆", color: "from-amber-400 to-amber-500" },
  { id: "discussion_starter", name: "Discussion Starter", description: "Post 5 discussions", icon: "💬", color: "from-pink-400 to-pink-500" },
  { id: "exam_ace", name: "Exam Ace", description: "Pass a mock certification exam", icon: "🎓", color: "from-teal-400 to-teal-500" },
];

export default function BadgeShowcase({ earnedBadges = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Badge Collection</h3>
        <Badge variant="outline" className="text-xs">
          {earnedBadges.length}/{AVAILABLE_BADGES.length}
        </Badge>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <TooltipProvider>
          {AVAILABLE_BADGES.map((badge, i) => {
            const isEarned = earnedBadges.includes(badge.id);
            return (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`relative aspect-square rounded-xl flex items-center justify-center text-3xl ${
                      isEarned
                        ? `bg-gradient-to-br ${badge.color} shadow-md cursor-pointer hover:scale-110 transition-transform`
                        : "bg-slate-100 grayscale opacity-40"
                    }`}
                  >
                    {isEarned ? (
                      badge.icon
                    ) : (
                      <Lock className="w-6 h-6 text-slate-400" />
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold text-xs">{badge.name}</p>
                  <p className="text-xs text-slate-500">{badge.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}