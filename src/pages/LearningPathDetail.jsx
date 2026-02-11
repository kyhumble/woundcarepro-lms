import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CheckCircle2, Lock, Play, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function LearningPathDetail() {
  const params = new URLSearchParams(window.location.search);
  const pathId = params.get("id");
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: path } = useQuery({
    queryKey: ["path", pathId],
    queryFn: async () => {
      const paths = await base44.entities.LearningPath.filter({ id: pathId });
      return paths[0];
    },
    enabled: !!pathId,
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["path-modules", path?.module_sequence],
    queryFn: async () => {
      if (!path?.module_sequence) return [];
      const modulePromises = path.module_sequence.map(id =>
        base44.entities.Module.filter({ id }).then(mods => mods[0])
      );
      return Promise.all(modulePromises);
    },
    enabled: !!path?.module_sequence,
  });

  const { data: pathProgress } = useQuery({
    queryKey: ["path-progress-detail", pathId, user?.email],
    queryFn: async () => {
      const progress = await base44.entities.PathProgress.filter({
        user_email: user.email,
        path_id: pathId
      });
      return progress[0];
    },
    enabled: !!user?.email && !!pathId,
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ["user-all-progress", user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const startPathMutation = useMutation({
    mutationFn: () =>
      base44.entities.PathProgress.create({
        user_email: user.email,
        path_id: pathId,
        current_module_index: 0,
        completed_module_ids: [],
        started_at: new Date().toISOString(),
        status: "in_progress"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["path-progress-detail"] });
    },
  });

  if (!path) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  const completedModuleIds = pathProgress?.completed_module_ids || [];
  const currentIndex = pathProgress?.current_module_index || 0;
  const overallProgress = modules.length > 0 ? (completedModuleIds.length / modules.length) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        to={createPageUrl("LearningPaths")}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Learning Paths
      </Link>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200/60 p-6 mb-6"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="capitalize bg-teal-50 text-teal-700">
                {path.path_type.replace("_", " ")}
              </Badge>
              {path.certification_alignment?.length > 0 && (
                <Badge variant="outline">{path.certification_alignment.join(", ")}</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{path.title}</h1>
            <p className="text-slate-500 mt-2">{path.description}</p>
          </div>
          {pathProgress && (
            <div className="text-right">
              <div className="text-3xl font-bold text-teal-600">{Math.round(overallProgress)}%</div>
              <p className="text-xs text-slate-400">complete</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>{modules.length} modules</span>
          </div>
          {path.estimated_weeks > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{path.estimated_weeks} weeks</span>
            </div>
          )}
          {path.total_ce_hours > 0 && (
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>{path.total_ce_hours} CE hours</span>
            </div>
          )}
        </div>

        {pathProgress && (
          <Progress value={overallProgress} className="h-2 bg-slate-100" />
        )}

        {!pathProgress && (
          <Button
            onClick={() => startPathMutation.mutate()}
            className="bg-teal-600 hover:bg-teal-700 gap-2 mt-4"
          >
            <Play className="w-4 h-4" /> Start This Path
          </Button>
        )}
      </motion.div>

      <div className="space-y-3">
        {modules.map((module, index) => {
          const isCompleted = completedModuleIds.includes(module?.id);
          const isCurrent = index === currentIndex && pathProgress;
          const isLocked = index > currentIndex && pathProgress;

          return (
            <motion.div
              key={module?.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl border p-5 transition-smooth ${
                isCurrent
                  ? "border-teal-300 shadow-md"
                  : isLocked
                  ? "border-slate-200 opacity-60"
                  : "border-slate-200 hover:border-teal-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-teal-500" />
                  ) : isLocked ? (
                    <Lock className="w-6 h-6 text-slate-300" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-400">{index + 1}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      Module {module?.module_number}
                    </Badge>
                    {isCurrent && <Badge className="bg-teal-50 text-teal-700 text-xs">Current</Badge>}
                  </div>
                  <h3 className="font-semibold text-slate-800">{module?.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{module?.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    {module?.estimated_hours && <span>⏱️ {module.estimated_hours}h</span>}
                    {module?.contact_hours && <span>🏆 {module.contact_hours} CE</span>}
                  </div>
                </div>

                {!isLocked && module && (
                  <Link to={createPageUrl(`ModuleDetail?id=${module.id}`)}>
                    <Button
                      variant={isCurrent ? "default" : "outline"}
                      className={isCurrent ? "bg-teal-600 hover:bg-teal-700" : ""}
                    >
                      {isCompleted ? "Review" : isCurrent ? "Continue" : "Start"}
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}