import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCw, CheckCircle2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function FlashcardStack({ keyTerms }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState(new Set());

  if (!keyTerms || keyTerms.length === 0) return null;

  const currentCard = keyTerms[currentIndex];
  const progress = ((currentIndex + 1) / keyTerms.length) * 100;
  const masteredCount = masteredCards.size;

  const handleNext = () => {
    if (currentIndex < keyTerms.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  };

  const handleMastered = () => {
    setMasteredCards(new Set([...masteredCards, currentIndex]));
    handleNext();
  };

  return (
    <div className="my-6 p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Key Terms</p>
          <p className="text-xs text-slate-500">
            Card {currentIndex + 1} of {keyTerms.length} · {masteredCount} mastered
          </p>
        </div>
      </div>

      <Progress value={progress} className="h-1.5 bg-purple-100 mb-4" />

      <motion.div
        className="relative"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped(!flipped)}
      >
        <motion.div
          className="relative h-48 cursor-pointer"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white rounded-xl border-2 border-purple-200 flex items-center justify-center p-6"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">{currentCard.term}</p>
              <p className="text-xs text-slate-400 mt-2">Click to flip</p>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-purple-600 rounded-xl border-2 border-purple-700 flex items-center justify-center p-6"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="text-center">
              <p className="text-sm text-white leading-relaxed">{currentCard.definition}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="flex items-center justify-between mt-4">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>

        <Button
          onClick={() => setFlipped(!flipped)}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <RotateCw className="w-4 h-4" /> Flip
        </Button>

        {flipped && !masteredCards.has(currentIndex) && (
          <Button
            onClick={handleMastered}
            size="sm"
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="w-4 h-4" /> Got it!
          </Button>
        )}

        {(!flipped || masteredCards.has(currentIndex)) && (
          <Button
            onClick={handleNext}
            disabled={currentIndex === keyTerms.length - 1}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}