import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import {
  ArrowLeft, User, Stethoscope, Send, CheckCircle2,
  FileText, ClipboardList, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InteractiveCaseStudy from "../components/case-study/InteractiveCaseStudy";

export default function CaseStudyDetail() {
  const params = new URLSearchParams(window.location.search);
  const caseId = params.get("id");
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: caseStudy } = useQuery({
    queryKey: ["case-study", caseId],
    queryFn: async () => {
      const cases = await base44.entities.CaseStudy.filter({ id: caseId });
      return cases[0];
    },
    enabled: !!caseId,
  });

  const { data: existingSubmission } = useQuery({
    queryKey: ["case-submission", caseId],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.CaseStudySubmission.filter({
        case_study_id: caseId,
        user_email: user.email,
      });
      return subs[0] || null;
    },
    enabled: !!user?.email && !!caseId,
  });

  const { data: interactiveProgress } = useQuery({
    queryKey: ["interactive-progress", caseId],
    queryFn: async () => {
      if (!user?.email) return null;
      const progress = await base44.entities.InteractiveCaseProgress.filter({
        case_study_id: caseId,
        user_email: user.email,
      });
      return progress[0] || null;
    },
    enabled: !!user?.email && !!caseId && caseStudy?.case_type === "interactive",
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      base44.entities.CaseStudySubmission.create({
        case_study_id: caseId,
        user_email: user.email,
        answers: Object.entries(answers).map(([qid, text]) => ({
          question_id: qid,
          answer_text: text,
        })),
        status: "submitted",
      }),
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["case-submission"] });
    },
  });

  if (!caseStudy) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>;
  }

  const isSubmitted = submitted || !!existingSubmission;
  const isInteractive = caseStudy.case_type === "interactive";

  return (
    <div className="max-w-4xl mx-auto">
      <Link to={createPageUrl("CaseStudies")} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Case Studies
      </Link>

      {/* Interactive Case Study */}
      {isInteractive ? (
        <InteractiveCaseStudy
          caseStudy={caseStudy}
          userEmail={user?.email}
          existingProgress={interactiveProgress}
        />
      ) : (
        <>
          {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-2xl border-slate-200/60 mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              {caseStudy.difficulty && (
                <Badge variant="outline" className="text-xs capitalize">{caseStudy.difficulty}</Badge>
              )}
              {caseStudy.wound_type && (
                <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-xs">{caseStudy.wound_type}</Badge>
              )}
            </div>
            <CardTitle className="text-xl">{caseStudy.title}</CardTitle>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Patient Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="rounded-2xl border-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-teal-500" /> Patient Background
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{caseStudy.patient_background}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-500" /> Physical Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{caseStudy.physical_assessment}</p>
          </CardContent>
        </Card>
      </div>

      {caseStudy.lab_values && (
        <Card className="rounded-2xl border-slate-200/60 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-teal-500" /> Lab Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{caseStudy.lab_values}</p>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {caseStudy.images?.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {caseStudy.images.map((img, i) => (
            <img key={i} src={img} alt={`Case image ${i + 1}`} className="rounded-xl border border-slate-200 object-cover h-48 w-full" />
          ))}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Clinical Questions</h3>
        {caseStudy.questions?.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="rounded-2xl border-slate-200/60">
              <CardContent className="pt-5">
                <div className="flex items-start gap-3 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{q.question}</p>
                    {q.rubric_points && (
                      <span className="text-[10px] text-slate-400 mt-1 block">{q.rubric_points} points</span>
                    )}
                  </div>
                </div>
                <Textarea
                  value={existingSubmission
                    ? existingSubmission.answers?.find(a => a.question_id === q.id)?.answer_text || ""
                    : answers[q.id] || ""
                  }
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  disabled={isSubmitted}
                  placeholder="Write your clinical response..."
                  className="min-h-[100px] rounded-xl"
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Submit / Status */}
      <div className="mt-6 flex justify-end">
        {isSubmitted ? (
          <div className="flex items-center gap-2 text-teal-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium text-sm">
              {existingSubmission?.status === "reviewed" ? "Reviewed" : "Submitted — Awaiting Review"}
            </span>
            {existingSubmission?.score !== undefined && existingSubmission?.score !== null && (
              <Badge className="bg-teal-50 text-teal-700 ml-2">Score: {existingSubmission.score}%</Badge>
            )}
          </div>
        ) : (
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={Object.keys(answers).length === 0}
            className="bg-teal-600 hover:bg-teal-700 gap-2"
          >
            <Send className="w-4 h-4" /> Submit Responses
          </Button>
        )}
      </div>

      {/* Expert Commentary */}
      {isSubmitted && caseStudy.expert_commentary && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
          <Card className="rounded-2xl border-teal-200 bg-teal-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-teal-800 flex items-center gap-2">
                <Stethoscope className="w-4 h-4" /> Expert Commentary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-teal-700 leading-relaxed">{caseStudy.expert_commentary}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
        </>
      )}
    </div>
  );
}