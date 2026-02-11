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
import { Trash2, Edit, Plus, Upload, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function ResourceManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resource_type: "pdf",
    url: "",
    file_url: "",
    module_id: "",
    topic_tags: [],
    difficulty: "beginner",
    status: "published"
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["all-resources"],
    queryFn: () => base44.entities.Resource.list("-created_date", 100),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => base44.entities.Module.list("module_number", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Resource.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-resources"] });
      toast.success("Resource created successfully");
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Resource.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-resources"] });
      toast.success("Resource updated successfully");
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Resource.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-resources"] });
      toast.success("Resource deleted");
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, file_url: data.file_url });
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingResource) {
      updateMutation.mutate({ id: editingResource.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      resource_type: "pdf",
      url: "",
      file_url: "",
      module_id: "",
      topic_tags: [],
      difficulty: "beginner",
      status: "published"
    });
    setEditingResource(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || "",
      resource_type: resource.resource_type,
      url: resource.url || "",
      file_url: resource.file_url || "",
      module_id: resource.module_id || "",
      topic_tags: resource.topic_tags || [],
      difficulty: resource.difficulty || "beginner",
      status: resource.status
    });
    setIsDialogOpen(true);
  };

  const resourceTypeColors = {
    pdf: "bg-red-100 text-red-700",
    video: "bg-purple-100 text-purple-700",
    article: "bg-blue-100 text-blue-700",
    guideline: "bg-green-100 text-green-700",
    quick_reference: "bg-amber-100 text-amber-700",
    external_link: "bg-slate-100 text-slate-700"
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Resource Library Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage learning resources and materials</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
              <Plus className="w-4 h-4" /> Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingResource ? "Edit Resource" : "Add New Resource"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Resource Type *</Label>
                  <Select value={formData.resource_type} onValueChange={(value) => setFormData({ ...formData, resource_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="guideline">Clinical Guideline</SelectItem>
                      <SelectItem value="quick_reference">Quick Reference</SelectItem>
                      <SelectItem value="external_link">External Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
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

              <div>
                <Label>Associated Module (Optional)</Label>
                <Select value={formData.module_id} onValueChange={(value) => setFormData({ ...formData, module_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a module (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {modules.map((mod) => (
                      <SelectItem key={mod.id} value={mod.id}>
                        Module {mod.module_number}: {mod.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Upload File</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                  {uploading && <p className="text-xs text-slate-400 mt-1">Uploading...</p>}
                  {formData.file_url && <p className="text-xs text-green-600 mt-1">✓ File uploaded</p>}
                </div>
              </div>

              <div>
                <Label>External URL (Optional)</Label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label>Topic Tags (comma-separated)</Label>
                <Input
                  value={formData.topic_tags.join(", ")}
                  onChange={(e) => setFormData({ ...formData, topic_tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                  placeholder="wound care, pressure injuries, nutrition"
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
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                  {editingResource ? "Update Resource" : "Create Resource"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Module</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Tags</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resources.map((resource) => {
                const module = modules.find(m => m.id === resource.module_id);
                return (
                  <tr key={resource.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{resource.title}</p>
                        {resource.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{resource.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={resourceTypeColors[resource.resource_type]}>
                        {resource.resource_type.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {module ? (
                        <span className="text-xs text-slate-600">Module {module.module_number}</span>
                      ) : (
                        <span className="text-xs text-slate-400">General</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {resource.topic_tags?.slice(0, 2).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                        {resource.topic_tags?.length > 2 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{resource.topic_tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={resource.status === "published" ? "default" : "outline"} className="text-xs">
                        {resource.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {(resource.file_url || resource.url) && (
                          <a
                            href={resource.file_url || resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(resource)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm("Delete this resource?")) {
                              deleteMutation.mutate(resource.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {resources.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            <p className="text-sm">No resources yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}