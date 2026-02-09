// Hook to get the daily tip
// Returns a deterministic tip based on the current date

import { useMemo } from "react";
import { savingsTips, SavingsTip } from "@/data/savings-tips";

export function useDailyTip(): SavingsTip {
  return useMemo(() => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    const index = dayOfYear % savingsTips.length;
    return savingsTips[index];
  }, []);
}
