import React from "react";
import { motion } from "framer-motion";
import { Award, Star, Zap, Trophy, BookOpen, Target, Shield, Crown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const BADGE_ICONS = {
  wound_warrior: Zap,
  assessment_expert: Target,
  case_closer: BookOpen,
  knowledge_seeker: Star,
  practice_perfect: Shield,
  master_clinician: Crown,
  certification_ready: Trophy,
  default: Award,
};

const BADGE_COLORS = {
  wound_warrior: "from-teal-400 to-teal-600",
  assessment_expert: "from-blue-400 to-blue-600",
  case_closer: "from-purple-400 to-purple-600",
  knowledge_seeker: "from-amber-400 to-amber-600",
  practice_perfect: "from-rose-400 to-rose-600",
  master_clinician: "from-indigo-400 to-indigo-600",
  certification_ready: "from-yellow-400 to-yellow-600",
  default: "from-slate-400 to-slate-600",
};

export default function AchievementBadge({ achievement, size = "md", showLabel = true }) {
  const Icon = BADGE_ICONS[achievement?.badge_id] || BADGE_ICONS.default;
  const gradient = BADGE_COLORS[achievement?.badge_id] || BADGE_COLORS.default;
  const sizes = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  };
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
              <Icon className={`${iconSizes[size]} text-white`} />
            </div>
            {showLabel && (
              <span className="text-[10px] font-medium text-slate-500 text-center max-w-[80px] leading-tight">
                {achievement?.badge_name}
              </span>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{achievement?.badge_name}</p>
          <p className="text-xs text-slate-400">{achievement?.badge_description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}