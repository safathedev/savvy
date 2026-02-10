// Category definitions for Savvy App

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const tipCategories: Category[] = [
  { id: "all", name: "All Tips", icon: "💡", color: "#22C55E" },
  { id: "shopping", name: "Shopping", icon: "🛒", color: "#3B82F6" },
  { id: "cooking", name: "Cooking", icon: "🍳", color: "#F59E0B" },
  { id: "home", name: "Home", icon: "🏠", color: "#8B5CF6" },
  { id: "general", name: "General", icon: "💰", color: "#22C55E" },
];

export const savingsCategories: Category[] = [
  { id: "groceries", name: "Groceries", icon: "🛒", color: "#3B82F6" },
  { id: "utilities", name: "Utilities", icon: "⚡", color: "#F59E0B" },
  { id: "shopping", name: "Shopping", icon: "🛍️", color: "#EC4899" },
  { id: "other", name: "Other", icon: "💰", color: "#22C55E" },
];

export function getCategoryById(id: string): Category | undefined {
  return [...tipCategories, ...savingsCategories].find((c) => c.id === id);
}

export function getCategoryColor(id: string): string {
  const category = getCategoryById(id);
  return category?.color || "#22C55E";
}
