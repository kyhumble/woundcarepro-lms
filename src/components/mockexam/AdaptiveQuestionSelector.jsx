/**
 * Adaptive Question Selection Logic
 * Adjusts question difficulty based on user's previous performance
 */

export function selectAdaptiveQuestions(questionPool, userPreviousAttempts, totalQuestions) {
  // Calculate user's average performance by domain and difficulty
  const performanceByDomain = {};
  const performanceByDifficulty = { easy: 0, medium: 0, hard: 0 };
  let totalAnswered = 0;

  userPreviousAttempts.forEach(attempt => {
    attempt.answers?.forEach(answer => {
      const question = questionPool.find(q => q.id === answer.question_id);
      if (!question) return;

      // Track domain performance
      if (!performanceByDomain[answer.domain]) {
        performanceByDomain[answer.domain] = { correct: 0, total: 0 };
      }
      performanceByDomain[answer.domain].total++;
      if (answer.is_correct) {
        performanceByDomain[answer.domain].correct++;
      }

      // Track difficulty performance
      if (question.difficulty && performanceByDifficulty[question.difficulty] !== undefined) {
        performanceByDifficulty[question.difficulty]++;
      }
      totalAnswered++;
    });
  });

  // Calculate average score
  const avgScore = userPreviousAttempts.length > 0
    ? userPreviousAttempts.reduce((sum, a) => sum + (a.overall_score || 0), 0) / userPreviousAttempts.length
    : 50;

  // Determine difficulty distribution based on performance
  let easyRatio, mediumRatio, hardRatio;

  if (avgScore < 60) {
    // Struggling - more easy questions
    easyRatio = 0.50;
    mediumRatio = 0.35;
    hardRatio = 0.15;
  } else if (avgScore < 75) {
    // Average - balanced
    easyRatio = 0.30;
    mediumRatio = 0.45;
    hardRatio = 0.25;
  } else if (avgScore < 85) {
    // Good - challenge more
    easyRatio = 0.20;
    mediumRatio = 0.40;
    hardRatio = 0.40;
  } else {
    // Excellent - mostly hard
    easyRatio = 0.10;
    mediumRatio = 0.30;
    hardRatio = 0.60;
  }

  // Separate questions by difficulty
  const easyQuestions = questionPool.filter(q => q.difficulty === "easy");
  const mediumQuestions = questionPool.filter(q => q.difficulty === "medium");
  const hardQuestions = questionPool.filter(q => q.difficulty === "hard");

  // If no difficulty tags, use random selection
  if (easyQuestions.length === 0 && mediumQuestions.length === 0 && hardQuestions.length === 0) {
    return [...questionPool].sort(() => Math.random() - 0.5).slice(0, totalQuestions);
  }

  // Calculate number of questions per difficulty
  const easyCount = Math.round(totalQuestions * easyRatio);
  const mediumCount = Math.round(totalQuestions * mediumRatio);
  const hardCount = totalQuestions - easyCount - mediumCount;

  // Select questions
  const selectedQuestions = [];

  // Helper to randomly select from array
  const selectRandom = (arr, count) => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, arr.length));
  };

  selectedQuestions.push(...selectRandom(easyQuestions, easyCount));
  selectedQuestions.push(...selectRandom(mediumQuestions, mediumCount));
  selectedQuestions.push(...selectRandom(hardQuestions, hardCount));

  // If we don't have enough questions, fill from remaining pool
  if (selectedQuestions.length < totalQuestions) {
    const remaining = questionPool.filter(q => !selectedQuestions.includes(q));
    selectedQuestions.push(...selectRandom(remaining, totalQuestions - selectedQuestions.length));
  }

  // Shuffle final selection
  return selectedQuestions.sort(() => Math.random() - 0.5);
}

export function getRecommendedDifficulty(previousAttempts) {
  if (previousAttempts.length === 0) return "balanced";

  const avgScore = previousAttempts.reduce((sum, a) => sum + (a.overall_score || 0), 0) / previousAttempts.length;

  if (avgScore < 60) return "easier";
  if (avgScore < 75) return "balanced";
  if (avgScore < 85) return "challenging";
  return "advanced";
}