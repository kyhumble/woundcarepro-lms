import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Edit, Plus, FileText, GitBranch } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import InteractiveCaseManager from "./InteractiveCaseManager";

export default function CaseStudyManager() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const queryClient = useQueryClient();

  const [caseData, setCaseData] = useState({
    title: "",
    module_id: "",
    patient_name: "",
    patient_background: "",
    physical_assessment: "",
    lab_values: "",
    images: [],
    case_type: "traditional",
    questions: [],
    difficulty: "intermediate",
    wound_type: "",
    expert_commentary: "",
    status: "published"
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    rubric_points: 0,
    ideal_answer_keywords: []
  });

  const [keywordInput, setKeywordInput] = useState("");

  const { data: traditionalCases = [] } = useQuery({
    queryKey: ["traditional-cases"],
    queryFn: () => base44.entities.CaseStudy.filter({ case_type: "traditional" }, "-created_date", 100),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => base44.entities.Module.list("module_number", 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CaseStudy.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["traditional-cases"] });
      toast.success("Case study created");
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CaseStudy.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["traditional-cases"] });
      toast.success("Case study updated");
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CaseStudy.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["traditional-cases"] });
      toast.success("Case study deleted");
    },
  });

  const resetForm = () => {
    setCaseData({
      title: "",
      module_id: "",
      patient_name: "",
      patient_background: "",
      physical_assessment: "",
      lab_values: "",
      images: [],
      case_type: "traditional",
      questions: [],
      difficulty: "intermediate",
      wound_type: "",
      expert_commentary: "",
      status: "published"
    });
    setEditingCase(null);
    setDialogOpen(false);
    setCurrentQuestion({ question: "", rubric_points: 0, ideal_answer_keywords: [] });
    setKeywordInput("");
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !currentQuestion.ideal_answer_keywords.includes(keywordInput.trim())) {
      setCurrentQuestion({
        ...currentQuestion,
        ideal_answer_keywords: [...currentQuestion.ideal_answer_keywords, keywordInput.trim()]
      });
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword) => {
    setCurrentQuestion({
      ...currentQuestion,
      ideal_answer_keywords: currentQuestion.ideal_answer_keywords.filter(k => k !== keyword)
    });
  };

  const addQuestion = () => {
    if (!currentQuestion.question) {
      toast.error("Question text is required");
      return;
    }
    setCaseData({
      ...caseData,
      questions: [...caseData.questions, { ...currentQuestion, id: Date.now().toString() }]
    });
    setCurrentQuestion({ question: "", rubric_points: 0, ideal_answer_keywords: [] });
    setKeywordInput("");
    toast.success("Question added");
  };

  const removeQuestion = (questionId) => {
    setCaseData({
      ...caseData,
      questions: caseData.questions.filter(q => q.id !== questionId)
    });
  };

  const handleSubmit = () => {
    if (!caseData.title || !caseData.module_id) {
      toast.error("Please complete all required fields");
      return;
    }

    if (editingCase) {
      updateMutation.mutate({ id: editingCase.id, data: caseData });
    } else {
      createMutation.mutate(caseData);
    }
  };

  const handleEdit = (caseStudy) => {
    setEditingCase(caseStudy);
    setCaseData(caseStudy);
    setDialogOpen(true);
  };

  return (
    <Tabs defaultValue="traditional" className="space-y-6">
      <TabsList>
        <TabsTrigger value="traditional">Traditional Cases</TabsTrigger>
        <TabsTrigger value="interactive">Interactive Cases</TabsTrigger>
      </TabsList>

      <TabsContent value="traditional">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Traditional Case Studies</h2>
              <p className="text-sm text-slate-500 mt-1">Create case studies with open-ended questions</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
                  <Plus className="w-4 h-4" /> Create Case Study
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCase ? "Edit Case Study" : "Create Case Study"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Case Title *</Label>
                      <Input
                        value={caseData.title}
                        onChange={(e) => setCaseData({ ...caseData, title: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Module *</Label>
                        <Select value={caseData.module_id} onValueChange={(v) => setCaseData({ ...caseData, module_id: v })}>
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
                        <Label>Difficulty</Label>
                        <Select value={caseData.difficulty} onValueChange={(v) => setCaseData({ ...caseData, difficulty: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Patient Name</Label>
                        <Input
                          value={caseData.patient_name}
                          onChange={(e) => setCaseData({ ...caseData, patient_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Wound Type</Label>
                        <Input
                          value={caseData.wound_type}
                          onChange={(e) => setCaseData({ ...caseData, wound_type: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Patient Background</Label>
                      <Textarea
                        value={caseData.patient_background}
                        onChange={(e) => setCaseData({ ...caseData, patient_background: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Physical Assessment</Label>
                      <Textarea
                        value={caseData.physical_assessment}
                        onChange={(e) => setCaseData({ ...caseData, physical_assessment: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Lab Values</Label>
                      <Textarea
                        value={caseData.lab_values}
                        onChange={(e) => setCaseData({ ...caseData, lab_values: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Expert Commentary</Label>
                      <Textarea
                        value={caseData.expert_commentary}
                        onChange={(e) => setCaseData({ ...caseData, expert_commentary: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Status</Label>
                      <Select value={caseData.status} onValueChange={(v) => setCaseData({ ...caseData, status: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-slate-800 mb-3">Case Questions</h3>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Enter question..."
                        value={currentQuestion.question}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                        rows={2}
                      />
                      <div>
                        <Label className="text-xs">Rubric Points</Label>
                        <Input
                          type="number"
                          value={currentQuestion.rubric_points}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, rubric_points: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Ideal Answer Keywords</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add keyword"
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                          />
                          <Button type="button" onClick={addKeyword} variant="outline" size="sm">
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {currentQuestion.ideal_answer_keywords.map((keyword, i) => (
                            <Badge key={i} variant="outline" className="gap-1">
                              {keyword}
                              <button onClick={() => removeKeyword(keyword)} className="ml-1 hover:text-red-600">×</button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button onClick={addQuestion} variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" /> Add Question
                      </Button>
                    </div>

                    {caseData.questions.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium text-sm">Questions ({caseData.questions.length})</h4>
                        {caseData.questions.map((q, i) => (
                          <div key={q.id} className="p-3 bg-slate-50 rounded-lg flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700">{i + 1}. {q.question}</p>
                              <p className="text-xs text-slate-500 mt-1">{q.rubric_points} points</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)}>
                              <Trash2 className="w-4 h-4 text-rose-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={resetForm} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} className="flex-1 bg-teal-600 hover:bg-teal-700">
                      {editingCase ? "Update Case" : "Create Case"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {traditionalCases.map((caseStudy) => (
              <Card key={caseStudy.id} className="border-teal-200/60 hover:border-teal-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{caseStudy.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{caseStudy.patient_name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-teal-100 text-teal-700 text-xs">
                            {caseStudy.questions?.length || 0} questions
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">{caseStudy.difficulty}</Badge>
                          {caseStudy.status === "draft" && <Badge variant="outline" className="text-xs">Draft</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(caseStudy)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Delete this case study?")) deleteMutation.mutate(caseStudy.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {traditionalCases.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                  <p className="text-slate-400 text-sm">No traditional case studies yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="interactive">
        <InteractiveCaseManager />
      </TabsContent>
    </Tabs>
  );
}