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
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Plus, GripVertical, X } from "lucide-react";
import { toast } from "sonner";

export default function LearningPathManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPath, setEditingPath] = useState(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    path_type: "skill_development",
    module_sequence: [],
    estimated_weeks: 0,
    certification_alignment: [],
    total_ce_hours: 0,
    is_published: true,
    prerequisites: []
  });

  const { data: paths = [] } = useQuery({
    queryKey: ["learning-paths"],
    queryFn: () => base44.entities.LearningPath.list("-created_date", 100),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["all-modules"],
    queryFn: () => base44.entities.Module.list("module_number", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LearningPath.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-paths"] });
      toast.success("Learning path created");
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LearningPath.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-paths"] });
      toast.success("Learning path updated");
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LearningPath.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-paths"] });
      toast.success("Learning path deleted");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calculate total CE hours from selected modules
    const totalCE = formData.module_sequence.reduce((sum, moduleId) => {
      const module = modules.find(m => m.id === moduleId);
      return sum + (module?.contact_hours || 0);
    }, 0);
    
    const dataToSubmit = { ...formData, total_ce_hours: totalCE };
    
    if (editingPath) {
      updateMutation.mutate({ id: editingPath.id, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      path_type: "skill_development",
      module_sequence: [],
      estimated_weeks: 0,
      certification_alignment: [],
      total_ce_hours: 0,
      is_published: true,
      prerequisites: []
    });
    setEditingPath(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (path) => {
    setEditingPath(path);
    setFormData({
      title: path.title,
      description: path.description || "",
      path_type: path.path_type,
      module_sequence: path.module_sequence || [],
      estimated_weeks: path.estimated_weeks || 0,
      certification_alignment: path.certification_alignment || [],
      total_ce_hours: path.total_ce_hours || 0,
      is_published: path.is_published,
      prerequisites: path.prerequisites || []
    });
    setIsDialogOpen(true);
  };

  const addModuleToSequence = (moduleId) => {
    if (!formData.module_sequence.includes(moduleId)) {
      setFormData({ ...formData, module_sequence: [...formData.module_sequence, moduleId] });
    }
  };

  const removeModuleFromSequence = (moduleId) => {
    setFormData({
      ...formData,
      module_sequence: formData.module_sequence.filter(id => id !== moduleId)
    });
  };

  const moveModule = (index, direction) => {
    const newSequence = [...formData.module_sequence];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newSequence.length) {
      [newSequence[index], newSequence[newIndex]] = [newSequence[newIndex], newSequence[index]];
      setFormData({ ...formData, module_sequence: newSequence });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Learning Paths</h2>
          <p className="text-sm text-slate-500 mt-1">Create structured learning journeys</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
              <Plus className="w-4 h-4" /> Create Learning Path
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPath ? "Edit Learning Path" : "Create Learning Path"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Path Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="WOCN Certification Preparation"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Complete preparation path for the WOCN certification exam..."
                  />
                </div>

                <div>
                  <Label>Path Type</Label>
                  <Select value={formData.path_type} onValueChange={(value) => setFormData({ ...formData, path_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="certification_prep">Certification Prep</SelectItem>
                      <SelectItem value="skill_development">Skill Development</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Estimated Weeks</Label>
                  <Input
                    type="number"
                    value={formData.estimated_weeks}
                    onChange={(e) => setFormData({ ...formData, estimated_weeks: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Certification Alignment (comma-separated)</Label>
                  <Input
                    value={formData.certification_alignment.join(", ")}
                    onChange={(e) => setFormData({ ...formData, certification_alignment: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                    placeholder="WOCN, ASCN, CWS"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Module Sequence *</Label>
                  <Select onValueChange={addModuleToSequence}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add modules to path..." />
                    </SelectTrigger>
                    <SelectContent>
                      {modules
                        .filter(m => !formData.module_sequence.includes(m.id))
                        .map(module => (
                          <SelectItem key={module.id} value={module.id}>
                            Module {module.module_number}: {module.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <div className="mt-3 space-y-2">
                    {formData.module_sequence.map((moduleId, index) => {
                      const module = modules.find(m => m.id === moduleId);
                      return (
                        <div key={moduleId} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                          <div className="flex flex-col gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => moveModule(index, 'up')}
                              disabled={index === 0}
                              className="h-4 px-1"
                            >
                              ↑
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => moveModule(index, 'down')}
                              disabled={index === formData.module_sequence.length - 1}
                              className="h-4 px-1"
                            >
                              ↓
                            </Button>
                          </div>
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="text-sm flex-1">{module?.title || moduleId}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeModuleFromSequence(moduleId)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="col-span-2 flex items-center gap-3">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label>Published (visible to learners)</Label>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                  {editingPath ? "Update Path" : "Create Path"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {paths.map((path) => (
          <div key={path.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="capitalize">{path.path_type.replace("_", " ")}</Badge>
                  {!path.is_published && <Badge variant="outline">Draft</Badge>}
                  {path.total_ce_hours > 0 && (
                    <Badge variant="outline">{path.total_ce_hours} CE Hours</Badge>
                  )}
                </div>
                <h3 className="font-semibold text-slate-800">{path.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{path.description}</p>
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-400">
                  <span>📚 {path.module_sequence?.length || 0} modules</span>
                  {path.estimated_weeks > 0 && <span>📅 {path.estimated_weeks} weeks</span>}
                  {path.certification_alignment?.length > 0 && (
                    <span>🏆 {path.certification_alignment.join(", ")}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(path)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => {
                    if (confirm("Delete this learning path?")) {
                      deleteMutation.mutate(path.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {paths.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400">No learning paths yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
}