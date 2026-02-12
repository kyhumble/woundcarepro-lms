import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { FileText, Search, ChevronRight, User, Stethoscope, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CaseStudies() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");

  const { data: caseStudies = [] } = useQuery({
    queryKey: ["case-studies"],
    queryFn: () => base44.entities.CaseStudy.list("-created_date", 50),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["modules-list"],
    queryFn: () => base44.entities.Module.list("module_number", 50),
  });

  const filtered = caseStudies.filter(cs => {
    const matchSearch = cs.title?.toLowerCase().includes(search.toLowerCase()) ||
      cs.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      cs.wound_type?.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = difficulty === "all" || cs.difficulty === difficulty;
    return matchSearch && matchDifficulty;
  });

  const getModuleName = (moduleId) => {
    return modules.find(m => m.id === moduleId)?.title || "";
  };

  const difficultyColors = {
    beginner: "bg-green-50 text-green-700 border-green-200",
    intermediate: "bg-amber-50 text-amber-700 border-amber-200",
    advanced: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Clinical Case Studies</h1>
        <p className="text-sm text-slate-500 mb-6">Practice clinical reasoning with real-world wound care scenarios</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white rounded-xl"
          />
        </div>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-40 bg-white rounded-xl">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cases Grid */}
      <div className="grid gap-4">
        {filtered.map((cs, i) => (
          <motion.div
            key={cs.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to={createPageUrl(`CaseStudyDetail?id=${cs.id}`)}
              className="block bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:border-teal-200 transition-smooth group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">
                      {cs.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <User className="w-3 h-3" />
                      <span>{cs.patient_name}</span>
                      {cs.wound_type && (
                        <>
                          <span>·</span>
                          <Tag className="w-3 h-3" />
                          <span>{cs.wound_type}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                      {cs.patient_background}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      {cs.case_type === "interactive" && (
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                          Interactive
                        </Badge>
                      )}
                      {cs.difficulty && (
                        <Badge variant="outline" className={`text-[10px] ${difficultyColors[cs.difficulty]}`}>
                          {cs.difficulty}
                        </Badge>
                      )}
                      {getModuleName(cs.module_id) && (
                        <Badge variant="outline" className="text-[10px]">
                          {getModuleName(cs.module_id)}
                        </Badge>
                      )}
                      {cs.case_type === "interactive" ? (
                        <span className="text-[10px] text-slate-400">
                          {cs.interactive_scenario?.stages?.length || 0} stages
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          {cs.questions?.length || 0} questions
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 flex-shrink-0 transition-colors" />
              </div>
            </Link>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400">No case studies found</p>
          </div>
        )}
      </div>
    </div>
  );
}