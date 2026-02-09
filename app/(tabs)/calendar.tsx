// Savvy Calendar Screen — Triple A "Mom" Rewrite
import { AgendaView } from "@/components/calendar/agenda-view";
import { DurationPicker } from "@/components/calendar/duration-picker";
import { QuickChips } from "@/components/calendar/quick-chips";
import { CALENDAR_CATEGORIES, CalendarCategory, QUICK_TEMPLATES } from "@/constants/calendar-types";
import { hatchColors, hatchShadows } from "@/constants/theme";
import { useApp } from "@/lib/app-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    DimensionValue,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import Animated, { FadeIn, Layout, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Helper: Pulse Animation for "Now" dot
function PulsingDot() {
    const opacity = useSharedValue(1);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(withTiming(0.4, { duration: 1000 }), withTiming(1, { duration: 1000 })),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

    return <Animated.View style={[s.nowDot, animatedStyle]} />;
}

export default function CalendarScreen() {
    const insets = useSafeAreaInsets();
    const { calendarEvents, addCalendarEvent, deleteCalendarEvent, updateCalendarEvent, userProfile } = useApp();
    const currency = userProfile?.currency || "EUR";

    // View States
    const [viewMode, setViewMode] = useState<"compact" | "month">("compact");
    const [timelineMode, setTimelineMode] = useState<"day" | "3day" | "week">("day");
    const [displayMode, setDisplayMode] = useState<"grid" | "agenda">("grid"); // New Toggle

    const [today] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    // Modal States
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [eventTitle, setEventTitle] = useState("");
    const [eventTime, setEventTime] = useState("09:00");
    const [eventDuration, setEventDuration] = useState(60); // Default 1h
    const [eventCategory, setEventCategory] = useState<CalendarCategory>("family");
    const [eventRecurrence, setEventRecurrence] = useState<"none" | "daily" | "weekly" | "monthly">("none");
    const [eventNotes, setEventNotes] = useState(""); // Simple checklist/notes
    const [isBudgetEnabled, setIsBudgetEnabled] = useState(false);
    const [eventAmount, setEventAmount] = useState("");

    const [currentTime, setCurrentTime] = useState(new Date());
    const timelineScrollRef = useRef<ScrollView>(null);

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Scroll to now
    useEffect(() => {
        if (displayMode === 'grid' && timelineMode === 'day' && isSameDate(selectedDate, today)) {
            setTimeout(() => {
                const h = currentTime.getHours();
                const m = currentTime.getMinutes();
                const y = (h * 60 + m);
                timelineScrollRef.current?.scrollTo({ y: Math.max(0, y - 200), animated: true });
            }, 500);
        }
    }, [displayMode, timelineMode, selectedDate]);

    // Helpers
    const isSameDate = (d1: Date, d2: Date) =>
        d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

    const isToday = (d: number, m: number, y: number) =>
        d === today.getDate() && m === today.getMonth() && y === today.getFullYear();

    const isSelected = (d: number, m: number, y: number) =>
        d === selectedDate.getDate() && m === selectedDate.getMonth() && y === selectedDate.getFullYear();

    const getEndTime = (start: string, durationMinutes: number) => {
        const [h, m] = start.split(':').map(Number);
        const total = h * 60 + m + durationMinutes;
        const newH = Math.floor(total / 60) % 24;
        const newM = total % 60;
        return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
    };

    // Calendar Grid Logic
    const calendarData = useMemo(() => {
        if (viewMode === "month") {
            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const startOffset = firstDay === 0 ? 6 : firstDay - 1;
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrev = new Date(year, month, 0).getDate();

            const days = [];
            for (let i = startOffset - 1; i >= 0; i--) days.push({ day: daysInPrev - i, month: month - 1, year, isCurrentMonth: false });
            for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, month, year, isCurrentMonth: true });
            const remaining = 42 - days.length;
            for (let i = 1; i <= remaining; i++) days.push({ day: i, month: month + 1, year, isCurrentMonth: false });
            return days;
        } else {
            // Compact: Current Week + Next Week
            const days = [];
            const startOfWeek = new Date(today);
            const day = startOfWeek.getDay();
            const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(startOfWeek);
            monday.setDate(diff);

            for (let i = 0; i < 14; i++) {
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                days.push({
                    day: d.getDate(),
                    month: d.getMonth(),
                    year: d.getFullYear(),
                    isCurrentMonth: d.getMonth() === today.getMonth(),
                });
            }
            return days;
        }
    }, [viewMode, viewDate, today]);

    const getDaysForTimeline = useMemo(() => {
        const days = [];
        const count = timelineMode === "day" ? 1 : timelineMode === "3day" ? 3 : 7;
        for (let i = 0; i < count; i++) {
            const d = new Date(selectedDate);
            d.setDate(selectedDate.getDate() + i);
            days.push(d);
        }
        return days;
    }, [selectedDate, timelineMode]);

    const getDayEvents = (d: number, m: number, y: number) => {
        const queryDate = new Date(y, m, d);
        return calendarEvents.filter(e => {
            const eventDate = new Date(e.date);
            const isSameDay = eventDate.getDate() === d && eventDate.getMonth() === m && eventDate.getFullYear() === y;
            if (isSameDay) return true;

            if (e.recurrence && e.recurrence !== 'none') {
                if (queryDate < eventDate) return false;
                if (e.recurrence === 'daily') return true;
                if (e.recurrence === 'weekly') return queryDate.getDay() === eventDate.getDay();
                if (e.recurrence === 'monthly') return queryDate.getDate() === eventDate.getDate();
            }
            return false;
        }).sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));
    };

    // Handlers
    const handleAddEvent = () => {
        setEditingEvent(null);
        setEventTitle("");
        setEventTime("09:00");
        setEventDuration(60);
        setEventCategory("family");
        setEventAmount("");
        setIsBudgetEnabled(false);
        setEventRecurrence("none");
        setEventNotes("");
        setIsModalVisible(true);
    };

    const handleEditEvent = (event: any) => {
        setEditingEvent(event);
        setEventTitle(event.title);
        setEventTime(event.time || "09:00");

        // Calculate duration from end time if exists
        if (event.endTime) {
            const [sh, sm] = (event.time || "09:00").split(':').map(Number);
            const [eh, em] = event.endTime.split(':').map(Number);
            const diff = (eh * 60 + em) - (sh * 60 + sm);
            setEventDuration(diff > 0 ? diff : 60);
        } else {
            setEventDuration(60);
        }

        setEventCategory(event.type as CalendarCategory);
        setEventAmount(event.amount?.toString() || "");
        setIsBudgetEnabled(!!event.amount);
        setEventRecurrence(event.recurrence || "none");
        setEventNotes(event.notes || "");
        setIsModalVisible(true);
    };

    const saveEvent = async () => {
        if (!eventTitle.trim()) return;
        const endTime = getEndTime(eventTime, eventDuration);

        const payload = {
            title: eventTitle,
            type: eventCategory,
            date: selectedDate.toISOString(),
            time: eventTime,
            endTime: endTime,
            recurrence: eventRecurrence,
            amount: isBudgetEnabled ? parseFloat(eventAmount) || 0 : undefined,
            color: CALENDAR_CATEGORIES[eventCategory]?.color || '#000', // Legacy support
            notes: eventNotes,
        };

        if (editingEvent) await updateCalendarEvent({ ...editingEvent, ...payload });
        else await addCalendarEvent(payload);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsModalVisible(false);
    };

    const applyTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
        setEventTitle(template.title);
        setEventCategory(template.category);
        setEventDuration(template.duration);
    };

    const selectedDateEvents = getDayEvents(selectedDate.getDate(), selectedDate.getMonth(), selectedDate.getFullYear());

    return (
        <View style={s.root}>
            <View style={[s.topSafe, { paddingTop: insets.top + 8 }]}>
                {/* Header with Weather & Agenda Toggle */}
                <View style={s.headerRow}>
                    <View style={{ flex: 1 }}>
                        <View style={s.weatherRow}>
                            <Text style={s.headerTitle}>Calendar</Text>
                            <View style={s.weatherTag}>
                                <Text style={s.weatherText}>☀️ 24°</Text>
                            </View>
                        </View>
                        <Pressable onPress={() => setViewMode(v => v === 'compact' ? 'month' : 'compact')}>
                            <Text style={s.headerSubtitle}>
                                {selectedDate.toLocaleDateString("default", { month: "long", year: "numeric" })}
                                <Ionicons name={viewMode === 'compact' ? "chevron-down" : "chevron-up"} size={12} color={hatchColors.primary.default} />
                            </Text>
                        </Pressable>
                    </View>

                    <View style={s.headerActions}>
                        <View style={s.toggleContainer}>
                            <Pressable onPress={() => { Haptics.selectionAsync(); setDisplayMode('grid'); }} style={[s.toggleBtn, displayMode === 'grid' && s.toggleBtnActive]}>
                                <Ionicons name="calendar" size={16} color={displayMode === 'grid' ? hatchColors.primary.default : hatchColors.text.tertiary} />
                            </Pressable>
                            <Pressable onPress={() => { Haptics.selectionAsync(); setDisplayMode('agenda'); }} style={[s.toggleBtn, displayMode === 'agenda' && s.toggleBtnActive]}>
                                <Ionicons name="list" size={16} color={displayMode === 'agenda' ? hatchColors.primary.default : hatchColors.text.tertiary} />
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Grid (Horizontal Date Picker) */}
                <Animated.View layout={Layout.springify()} style={[s.gridContainer, viewMode === 'month' && s.gridContainerMonth]}>
                    <View style={s.grid}>
                        {["M", "T", "W", "T", "F", "S", "S"].map(d => <Text key={d} style={s.weekdayLabel}>{d}</Text>)}
                        {calendarData.map((d, i) => {
                            const todayCheck = isToday(d.day, d.month, d.year);
                            const selectedCheck = isSelected(d.day, d.month, d.year);
                            const dayEvents = getDayEvents(d.day, d.month, d.year);
                            const hasEvents = dayEvents.length > 0;

                            return (
                                <Pressable key={i} style={s.dayCell} onPress={() => { Haptics.selectionAsync(); setSelectedDate(new Date(d.year, d.month, d.day)); }}>
                                    <View style={[s.dayCircle, selectedCheck && s.dayCircleSelected, !d.isCurrentMonth && viewMode === 'month' && s.dayCircleDimmed]}>
                                        <Text style={[s.dayText, selectedCheck && s.dayTextSelected, todayCheck && !selectedCheck && s.dayTextToday]}>{d.day}</Text>
                                        {hasEvents && !selectedCheck && (
                                            <View style={s.eventDotRow}>
                                                <View style={[s.eventDot, { backgroundColor: CALENDAR_CATEGORIES[dayEvents[0].type as CalendarCategory]?.color || hatchColors.primary.default }]} />
                                            </View>
                                        )}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                </Animated.View>
            </View>

            {/* Main Content: Agenda or Timeline */}
            {displayMode === 'agenda' ? (
                <AgendaView events={selectedDateEvents} selectedDate={selectedDate} onEditEvent={handleEditEvent} />
            ) : (
                <View style={{ flex: 1 }}>
                    <View style={s.subHeader}>
                        <View style={s.modeSwitcherInline}>
                            {(["day", "3day", "week"] as const).map(m => (
                                <Pressable key={m} onPress={() => { Haptics.selectionAsync(); setTimelineMode(m); }} style={[s.modeBtnInline, timelineMode === m && s.modeBtnActive]}>
                                    <Text style={[s.modeBtnText, timelineMode === m && s.modeBtnTextActive]}>{m.toUpperCase()}</Text>
                                </Pressable>
                            ))}
                        </View>
                        <Text style={s.dayLabel}>{selectedDate.toLocaleDateString("default", { weekday: "long" })}</Text>
                    </View>

                    <ScrollView ref={timelineScrollRef} style={s.timelineScroll} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
                        <View style={s.timelineContainer}>
                            {/* Time Column */}
                            <View style={s.timeCol}>
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <View key={i} style={s.hourLabel}>
                                        <Text style={s.hourText}>{i.toString().padStart(2, '0')}:00</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Schedule Grid */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={timelineMode !== 'day'}>
                                <View style={s.scheduleWrapper}>
                                    {getDaysForTimeline.map((date, dayIdx) => {
                                        const isCurrentDayUnderNow = isSameDate(date, today);
                                        const nowLineTop = (currentTime.getHours() * 60 + currentTime.getMinutes()) + 20; // +20 padding offset

                                        return (
                                            <View key={dayIdx} style={[s.scheduleCol, { width: timelineMode === 'day' ? 300 : timelineMode === '3day' ? 120 : 80 }]}>
                                                {Array.from({ length: 24 }).map((_, i) => (
                                                    <Pressable
                                                        key={i}
                                                        style={s.hourRow}
                                                        onLongPress={() => {
                                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                                            setSelectedDate(date);
                                                            setEventTime(`${i.toString().padStart(2, '0')}:00`);
                                                            handleAddEvent();
                                                        }}
                                                    />
                                                ))}

                                                {isCurrentDayUnderNow && (
                                                    <View style={[s.nowLine, { top: nowLineTop }]}>
                                                        <PulsingDot />
                                                        <View style={s.nowLineSolid} />
                                                    </View>
                                                )}

                                                {/* Events Rendering */}
                                                {(() => {
                                                    const dayEvents = getDayEvents(date.getDate(), date.getMonth(), date.getFullYear());
                                                    return dayEvents.map((event) => {
                                                        const [h, m] = (event.time || "09:00").split(':').map(Number);
                                                        const top = (h * 60 + m) + 20; // offset

                                                        const [eh, em] = (event.endTime || "10:00").split(':').map(Number);
                                                        const duration = (eh * 60 + em) - (h * 60 + m);
                                                        const height = Math.max(30, duration);

                                                        // Simple overlap handling: 
                                                        // if overlap, shift right slightly (stacking cards effect)
                                                        const overlapping = dayEvents.filter(e => e.time === event.time);
                                                        const index = overlapping.findIndex(e => e.id === event.id);
                                                        const leftOffset = index * 12;
                                                        const widthOffset = index * 12;

                                                        const catConfig = CALENDAR_CATEGORIES[event.type as CalendarCategory] || CALENDAR_CATEGORIES.other;

                                                        return (
                                                            <Pressable
                                                                key={event.id}
                                                                onPress={() => handleEditEvent(event)}
                                                                style={[
                                                                    s.timelineEvent,
                                                                    {
                                                                        top: top as DimensionValue,
                                                                        height: height as DimensionValue,
                                                                        left: (4 + leftOffset) as DimensionValue,
                                                                        right: (4 + widthOffset) as DimensionValue /* pseudo width */,
                                                                        backgroundColor: catConfig.colorLight,
                                                                        borderLeftColor: catConfig.color
                                                                    }
                                                                ]}
                                                            >
                                                                <Text style={[s.eventTitleLabel, { color: catConfig.color }]} numberOfLines={1}>{event.title}</Text>
                                                                {height > 40 && <Text style={[s.eventTimeLabel, { color: catConfig.color }]}>{event.time} - {event.endTime}</Text>}
                                                            </Pressable>
                                                        );
                                                    });
                                                })()}
                                            </View>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        </View>
                    </ScrollView>
                </View>
            )}

            {/* FAB */}
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleAddEvent(); }} style={s.fab}>
                <Ionicons name="add" size={32} color="#FFFFFF" />
            </Pressable>

            {/* Event Modal */}
            <Modal visible={isModalVisible} transparent animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalOverlay}>
                    <View style={s.modalContent}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>{editingEvent ? "Edit Plan" : "New Plan"}</Text>
                            <Pressable onPress={() => setIsModalVisible(false)}><Ionicons name="close-circle" size={28} color={hatchColors.text.tertiary} /></Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <QuickChips onSelectTemplate={applyTemplate} />

                            <Text style={s.inputLabel}>WHAT</Text>
                            <TextInput style={s.input} placeholder="e.g. Piano Lesson..." value={eventTitle} onChangeText={setEventTitle} maxLength={40} placeholderTextColor={hatchColors.text.tertiary} />

                            <Text style={s.inputLabel}>WHEN</Text>
                            <View style={s.timeRow}>
                                <View style={s.timeBox}>
                                    <Text style={s.timeLabelSmall}>START</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', gap: 12 }}>
                                        {Array.from({ length: 17 }).map((_, i) => {
                                            const h = (i + 6).toString().padStart(2, '0'); // 06:00 to 22:00
                                            const timeStr = `${h}:00`;
                                            const isActive = eventTime.startsWith(h);
                                            return (
                                                <Pressable key={h} onPress={() => { Haptics.selectionAsync(); setEventTime(timeStr); }} style={[s.hourChip, isActive && s.hourChipActive]}>
                                                    <Text style={[s.hourChipText, isActive && s.hourChipTextActive]}>{h}</Text>
                                                </Pressable>
                                            )
                                        })}
                                    </ScrollView>
                                    <Text style={s.timeValueLarge}>{eventTime}</Text>
                                </View>
                            </View>

                            <DurationPicker selectedDuration={eventDuration} onSelectDuration={(d) => { setEventDuration(d); }} />

                            <Text style={s.inputLabel}>CATEGORY</Text>
                            <View style={s.catRow}>
                                {Object.values(CALENDAR_CATEGORIES).map((cat) => (
                                    <Pressable key={cat.id} onPress={() => { Haptics.selectionAsync(); setEventCategory(cat.id); }} style={[s.catChip, eventCategory === cat.id && { backgroundColor: cat.colorLight, borderColor: cat.color }]}>
                                        <Ionicons name={cat.icon as any} size={18} color={eventCategory === cat.id ? cat.color : hatchColors.text.tertiary} />
                                        <Text style={[s.catText, eventCategory === cat.id && { color: cat.color, fontWeight: "800" }]}>{cat.label}</Text>
                                    </Pressable>
                                ))}
                            </View>

                            <Text style={s.inputLabel}>NOTES</Text>
                            <TextInput
                                style={[s.input, { height: 80, textAlignVertical: 'top' }]}
                                placeholder="Add checklist or notes..."
                                value={eventNotes}
                                onChangeText={setEventNotes}
                                multiline
                            />

                            <View style={s.toggleRow}>
                                <Text style={s.toggleLabel}>Track Cost</Text>
                                <Switch value={isBudgetEnabled} onValueChange={setIsBudgetEnabled} trackColor={{ false: hatchColors.border.default, true: hatchColors.primary.default }} thumbColor="#FFFFFF" />
                            </View>
                            {isBudgetEnabled && (
                                <Animated.View entering={FadeIn}>
                                    <TextInput style={s.budgetInput} placeholder="0.00" value={eventAmount} onChangeText={setEventAmount} keyboardType="numeric" />
                                </Animated.View>
                            )}

                            <Pressable onPress={saveEvent} style={s.saveBtn}>
                                <Text style={s.saveBtnText}>{editingEvent ? "Update" : "Save Plan"}</Text>
                            </Pressable>

                            {editingEvent && (
                                <Pressable onPress={() => { deleteCalendarEvent(editingEvent.id); setIsModalVisible(false); }} style={s.deleteBtn}>
                                    <Text style={s.deleteBtnText}>Delete Event</Text>
                                </Pressable>
                            )}

                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#FFFFFF" },
    topSafe: { backgroundColor: "#FFFFFF", ...hatchShadows.sm, zIndex: 10, paddingBottom: 12 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, marginBottom: 12 },
    weatherRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    weatherTag: { backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    weatherText: { fontSize: 11, fontWeight: '700', color: '#D97706' },

    headerTitle: { fontSize: 26, fontWeight: "800", color: hatchColors.text.primary, letterSpacing: -1 },
    headerSubtitle: { fontSize: 14, fontWeight: "600", color: hatchColors.primary.default, marginTop: 2, flexDirection: 'row', alignItems: 'center' },

    headerActions: { flexDirection: "row", gap: 12, alignItems: "center" },
    toggleContainer: { flexDirection: 'row', backgroundColor: hatchColors.background.secondary, borderRadius: 12, padding: 4, gap: 4 },
    toggleBtn: { padding: 8, borderRadius: 8 },
    toggleBtnActive: { backgroundColor: '#FFFFFF', ...hatchShadows.sm },

    // Grid
    gridContainer: { paddingHorizontal: 16 },
    gridContainerMonth: { height: 320 },
    grid: { flexDirection: "row", flexWrap: "wrap" },
    weekdayLabel: { width: `${100 / 7}%`, textAlign: "center", fontSize: 11, fontWeight: "800", color: hatchColors.text.tertiary, marginBottom: 8 },
    dayCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center" },
    dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", position: "relative" },
    dayCircleSelected: { backgroundColor: hatchColors.primary.default },
    dayCircleDimmed: { opacity: 0.3 },
    dayText: { fontSize: 15, fontWeight: "700", color: hatchColors.text.primary },
    dayTextSelected: { color: "#FFFFFF" },
    dayTextToday: { color: hatchColors.primary.default, fontWeight: "900" },
    eventDotRow: { position: 'absolute', bottom: 4, flexDirection: 'row', gap: 2 },
    eventDot: { width: 4, height: 4, borderRadius: 2 },

    // Timeline Area
    subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: hatchColors.border.light },
    modeSwitcherInline: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 2 },
    modeBtnInline: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    modeBtnActive: { backgroundColor: hatchColors.background.secondary },
    modeBtnText: { fontSize: 10, fontWeight: "800", color: hatchColors.text.tertiary },
    modeBtnTextActive: { color: hatchColors.text.primary },
    dayLabel: { fontSize: 13, fontWeight: "700", color: hatchColors.text.secondary, textTransform: 'uppercase' },

    timelineScroll: { flex: 1, backgroundColor: "#F9FAFB" },
    timelineContainer: { flexDirection: "row", minHeight: 1440 },
    timeCol: { width: 60, borderRightWidth: 1, borderRightColor: hatchColors.border.light, paddingTop: 20 },
    hourLabel: { height: 60, alignItems: "center" },
    hourText: { fontSize: 11, fontWeight: "600", color: hatchColors.text.tertiary },

    scheduleWrapper: { flexDirection: 'row' },
    scheduleCol: { position: "relative", borderRightWidth: 1, borderRightColor: hatchColors.border.light },
    hourRow: { height: 60, borderBottomWidth: 1, borderBottomColor: hatchColors.border.light, width: "100%", opacity: 0.5 },

    // Timeline Events
    timelineEvent: {
        position: "absolute",
        left: 4,
        right: 4,
        borderRadius: 8,
        padding: 6,
        paddingLeft: 8,
        borderLeftWidth: 4,
        overflow: "hidden",
        justifyContent: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 // Subtle shadow
    },
    eventTitleLabel: { fontSize: 12, fontWeight: "800" },
    eventTimeLabel: { fontSize: 10, fontWeight: "600", marginTop: 1 },

    nowLine: { position: 'absolute', left: 0, right: 0, height: 2, zIndex: 10, flexDirection: 'row', alignItems: 'center' },
    nowDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444', marginLeft: -5 },
    nowLineSolid: { flex: 1, height: 2, backgroundColor: '#EF4444' },

    fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: hatchColors.primary.default, alignItems: "center", justifyContent: "center", ...hatchShadows.glow, zIndex: 50 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-end" },
    modalContent: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, maxHeight: "90%", ...hatchShadows.lg },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: "800", color: hatchColors.text.primary },

    inputLabel: { fontSize: 11, fontWeight: "900", color: hatchColors.text.tertiary, letterSpacing: 1, marginTop: 20, marginBottom: 8, marginLeft: 4 },
    input: { backgroundColor: hatchColors.background.secondary, borderRadius: 16, padding: 16, fontSize: 16, fontWeight: "600", color: hatchColors.text.primary },

    timeRow: { flexDirection: 'row', gap: 12 },
    timeBox: { flex: 1, backgroundColor: hatchColors.background.secondary, borderRadius: 16, padding: 12 },
    timeLabelSmall: { fontSize: 10, fontWeight: "700", color: hatchColors.text.tertiary, marginBottom: 8 },
    timeValueLarge: { fontSize: 24, fontWeight: "400", color: hatchColors.text.primary, marginTop: 8, textAlign: 'center' },

    hourChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#FFFFFF' },
    hourChipActive: { backgroundColor: hatchColors.primary.default },
    hourChipText: { fontSize: 12, fontWeight: '700', color: hatchColors.text.primary },
    hourChipTextActive: { color: '#FFFFFF' },

    catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: hatchColors.background.secondary, borderWidth: 1, borderColor: 'transparent', gap: 6 },
    catText: { fontSize: 13, fontWeight: "600", color: hatchColors.text.secondary },

    toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 24, marginBottom: 12 },
    toggleLabel: { fontSize: 15, fontWeight: "700", color: hatchColors.text.primary },
    budgetInput: { backgroundColor: hatchColors.primary.muted, borderRadius: 16, padding: 14, fontSize: 18, fontWeight: "800", color: hatchColors.primary.default },

    saveBtn: { backgroundColor: hatchColors.primary.default, borderRadius: 20, padding: 18, alignItems: "center", marginTop: 32, ...hatchShadows.glow },
    saveBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
    deleteBtn: { padding: 16, alignItems: "center", marginTop: 8 },
    deleteBtnText: { color: hatchColors.status.error, fontSize: 14, fontWeight: "700" },
});
