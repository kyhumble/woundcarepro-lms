import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import {
  Search, FileText, Video, BookOpen, ExternalLink,
  Download, Filter, Bookmark, Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const typeIcons = {
  pdf: FileText,
  video: Video,
  article: BookOpen,
  guideline: FileText,
  quick_reference: Bookmark,
  external_link: ExternalLink,
};

const typeColors = {
  pdf: "bg-rose-50 text-rose-600",
  video: "bg-purple-50 text-purple-600",
  article: "bg-blue-50 text-blue-600",
  guideline: "bg-teal-50 text-teal-600",
  quick_reference: "bg-amber-50 text-amber-600",
  external_link: "bg-slate-50 text-slate-600",
};

export default function ResourceLibrary() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const { data: resources = [] } = useQuery({
    queryKey: ["resources"],
    queryFn: () => base44.entities.Resource.filter({ status: "published" }, "-created_date", 100),
  });

  const filtered = resources.filter(r => {
    const matchSearch = r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || r.resource_type === typeFilter;
    const matchDiff = difficultyFilter === "all" || r.difficulty === difficultyFilter;
    return matchSearch && matchType && matchDiff;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Resource Library</h1>
          <p className="text-sm text-slate-500">Supplementary materials, guidelines, and reference documents</p>
        </div>
        {user?.role === "admin" && (
          <Link to={createPageUrl("AdminPanel")}>
            <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
              <Plus className="w-4 h-4" /> Manage Resources
            </Button>
          </Link>
        )}
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white rounded-xl" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 bg-white rounded-xl">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="pdf">PDFs</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="article">Articles</SelectItem>
            <SelectItem value="guideline">Guidelines</SelectItem>
            <SelectItem value="quick_reference">Quick Ref</SelectItem>
            <SelectItem value="external_link">Links</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-40 bg-white rounded-xl">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((resource, i) => {
          const Icon = typeIcons[resource.resource_type] || FileText;
          const color = typeColors[resource.resource_type] || typeColors.article;

          return (
            <Link
              key={resource.id}
              to={createPageUrl(`ResourceDetail?id=${resource.id}`)}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-xl hover:border-teal-200 transition-all group cursor-pointer"
              >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-slate-800 group-hover:text-teal-700 transition-colors">
                    {resource.title}
                  </h3>
                  {resource.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{resource.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px] capitalize">{resource.resource_type?.replace("_", " ")}</Badge>
                    {resource.difficulty && (
                      <Badge variant="outline" className="text-[10px] capitalize">{resource.difficulty}</Badge>
                    )}
                    {resource.topic_tags?.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-teal-500 flex-shrink-0 mt-1" />
              </div>
            </motion.div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400">No resources found</p>
        </div>
      )}
    </div>
  );
}