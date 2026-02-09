import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { motion } from "framer-motion";
import { BookOpen, Clock, CheckCircle2, Lock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ModuleProgressCard({ module, progress = 0, isLocked = false, index = 0 }) {
  const statusColors = {
    completed: "bg-teal-50 text-teal-700 border-teal-200",
    in_progress: "bg-amber-50 text-amber-700 border-amber-200",
    locked: "bg-slate-100 text-slate-400 border-slate-200",
    not_started: "bg-slate-50 text-slate-500 border-slate-200",
  };

  const status = isLocked ? "locked" : progress >= 100 ? "completed" : progress > 0 ? "in_progress" : "not_started";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link
        to={isLocked ? "#" : createPageUrl(`ModuleDetail?id=${module.id}`)}
        className={`block bg-white rounded-2xl border border-slate-200/60 p-5 transition-smooth ${
          isLocked ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg hover:shadow-slate-200/50 hover:border-teal-200"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
              status === "completed" ? "bg-teal-500 text-white" :
              status === "in_progress" ? "bg-amber-500 text-white" :
              "bg-slate-200 text-slate-500"
            }`}>
              {isLocked ? <Lock className="w-4 h-4" /> : module.module_number}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {module.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-400">{module.estimated_hours || 0}h</span>
                {module.contact_hours && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{module.contact_hours} CE hrs</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {status === "completed" ? (
            <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0" />
          ) : !isLocked ? (
            <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
          ) : null}
        </div>

        {!isLocked && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-400">{Math.round(progress)}% complete</span>
              <Badge variant="outline" className={`text-[10px] px-2 py-0 ${statusColors[status]}`}>
                {status.replace("_", " ")}
              </Badge>
            </div>
            <Progress value={progress} className="h-1.5 bg-slate-100" />
          </div>
        )}
      </Link>
    </motion.div>
  );
}