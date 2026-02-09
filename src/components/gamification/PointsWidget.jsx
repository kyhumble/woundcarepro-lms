import React from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function PointsWidget({ totalPoints, level }) {
  const pointsForNextLevel = level * 1000;
  const currentLevelProgress = (totalPoints % 1000) / 10;

  return (
    <Card className="rounded-2xl border-slate-200/60 bg-gradient-to-br from-teal-50 to-cyan-50 overflow-hidden relative">
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-200/20 rounded-full translate-y-16 -translate-x-16" />
      <CardContent className="pt-5 relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-teal-600 font-medium">Total Points</p>
            <p className="text-2xl font-bold text-teal-700">{totalPoints.toLocaleString()}</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-teal-600">Level {level}</span>
            <span className="text-teal-500">{Math.floor(currentLevelProgress)}% to Level {level + 1}</span>
          </div>
          <Progress value={currentLevelProgress} className="h-2 bg-teal-100" />
        </div>
      </CardContent>
    </Card>
  );
}