import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { ClipboardCheck, ChevronRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SkillsChecklists() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: checklists = [] } = useQuery({
    queryKey: ["checklists"],
    queryFn: () => base44.entities.SkillsChecklist.list("-created_date", 50),
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ["checklist-submissions"],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.ChecklistSubmission.filter({ user_email: user.email });
    },
    enabled: !!user?.email,
  });

  const getSubmissionStatus = (checklistId) => {
    const sub = submissions.find(s => s.checklist_id === checklistId);
    return sub?.status || null;
  };

  const statusConfig = {
    completed: { icon: CheckCircle2, label: "Verified", color: "bg-teal-50 text-teal-700 border-teal-200" },
    in_progress: { icon: Clock, label: "In Progress", color: "bg-amber-50 text-amber-700 border-amber-200" },
    pending: { icon: Clock, label: "Pending Review", color: "bg-blue-50 text-blue-700 border-blue-200" },
    needs_improvement: { icon: AlertCircle, label: "Needs Improvement", color: "bg-rose-50 text-rose-700 border-rose-200" },
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Skills Competency Checklists</h1>
        <p className="text-sm text-slate-500 mb-6">Demonstrate clinical competency with hands-on skills verification</p>
      </motion.div>

      <div className="space-y-4">
        {checklists.map((cl, i) => {
          const status = getSubmissionStatus(cl.id);
          const config = status ? statusConfig[status] : null;
          const Icon = config?.icon;

          return (
            <motion.div
              key={cl.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                to={createPageUrl(`ChecklistDetail?id=${cl.id}`)}
                className="block bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-lg hover:border-teal-200 transition-smooth group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      status === "completed" ? "bg-teal-100" : "bg-slate-100"
                    }`}>
                      <ClipboardCheck className={`w-5 h-5 ${status === "completed" ? "text-teal-600" : "text-slate-500"}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">
                        {cl.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{cl.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-slate-400">{cl.skills?.length || 0} skill areas</span>
                        {config && (
                          <Badge variant="outline" className={`text-[10px] gap-1 ${config.color}`}>
                            <Icon className="w-3 h-3" /> {config.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 flex-shrink-0" />
                </div>
              </Link>
            </motion.div>
          );
        })}

        {checklists.length === 0 && (
          <div className="text-center py-16">
            <ClipboardCheck className="w-16 h-16 mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400">No skills checklists available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}