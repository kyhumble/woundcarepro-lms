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
import { Trash2, Edit, Plus, GitBranch, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function InteractiveCaseManager() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const [caseData, setCaseData] = useState({
    title: "",
    module_id: "",
    patient_name: "",
    patient_background: "",
    case_type: "interactive",
    difficulty: "intermediate",
    wound_type: "",
    interactive_scenario: {
      stages: [],
      start_stage_id: "",
      end_stage_id: ""
    }
  });

  const [currentStage, setCurrentStage] = useState({
    id: "",
    title: "",
    description: "",
    decision_point: "",
    choices: []
  });

  const [currentChoice, setCurrentChoice] = useState({
    text: "",
    is_optimal: false,
    feedback: "",
    outcome_description: "",
    points_awarded: 0,
    next_stage_id: ""
  });

  const { data: cases = [] } = useQuery({
    queryKey: ["interactive-cases"],
    queryFn: () => base44.entities.CaseStudy.filter({ case_type: "interactive" }, "-created_date", 100),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => base44.entities.Module.list("module_number", 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CaseStudy.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interactive-cases"] });
      toast.success("Interactive case created");
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CaseStudy.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interactive-cases"] });
      toast.success("Interactive case updated");
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CaseStudy.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interactive-cases"] });
      toast.success("Case deleted");
    },
  });

  const resetForm = () => {
    setCaseData({
      title: "",
      module_id: "",
      patient_name: "",
      patient_background: "",
      case_type: "interactive",
      difficulty: "intermediate",
      wound_type: "",
      interactive_scenario: {
        stages: [],
        start_stage_id: "",
        end_stage_id: ""
      }
    });
    setEditingCase(null);
    setDialogOpen(false);
  };

  const addChoice = () => {
    if (!currentChoice.text) {
      toast.error("Choice text is required");
      return;
    }
    setCurrentStage({
      ...currentStage,
      choices: [...currentStage.choices, { ...currentChoice, id: Date.now().toString() }]
    });
    setCurrentChoice({
      text: "",
      is_optimal: false,
      feedback: "",
      outcome_description: "",
      points_awarded: 0,
      next_stage_id: ""
    });
  };

  const addStage = () => {
    if (!currentStage.title || !currentStage.description) {
      toast.error("Stage title and description are required");
      return;
    }

    const stageId = currentStage.id || `stage_${Date.now()}`;
    const newStage = { ...currentStage, id: stageId };
    const updatedStages = [...caseData.interactive_scenario.stages, newStage];

    setCaseData({
      ...caseData,
      interactive_scenario: {
        ...caseData.interactive_scenario,
        stages: updatedStages,
        start_stage_id: caseData.interactive_scenario.start_stage_id || stageId
      }
    });

    setCurrentStage({
      id: "",
      title: "",
      description: "",
      decision_point: "",
      choices: []
    });
    setStageDialogOpen(false);
    toast.success("Stage added");
  };

  const removeStage = (stageId) => {
    setCaseData({
      ...caseData,
      interactive_scenario: {
        ...caseData.interactive_scenario,
        stages: caseData.interactive_scenario.stages.filter(s => s.id !== stageId)
      }
    });
  };

  const handleSubmit = () => {
    if (!caseData.title || !caseData.module_id || caseData.interactive_scenario.stages.length === 0) {
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Interactive Case Studies</h2>
          <p className="text-sm text-slate-500 mt-1">Create branching scenarios with decision points</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
              <Plus className="w-4 h-4" /> Create Interactive Case
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCase ? "Edit Interactive Case" : "Create Interactive Case"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label>Case Title *</Label>
                  <Input
                    value={caseData.title}
                    onChange={(e) => setCaseData({ ...caseData, title: e.target.value })}
                    placeholder="e.g., Pressure Injury Management Decision Tree"
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
              </div>

              {/* Stages */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800">Scenario Stages ({caseData.interactive_scenario.stages.length})</h3>
                  <Dialog open={stageDialogOpen} onOpenChange={setStageDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Plus className="w-3 h-3" /> Add Stage
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add Scenario Stage</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label>Stage Title *</Label>
                          <Input
                            value={currentStage.title}
                            onChange={(e) => setCurrentStage({ ...currentStage, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Description *</Label>
                          <Textarea
                            value={currentStage.description}
                            onChange={(e) => setCurrentStage({ ...currentStage, description: e.target.value })}
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label>Decision Point</Label>
                          <Input
                            value={currentStage.decision_point}
                            onChange={(e) => setCurrentStage({ ...currentStage, decision_point: e.target.value })}
                            placeholder="What decision should the learner make?"
                          />
                        </div>

                        {/* Choices */}
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-sm text-slate-700 mb-3">Decision Choices</h4>
                          <div className="space-y-3">
                            <Input
                              placeholder="Choice text"
                              value={currentChoice.text}
                              onChange={(e) => setCurrentChoice({ ...currentChoice, text: e.target.value })}
                            />
                            <Textarea
                              placeholder="Feedback for this choice"
                              value={currentChoice.feedback}
                              onChange={(e) => setCurrentChoice({ ...currentChoice, feedback: e.target.value })}
                              rows={2}
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Points Awarded</Label>
                                <Input
                                  type="number"
                                  value={currentChoice.points_awarded}
                                  onChange={(e) => setCurrentChoice({ ...currentChoice, points_awarded: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                              <div className="flex items-end">
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={currentChoice.is_optimal}
                                    onChange={(e) => setCurrentChoice({ ...currentChoice, is_optimal: e.target.checked })}
                                    className="w-4 h-4 text-teal-600"
                                  />
                                  Optimal Choice
                                </label>
                              </div>
                            </div>
                            <Select value={currentChoice.next_stage_id} onValueChange={(v) => setCurrentChoice({ ...currentChoice, next_stage_id: v })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Next stage (or 'end')" />
                              </SelectTrigger>
                              <SelectContent>
                                {caseData.interactive_scenario.stages.map(s => (
                                  <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                                ))}
                                <SelectItem value="end">End Scenario</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button onClick={addChoice} variant="outline" size="sm" className="w-full">
                              <Plus className="w-3 h-3 mr-1" /> Add Choice
                            </Button>
                          </div>

                          {currentStage.choices.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {currentStage.choices.map((choice, i) => (
                                <div key={choice.id} className="p-2 bg-slate-50 rounded text-xs flex items-center justify-between">
                                  <span>{choice.text} {choice.is_optimal && <Badge className="ml-2 bg-green-100 text-green-700 text-[10px]">Optimal</Badge>}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentStage({ ...currentStage, choices: currentStage.choices.filter((_, idx) => idx !== i) })}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <Button onClick={addStage} className="w-full bg-purple-600 hover:bg-purple-700">
                          Add Stage to Scenario
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-2">
                  {caseData.interactive_scenario.stages.map((stage, i) => (
                    <Card key={stage.id} className="border-purple-200/60">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-purple-700">{i + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-slate-800">{stage.title}</h4>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{stage.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-[10px]">{stage.choices?.length || 0} choices</Badge>
                                {i === 0 && <Badge className="bg-teal-100 text-teal-700 text-[10px]">Start</Badge>}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeStage(stage.id)}
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  {editingCase ? "Update Case" : "Create Case"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cases List */}
      <div className="grid gap-4">
        {cases.map((caseStudy) => (
          <Card key={caseStudy.id} className="border-purple-200/60 hover:border-purple-300 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <GitBranch className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{caseStudy.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{caseStudy.patient_name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-purple-100 text-purple-700 text-xs">
                        {caseStudy.interactive_scenario?.stages?.length || 0} stages
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">{caseStudy.difficulty}</Badge>
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
                      if (confirm("Delete this case?")) deleteMutation.mutate(caseStudy.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {cases.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <GitBranch className="w-12 h-12 mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 text-sm">No interactive cases yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}