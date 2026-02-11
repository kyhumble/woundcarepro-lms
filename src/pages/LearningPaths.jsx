import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { BookOpen, Clock, Award, ChevronRight, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function LearningPaths() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: paths = [] } = useQuery({
    queryKey: ["learning-paths"],
    queryFn: () => base44.entities.LearningPath.filter({ is_published: true }),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["all-modules"],
    queryFn: () => base44.entities.Module.list("module_number", 100),
  });

  const { data: pathProgress = [] } = useQuery({
    queryKey: ["path-progress", user?.email],
    queryFn: () => base44.entities.PathProgress.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ["user-module-progress", user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const startPathMutation = useMutation({
    mutationFn: (pathId) =>
      base44.entities.PathProgress.create({
        user_email: user.email,
        path_id: pathId,
        current_module_index: 0,
        completed_module_ids: [],
        started_at: new Date().toISOString(),
        status: "in_progress"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["path-progress"] });
    },
  });

  const getPathProgress = (path) => {
    const progress = pathProgress.find(p => p.path_id === path.id);
    if (!progress) return { started: false, percentage: 0, completedCount: 0 };

    const completedCount = progress.completed_module_ids?.length || 0;
    const totalModules = path.module_sequence?.length || 1;
    const percentage = (completedCount / totalModules) * 100;

    return { started: true, percentage, completedCount, progress };
  };

  const getNextModule = (path) => {
    const progress = pathProgress.find(p => p.path_id === path.id);
    if (!progress) return modules.find(m => m.id === path.module_sequence?.[0]);

    const nextIndex = progress.current_module_index || 0;
    const nextModuleId = path.module_sequence?.[nextIndex];
    return modules.find(m => m.id === nextModuleId);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Learning Paths</h1>
        <p className="text-slate-500 mt-2">Follow structured curricula to achieve your learning goals</p>
      </div>

      <div className="grid gap-6">
        {paths.map((path, i) => {
          const { started, percentage, completedCount, progress } = getPathProgress(path);
          const nextModule = getNextModule(path);
          const totalModules = path.module_sequence?.length || 0;

          return (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden hover:shadow-lg transition-smooth"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="capitalize bg-teal-50 text-teal-700">
                        {path.path_type.replace("_", " ")}
                      </Badge>
                      {path.certification_alignment?.length > 0 && (
                        <Badge variant="outline">
                          {path.certification_alignment.join(", ")}
                        </Badge>
                      )}
                      {started && progress?.status === "completed" && (
                        <Badge className="bg-green-50 text-green-700 gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">{path.title}</h2>
                    <p className="text-sm text-slate-500 mt-1">{path.description}</p>
                  </div>
                  {started ? (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-600">{Math.round(percentage)}%</div>
                      <p className="text-xs text-slate-400">complete</p>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>{totalModules} modules</span>
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

                {started && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>{completedCount} of {totalModules} modules completed</span>
                    </div>
                    <Progress value={percentage} className="h-2 bg-slate-100" />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {started ? (
                    <>
                      {nextModule && (
                        <Link to={createPageUrl(`ModuleDetail?id=${nextModule.id}`)} className="flex-1">
                          <Button className="w-full bg-teal-600 hover:bg-teal-700 gap-2">
                            <Play className="w-4 h-4" /> Continue: {nextModule.title}
                          </Button>
                        </Link>
                      )}
                      <Link to={createPageUrl(`LearningPathDetail?id=${path.id}`)}>
                        <Button variant="outline" className="gap-2">
                          View Path <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => startPathMutation.mutate(path.id)}
                        className="bg-teal-600 hover:bg-teal-700 gap-2"
                      >
                        <Play className="w-4 h-4" /> Start Learning Path
                      </Button>
                      <Link to={createPageUrl(`LearningPathDetail?id=${path.id}`)}>
                        <Button variant="outline" className="gap-2">
                          View Details <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {paths.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400">No learning paths available yet</p>
        </div>
      )}
    </div>
  );
}