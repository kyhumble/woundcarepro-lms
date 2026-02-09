import React from "react";
import { motion } from "framer-motion";
import { Flame, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function StreakWidget({ currentStreak, longestStreak }) {
  return (
    <Card className="rounded-2xl border-slate-200/60 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full -translate-y-16 translate-x-16" />
      <CardContent className="pt-5 relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-orange-600 font-medium">Learning Streak</p>
            <p className="text-2xl font-bold text-orange-700">{currentStreak} days</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-orange-600">
          <Calendar className="w-3 h-3" />
          <span>Longest: {longestStreak} days</span>
        </div>
        {currentStreak >= 7 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-2 text-xs text-orange-700 font-medium"
          >
            🔥 You're on fire! Keep it going!
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}