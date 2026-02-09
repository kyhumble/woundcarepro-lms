import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const CERTIFICATIONS = [
  {
    id: "wocn",
    name: "WOCN Certification",
    fullName: "Wound Care Certified (WCC)",
    requiredHours: 45,
    requirements: ["Complete all 5 modules", "Pass final comprehensive exam", "45 CE contact hours", "Clinical practice hours"],
  },
  {
    id: "cws",
    name: "CWS Certification",
    fullName: "Certified Wound Specialist",
    requiredHours: 120,
    requirements: ["120+ hours education", "Pass CWS exam prep", "Evidence-based practice module", "Multidisciplinary training"],
  },
  {
    id: "ascn",
    name: "ASCN Recognition",
    fullName: "Advanced Wound Care",
    requiredHours: 80,
    requirements: ["Complete advanced modules", "All case studies reviewed", "Skills checklists verified", "Research methodology"],
  },
];

export default function AccreditationTracker({ totalHours = 0, completedModules = 0, totalModules = 5 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        Accreditation Pathways
      </h3>
      <div className="space-y-4">
        {CERTIFICATIONS.map((cert, i) => {
          const progress = Math.min(100, (totalHours / cert.requiredHours) * 100);
          return (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="border border-slate-100 rounded-xl p-4 hover:border-teal-200 transition-smooth"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-sm text-slate-800">{cert.name}</h4>
                  <p className="text-xs text-slate-400">{cert.fullName}</p>
                </div>
                <span className="text-xs font-medium text-teal-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5 bg-slate-100 mb-3" />
              <div className="space-y-1">
                {cert.requirements.map((req, j) => {
                  const met = j < completedModules;
                  return (
                    <div key={j} className="flex items-center gap-2 text-xs">
                      {met ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                      )}
                      <span className={met ? "text-slate-600" : "text-slate-400"}>{req}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}