
export type CalendarCategory = 'family' | 'school' | 'work' | 'home' | 'selfcare' | 'finance' | 'other';

export interface CalendarCategoryConfig {
    id: CalendarCategory;
    label: string;
    icon: string;
    color: string;
    colorLight: string;
}

export const CALENDAR_CATEGORIES: Record<CalendarCategory, CalendarCategoryConfig> = {
    family: {
        id: 'family',
        label: 'Family',
        icon: 'people',
        color: '#8B5CF6', // Purple
        colorLight: '#F3E8FF',
    },
    school: {
        id: 'school',
        label: 'School',
        icon: 'school',
        color: '#F97316', // Orange
        colorLight: '#FFEDD5',
    },
    work: {
        id: 'work',
        label: 'Work',
        icon: 'briefcase',
        color: '#3B82F6', // Blue
        colorLight: '#DBEAFE',
    },
    home: {
        id: 'home',
        label: 'Home',
        icon: 'home',
        color: '#10B981', // Green
        colorLight: '#D1FAE5',
    },
    selfcare: {
        id: 'selfcare',
        label: 'Self Care',
        icon: 'heart',
        color: '#EC4899', // Pink
        colorLight: '#FCE7F3',
    },
    finance: {
        id: 'finance',
        label: 'Finance',
        icon: 'cash',
        color: '#059669', // Emerald
        colorLight: '#ECFDF5',
    },
    other: {
        id: 'other',
        label: 'Other',
        icon: 'ellipsis-horizontal',
        color: '#6B7280', // Gray
        colorLight: '#F3F4F6',
    }
};

export const QUICK_TEMPLATES = [
    { title: "School Drop-off 🏫", duration: 30, category: 'school' as CalendarCategory },
    { title: "School Pick-up 🚌", duration: 30, category: 'school' as CalendarCategory },
    { title: "Grocery Shop 🛒", duration: 60, category: 'home' as CalendarCategory },
    { title: "Coffee Break ☕", duration: 30, category: 'selfcare' as CalendarCategory },
    { title: "Workout 💪", duration: 60, category: 'selfcare' as CalendarCategory },
    { title: "Dinner Prep 🍳", duration: 45, category: 'home' as CalendarCategory },
    { title: "Family Time 👨‍👩‍👧‍👦", duration: 120, category: 'family' as CalendarCategory },
];

export const DURATIONS = [
    { label: '15m', minutes: 15 },
    { label: '30m', minutes: 30 },
    { label: '45m', minutes: 45 },
    { label: '1h', minutes: 60 },
    { label: '1.5h', minutes: 90 },
    { label: '2h', minutes: 120 },
    { label: '3h', minutes: 180 },
    { label: '4h', minutes: 240 },
];
