// Hook for streak functionality

import { useApp } from "@/lib/app-context";
import {
  isStreakMilestone,
  getNextMilestone,
  getMilestoneProgress,
  getStreakEncouragement,
} from "@/lib/streak-manager";

export function useStreak() {
  const { streakData, recordActivity } = useApp();

  const isMilestone = isStreakMilestone(streakData.currentStreak);
  const nextMilestone = getNextMilestone(streakData.currentStreak);
  const milestoneProgress = getMilestoneProgress(streakData.currentStreak);
  const encouragement = getStreakEncouragement(streakData.currentStreak);

  return {
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    weeklyActivity: streakData.weeklyActivity,
    lastActiveDate: streakData.lastActiveDate,
    isMilestone,
    nextMilestone,
    milestoneProgress,
    encouragement,
    recordActivity,
  };
}
