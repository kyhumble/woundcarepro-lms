import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, BookOpen, Clock, Play, FileText, CheckCircle2,
  Circle, ChevronRight, Award, Target, Download, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import VideoPlayer from "../components/lesson/VideoPlayer";
import InlineQuiz from "../components/lesson/InlineQuiz";
import FlashcardStack from "../components/lesson/FlashcardStack";
import InteractiveDiagram from "../components/lesson/InteractiveDiagram";

export default function ModuleDetail() {
  const params = new URLSearchParams(window.location.search);
  const moduleId = params.get("id");
  const [user, setUser] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: module } = useQuery({
    queryKey: ["module", moduleId],
    queryFn: async () => {
      const mods = await base44.entities.Module.filter({ id: moduleId });
      return mods[0];
    },
    enabled: !!moduleId,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["lessons", moduleId],
    queryFn: () => base44.entities.Lesson.filter({ module_id: moduleId }, "lesson_number", 50),
    enabled: !!moduleId,
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ["quizzes", moduleId],
    queryFn: () => base44.entities.Quiz.filter({ module_id: moduleId }),
    enabled: !!moduleId,
  });

  const { data: caseStudies = [] } = useQuery({
    queryKey: ["case-studies", moduleId],
    queryFn: () => base44.entities.CaseStudy.filter({ module_id: moduleId }),
    enabled: !!moduleId,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["progress", moduleId],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.UserProgress.filter({ user_email: user.email, module_id: moduleId });
    },
    enabled: !!user?.email && !!moduleId,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["resources", moduleId],
    queryFn: () => base44.entities.Resource.filter({ module_id: moduleId }),
    enabled: !!moduleId,
  });

  const completeLessonMutation = useMutation({
    mutationFn: (lessonId) =>
      base44.entities.UserProgress.create({
        user_email: user.email,
        module_id: moduleId,
        lesson_id: lessonId,
        progress_type: "lesson_complete",
        completed_at: new Date().toISOString(),
        time_spent_minutes: 15,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["progress", moduleId] }),
  });

  const completedLessonIds = progress
    .filter(p => p.progress_type === "lesson_complete")
    .map(p => p.lesson_id);

  const overallProgress = lessons.length > 0
    ? (completedLessonIds.length / lessons.length) * 100
    : 0;

  useEffect(() => {
    if (lessons.length > 0 && !activeLesson) {
      setActiveLesson(lessons[0]);
    }
  }, [lessons]);

  const contentTypeIcons = {
    text: FileText,
    video: Play,
    interactive: Target,
    reading: BookOpen,
  };

  if (!module) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-400">Loading module...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back nav + header */}
      <Link to={createPageUrl("Modules")} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Modules
      </Link>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200/60 p-6 mb-6"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Badge className="bg-teal-50 text-teal-700 border-teal-200 mb-2">Module {module.module_number}</Badge>
            <h1 className="text-2xl font-bold text-slate-800">{module.title}</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">{module.description}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{lessons.length} lessons</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{module.estimated_hours || 0}h</span>
              </div>
              {module.contact_hours && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Award className="w-3.5 h-3.5" />
                  <span>{module.contact_hours} CE credits</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-teal-600">{Math.round(overallProgress)}%</span>
            <p className="text-xs text-slate-400">complete</p>
          </div>
        </div>
        <Progress value={overallProgress} className="h-2 bg-slate-100 mt-4" />
      </motion.div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar - Lesson List */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden sticky top-24">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-sm text-slate-800">Lessons</h3>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {lessons.map((lesson, i) => {
                const isComplete = completedLessonIds.includes(lesson.id);
                const isActive = activeLesson?.id === lesson.id;
                const Icon = contentTypeIcons[lesson.content_type] || FileText;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full text-left p-3 flex items-center gap-3 border-b border-slate-50 transition-smooth ${
                      isActive ? "bg-teal-50 border-l-2 border-l-teal-500" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-teal-500" />
                      ) : (
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isActive ? "border-teal-500" : "border-slate-300"
                        }`}>
                          <span className="text-[9px] font-bold text-slate-400">{i + 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${isActive ? "text-teal-700" : "text-slate-700"}`}>
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Icon className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] text-slate-400 capitalize">{lesson.content_type}</span>
                        {lesson.estimated_minutes && (
                          <span className="text-[10px] text-slate-400">· {lesson.estimated_minutes}min</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Module actions */}
            <div className="p-4 border-t border-slate-100 space-y-2">
              {quizzes.length > 0 && (
                <Link to={createPageUrl(`QuizPage?id=${quizzes[0].id}`)}>
                  <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700 gap-2 text-xs">
                    <Target className="w-3.5 h-3.5" /> Take Module Quiz
                  </Button>
                </Link>
              )}
              {caseStudies.length > 0 && (
                <Link to={createPageUrl(`CaseStudyDetail?id=${caseStudies[0].id}`)}>
                  <Button size="sm" variant="outline" className="w-full gap-2 text-xs">
                    <FileText className="w-3.5 h-3.5" /> View Case Studies ({caseStudies.length})
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8 xl:col-span-9">
          {activeLesson ? (
            <motion.div
              key={activeLesson.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden"
            >
              {/* Video */}
              {activeLesson.content_type === "video" && activeLesson.video_url && (
                <VideoPlayer
                  src={activeLesson.video_url}
                  onComplete={() => completeLessonMutation.mutate(activeLesson.id)}
                  isCompleted={completedLessonIds.includes(activeLesson.id)}
                />
              )}

              <div className="p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4 gap-4">
                  <div>
                    <Badge variant="outline" className="text-[10px] mb-2 capitalize">{activeLesson.content_type}</Badge>
                    <h2 className="text-xl font-bold text-slate-800">{activeLesson.title}</h2>
                  </div>
                  {!completedLessonIds.includes(activeLesson.id) && (
                    <Button
                      onClick={() => completeLessonMutation.mutate(activeLesson.id)}
                      className="bg-teal-600 hover:bg-teal-700 gap-2 flex-shrink-0"
                      size="sm"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Complete
                    </Button>
                  )}
                  {completedLessonIds.includes(activeLesson.id) && (
                    <Badge className="bg-teal-50 text-teal-700 border-teal-200 gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </Badge>
                  )}
                </div>

                {/* Lesson Content */}
                <Tabs defaultValue="content">
                  <TabsList className="mb-4">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    {activeLesson.key_terms?.length > 0 && (
                      <TabsTrigger value="terms">Key Terms</TabsTrigger>
                    )}
                    {activeLesson.resources?.length > 0 && (
                      <TabsTrigger value="resources">Resources</TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="content">
                    <div className="prose prose-slate max-w-none prose-headings:font-bold prose-p:text-slate-600 prose-p:leading-relaxed">
                      <ReactMarkdown>{activeLesson.content_html || "Content coming soon..."}</ReactMarkdown>
                    </div>
                  </TabsContent>

                  <TabsContent value="terms">
                    <div className="grid gap-3">
                      {activeLesson.key_terms?.map((term, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-xl">
                          <h4 className="font-semibold text-sm text-slate-800">{term.term}</h4>
                          <p className="text-sm text-slate-500 mt-1">{term.definition}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="resources">
                    <div className="space-y-2">
                      {activeLesson.resources?.map((res, i) => (
                        <a
                          key={i}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-smooth"
                        >
                          <Download className="w-4 h-4 text-teal-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">{res.title}</p>
                            <p className="text-xs text-slate-400">{res.type}</p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-300 ml-auto" />
                        </a>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400">Select a lesson to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}