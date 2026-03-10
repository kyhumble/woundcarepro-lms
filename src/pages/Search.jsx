import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as SearchIcon, BookOpen, FileText, Library, GraduationCap,
  ClipboardCheck, X, ArrowRight, Filter, Clock, Tag, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const CONTENT_TYPES = [
  { id: "all", label: "All", icon: SearchIcon },
  { id: "modules", label: "Modules", icon: BookOpen },
  { id: "resources", label: "Resources", icon: Library },
  { id: "case_studies", label: "Case Studies", icon: FileText },
  { id: "mock_exams", label: "Mock Exams", icon: GraduationCap },
  { id: "checklists", label: "Checklists", icon: ClipboardCheck },
];

const POPULAR_SEARCHES = [
  "wound assessment",
  "pressure ulcer staging",
  "moist wound healing",
  "WOCN exam",
  "debridement techniques",
  "infection management",
  "compression therapy",
  "dressing selection",
];

function ResultCard({ type, item, query }) {
  const highlight = (text) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="bg-teal-100 text-teal-800 rounded px-0.5">{part}</mark>
        : part
    );
  };

  const typeConfig = {
    module: { icon: BookOpen, color: "teal", label: "Module", page: "ModuleDetail" },
    resource: { icon: Library, color: "blue", label: "Resource", page: "ResourceDetail" },
    case_study: { icon: FileText, color: "violet", label: "Case Study", page: "CaseStudyDetail" },
    mock_exam: { icon: GraduationCap, color: "amber", label: "Mock Exam", page: "MockExamDetail" },
    checklist: { icon: ClipboardCheck, color: "rose", label: "Checklist", page: "ChecklistDetail" },
  };

  const config = typeConfig[type] || typeConfig.module;
  const Icon = config.icon;

  const colorMap = {
    teal: "bg-teal-100 text-teal-600",
    blue: "bg-blue-100 text-blue-600",
    violet: "bg-violet-100 text-violet-600",
    amber: "bg-amber-100 text-amber-600",
    rose: "bg-rose-100 text-rose-600",
  };

  return (
    <Link
      to={createPageUrl(config.page) + `?id=${item.id}`}
      className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm transition-all group"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[config.color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Badge variant="outline" className="text-[10px] mb-1 px-1.5 py-0">{config.label}</Badge>
            <h3 className="font-semibold text-slate-800 text-sm leading-snug group-hover:text-teal-700 transition-colors">
              {highlight(item.title || item.name || "Untitled")}
            </h3>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 flex-shrink-0 mt-1 transition-colors" />
        </div>
        {(item.description || item.learning_objectives) && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {highlight(item.description || (Array.isArray(item.learning_objectives) ? item.learning_objectives[0] : ""))}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2">
          {item.certification_alignment && (
            <span className="text-[10px] text-teal-600 font-medium flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {Array.isArray(item.certification_alignment)
                ? item.certification_alignment.join(", ")
                : item.certification_alignment}
            </span>
          )}
          {item.difficulty && (
            <span className="text-[10px] text-slate-400 capitalize">{item.difficulty}</span>
          )}
          {item.estimated_hours && (
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {item.estimated_hours}h
            </span>
          )}
          {item.resource_type && (
            <span className="text-[10px] text-slate-400 capitalize">{item.resource_type}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState("all");
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query) {
        setSearchParams({ q: query });
      } else {
        setSearchParams({});
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: modules = [], isLoading: loadingModules } = useQuery({
    queryKey: ["search-modules", debouncedQuery],
    queryFn: () => base44.entities.Module.list("module_number", 100),
    enabled: (activeType === "all" || activeType === "modules") && debouncedQuery.length > 1,
  });

  const { data: resources = [], isLoading: loadingResources } = useQuery({
    queryKey: ["search-resources", debouncedQuery],
    queryFn: () => base44.entities.Resource.list("-created_date", 100),
    enabled: (activeType === "all" || activeType === "resources") && debouncedQuery.length > 1,
  });

  const { data: caseStudies = [], isLoading: loadingCases } = useQuery({
    queryKey: ["search-cases", debouncedQuery],
    queryFn: () => base44.entities.CaseStudy.list("-created_date", 100),
    enabled: (activeType === "all" || activeType === "case_studies") && debouncedQuery.length > 1,
  });

  const { data: mockExams = [], isLoading: loadingExams } = useQuery({
    queryKey: ["search-exams", debouncedQuery],
    queryFn: () => base44.entities.MockExam.list("-created_date", 50),
    enabled: (activeType === "all" || activeType === "mock_exams") && debouncedQuery.length > 1,
  });

  const { data: checklists = [], isLoading: loadingChecklists } = useQuery({
    queryKey: ["search-checklists", debouncedQuery],
    queryFn: () => base44.entities.SkillsChecklist.list("-created_date", 50),
    enabled: (activeType === "all" || activeType === "checklists") && debouncedQuery.length > 1,
  });

  const isLoading = loadingModules || loadingResources || loadingCases || loadingExams || loadingChecklists;

  const filterFn = (items) => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return items.filter(item => {
      const searchable = [
        item.title, item.name, item.description,
        item.certification_alignment,
        item.resource_type,
        ...(Array.isArray(item.learning_objectives) ? item.learning_objectives : []),
        ...(Array.isArray(item.topic_tags) ? item.topic_tags : []),
      ].filter(Boolean).join(" ").toLowerCase();
      return searchable.includes(q);
    });
  };

  const filteredModules = filterFn(modules);
  const filteredResources = filterFn(resources);
  const filteredCases = filterFn(caseStudies);
  const filteredExams = filterFn(mockExams);
  const filteredChecklists = filterFn(checklists);

  const allResults = [
    ...filteredModules.map(m => ({ type: "module", item: m })),
    ...filteredResources.map(r => ({ type: "resource", item: r })),
    ...filteredCases.map(c => ({ type: "case_study", item: c })),
    ...filteredExams.map(e => ({ type: "mock_exam", item: e })),
    ...filteredChecklists.map(c => ({ type: "checklist", item: c })),
  ];

  const visibleResults = activeType === "all"
    ? allResults
    : allResults.filter(r => {
        if (activeType === "modules") return r.type === "module";
        if (activeType === "resources") return r.type === "resource";
        if (activeType === "case_studies") return r.type === "case_study";
        if (activeType === "mock_exams") return r.type === "mock_exam";
        if (activeType === "checklists") return r.type === "checklist";
        return true;
      });

  const counts = {
    all: allResults.length,
    modules: filteredModules.length,
    resources: filteredResources.length,
    case_studies: filteredCases.length,
    mock_exams: filteredExams.length,
    checklists: filteredChecklists.length,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Search</h1>
        <p className="text-slate-500 text-sm">Find modules, resources, case studies, and more</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search wound care content..."
          className="pl-12 pr-12 py-6 text-base border-slate-200 focus:border-teal-400 rounded-xl shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5 text-slate-600" />
          </button>
        )}
      </div>

      {/* Filters */}
      {debouncedQuery && (
        <div className="flex items-center gap-2 flex-wrap">
          {CONTENT_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeType === type.id
                  ? "bg-teal-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-teal-400"
              }`}
            >
              <type.icon className="w-3.5 h-3.5" />
              {type.label}
              {debouncedQuery && counts[type.id] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeType === type.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {counts[type.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {!debouncedQuery ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Popular searches */}
            <div>
              <p className="text-sm font-medium text-slate-500 mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 hover:border-teal-400 hover:text-teal-700 transition-colors"
                  >
                    <SearchIcon className="w-3 h-3 text-slate-400" />
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <p className="text-sm font-medium text-slate-500 mb-3">Browse Content</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "All Modules", icon: BookOpen, page: "Modules", color: "teal" },
                  { label: "Resource Library", icon: Library, page: "ResourceLibrary", color: "blue" },
                  { label: "Case Studies", icon: FileText, page: "CaseStudies", color: "violet" },
                  { label: "Mock Exams", icon: GraduationCap, page: "MockExams", color: "amber" },
                  { label: "Skills Checklists", icon: ClipboardCheck, page: "SkillsChecklists", color: "rose" },
                  { label: "Learning Paths", icon: ArrowRight, page: "LearningPaths", color: "green" },
                ].map(item => {
                  const colorMap = {
                    teal: "bg-teal-50 text-teal-700 border-teal-100",
                    blue: "bg-blue-50 text-blue-700 border-blue-100",
                    violet: "bg-violet-50 text-violet-700 border-violet-100",
                    amber: "bg-amber-50 text-amber-700 border-amber-100",
                    rose: "bg-rose-50 text-rose-700 border-rose-100",
                    green: "bg-green-50 text-green-700 border-green-100",
                  };
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      className={`flex items-center gap-2.5 p-3.5 rounded-xl border font-medium text-sm hover:shadow-sm transition-shadow ${colorMap[item.color]}`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-16 gap-3 text-slate-400"
          >
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Searching...</span>
          </motion.div>
        ) : visibleResults.length === 0 ? (
          <motion.div
            key="no-results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <SearchIcon className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No results found</h3>
            <p className="text-slate-500 text-sm mb-6">
              No content matched "<span className="font-medium text-slate-700">{debouncedQuery}</span>"
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {POPULAR_SEARCHES.slice(0, 4).map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-sm hover:bg-teal-100 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{visibleResults.length}</span> results for "
                <span className="font-medium text-teal-700">{debouncedQuery}</span>"
              </p>
            </div>

            <div className="space-y-3">
              {visibleResults.map(({ type, item }, i) => (
                <motion.div
                  key={`${type}-${item.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <ResultCard type={type} item={item} query={debouncedQuery} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
