// Streak Management for Savvy App
// Duolingo-inspired streak system

export const STREAK_MILESTONES = [7, 14, 30, 60, 100] as const;

export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

/**
 * Check if a streak has reached a milestone
 */
export function isStreakMilestone(streak: number): boolean {
  return STREAK_MILESTONES.includes(streak as StreakMilestone);
}

/**
 * Get the next milestone for a given streak
 */
export function getNextMilestone(streak: number): number | null {
  for (const milestone of STREAK_MILESTONES) {
    if (streak < milestone) {
      return milestone;
    }
  }
  return null;
}

/**
 * Get progress toward next milestone
 */
export function getMilestoneProgress(streak: number): {
  current: number;
  next: number | null;
  progress: number;
} {
  const next = getNextMilestone(streak);
  if (!next) {
    return { current: streak, next: null, progress: 100 };
  }

  // Find previous milestone
  const prev = STREAK_MILESTONES.filter((m) => m < next).pop() || 0;
  const progress = ((streak - prev) / (next - prev)) * 100;

  return { current: streak, next, progress };
}

/**
 * Get celebration message for milestone
 */
export function getMilestoneMessage(streak: number): string {
  switch (streak) {
    case 7:
      return "One week! You're building a great habit! 🎉";
    case 14:
      return "Two weeks strong! Keep up the momentum! 💪";
    case 30:
      return "One month! You're a savings superstar! 🌟";
    case 60:
      return "Two months! Your dedication is inspiring! 🏆";
    case 100:
      return "100 days! You're absolutely amazing! 👑";
    default:
      return `${streak} day streak! Keep going! 🔥`;
  }
}

/**
 * Get encouraging message based on streak
 */
export function getStreakEncouragement(streak: number): string {
  if (streak === 0) {
    return "Start your streak today!";
  }
  if (streak === 1) {
    return "Day 1! Every journey starts with a single step.";
  }
  if (streak < 7) {
    return `${streak} days in! Keep going to reach a week!`;
  }
  if (streak < 14) {
    return `${streak} day streak! Two weeks is in sight!`;
  }
  if (streak < 30) {
    return `${streak} days strong! Can you reach a month?`;
  }
  return `Amazing ${streak} day streak! You're unstoppable!`;
}
