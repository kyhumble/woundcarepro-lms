import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, XCircle, MinusCircle, Send,
  ClipboardCheck, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChecklistDetail() {
  const params = new URLSearchParams(window.location.search);
  const checklistId = params.get("id");
  const [user, setUser] = useState(null);
  const [evaluations, setEvaluations] = useState({});
  const [comments, setComments] = useState({});
  const [overallComments, setOverallComments] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: checklist } = useQuery({
    queryKey: ["checklist", checklistId],
    queryFn: async () => {
      const cl = await base44.entities.SkillsChecklist.filter({ id: checklistId });
      return cl[0];
    },
    enabled: !!checklistId,
  });

  const { data: existingSub } = useQuery({
    queryKey: ["checklist-sub", checklistId],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.ChecklistSubmission.filter({
        checklist_id: checklistId,
        user_email: user.email,
      });
      return subs[0] || null;
    },
    enabled: !!user?.email && !!checklistId,
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      base44.entities.ChecklistSubmission.create({
        checklist_id: checklistId,
        user_email: user.email,
        evaluations: Object.entries(evaluations).map(([id, result]) => ({
          criteria_id: id,
          result,
          comments: comments[id] || "",
        })),
        overall_comments: overallComments,
        status: "pending",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["checklist-sub"] }),
  });

  if (!checklist) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>;
  }

  const isSubmitted = !!existingSub;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to={createPageUrl("SkillsChecklists")} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Checklists
      </Link>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-2xl border-slate-200/60 mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <ClipboardCheck className="w-5 h-5 text-teal-500" />
              <Badge variant="outline" className="text-xs">Skills Verification</Badge>
            </div>
            <CardTitle className="text-xl">{checklist.title}</CardTitle>
            {checklist.description && (
              <p className="text-sm text-slate-500 mt-1">{checklist.description}</p>
            )}
          </CardHeader>
        </Card>
      </motion.div>

      {/* Skills */}
      <div className="space-y-6">
        {checklist.skills?.map((skill, si) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.05 }}
          >
            <Card className="rounded-2xl border-slate-200/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center text-[10px] font-bold text-teal-600">
                    {si + 1}
                  </span>
                  {skill.skill_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {skill.criteria?.map((criterion) => {
                  const existingEval = existingSub?.evaluations?.find(e => e.criteria_id === criterion.id);
                  const currentVal = existingEval?.result || evaluations[criterion.id];

                  return (
                    <div key={criterion.id} className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-700 flex-1">{criterion.description}</p>
                      <RadioGroup
                        value={currentVal}
                        onValueChange={(val) => setEvaluations({ ...evaluations, [criterion.id]: val })}
                        disabled={isSubmitted}
                        className="flex gap-4"
                      >
                        <div className="flex items-center gap-1.5">
                          <RadioGroupItem value="yes" id={`${criterion.id}-yes`} />
                          <Label htmlFor={`${criterion.id}-yes`} className="text-xs text-green-600 cursor-pointer">Yes</Label>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <RadioGroupItem value="no" id={`${criterion.id}-no`} />
                          <Label htmlFor={`${criterion.id}-no`} className="text-xs text-rose-600 cursor-pointer">No</Label>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <RadioGroupItem value="na" id={`${criterion.id}-na`} />
                          <Label htmlFor={`${criterion.id}-na`} className="text-xs text-slate-400 cursor-pointer">N/A</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Comments & Submit */}
      <Card className="rounded-2xl border-slate-200/60 mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-teal-500" /> Overall Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={existingSub?.overall_comments || overallComments}
            onChange={(e) => setOverallComments(e.target.value)}
            disabled={isSubmitted}
            placeholder="Additional observations or comments..."
            className="rounded-xl min-h-[80px]"
          />
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        {isSubmitted ? (
          <Badge className="bg-teal-50 text-teal-700 border-teal-200 gap-1 text-sm px-4 py-2">
            <CheckCircle2 className="w-4 h-4" />
            {existingSub.status === "completed" ? "Verified" : "Submitted — Awaiting Verification"}
          </Badge>
        ) : (
          <Button
            onClick={() => submitMutation.mutate()}
            className="bg-teal-600 hover:bg-teal-700 gap-2"
          >
            <Send className="w-4 h-4" /> Submit for Verification
          </Button>
        )}
      </div>
    </div>
  );
}