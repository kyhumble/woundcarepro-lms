import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus, Trash2, Edit, Save, X, BookOpen, Target, List
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function QuizBuilder() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizData, setQuizData] = useState({
    title: "",
    module_id: "",
    quiz_type: "module_quiz",
    passing_score: 80,
    time_limit_minutes: 30,
    questions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: "",
    question_type: "multiple_choice",
    options: [{ text: "", is_correct: false }],
    explanation: "",
    associated_skill: ""
  });

  const queryClient = useQueryClient();

  const { data: quizzes = [] } = useQuery({
    queryKey: ["admin-quizzes"],
    queryFn: () => base44.entities.Quiz.list("-created_date", 100),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["quiz-modules"],
    queryFn: () => base44.entities.Module.list("module_number", 50),
  });

  const createQuizMutation = useMutation({
    mutationFn: (quiz) => base44.entities.Quiz.create(quiz),
    onSuccess: () => {
      toast.success("Quiz created successfully!");
      resetForm();
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
    },
    onError: (error) => {
      toast.error("Failed to create quiz");
    },
  });

  const updateQuizMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Quiz.update(id, data),
    onSuccess: () => {
      toast.success("Quiz updated successfully!");
      resetForm();
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
    },
    onError: () => {
      toast.error("Failed to update quiz");
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: (id) => base44.entities.Quiz.delete(id),
    onSuccess: () => {
      toast.success("Quiz deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
    },
  });

  const resetForm = () => {
    setQuizData({
      title: "",
      module_id: "",
      quiz_type: "module_quiz",
      passing_score: 80,
      time_limit_minutes: 30,
      questions: []
    });
    setEditingQuiz(null);
  };

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, { text: "", is_correct: false }]
    });
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addQuestion = () => {
    if (!currentQuestion.question_text || currentQuestion.options.every(o => !o.text)) {
      toast.error("Please complete the question and options");
      return;
    }
    const questionWithId = {
      ...currentQuestion,
      id: Date.now().toString(),
      options: currentQuestion.options.map((o, i) => ({ ...o, id: i.toString() }))
    };
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, questionWithId]
    });
    setCurrentQuestion({
      question_text: "",
      question_type: "multiple_choice",
      options: [{ text: "", is_correct: false }],
      explanation: "",
      associated_skill: ""
    });
    toast.success("Question added!");
  };

  const removeQuestion = (questionId) => {
    setQuizData({
      ...quizData,
      questions: quizData.questions.filter(q => q.id !== questionId)
    });
  };

  const handleSaveQuiz = () => {
    if (!quizData.title || !quizData.module_id || quizData.questions.length === 0) {
      toast.error("Please complete all required fields and add at least one question");
      return;
    }

    if (editingQuiz) {
      updateQuizMutation.mutate({ id: editingQuiz.id, data: quizData });
    } else {
      createQuizMutation.mutate(quizData);
    }
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setQuizData(quiz);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="border-teal-200/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-600" />
              Custom Quiz Builder
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Quiz
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingQuiz ? "Edit Quiz" : "Create New Quiz"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Quiz Settings */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Quiz Title</label>
                      <Input
                        placeholder="e.g., Module 1 Assessment"
                        value={quizData.title}
                        onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Module</label>
                        <Select value={quizData.module_id} onValueChange={(v) => setQuizData({ ...quizData, module_id: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select module" />
                          </SelectTrigger>
                          <SelectContent>
                            {modules.map(m => (
                              <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Quiz Type</label>
                        <Select value={quizData.quiz_type} onValueChange={(v) => setQuizData({ ...quizData, quiz_type: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="module_quiz">Module Quiz</SelectItem>
                            <SelectItem value="final_exam">Final Exam</SelectItem>
                            <SelectItem value="practice">Practice Quiz</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Passing Score (%)</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={quizData.passing_score}
                          onChange={(e) => setQuizData({ ...quizData, passing_score: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Time Limit (min)</label>
                        <Input
                          type="number"
                          min="0"
                          value={quizData.time_limit_minutes}
                          onChange={(e) => setQuizData({ ...quizData, time_limit_minutes: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Question Builder */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-slate-800 mb-3">Add Question</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Question</label>
                        <Textarea
                          placeholder="Enter your question..."
                          value={currentQuestion.question_text}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Options</label>
                        <div className="space-y-2">
                          {currentQuestion.options.map((option, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={option.is_correct}
                                onChange={(e) => updateOption(i, 'is_correct', e.target.checked)}
                                className="w-4 h-4 text-teal-600"
                              />
                              <Input
                                placeholder={`Option ${i + 1}`}
                                value={option.text}
                                onChange={(e) => updateOption(i, 'text', e.target.value)}
                                className="flex-1"
                              />
                              {currentQuestion.options.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeOption(i)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={addOption} className="mt-2">
                          <Plus className="w-3 h-3 mr-1" /> Add Option
                        </Button>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Explanation (optional)</label>
                        <Textarea
                          placeholder="Explain the correct answer..."
                          value={currentQuestion.explanation}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Associated Skill (optional)</label>
                        <Input
                          placeholder="e.g., Pressure Injury Staging"
                          value={currentQuestion.associated_skill}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, associated_skill: e.target.value })}
                        />
                        <p className="text-xs text-slate-500 mt-1">Link this question to a specific skill for mastery tracking</p>
                      </div>

                      <Button onClick={addQuestion} variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question to Quiz
                      </Button>
                    </div>
                  </div>

                  {/* Questions List */}
                  {quizData.questions.length > 0 && (
                    <div className="border-t pt-4">
                      <h3 className="font-semibold text-slate-800 mb-3">Quiz Questions ({quizData.questions.length})</h3>
                      <div className="space-y-2">
                        {quizData.questions.map((q, i) => (
                          <div key={q.id} className="p-3 bg-slate-50 rounded-lg flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700">{i + 1}. {q.question_text}</p>
                              <p className="text-xs text-slate-500 mt-1">{q.options.length} options</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeQuestion(q.id)}
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveQuiz}
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                      disabled={createQuizMutation.isPending || updateQuizMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingQuiz ? "Update Quiz" : "Create Quiz"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Quizzes List */}
      <div className="grid gap-4">
        {quizzes.map((quiz, i) => {
          const module = modules.find(m => m.id === quiz.module_id);
          return (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-slate-200/60 hover:border-teal-200 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-800">{quiz.title}</h3>
                        <Badge variant="outline" className="text-xs capitalize">
                          {quiz.quiz_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {module?.title || 'No module'}
                        </span>
                        <span className="flex items-center gap-1">
                          <List className="w-3 h-3" />
                          {quiz.questions?.length || 0} questions
                        </span>
                        <span>Pass: {quiz.passing_score}%</span>
                        <span>Time: {quiz.time_limit_minutes}min</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(quiz)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteQuizMutation.mutate(quiz.id)}
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        {quizzes.length === 0 && (
          <Card className="border-slate-200/60">
            <CardContent className="p-12 text-center">
              <Target className="w-12 h-12 mx-auto text-slate-200 mb-3" />
              <p className="text-sm text-slate-400">No quizzes created yet. Click "Create Quiz" to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}