import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  TrendingDown, TrendingUp, Target, BookOpen, 
  CheckCircle2, XCircle, AlertCircle, ArrowRight 
} from "lucide-react";
import { motion } from "framer-motion";

export default function QuizAnalytics({ quizAttempt, quiz, module }) {
  const { data: lessons = [] } = useQuery({
    queryKey: ["lessons", module?.id],
    queryFn: () => base44.entities.Lesson.filter({ module_id: module.id }),
    enabled: !!module?.id,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["resources", module?.id],
    queryFn: () => base44.entities.Resource.filter({ module_id: module.id }),
    enabled: !!module?.id,
  });

  // Analyze performance by category/topic
  const analyzePerformance = () => {
    const categoryStats = {};
    const skillStats = {};

    quiz.questions.forEach((question, idx) => {
      const userAnswer = quizAttempt.answers[idx];
      const isCorrect = userAnswer?.is_correct || false;
      
      // Analyze by category
      const category = question.category || "General";
      if (!categoryStats[category]) {
        categoryStats[category] = { correct: 0, total: 0, questions: [] };
      }
      categoryStats[category].total++;
      if (isCorrect) categoryStats[category].correct++;
      categoryStats[category].questions.push({
        question: question.question_text,
        isCorrect,
        explanation: question.explanation
      });

      // Analyze by skill
      if (question.associated_skill) {
        const skill = question.associated_skill;
        if (!skillStats[skill]) {
          skillStats[skill] = { correct: 0, total: 0 };
        }
        skillStats[skill].total++;
        if (isCorrect) skillStats[skill].correct++;
      }
    });

    return { categoryStats, skillStats };
  };

  const { categoryStats, skillStats } = analyzePerformance();

  // Identify weak areas (< 70% correct)
  const weakAreas = Object.entries(categoryStats)
    .filter(([_, stats]) => (stats.correct / stats.total) * 100 < 70)
    .map(([category, stats]) => ({
      category,
      percentage: Math.round((stats.correct / stats.total) * 100),
      ...stats
    }))
    .sort((a, b) => a.percentage - b.percentage);

  const strongAreas = Object.entries(categoryStats)
    .filter(([_, stats]) => (stats.correct / stats.total) * 100 >= 70)
    .map(([category, stats]) => ({
      category,
      percentage: Math.round((stats.correct / stats.total) * 100),
      ...stats
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Find relevant lessons for weak areas
  const getRelevantLessons = (category) => {
    return lessons.filter(lesson => 
      lesson.title.toLowerCase().includes(category.toLowerCase()) ||
      lesson.content_html?.toLowerCase().includes(category.toLowerCase())
    );
  };

  const getRelevantResources = (category) => {
    return resources.filter(resource => 
      resource.title.toLowerCase().includes(category.toLowerCase()) ||
      resource.description?.toLowerCase().includes(category.toLowerCase()) ||
      resource.topic_tags?.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <Card className="border-teal-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-600" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-lg">
              <div className="text-3xl font-bold text-teal-700">{quizAttempt.score}%</div>
              <div className="text-sm text-slate-600 mt-1">Overall Score</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg">
              <div className="text-3xl font-bold text-green-700">
                {quizAttempt.answers.filter(a => a.is_correct).length}
              </div>
              <div className="text-sm text-slate-600 mt-1">Correct Answers</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-lg">
              <div className="text-3xl font-bold text-rose-700">
                {quizAttempt.answers.filter(a => !a.is_correct).length}
              </div>
              <div className="text-sm text-slate-600 mt-1">Incorrect Answers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Topic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(categoryStats).map(([category, stats]) => {
            const percentage = Math.round((stats.correct / stats.total) * 100);
            const isWeak = percentage < 70;
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border-2 ${
                  isWeak ? "bg-rose-50/50 border-rose-200" : "bg-green-50/50 border-green-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isWeak ? "bg-rose-100" : "bg-green-100"
                    }`}>
                      {isWeak ? (
                        <TrendingDown className="w-4 h-4 text-rose-600" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <span className="font-semibold text-slate-800">{category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${isWeak ? "text-rose-700" : "text-green-700"}`}>
                      {percentage}%
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {stats.correct}/{stats.total}
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={percentage} 
                  className={`h-2 ${isWeak ? "[&>div]:bg-rose-500" : "[&>div]:bg-green-500"}`}
                />
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Skill Performance */}
      {Object.keys(skillStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skill Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(skillStats).map(([skill, stats]) => {
                const percentage = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={skill} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{skill}</span>
                      <span className="text-sm font-bold text-teal-700">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Areas Needing Improvement */}
      {weakAreas.length > 0 && (
        <Card className="border-amber-200/60 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-5 h-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weakAreas.map((area) => {
              const relevantLessons = getRelevantLessons(area.category);
              const relevantResources = getRelevantResources(area.category);
              
              return (
                <div key={area.category} className="bg-white p-4 rounded-lg border border-amber-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-800">{area.category}</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {area.correct} out of {area.total} correct ({area.percentage}%)
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                      Needs Practice
                    </Badge>
                  </div>

                  {/* Recommended Lessons */}
                  {relevantLessons.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Recommended Lessons
                      </div>
                      <div className="space-y-1.5">
                        {relevantLessons.slice(0, 3).map((lesson) => (
                          <Link
                            key={lesson.id}
                            to={createPageUrl(`ModuleDetail?id=${module.id}&lesson=${lesson.id}`)}
                            className="flex items-center justify-between p-2 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors group"
                          >
                            <span className="text-sm text-slate-700">{lesson.title}</span>
                            <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Resources */}
                  {relevantResources.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Additional Resources
                      </div>
                      <div className="space-y-1.5">
                        {relevantResources.slice(0, 2).map((resource) => (
                          <a
                            key={resource.id}
                            href={resource.url || resource.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                          >
                            <span className="text-sm text-slate-700">{resource.title}</span>
                            <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Questions you missed */}
                  <details className="mt-3">
                    <summary className="text-xs font-semibold text-slate-600 cursor-pointer hover:text-slate-800">
                      View missed questions ({area.questions.filter(q => !q.isCorrect).length})
                    </summary>
                    <div className="mt-2 space-y-2">
                      {area.questions.filter(q => !q.isCorrect).map((q, idx) => (
                        <div key={idx} className="p-2 bg-rose-50/50 rounded text-xs">
                          <p className="text-slate-700 mb-1">{q.question}</p>
                          {q.explanation && (
                            <p className="text-slate-500 italic">💡 {q.explanation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Strong Areas */}
      {strongAreas.length > 0 && (
        <Card className="border-green-200/60 bg-green-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              Areas of Strength
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {strongAreas.map((area) => (
                <div key={area.category} className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{area.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-green-700">{area.percentage}%</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">
                        {area.correct}/{area.total}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="border-teal-200/60 bg-gradient-to-br from-teal-50 to-blue-50">
        <CardHeader>
          <CardTitle>Recommended Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {weakAreas.length > 0 ? (
            <>
              <p className="text-sm text-slate-600">
                Focus on improving your understanding in {weakAreas.length} topic{weakAreas.length > 1 ? 's' : ''} where you scored below 70%.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="gap-2">
                  <Link to={createPageUrl(`ModuleDetail?id=${module?.id}`)}>
                    <BookOpen className="w-4 h-4" />
                    Review Module Content
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link to={createPageUrl("ResourceLibrary")}>
                    <BookOpen className="w-4 h-4" />
                    Browse Resources
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                Great job! You demonstrated strong understanding across all topics. Consider taking the next quiz or advancing to the next module.
              </p>
              <Button asChild className="bg-teal-600 hover:bg-teal-700 gap-2">
                <Link to={createPageUrl("Modules")}>
                  Continue Learning
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}