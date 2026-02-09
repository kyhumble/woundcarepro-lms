import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Award, Download, ExternalLink, GraduationCap, Calendar, Hash, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import moment from "moment";

export default function Certificates() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: certificates = [] } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Certificate.filter({ user_email: user.email }, "-created_date", 50);
    },
    enabled: !!user?.email,
  });

  const typeLabels = {
    module_completion: "Module Completion",
    course_completion: "Course Completion",
    certification_ready: "Certification Ready",
  };

  const typeColors = {
    module_completion: "bg-blue-50 text-blue-700 border-blue-200",
    course_completion: "bg-teal-50 text-teal-700 border-teal-200",
    certification_ready: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">My Certificates</h1>
        <p className="text-sm text-slate-500 mb-6">Your earned certificates and credentials</p>
      </motion.div>

      {certificates.length > 0 ? (
        <div className="space-y-4">
          {certificates.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden"
            >
              {/* Certificate Card */}
              <div className="relative p-6">
                {/* Decorative border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-amber-500 to-teal-500" />

                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-8 h-8 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-slate-800">{cert.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{cert.user_name}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs ${typeColors[cert.certificate_type] || typeColors.module_completion}`}>
                        {typeLabels[cert.certificate_type] || cert.certificate_type}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-3 h-3" />
                        <span>{cert.certificate_number}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>Issued {moment(cert.issue_date).format("MMM D, YYYY")}</span>
                      </div>
                      {cert.contact_hours && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>{cert.contact_hours} CE Contact Hours</span>
                        </div>
                      )}
                      {cert.expiry_date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          <span>Expires {moment(cert.expiry_date).format("MMM D, YYYY")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Award className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No Certificates Yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Complete modules and pass assessments to earn your wound care certificates and CE credits.
          </p>
        </motion.div>
      )}
    </div>
  );
}