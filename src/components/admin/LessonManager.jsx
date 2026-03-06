import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Video, FileText, ArrowLeft, Upload, Presentation, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function LessonManager() {
  const [isEditing, setIsEditing] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedModule, setSelectedModule] = useState("");
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    module_id: "",
    lesson_number: 1,
    content_type: "text",
    content_html: "",
    video_url: "",
    video_duration_minutes: 0,
    presentation_url: "",
    presentation_file_name: "",
    embedded_quizzes: [],
    estimated_minutes: 0,
    status: "published",
    associated_skills: []
  });

  const [skillInput, setSkillInput] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);
  const [quizDraft, setQuizDraft] = useState({ question: "", options: ["", "", "", ""], correct_answer: "", explanation: "" });

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => base44.entities.Module.list("module_number", 100),
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["admin-lessons", selectedModule],
    queryFn: () => selectedModule 
      ? base44.entities.Lesson.filter({ module_id: selectedModule }, "lesson_number", 100)
      : base44.entities.Lesson.list("lesson_number", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Lesson.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      toast.success("Lesson created");
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lesson.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      toast.success("Lesson updated");
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Lesson.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
      toast.success("Lesson deleted");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingLesson) {
      updateMutation.mutate({ id: editingLesson.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      module_id: "",
      lesson_number: 1,
      content_type: "text",
      content_html: "",
      video_url: "",
      video_duration_minutes: 0,
      estimated_minutes: 0,
      status: "published",
      associated_skills: []
    });
    setEditingLesson(null);
    setIsEditing(false);
    setSkillInput("");
    setQuizDraft({ question: "", options: ["", "", "", ""], correct_answer: "", explanation: "" });
    };

    const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFile(true);
    try {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, presentation_url: file_url, presentation_file_name: file.name }));
    toast.success("File uploaded successfully!");
    } catch (err) {
    toast.error("Upload failed. Try again.");
    } finally {
    setUploadingFile(false);
    }
    };

    const addQuizQuestion = () => {
    if (!quizDraft.question || !quizDraft.correct_answer) return;
    const newQ = { ...quizDraft, id: `q-${Date.now()}`, options: quizDraft.options.filter(o => o.trim()) };
    setFormData(prev => ({ ...prev, embedded_quizzes: [...(prev.embedded_quizzes || []), newQ] }));
    setQuizDraft({ question: "", options: ["", "", "", ""], correct_answer: "", explanation: "" });
    };

    const removeQuizQuestion = (id) => {
    setFormData(prev => ({ ...prev, embedded_quizzes: prev.embedded_quizzes.filter(q => q.id !== id) }));
    };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      module_id: lesson.module_id,
      lesson_number: lesson.lesson_number,
      content_type: lesson.content_type,
      content_html: lesson.content_html || "",
      video_url: lesson.video_url || "",
      video_duration_minutes: lesson.video_duration_minutes || 0,
      presentation_url: lesson.presentation_url || "",
      presentation_file_name: lesson.presentation_file_name || "",
      embedded_quizzes: lesson.embedded_quizzes || [],
      estimated_minutes: lesson.estimated_minutes || 0,
      status: lesson.status,
      associated_skills: lesson.associated_skills || []
    });
    setIsEditing(true);
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.associated_skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        associated_skills: [...formData.associated_skills, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      associated_skills: formData.associated_skills.filter(s => s !== skill)
    });
  };

  // Full-page editor view
  if (isEditing) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={resetForm} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Lessons
          </Button>
          <h2 className="text-xl font-bold text-slate-800">
            {editingLesson ? "Edit Lesson" : "Create New Lesson"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top metadata row */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Lesson Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="md:col-span-2 lg:col-span-4">
                <Label>Lesson Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="text-base"
                  placeholder="Enter lesson title..."
                />
              </div>

              <div>
                <Label>Module *</Label>
                <Select value={formData.module_id} onValueChange={(value) => setFormData({ ...formData, module_id: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((mod) => (
                      <SelectItem key={mod.id} value={mod.id}>
                        Module {mod.module_number}: {mod.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Lesson Number *</Label>
                <Input
                  type="number"
                  value={formData.lesson_number}
                  onChange={(e) => setFormData({ ...formData, lesson_number: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label>Content Type</Label>
                <Select value={formData.content_type} onValueChange={(value) => setFormData({ ...formData, content_type: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Estimated Minutes</Label>
                <Input
                  type="number"
                  value={formData.estimated_minutes}
                  onChange={(e) => setFormData({ ...formData, estimated_minutes: parseInt(e.target.value) })}
                />
              </div>

              {formData.content_type === "video" && (
                <>
                  <div className="md:col-span-2">
                    <Label>Video URL</Label>
                    <Input
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label>Video Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.video_duration_minutes}
                      onChange={(e) => setFormData({ ...formData, video_duration_minutes: parseInt(e.target.value) })}
                    />
                  </div>
                </>
              )}

              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Full-width content editor */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Lesson Content <span className="text-slate-400 font-normal">(Markdown supported)</span></h3>
            <Textarea
              value={formData.content_html}
              onChange={(e) => setFormData({ ...formData, content_html: e.target.value })}
              rows={28}
              placeholder="# Lesson Title&#10;&#10;## Introduction&#10;&#10;Write your lesson content here using Markdown...&#10;&#10;## Key Concepts&#10;&#10;- Concept 1&#10;- Concept 2"
              className="font-mono text-sm resize-y w-full min-h-[400px]"
            />
          </div>

          {/* Voiceover Presentation Upload */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Voiceover Presentation</h3>
            <p className="text-xs text-slate-400 mb-4">Upload a pre-recorded PPT, PDF, or MP4 video with voiceover. Supports PPTX, PDF, MP4, MOV, WEBM.</p>

            {formData.presentation_url ? (
              <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl border border-teal-200">
                <Presentation className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-teal-800 truncate">{formData.presentation_file_name || "Uploaded file"}</p>
                  <a href={formData.presentation_url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:underline">Preview file</a>
                </div>
                <Button type="button" variant="ghost" size="sm" className="text-red-500 h-7 px-2" onClick={() => setFormData(prev => ({ ...prev, presentation_url: "", presentation_file_name: "" }))}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div>
                <input ref={fileInputRef} type="file" accept=".pptx,.ppt,.pdf,.mp4,.mov,.webm,.m4v" className="hidden" onChange={handleFileUpload} />
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 border-dashed border-2 w-full h-20 text-slate-500 hover:border-teal-400 hover:text-teal-600"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                >
                  {uploadingFile ? (
                    <span className="flex items-center gap-2"><Upload className="w-4 h-4 animate-bounce" /> Uploading...</span>
                  ) : (
                    <span className="flex flex-col items-center gap-1">
                      <Upload className="w-5 h-5" />
                      <span className="text-xs">Click to upload PPTX, PDF, or Video</span>
                    </span>
                  )}
                </Button>
                <p className="text-xs text-slate-400 mt-2">Or paste a direct URL:</p>
                <Input
                  value={formData.presentation_url}
                  onChange={(e) => setFormData({ ...formData, presentation_url: e.target.value, presentation_file_name: formData.presentation_file_name || "Linked presentation" })}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Embedded Quiz Questions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Embedded Quiz Questions</h3>
            <p className="text-xs text-slate-400 mb-4">Add quiz questions students answer directly within this lesson.</p>

            {/* Existing questions */}
            {formData.embedded_quizzes?.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.embedded_quizzes.map((q, i) => (
                  <div key={q.id} className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{i + 1}. {q.question}</p>
                      <p className="text-xs text-teal-600 mt-0.5">✓ {q.correct_answer}</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="text-red-500 h-7 px-2 flex-shrink-0" onClick={() => removeQuizQuestion(q.id)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new question form */}
            <div className="border border-dashed border-slate-300 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-600">Add a Question</p>
              <div>
                <Label className="text-xs">Question *</Label>
                <Input
                  value={quizDraft.question}
                  onChange={e => setQuizDraft(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="e.g., What is the first step in wound assessment?"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quizDraft.options.map((opt, i) => (
                  <div key={i}>
                    <Label className="text-xs">Option {i + 1}</Label>
                    <Input
                      value={opt}
                      onChange={e => {
                        const newOpts = [...quizDraft.options];
                        newOpts[i] = e.target.value;
                        setQuizDraft(prev => ({ ...prev, options: newOpts }));
                      }}
                      placeholder={`Option ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
              <div>
                <Label className="text-xs">Correct Answer * (must match an option exactly)</Label>
                <Input
                  value={quizDraft.correct_answer}
                  onChange={e => setQuizDraft(prev => ({ ...prev, correct_answer: e.target.value }))}
                  placeholder="Paste or type the correct option"
                />
              </div>
              <div>
                <Label className="text-xs">Explanation (shown after answering)</Label>
                <Textarea
                  value={quizDraft.explanation}
                  onChange={e => setQuizDraft(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explain why this is correct..."
                  rows={2}
                />
              </div>
              <Button type="button" onClick={addQuizQuestion} variant="outline" className="gap-2 text-teal-700 border-teal-300 hover:bg-teal-50" disabled={!quizDraft.question || !quizDraft.correct_answer}>
                <Plus className="w-4 h-4" /> Add Question
              </Button>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Associated Skills</h3>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="e.g., Wound Assessment, Dressing Selection"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} variant="outline">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.associated_skills.map((skill, i) => (
                <Badge key={i} variant="outline" className="gap-1">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pb-8">
            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 px-8">
              {editingLesson ? "Update Lesson" : "Create Lesson"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // List view
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Lesson Management</h2>
          <p className="text-sm text-slate-500 mt-1">Create and manage lesson content</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 gap-2" onClick={() => setIsEditing(true)}>
          <Plus className="w-4 h-4" /> Add Lesson
        </Button>
      </div>

      <div className="mb-4">
        <Select value={selectedModule} onValueChange={setSelectedModule}>
          <SelectTrigger className="w-64 bg-white">
            <SelectValue placeholder="Filter by module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>All Modules</SelectItem>
            {modules.map((mod) => (
              <SelectItem key={mod.id} value={mod.id}>
                Module {mod.module_number}: {mod.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Lesson</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Module</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lessons.map((lesson) => {
                const module = modules.find(m => m.id === lesson.module_id);
                return (
                  <tr key={lesson.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">#{lesson.lesson_number}</span>
                        <span className="text-sm font-medium text-slate-800">{lesson.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {module ? `Module ${module.module_number}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs capitalize">
                        {lesson.content_type === "video" && <Video className="w-3 h-3 mr-1" />}
                        {lesson.content_type === "text" && <FileText className="w-3 h-3 mr-1" />}
                        {lesson.content_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {lesson.estimated_minutes || "—"}min
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={lesson.status === "published" ? "default" : "outline"}>
                        {lesson.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(lesson)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => {
                            if (confirm("Delete this lesson?")) {
                              deleteMutation.mutate(lesson.id);
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
        {lessons.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            <p className="text-sm">No lessons yet</p>
          </div>
        )}
      </div>
    </div>
  );
}