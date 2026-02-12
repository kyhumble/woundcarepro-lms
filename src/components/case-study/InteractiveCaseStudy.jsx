import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, AlertCircle, Lightbulb,
  Trophy, Target, ArrowRight, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function InteractiveCaseStudy({ caseStudy, userEmail, existingProgress }) {
  const [currentStageId, setCurrentStageId] = useState(
    existingProgress?.current_stage_id || caseStudy.interactive_scenario?.start_stage_id
  );
  const [choicesMade, setChoicesMade] = useState(existingProgress?.choices_made || []);
  const [totalPoints, setTotalPoints] = useState(existingProgress?.total_points || 0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [completed, setCompleted] = useState(existingProgress?.status === "completed");
  const queryClient = useQueryClient();

  const scenario = caseStudy.interactive_scenario;
  const currentStage = scenario?.stages?.find(s => s.id === currentStageId);
  const isEndStage = currentStageId === scenario?.end_stage_id;

  const progressMutation = useMutation({
    mutationFn: (data) => {
      if (existingProgress?.id) {
        return base44.entities.InteractiveCaseProgress.update(existingProgress.id, data);
      }
      return base44.entities.InteractiveCaseProgress.create({
        user_email: userEmail,
        case_study_id: caseStudy.id,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interactive-progress"] });
    },
  });

  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice);
    setShowFeedback(true);

    const newChoice = {
      stage_id: currentStageId,
      choice_id: choice.id,
      choice_text: choice.text,
      is_optimal: choice.is_optimal,
      points_earned: choice.points_awarded || 0,
    };

    const updatedChoices = [...choicesMade, newChoice];
    const updatedPoints = totalPoints + (choice.points_awarded || 0);
    const optimalCount = updatedChoices.filter(c => c.is_optimal).length;

    setChoicesMade(updatedChoices);
    setTotalPoints(updatedPoints);

    // Check if this leads to end stage
    const isGoingToEnd = choice.next_stage_id === scenario?.end_stage_id;

    progressMutation.mutate({
      current_stage_id: choice.next_stage_id,
      choices_made: updatedChoices,
      total_points: updatedPoints,
      optimal_choices_count: optimalCount,
      status: isGoingToEnd ? "completed" : "in_progress",
      completed_at: isGoingToEnd ? new Date().toISOString() : null,
    });
  };

  const handleContinue = () => {
    if (selectedChoice?.next_stage_id === scenario?.end_stage_id) {
      setCompleted(true);
    }
    setCurrentStageId(selectedChoice?.next_stage_id);
    setShowFeedback(false);
    setSelectedChoice(null);
  };

  const handleRestart = () => {
    setCurrentStageId(scenario?.start_stage_id);
    setChoicesMade([]);
    setTotalPoints(0);
    setShowFeedback(false);
    setSelectedChoice(null);
    setCompleted(false);

    if (existingProgress?.id) {
      progressMutation.mutate({
        current_stage_id: scenario?.start_stage_id,
        choices_made: [],
        total_points: 0,
        optimal_choices_count: 0,
        status: "in_progress",
        completed_at: null,
      });
    }
  };

  const optimalCount = choicesMade.filter(c => c.is_optimal).length;
  const progressPercent = scenario?.stages?.length
    ? (choicesMade.length / (scenario.stages.length - 1)) * 100
    : 0;

  if (!currentStage) {
    return <div className="text-center text-slate-400">Stage not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
              Interactive Case
            </Badge>
            <span className="text-sm text-slate-500">
              Stage {choicesMade.length + 1} of {scenario.stages.length}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-slate-700">{totalPoints} pts</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-500" />
              <span className="text-sm font-semibold text-slate-700">
                {optimalCount}/{choicesMade.length} optimal
              </span>
            </div>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Current Stage */}
      {!completed && !isEndStage && (
        <motion.div
          key={currentStageId}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="rounded-2xl border-slate-200/60 mb-6">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold text-slate-900 mb-3">{currentStage.title}</h2>
              <p className="text-slate-600 mb-4 leading-relaxed whitespace-pre-wrap">
                {currentStage.description}
              </p>
              {currentStage.image_url && (
                <img
                  src={currentStage.image_url}
                  alt={currentStage.title}
                  className="w-full rounded-xl border border-slate-200 mb-4"
                />
              )}
            </CardContent>
          </Card>

          {/* Decision Point */}
          <Card className="rounded-2xl border-teal-200 bg-teal-50/30 mb-6">
            <CardContent className="pt-5">
              <div className="flex items-start gap-3 mb-4">
                <Lightbulb className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="font-semibold text-slate-800">{currentStage.decision_point}</p>
              </div>

              {/* Choices */}
              <div className="space-y-3">
                {currentStage.choices?.map((choice, index) => (
                  <motion.button
                    key={choice.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => !showFeedback && handleChoiceSelect(choice)}
                    disabled={showFeedback}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      showFeedback && selectedChoice?.id === choice.id
                        ? choice.is_optimal
                          ? "border-green-400 bg-green-50"
                          : "border-amber-400 bg-amber-50"
                        : "border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/50"
                    } ${showFeedback ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <p className="flex-1 text-sm text-slate-700 leading-relaxed">{choice.text}</p>
                      {showFeedback && selectedChoice?.id === choice.id && (
                        <div className="flex-shrink-0">
                          {choice.is_optimal ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && selectedChoice && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card
                  className={`rounded-2xl mb-6 ${
                    selectedChoice.is_optimal
                      ? "border-green-300 bg-green-50/50"
                      : "border-amber-300 bg-amber-50/50"
                  }`}
                >
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-3 mb-3">
                      {selectedChoice.is_optimal ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-2">
                          {selectedChoice.is_optimal ? "Excellent Decision!" : "Consider This"}
                        </h3>
                        <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                          {selectedChoice.feedback}
                        </p>
                        {selectedChoice.outcome_description && (
                          <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <p className="text-xs font-semibold text-slate-600 mb-1">Outcome:</p>
                            <p className="text-sm text-slate-700">{selectedChoice.outcome_description}</p>
                          </div>
                        )}
                        {selectedChoice.points_awarded > 0 && (
                          <Badge className="mt-3 bg-amber-100 text-amber-700 border-amber-200">
                            +{selectedChoice.points_awarded} points
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleContinue} className="bg-teal-600 hover:bg-teal-700 gap-2">
                        Continue <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Completion Summary */}
      {(completed || isEndStage) && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="rounded-2xl border-teal-300 bg-gradient-to-br from-teal-50 to-white">
            <CardContent className="pt-8 pb-8 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-500" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Case Completed!</h2>
              <p className="text-slate-600 mb-6">You've worked through this interactive scenario</p>

              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-2xl font-bold text-teal-600">{totalPoints}</p>
                  <p className="text-xs text-slate-500 mt-1">Total Points</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-2xl font-bold text-green-600">{optimalCount}</p>
                  <p className="text-xs text-slate-500 mt-1">Optimal Choices</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round((optimalCount / choicesMade.length) * 100)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Accuracy</p>
                </div>
              </div>

              {caseStudy.expert_commentary && (
                <Card className="border-slate-200 bg-slate-50 mb-6">
                  <CardContent className="pt-5">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Expert Commentary</p>
                    <p className="text-sm text-slate-700 leading-relaxed text-left">
                      {caseStudy.expert_commentary}
                    </p>
                  </CardContent>
                </Card>
              )}

              <Button onClick={handleRestart} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}