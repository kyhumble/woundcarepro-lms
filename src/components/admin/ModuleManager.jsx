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
import { Trash2, Edit, Plus } from "lucide-react";
import { toast } from "sonner";

export default function ModuleManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    module_number: 1,
    description: "",
    objectives: [],
    estimated_hours: 0,
    cover_image: "",
    status: "published",
    prerequisites: [],
    certification_alignment: [],
    contact_hours: 0
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["admin-modules"],
    queryFn: () => base44.entities.Module.list("module_number", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Module.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules"] });
      toast.success("Module created successfully");
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Module.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules"] });
      toast.success("Module updated successfully");
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Module.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules"] });
      toast.success("Module deleted");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingModule) {
      updateMutation.mutate({ id: editingModule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      module_number: modules.length + 1,
      description: "",
      objectives: [],
      estimated_hours: 0,
      cover_image: "",
      status: "published",
      prerequisites: [],
      certification_alignment: [],
      contact_hours: 0
    });
    setEditingModule(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (module) => {
    setEditingModule(module);
    setFormData({
      title: module.title,
      module_number: module.module_number,
      description: module.description || "",
      objectives: module.objectives || [],
      estimated_hours: module.estimated_hours || 0,
      cover_image: module.cover_image || "",
      status: module.status,
      prerequisites: module.prerequisites || [],
      certification_alignment: module.certification_alignment || [],
      contact_hours: module.contact_hours || 0
    });
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Module Management</h2>
          <p className="text-sm text-slate-500 mt-1">Create and manage learning modules</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
              <Plus className="w-4 h-4" /> Add Module
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingModule ? "Edit Module" : "Create New Module"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Module Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Introduction to Wound Care"
                  />
                </div>

                <div>
                  <Label>Module Number *</Label>
                  <Input
                    type="number"
                    value={formData.module_number}
                    onChange={(e) => setFormData({ ...formData, module_number: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Module overview and what students will learn"
                  />
                </div>

                <div>
                  <Label>Estimated Hours</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Contact Hours (CE Credits)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.contact_hours}
                    onChange={(e) => setFormData({ ...formData, contact_hours: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Learning Objectives (one per line)</Label>
                  <Textarea
                    value={formData.objectives.join("\n")}
                    onChange={(e) => setFormData({ ...formData, objectives: e.target.value.split("\n").filter(Boolean) })}
                    rows={4}
                    placeholder="Identify key wound types&#10;Demonstrate proper assessment techniques"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Cover Image URL</Label>
                  <Input
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
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
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                  {editingModule ? "Update Module" : "Create Module"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {modules.map((module) => (
          <div key={module.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-teal-200 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-teal-50 text-teal-700">Module {module.module_number}</Badge>
                  <Badge variant={module.status === "published" ? "default" : "outline"}>
                    {module.status}
                  </Badge>
                </div>
                <h3 className="font-semibold text-slate-800">{module.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{module.description}</p>
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-400">
                  <span>⏱️ {module.estimated_hours}h</span>
                  {module.contact_hours > 0 && <span>🏆 {module.contact_hours} CE</span>}
                  {module.certification_alignment?.length > 0 && (
                    <span>📋 {module.certification_alignment.join(", ")}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(module)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => {
                    if (confirm("Delete this module? This will also delete all lessons, quizzes, and case studies associated with it.")) {
                      deleteMutation.mutate(module.id);
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

      {modules.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400">No modules yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
}