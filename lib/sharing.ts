// Share functionality for Savvy App

import * as Sharing from "expo-sharing";
import { Platform, Share } from "react-native";
import { SavingsTip } from "@/data/savings-tips";

/**
 * Share a savings tip
 */
export async function shareTip(tip: SavingsTip): Promise<void> {
  const message = `💡 Money-saving tip from Savvy!\n\n${tip.icon} ${tip.title}\n\n${tip.description}\n\n💰 Potential savings: ${tip.estimatedSavings}\n\nDownload Savvy to learn more money-saving tips!`;

  await shareMessage(message);
}

/**
 * Share streak milestone
 */
export async function shareStreak(streak: number): Promise<void> {
  const message = `🔥 I've been on a ${streak} day streak with Savvy!\n\nI'm learning to save money and invest wisely every day. Join me on my financial freedom journey!\n\n#Savvy #FinancialFreedom #MoneyTips`;

  await shareMessage(message);
}

/**
 * Share lesson completion
 */
export async function shareLessonComplete(
  lessonTitle: string,
  lessonNumber: number
): Promise<void> {
  const message = `📚 Just completed "${lessonTitle}" on Savvy!\n\nLesson ${lessonNumber} of 8 done. I'm learning the basics of investing and building my financial knowledge!\n\n#Savvy #Investing #FinancialEducation`;

  await shareMessage(message);
}

/**
 * Share savings milestone
 */
export async function shareSavingsMilestone(
  amount: string,
  currency: string
): Promise<void> {
  const message = `💰 I've tracked ${currency}${amount} in savings with Savvy!\n\nSmall savings add up to big results. Download Savvy to start your savings journey!\n\n#Savvy #MoneySaving #FinancialGoals`;

  await shareMessage(message);
}

/**
 * Generic share message function
 */
async function shareMessage(message: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      // Web sharing
      if (navigator.share) {
        await navigator.share({ text: message });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(message);
        alert("Copied to clipboard!");
      }
    } else {
      // Native sharing
      await Share.share({
        message,
      });
    }
  } catch (error) {
    console.error("Error sharing:", error);
  }
}

/**
 * Check if sharing is available
 */
export async function isSharingAvailable(): Promise<boolean> {
  if (Platform.OS === "web") {
    return !!navigator.share;
  }
  return await Sharing.isAvailableAsync();
}
