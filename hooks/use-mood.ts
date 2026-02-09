// Hook for daily mood check-in
// Persists today's mood locally so the prompt only shows once per day.

import { STORAGE_KEYS } from "@/constants/storage-keys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export type MoodId = "great" | "good" | "okay" | "tough" | "care";

export interface MoodOption {
  id: MoodId;
  emoji: string;
  label: string;
  response: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { id: "great", emoji: "🌟", label: "Great", response: "You're glowing! Let's channel this energy into something beautiful today." },
  { id: "good", emoji: "✨", label: "Good", response: "A lovely day ahead. Remember, your progress is worth celebrating." },
  { id: "okay", emoji: "🌱", label: "Okay", response: "Each 'okay' day is a seed for future growth. You're doing just fine." },
  { id: "tough", emoji: "🛡️", label: "Tough", response: "You are stronger than this moment. Take a deep breath—you've got this." },
  { id: "care", emoji: "🫂", label: "Need care", response: "Today, your only job is to be kind to yourself. You are deeply valued." },
];

interface StoredMood {
  date: string;   // YYYY-MM-DD
  moodId: MoodId;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useMood() {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load today's mood on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.MOOD_CHECKIN);
        if (raw) {
          const stored: StoredMood = JSON.parse(raw);
          if (stored.date === todayKey()) {
            const found = MOOD_OPTIONS.find((m) => m.id === stored.moodId);
            if (found) setSelectedMood(found);
          }
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const selectMood = useCallback(async (mood: MoodOption | null) => {
    setSelectedMood(mood);
    try {
      if (mood) {
        const stored: StoredMood = { date: todayKey(), moodId: mood.id };
        await AsyncStorage.setItem(STORAGE_KEYS.MOOD_CHECKIN, JSON.stringify(stored));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.MOOD_CHECKIN);
      }
    } catch {
      // ignore
    }
  }, []);

  return {
    /** null = not answered yet today */
    selectedMood,
    /** true while loading from storage */
    isLoading,
    /** all available mood options */
    options: MOOD_OPTIONS,
    /** call to persist a mood selection */
    selectMood,
  };
}
