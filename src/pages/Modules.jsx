import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import {
  BookOpen, Clock, CheckCircle2, ChevronRight, Search,
  GraduationCap, Award
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Modules() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ["modules"],
    queryFn: () => base44.entities.Module.list("module_number", 50),
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["user-progress-modules"],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.UserProgress.filter({ user_email: user.email });
    },
    enabled: !!user?.email,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["all-lessons"],
    queryFn: () => base44.entities.Lesson.list("lesson_number", 200),
  });

  const filteredModules = modules.filter(m =>
    m.title?.toLowerCase().includes(search.toLowerCase())
  );

  const getModuleProgress = (moduleId) => {
    const moduleLessons = lessons.filter(l => l.module_id === moduleId);
    const completedLessons = progress.filter(
      p => p.module_id === moduleId && p.progress_type === "lesson_complete"
    );
    if (moduleLessons.length === 0) return 0;
    return Math.min(100, (completedLessons.length / moduleLessons.length) * 100);
  };

  const totalProgress = modules.length > 0
    ? modules.reduce((sum, m) => sum + getModuleProgress(m.id), 0) / modules.length
    : 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 mb-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 rounded-full translate-y-24 -translate-x-24" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <GraduationCap className="w-8 h-8 text-teal-400" />
            <h1 className="text-2xl md:text-3xl font-bold">Wound Care Curriculum</h1>
          </div>
          <p className="text-slate-300 text-sm max-w-2xl mb-6">
            Comprehensive wound care education aligned with WOCN, ASCN, and CWS certification standards.
            Complete all modules to prepare for board certification.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-400">Overall Progress</span>
                <span className="text-xs font-medium text-teal-400">{Math.round(totalProgress)}%</span>
              </div>
              <Progress value={totalProgress} className="h-2 bg-slate-700" />
            </div>
            <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs">
              {modules.length} Modules
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search modules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white border-slate-200 rounded-xl h-11"
        />
      </div>

      {/* Modules Grid */}
      <div className="space-y-4">
        {filteredModules.map((module, i) => {
          const prog = getModuleProgress(module.id);
          const isComplete = prog >= 100;
          const moduleLessonCount = lessons.filter(l => l.module_id === module.id).length;

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                to={createPageUrl(`ModuleDetail?id=${module.id}`)}
                className="block bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg hover:shadow-slate-200/50 hover:border-teal-200 transition-smooth group"
              >
                <div className="flex items-start gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                    isComplete ? "bg-teal-500 text-white" :
                    prog > 0 ? "bg-amber-500 text-white" :
                    "bg-slate-100 text-slate-500"
                  }`}>
                    {isComplete ? <CheckCircle2 className="w-6 h-6" /> : module.module_number}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                          {module.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                          {module.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 mt-1 flex-shrink-0 transition-colors" />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{moduleLessonCount} lessons</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{module.estimated_hours || 0}h estimated</span>
                      </div>
                      {module.contact_hours && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Award className="w-3.5 h-3.5" />
                          <span>{module.contact_hours} CE credits</span>
                        </div>
                      )}
                      {module.certification_alignment?.map(cert => (
                        <Badge key={cert} variant="outline" className="text-[10px] px-2 py-0">
                          {cert}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">{Math.round(prog)}% complete</span>
                      </div>
                      <Progress value={prog} className="h-1.5 bg-slate-100" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}

        {filteredModules.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400">No modules found</p>
          </div>
        )}
      </div>
    </div>
  );
}