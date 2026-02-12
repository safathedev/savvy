import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { AgendaView } from "@/components/calendar/agenda-view";
import {
  CALENDAR_CATEGORIES,
  CATEGORY_COLOR_PRESETS,
  CalendarCategoryConfig,
  DEFAULT_CALENDAR_CATEGORY_ORDER,
} from "@/constants/calendar-types";
import { hatchColors, hatchShadows } from "@/constants/theme";
import { useApp } from "@/lib/app-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  DimensionValue,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_AMOUNT = 10000;

type CategoryOption = CalendarCategoryConfig;
type PickerTarget = "start" | "end";

function PulsingDot() {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.45, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      true
    );
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[s.nowDot, style]} />;
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function normalizeMoneyInput(value: string): string {
  const clean = value.replace(/[^0-9.,]/g, "");
  const parsed = Number(clean.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= MAX_AMOUNT) return clean;
  return String(MAX_AMOUNT);
}

function normalizeTimeInput(value: string): string {
  const digits = value.replace(/[^0-9]/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function addMinutes(time: string, minutes: number): string {
  if (!isValidTime(time)) return time;
  const [hours, mins] = time.split(":").map(Number);
  const total = hours * 60 + mins + minutes;
  const nextHours = Math.floor(total / 60) % 24;
  const nextMins = total % 60;
  return `${String(nextHours).padStart(2, "0")}:${String(nextMins).padStart(2, "0")}`;
}

function toMinutes(time: string): number {
  if (!isValidTime(time)) return -1;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function defaultStartTime(): string {
  const now = new Date();
  const rounded = new Date(now);
  const min = rounded.getMinutes();
  if (min === 0 || min === 30) {
    return `${String(rounded.getHours()).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  }
  if (min < 30) rounded.setMinutes(30, 0, 0);
  else rounded.setHours(rounded.getHours() + 1, 0, 0, 0);
  return `${String(rounded.getHours()).padStart(2, "0")}:${String(rounded.getMinutes()).padStart(2, "0")}`;
}

function formatCategoryLabel(id: string): string {
  return id
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function toTimeString(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function timeToDate(time: string): Date {
  const d = new Date();
  const [h, m] = isValidTime(time) ? time.split(":").map(Number) : [9, 0];
  d.setHours(h, m, 0, 0);
  return d;
}

function normalizeColor(value: string): string {
  const hex = value.replace("#", "").slice(0, 6);
  if (/^[0-9a-fA-F]{6}$/.test(hex)) return `#${hex}`;
  return CATEGORY_COLOR_PRESETS[0];
}

function sanitizeHexColor(value: string): string {
  return value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6).toUpperCase();
}

function getColorLight(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  const mix = (channel: number) => Math.max(0, Math.min(255, Math.round(channel + (255 - channel) * 0.86)));
  return `#${mix(r).toString(16).padStart(2, "0")}${mix(g).toString(16).padStart(2, "0")}${mix(b)
    .toString(16)
    .padStart(2, "0")}`;
}

type TimedEventLayout = {
  event: any;
  startTime: string;
  endTime: string;
  start: number;
  end: number;
  top: number;
  height: number;
  column: number;
  columns: number;
};

function buildTimedEventLayouts(events: any[]): TimedEventLayout[] {
  const normalized = events
    .map((event) => {
      const startTime = isValidTime(event.time || "") ? String(event.time) : "09:00";
      const rawEndTime = isValidTime(event.endTime || "")
        ? String(event.endTime)
        : addMinutes(startTime, 30);
      const start = Math.max(0, toMinutes(startTime));
      let end = Math.max(start + 15, toMinutes(rawEndTime));
      if (!Number.isFinite(end) || end <= start) end = start + 30;
      end = Math.min(24 * 60, end);

      return {
        event,
        startTime,
        endTime: rawEndTime,
        start,
        end,
        top: start + 20,
        height: Math.max(30, end - start),
      };
    })
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const layouts: TimedEventLayout[] = [];
  let active: TimedEventLayout[] = [];
  let cluster: TimedEventLayout[] = [];

  const flushCluster = () => {
    if (cluster.length === 0) return;
    const maxColumn = Math.max(...cluster.map((item) => item.column));
    const clusterColumns = Math.max(1, maxColumn + 1);
    cluster.forEach((item) => {
      item.columns = clusterColumns;
    });
    cluster = [];
    active = [];
  };

  normalized.forEach((entry) => {
    active = active.filter((item) => item.end > entry.start);

    if (active.length === 0 && cluster.length > 0) {
      flushCluster();
    }

    const usedColumns = new Set(active.map((item) => item.column));
    let column = 0;
    while (usedColumns.has(column)) {
      column += 1;
    }

    const next: TimedEventLayout = {
      ...entry,
      column,
      columns: 1,
    };

    active.push(next);
    cluster.push(next);
    layouts.push(next);
  });

  flushCluster();

  return layouts.sort((a, b) => a.start - b.start || a.column - b.column);
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const {
    calendarEvents,
    addCalendarEvent,
    deleteCalendarEvent,
    updateCalendarEvent,
    customCalendarCategories,
    addCustomCalendarCategory,
    userProfile,
  } = useApp();
  const currencyCode = userProfile?.currency || "GBP";

  const [viewMode, setViewMode] = useState<"compact" | "month">("compact");
  const [timelineMode, setTimelineMode] = useState<"day" | "3day" | "week">("day");
  const [displayMode, setDisplayMode] = useState<"grid" | "agenda">("grid");
  const [today] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStart, setEventStart] = useState(defaultStartTime());
  const [eventEnd, setEventEnd] = useState(addMinutes(defaultStartTime(), 30));
  const [isAllDay, setIsAllDay] = useState(false);
  const [eventCategory, setEventCategory] = useState<string>("family");
  const [eventRecurrence, setEventRecurrence] = useState<"none" | "daily" | "weekly" | "monthly">("none");
  const [eventNote, setEventNote] = useState("");
  const [isCostEnabled, setIsCostEnabled] = useState(false);
  const [eventAmount, setEventAmount] = useState("");
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState<string>(CATEGORY_COLOR_PRESETS[0]);
  const [newCategoryColorInput, setNewCategoryColorInput] = useState<string>(
    CATEGORY_COLOR_PRESETS[0].replace("#", "").toUpperCase()
  );

  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<PickerTarget>("start");
  const [timePickerValue, setTimePickerValue] = useState(new Date());

  const [currentTime, setCurrentTime] = useState(new Date());
  const timelineScrollRef = useRef<ScrollView>(null);
  const dayColumnWidth = Math.max(250, screenWidth - 84);

  const defaultCategories = useMemo(
    () => DEFAULT_CALENDAR_CATEGORY_ORDER.map((id) => CALENDAR_CATEGORIES[id]),
    []
  );

  const categoryOptions = useMemo<CategoryOption[]>(() => {
    const map = new Map<string, CategoryOption>();

    defaultCategories.forEach((category) => {
      map.set(category.id, category);
    });

    customCalendarCategories.forEach((category) => {
      const id = typeof category.id === "string" ? category.id.trim() : "";
      if (!id || map.has(id)) return;

      const color = normalizeColor(category.color);
      map.set(id, {
        id,
        label: category.label,
        icon: "pricetag",
        color,
        colorLight: category.colorLight || getColorLight(color),
        isCustom: true,
      });
    });

    return Array.from(map.values());
  }, [customCalendarCategories, defaultCategories]);

  const getCategoryConfig = useCallback(
    (type?: string, color?: string): CategoryOption => {
      if (type) {
        const found = categoryOptions.find((category) => category.id === type);
        if (found) return found;
      }

      if (type && type in CALENDAR_CATEGORIES) {
        return CALENDAR_CATEGORIES[type as keyof typeof CALENDAR_CATEGORIES];
      }

      const fallbackColor = color && /^#?[0-9a-fA-F]{6}$/.test(color)
        ? `#${color.replace("#", "")}`
        : "#64748B";

      return {
        id: type || "custom",
        label: type ? formatCategoryLabel(type) : "Custom",
        icon: "pricetag",
        color: fallbackColor,
        colorLight: getColorLight(fallbackColor),
        isCustom: true,
      };
    },
    [categoryOptions]
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isSameDate = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const shiftViewMonth = useCallback((delta: number) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }, []);

  const monthPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          viewMode === "month" &&
          Math.abs(gesture.dx) > 14 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx <= -40) {
            shiftViewMonth(1);
          } else if (gesture.dx >= 40) {
            shiftViewMonth(-1);
          }
        },
      }),
    [shiftViewMonth, viewMode]
  );

  useEffect(() => {
    if (displayMode === "grid" && timelineMode === "day" && isSameDate(selectedDate, today)) {
      const timeout = setTimeout(() => {
        const y = currentTime.getHours() * 60 + currentTime.getMinutes();
        timelineScrollRef.current?.scrollTo({ y: Math.max(0, y - 220), animated: true });
      }, 400);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [displayMode, timelineMode, selectedDate, today, currentTime]);

  const calendarData = useMemo(() => {
    if (viewMode === "month") {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();

      const firstOfMonth = new Date(year, month, 1);
      const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
      const gridStart = new Date(year, month, 1 - mondayOffset);

      return Array.from({ length: 42 }).map((_, index) => {
        const d = new Date(gridStart);
        d.setDate(gridStart.getDate() + index);
        return {
          day: d.getDate(),
          month: d.getMonth(),
          year: d.getFullYear(),
          isCurrentMonth: d.getMonth() === month,
        };
      });
    }

    const days: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];
    const start = new Date(today);
    const dow = start.getDay();
    const diff = start.getDate() - dow + (dow === 0 ? -6 : 1);
    const monday = new Date(start);
    monday.setDate(diff);
    for (let i = 0; i < 14; i += 1) {
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
  }, [today, viewDate, viewMode]);

  const timelineDays = useMemo(() => {
    const count = timelineMode === "day" ? 1 : timelineMode === "3day" ? 3 : 7;
    return Array.from({ length: count }).map((_, index) => {
      const d = new Date(selectedDate);
      d.setDate(selectedDate.getDate() + index);
      return d;
    });
  }, [selectedDate, timelineMode]);

  const getDayEvents = useCallback(
    (d: number, m: number, y: number) => {
      const queryDate = new Date(y, m, d);
      return calendarEvents
        .filter((event) => {
          const date = new Date(event.date);
          const sameDay =
            date.getDate() === d && date.getMonth() === m && date.getFullYear() === y;
          if (sameDay) return true;
          if (!event.recurrence || event.recurrence === "none") return false;
          if (queryDate < date) return false;
          if (event.recurrence === "daily") return true;
          if (event.recurrence === "weekly") return queryDate.getDay() === date.getDay();
          if (event.recurrence === "monthly") return queryDate.getDate() === date.getDate();
          return false;
        })
        .sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));
    },
    [calendarEvents]
  );

  const calendarCellEvents = useMemo(() => {
    const byDate = new Map<string, any[]>();
    calendarData.forEach((d) => {
      byDate.set(`${d.year}-${d.month}-${d.day}`, getDayEvents(d.day, d.month, d.year));
    });
    return byDate;
  }, [calendarData, getDayEvents]);

  const timelineDayColumns = useMemo(
    () =>
      timelineDays.map((date) => {
        const dayEvents = getDayEvents(date.getDate(), date.getMonth(), date.getFullYear());
        const allDayEvents = dayEvents.filter((event) => Boolean(event.allDay));
        const timedEvents = dayEvents.filter((event) => !event.allDay);
        return {
          date,
          allDayEvents,
          timedLayouts: buildTimedEventLayouts(timedEvents),
        };
      }),
    [getDayEvents, timelineDays]
  );

  const selectedDateEvents = useMemo(
    () => getDayEvents(selectedDate.getDate(), selectedDate.getMonth(), selectedDate.getFullYear()),
    [getDayEvents, selectedDate]
  );

  const openNewModal = (presetStart?: string) => {
    const start = presetStart && isValidTime(presetStart) ? presetStart : defaultStartTime();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingEvent(null);
    setEventTitle("");
    setEventStart(start);
    setEventEnd(addMinutes(start, 30));
    setIsAllDay(false);
    setEventCategory("family");
    setEventRecurrence("none");
    setEventNote("");
    setIsCostEnabled(false);
    setEventAmount("");
    setShowMoreOptions(false);
    setIsModalVisible(true);
  };

  const handleEditEvent = (event: any) => {
    Haptics.selectionAsync();
    const eventIsAllDay =
      Boolean(event.allDay) ||
      (!isValidTime(event.time || "") && !isValidTime(event.endTime || ""));
    const start = eventIsAllDay ? "00:00" : isValidTime(event.time || "") ? event.time : "09:00";
    const end = eventIsAllDay ? "23:59" : isValidTime(event.endTime || "") ? event.endTime : addMinutes(start, 30);
    const categoryId = typeof event.type === "string" && event.type.trim() ? event.type : "family";

    setEditingEvent(event);
    setEventTitle(event.title || "");
    setEventStart(start);
    setEventEnd(end);
    setIsAllDay(eventIsAllDay);
    setEventCategory(categoryId);
    setEventRecurrence(event.recurrence || "none");
    setEventNote(event.note || event.notes || "");
    setIsCostEnabled(!!event.amount);
    setEventAmount(event.amount ? String(event.amount) : "");
    setShowMoreOptions(
      (event.recurrence && event.recurrence !== "none") ||
      !!(event.note || event.notes) ||
      categoryId !== "family"
    );
    setIsModalVisible(true);
  };

  const openTimePicker = (target: PickerTarget) => {
    Haptics.selectionAsync();
    setTimePickerTarget(target);
    setTimePickerValue(timeToDate(target === "start" ? eventStart : eventEnd));
    setTimePickerVisible(true);
  };

  const applyPickedTime = (date: Date, target: PickerTarget) => {
    const value = toTimeString(date);

    if (target === "start") {
      setEventStart(value);
      if (!isValidTime(eventEnd) || toMinutes(eventEnd) <= toMinutes(value)) {
        setEventEnd(addMinutes(value, 30));
      }
      return;
    }

    setEventEnd(value);
  };

  const handleStartTimeInput = (value: string) => {
    const normalized = normalizeTimeInput(value);
    setEventStart(normalized);
    if (isValidTime(normalized) && (!isValidTime(eventEnd) || toMinutes(eventEnd) <= toMinutes(normalized))) {
      setEventEnd(addMinutes(normalized, 30));
    }
  };

  const handleEndTimeInput = (value: string) => {
    setEventEnd(normalizeTimeInput(value));
  };

  const handleAndroidTimeChange = (event: DateTimePickerEvent, value?: Date) => {
    if (event.type === "dismissed") {
      setTimePickerVisible(false);
      return;
    }
    if (value) {
      applyPickedTime(value, timePickerTarget);
    }
    setTimePickerVisible(false);
  };

  const openCategoryModal = () => {
    Haptics.selectionAsync();
    setNewCategoryName("");
    setNewCategoryColor(CATEGORY_COLOR_PRESETS[0]);
    setNewCategoryColorInput(CATEGORY_COLOR_PRESETS[0].replace("#", "").toUpperCase());
    setCategoryModalVisible(true);
  };

  const saveCustomCategory = async () => {
    const label = newCategoryName.trim();
    if (!label) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Name required", "Please enter a category name.");
      return;
    }

    const candidateColor =
      newCategoryColorInput.length === 6 ? `#${newCategoryColorInput}` : newCategoryColor;

    const created = await addCustomCalendarCategory({
      label,
      color: normalizeColor(candidateColor),
    });

    if (!created) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Category unavailable",
        "This category already exists or uses an invalid name/color."
      );
      return;
    }

    setEventCategory(created.id);
    setCategoryModalVisible(false);
    setNewCategoryName("");
    setNewCategoryColor(CATEGORY_COLOR_PRESETS[0]);
    setNewCategoryColorInput(CATEGORY_COLOR_PRESETS[0].replace("#", "").toUpperCase());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const saveEvent = async () => {
    if (!eventTitle.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Title required", "Please add a title for this event.");
      return;
    }

    if (!isAllDay) {
      if (!isValidTime(eventStart) || !isValidTime(eventEnd)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert("Invalid time", "Please use valid 24-hour times (HH:MM).");
        return;
      }
      if (toMinutes(eventEnd) <= toMinutes(eventStart)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert("Invalid range", "End time must be later than start time.");
        return;
      }
    }

    const amountInput = eventAmount.trim();
    const rawAmount = Number(amountInput.replace(",", "."));
    if (isCostEnabled && amountInput && !Number.isFinite(rawAmount)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Invalid amount", "Please enter a valid planned amount.");
      return;
    }

    const amount = Number.isFinite(rawAmount)
      ? Math.max(0, Math.min(MAX_AMOUNT, rawAmount))
      : 0;
    if (isCostEnabled && amount <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Amount required", "Track cost is enabled. Enter an amount greater than 0.");
      return;
    }

    const categoryConfig = getCategoryConfig(eventCategory);

    const payload = {
      title: eventTitle.trim(),
      type: categoryConfig.id,
      date: selectedDate.toISOString(),
      time: isAllDay ? undefined : eventStart,
      endTime: isAllDay ? undefined : eventEnd,
      allDay: isAllDay,
      recurrence: eventRecurrence,
      amount: isCostEnabled && amount > 0 ? amount : undefined,
      color: categoryConfig.color,
      note: eventNote.trim() || undefined,
    };

    if (editingEvent) await updateCalendarEvent({ ...editingEvent, ...payload });
    else await addCalendarEvent(payload);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsModalVisible(false);
  };

  const confirmDeleteEvent = (event: any) => {
    Alert.alert("Delete event?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteCalendarEvent(event.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setIsModalVisible(false);
        },
      },
    ]);
  };

  const headerDate = viewMode === "month" ? viewDate : selectedDate;

  return (
    <View style={s.root}>
      <View style={[s.topSafe, { paddingTop: insets.top + 8 }]}> 
          <View style={s.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.headerTitle}>Calendar</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={viewMode === "compact" ? "Open month view" : "Close month view"}
                onPress={() => {
                  Haptics.selectionAsync();
                  setViewMode((value) => (value === "compact" ? "month" : "compact"));
                }}
              >
              <Text style={s.headerSubtitle}>
                {headerDate.toLocaleDateString("default", { month: "long", year: "numeric" })}
                <Ionicons name={viewMode === "compact" ? "chevron-down" : "chevron-up"} size={12} color={hatchColors.primary.default} />
              </Text>
              </Pressable>
            </View>

          <View style={s.toggleContainer}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Switch to calendar timeline view"
                onPress={() => {
                  Haptics.selectionAsync();
                  setDisplayMode("grid");
                }}
                style={[s.toggleBtn, displayMode === "grid" && s.toggleBtnActive]}
              >
              <Ionicons name="calendar" size={16} color={displayMode === "grid" ? hatchColors.primary.default : hatchColors.text.tertiary} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Switch to agenda list view"
                onPress={() => {
                  Haptics.selectionAsync();
                  setDisplayMode("agenda");
                }}
                style={[s.toggleBtn, displayMode === "agenda" && s.toggleBtnActive]}
              >
              <Ionicons name="list" size={16} color={displayMode === "agenda" ? hatchColors.primary.default : hatchColors.text.tertiary} />
              </Pressable>
          </View>
        </View>

        <Animated.View
          layout={Layout.springify()}
          style={[s.gridContainer, viewMode === "month" && s.gridContainerMonth]}
          {...(viewMode === "month" ? monthPanResponder.panHandlers : {})}
        >
          <View style={s.grid}>
            {["M", "T", "W", "T", "F", "S", "S"].map((label, index) => (
              <Text key={`${label}-${index}`} style={s.weekdayLabel}>{label}</Text>
            ))}
            {calendarData.map((d, index) => {
              const todayCheck =
                d.day === today.getDate() &&
                d.month === today.getMonth() &&
                d.year === today.getFullYear();
              const selectedCheck =
                d.day === selectedDate.getDate() &&
                d.month === selectedDate.getMonth() &&
                d.year === selectedDate.getFullYear();

              const dayEvents =
                calendarCellEvents.get(`${d.year}-${d.month}-${d.day}`) ?? [];
              const hasEvents = dayEvents.length > 0;

              return (
                <Pressable
                  key={`${d.year}-${d.month}-${d.day}-${index}`}
                  style={s.dayCell}
                  onPress={() => {
                    Haptics.selectionAsync();
                    const nextDate = new Date(d.year, d.month, d.day);
                    setSelectedDate(nextDate);
                    if (viewMode === "month") {
                      setViewDate(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
                    }
                  }}
                >
                  <View
                    style={[
                      s.dayCircle,
                      selectedCheck && s.dayCircleSelected,
                      !d.isCurrentMonth && viewMode === "month" && s.dayCircleDimmed,
                    ]}
                  >
                    <Text style={[s.dayText, selectedCheck && s.dayTextSelected, todayCheck && !selectedCheck && s.dayTextToday]}>
                      {d.day}
                    </Text>
                    {hasEvents && !selectedCheck && (
                      <View style={[s.eventDot, { backgroundColor: getCategoryConfig(dayEvents[0]?.type, dayEvents[0]?.color).color }]} />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </View>

      {displayMode === "agenda" ? (
        <AgendaView
          events={selectedDateEvents}
          selectedDate={selectedDate}
          onEditEvent={handleEditEvent}
          resolveCategory={getCategoryConfig}
          currencyCode={currencyCode}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <View style={s.subHeader}>
            <View style={s.modeSwitcherInline}>
              {(["day", "3day", "week"] as const).map((mode) => (
                <Pressable
                  key={mode}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setTimelineMode(mode);
                  }}
                  style={[s.modeBtnInline, timelineMode === mode && s.modeBtnActive]}
                >
                  <Text style={[s.modeBtnText, timelineMode === mode && s.modeBtnTextActive]}>{mode.toUpperCase()}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={s.dayLabel}>{selectedDate.toLocaleDateString("default", { weekday: "long" })}</Text>
          </View>

          <ScrollView
            ref={timelineScrollRef}
            style={s.timelineScroll}
            contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            <View style={s.timelineContainer}>
              <View style={s.timeCol}>
                {Array.from({ length: 24 }).map((_, hour) => (
                  <View key={hour} style={s.hourLabel}><Text style={s.hourText}>{String(hour).padStart(2, "0")}:00</Text></View>
                ))}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEnabled={timelineMode !== "day"}
                nestedScrollEnabled
              >
                <View style={s.scheduleWrapper}>
                  {timelineDayColumns.map(({ date, allDayEvents, timedLayouts }, dayIdx) => {
                    const nowLineTop = currentTime.getHours() * 60 + currentTime.getMinutes() + 20;
                    const isCurrentDay = isSameDate(date, today);
                    const columnWidth = timelineMode === "day" ? dayColumnWidth : timelineMode === "3day" ? 120 : 80;

                    return (
                      <View
                        key={`${date.toISOString()}-${dayIdx}`}
                        style={[
                          s.scheduleCol,
                          {
                            width: columnWidth,
                          },
                        ]}
                      >
                        {Array.from({ length: 24 }).map((_, hour) => (
                          <View key={`${dayIdx}-${hour}`} style={s.hourRow} />
                        ))}

                        {allDayEvents.map((event, allDayIndex) => {
                          const category = getCategoryConfig(event.type, event.color);

                          return (
                            <Pressable
                              key={`${event.id}-${allDayIndex}-all-day`}
                              onPress={() => handleEditEvent(event)}
                              style={[
                                s.timelineEvent,
                                s.timelineAllDayEvent,
                                {
                                  top: (4 + allDayIndex * 30) as DimensionValue,
                                  left: 4,
                                  right: 4,
                                  backgroundColor: category.colorLight,
                                  borderLeftColor: category.color,
                                },
                              ]}
                            >
                              <Text style={[s.eventTitleLabel, { color: category.color }]} numberOfLines={1}>
                                {event.title}
                              </Text>
                              <Text style={[s.eventTimeLabel, { color: category.color }]}>All day</Text>
                            </Pressable>
                          );
                        })}

                        {isCurrentDay && (
                          <View style={[s.nowLine, { top: nowLineTop }]}>
                            <PulsingDot />
                            <View style={s.nowLineSolid} />
                          </View>
                        )}

                        {timedLayouts.map((layout, eventIndex) => {
                          const columns = Math.max(1, layout.columns);
                          const gap = columns > 1 ? 4 : 0;
                          const innerWidth = Math.max(40, columnWidth - 8);
                          const eventWidth = Math.max(18, (innerWidth - gap * (columns - 1)) / columns);
                          const left = 4 + layout.column * (eventWidth + gap);
                          const category = getCategoryConfig(layout.event.type, layout.event.color);

                          return (
                            <Pressable
                              key={`${layout.event.id}-${eventIndex}`}
                              onPress={() => handleEditEvent(layout.event)}
                              style={[
                                s.timelineEvent,
                                {
                                  top: layout.top as DimensionValue,
                                  height: layout.height as DimensionValue,
                                  left: left as DimensionValue,
                                  width: eventWidth as DimensionValue,
                                  backgroundColor: category.colorLight,
                                  borderLeftColor: category.color,
                                },
                              ]}
                            >
                              <Text style={[s.eventTitleLabel, { color: category.color }]} numberOfLines={1}>{layout.event.title}</Text>
                              {layout.height > 40 && (
                                <Text style={[s.eventTimeLabel, { color: category.color }]}>
                                  {layout.startTime} - {layout.endTime}
                                </Text>
                              )}
                            </Pressable>
                          );
                        })}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add calendar event"
        onPress={() => openNewModal()}
        style={s.fab}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </Pressable>

      {Platform.OS === "android" && timePickerVisible && (
        <DateTimePicker
          value={timePickerValue}
          mode="time"
          is24Hour
          display="default"
          onChange={handleAndroidTimeChange}
        />
      )}

      <Modal
        visible={Platform.OS === "ios" && timePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTimePickerVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.timePickerCard}>
            <Text style={s.timePickerTitle}>{timePickerTarget === "start" ? "Choose start time" : "Choose end time"}</Text>
            <DateTimePicker
              value={timePickerValue}
              mode="time"
              is24Hour
              display="spinner"
              onChange={(_, value) => {
                if (value) setTimePickerValue(value);
              }}
            />
            <View style={s.timePickerActionRow}>
              <Pressable style={s.timePickerGhostBtn} onPress={() => setTimePickerVisible(false)}>
                <Text style={s.timePickerGhostText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={s.timePickerSaveBtn}
                onPress={() => {
                  applyPickedTime(timePickerValue, timePickerTarget);
                  setTimePickerVisible(false);
                }}
              >
                <Text style={s.timePickerSaveText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editingEvent ? "Edit event" : "New event"}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close event editor"
                style={s.modalCloseBtn}
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons name="close-circle" size={28} color={hatchColors.text.tertiary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.inputLabel}>What</Text>
              <TextInput style={s.input} placeholder="e.g. Piano lesson" value={eventTitle} onChangeText={setEventTitle} maxLength={40} />

              <Text style={s.inputLabel}>When</Text>
              <View style={s.toggleRow}>
                <Text style={s.toggleLabel}>All day</Text>
                <Switch
                  value={isAllDay}
                  onValueChange={(value) => {
                    Haptics.selectionAsync();
                    setIsAllDay(value);
                  }}
                  trackColor={{ false: hatchColors.border.default, true: hatchColors.primary.default }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {!isAllDay ? (
                <View style={s.timeRow}>
                  <View style={s.timeBox}>
                    <Text style={s.timeLabelSmall}>From</Text>
                    <View style={s.timeInputRow}>
                      <TextInput
                        style={s.timeInput}
                        value={eventStart}
                        onChangeText={handleStartTimeInput}
                        keyboardType="number-pad"
                        placeholder="18:30"
                        maxLength={5}
                      />
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Pick start time"
                        style={s.timePickerBtn}
                        onPress={() => openTimePicker("start")}
                      >
                        <Ionicons name="time-outline" size={18} color={hatchColors.primary.default} />
                      </Pressable>
                    </View>
                  </View>
                  <View style={s.timeBox}>
                    <Text style={s.timeLabelSmall}>To</Text>
                    <View style={s.timeInputRow}>
                      <TextInput
                        style={s.timeInput}
                        value={eventEnd}
                        onChangeText={handleEndTimeInput}
                        keyboardType="number-pad"
                        placeholder="19:00"
                        maxLength={5}
                      />
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Pick end time"
                        style={s.timePickerBtn}
                        onPress={() => openTimePicker("end")}
                      >
                        <Ionicons name="time-outline" size={18} color={hatchColors.primary.default} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={s.allDayHintCard}>
                  <Text style={s.allDayHintText}>This event stays pinned to the full selected day.</Text>
                </View>
              )}

              <View style={s.toggleRow}>
                <Text style={s.toggleLabel}>Track cost</Text>
                <Switch
                  value={isCostEnabled}
                  onValueChange={(value) => {
                    Haptics.selectionAsync();
                    setIsCostEnabled(value);
                  }}
                  trackColor={{ false: hatchColors.border.default, true: hatchColors.primary.default }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {isCostEnabled && (
                <Animated.View entering={FadeIn} style={s.costCard}>
                  <Text style={s.costLabel}>Planned expense</Text>
                  <TextInput style={s.budgetInput} placeholder="0.00" value={eventAmount} onChangeText={(value) => setEventAmount(normalizeMoneyInput(value))} keyboardType="decimal-pad" />
                  <Text style={s.costHint}>This amount appears in planned expenses under Savings.</Text>
                </Animated.View>
              )}

              <Pressable style={s.moreOptionsBtn} onPress={() => setShowMoreOptions((value) => !value)}>
                <Text style={s.moreOptionsText}>{showMoreOptions ? "Hide options" : "More options"}</Text>
                <Ionicons name={showMoreOptions ? "chevron-up" : "chevron-down"} size={14} color={hatchColors.primary.default} />
              </Pressable>

              {showMoreOptions && (
                <Animated.View entering={FadeIn}>
                  <Text style={s.inputLabel}>Category</Text>
                  <View style={s.catRow}>
                    {categoryOptions.map((category, categoryIndex) => (
                      <Pressable
                        key={`${category.id}-${categoryIndex}`}
                        onPress={() => setEventCategory(category.id)}
                        style={[
                          s.catChip,
                          eventCategory === category.id && {
                            backgroundColor: category.colorLight,
                            borderColor: category.color,
                          },
                        ]}
                      >
                        <Ionicons name={category.icon as any} size={18} color={eventCategory === category.id ? category.color : hatchColors.text.tertiary} />
                        <Text style={[s.catText, eventCategory === category.id && { color: category.color }]}>{category.label}</Text>
                      </Pressable>
                    ))}

                    <Pressable style={s.addCategoryChip} onPress={openCategoryModal}>
                      <Ionicons name="add" size={15} color={hatchColors.primary.default} />
                      <Text style={s.addCategoryText}>New</Text>
                    </Pressable>
                  </View>

                  <Text style={s.inputLabel}>Recurrence</Text>
                  <View style={s.recurrenceRow}>
                    {(["none", "daily", "weekly", "monthly"] as const).map((value) => (
                      <Pressable key={value} onPress={() => setEventRecurrence(value)} style={[s.recurrenceChip, eventRecurrence === value && s.recurrenceChipActive]}>
                        <Text style={[s.recurrenceText, eventRecurrence === value && s.recurrenceTextActive]}>{value}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={s.inputLabel}>Notes</Text>
                  <TextInput style={[s.input, { height: 80, textAlignVertical: "top" }]} placeholder="Add notes" value={eventNote} onChangeText={setEventNote} multiline />
                </Animated.View>
              )}

              <Pressable onPress={saveEvent} style={s.saveBtn}><Text style={s.saveBtnText}>{editingEvent ? "Update event" : "Save event"}</Text></Pressable>
              {editingEvent && (
                <Pressable onPress={() => confirmDeleteEvent(editingEvent)} style={s.deleteBtn}>
                  <Text style={s.deleteBtnText}>Delete event</Text>
                </Pressable>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.modalOverlay}>
          <View style={s.categoryModalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>New category</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close category editor"
                style={s.modalCloseBtn}
                onPress={() => setCategoryModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={hatchColors.text.secondary} />
              </Pressable>
            </View>

            <Text style={s.inputLabel}>Name</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Health"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              maxLength={28}
            />

            <Text style={s.inputLabel}>Color</Text>
            <View style={s.colorInputRow}>
              <View style={[s.colorPreview, { backgroundColor: newCategoryColor }]} />
              <TextInput
                style={s.colorInput}
                value={newCategoryColorInput}
                onChangeText={(value) => {
                  const next = sanitizeHexColor(value);
                  setNewCategoryColorInput(next);
                  if (next.length === 6) {
                    setNewCategoryColor(`#${next}`);
                  }
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
                placeholder="RRGGBB"
              />
            </View>
            <View style={s.colorPickerRow}>
              {CATEGORY_COLOR_PRESETS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => {
                    setNewCategoryColor(color);
                    setNewCategoryColorInput(color.replace("#", "").toUpperCase());
                  }}
                  style={[
                    s.colorDot,
                    { backgroundColor: color },
                    newCategoryColor === color && s.colorDotActive,
                  ]}
                />
              ))}
            </View>

            <Pressable style={s.saveBtn} onPress={saveCustomCategory}>
              <Text style={s.saveBtnText}>Add category</Text>
            </Pressable>
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
  headerTitle: { fontSize: 26, fontWeight: "800", color: hatchColors.text.primary, letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, fontWeight: "600", color: hatchColors.primary.default, marginTop: 4 },
  toggleContainer: { flexDirection: "row", backgroundColor: hatchColors.background.secondary, borderRadius: 12, padding: 4, gap: 4 },
  toggleBtn: { padding: 8, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: "#FFFFFF", ...hatchShadows.sm },

  gridContainer: { paddingHorizontal: 16 },
  gridContainerMonth: { minHeight: 320 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  weekdayLabel: { width: `${100 / 7}%`, textAlign: "center", fontSize: 11, fontWeight: "800", color: hatchColors.text.tertiary, marginBottom: 8 },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", position: "relative" },
  dayCircleSelected: { backgroundColor: hatchColors.primary.default },
  dayCircleDimmed: { opacity: 0.3 },
  dayText: { fontSize: 15, fontWeight: "700", color: hatchColors.text.primary },
  dayTextSelected: { color: "#FFFFFF" },
  dayTextToday: { color: hatchColors.primary.default, fontWeight: "900" },
  eventDot: { position: "absolute", bottom: 4, width: 4, height: 4, borderRadius: 2 },

  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: hatchColors.border.light,
    zIndex: 4,
    elevation: 2,
  },
  modeSwitcherInline: { flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 8, padding: 2 },
  modeBtnInline: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  modeBtnActive: { backgroundColor: hatchColors.background.secondary },
  modeBtnText: { fontSize: 10, fontWeight: "800", color: hatchColors.text.tertiary },
  modeBtnTextActive: { color: hatchColors.text.primary },
  dayLabel: { fontSize: 13, fontWeight: "700", color: hatchColors.text.secondary, textTransform: "uppercase" },

  timelineScroll: { flex: 1, backgroundColor: "#F9FAFB", zIndex: 1 },
  timelineContainer: { flexDirection: "row", minHeight: 1440 },
  timeCol: { width: 60, borderRightWidth: 1, borderRightColor: hatchColors.border.light, paddingTop: 20 },
  hourLabel: { height: 60, alignItems: "center" },
  hourText: { fontSize: 11, fontWeight: "600", color: hatchColors.text.tertiary },
  scheduleWrapper: { flexDirection: "row" },
  scheduleCol: { position: "relative", borderRightWidth: 1, borderRightColor: hatchColors.border.light },
  hourRow: { height: 60, borderBottomWidth: 1, borderBottomColor: hatchColors.border.light, width: "100%", opacity: 0.5 },
  timelineEvent: { position: "absolute", borderRadius: 8, padding: 6, paddingLeft: 8, borderLeftWidth: 4, overflow: "hidden", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  timelineAllDayEvent: {
    height: 26,
    zIndex: 11,
  },
  eventTitleLabel: { fontSize: 12, fontWeight: "800" },
  eventTimeLabel: { fontSize: 10, fontWeight: "600", marginTop: 1 },
  nowLine: { position: "absolute", left: 0, right: 0, height: 2, zIndex: 10, flexDirection: "row", alignItems: "center" },
  nowDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#EF4444", marginLeft: -5 },
  nowLineSolid: { flex: 1, height: 2, backgroundColor: "#EF4444" },

  fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: hatchColors.primary.default, alignItems: "center", justifyContent: "center", ...hatchShadows.glow, zIndex: 50 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center", padding: 18 },
  modalContent: { width: "100%", maxWidth: 420, maxHeight: "92%", backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, ...hatchShadows.lg },
  categoryModalCard: { width: "100%", maxWidth: 420, backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  modalCloseBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 22, fontWeight: "800", color: hatchColors.text.primary },
  inputLabel: { fontSize: 11, fontWeight: "900", color: hatchColors.text.tertiary, letterSpacing: 1, marginTop: 12, marginBottom: 8, marginLeft: 4, textTransform: "uppercase" },
  input: { backgroundColor: hatchColors.background.secondary, borderRadius: 14, padding: 14, fontSize: 16, fontWeight: "600", color: hatchColors.text.primary },

  timeRow: { flexDirection: "row", gap: 10 },
  timeBox: { flex: 1, backgroundColor: hatchColors.background.secondary, borderRadius: 14, padding: 12 },
  timeLabelSmall: { fontSize: 10, fontWeight: "700", color: hatchColors.text.tertiary, marginBottom: 6, textTransform: "uppercase" },
  timeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  timeInput: { flex: 1, fontSize: 20, fontWeight: "700", color: hatchColors.text.primary, paddingVertical: 0 },
  timePickerBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: hatchColors.primary.muted,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: hatchColors.background.secondary, borderWidth: 1, borderColor: "transparent", gap: 6 },
  catText: { fontSize: 13, fontWeight: "600", color: hatchColors.text.secondary },
  addCategoryChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: hatchColors.primary.default, backgroundColor: hatchColors.primary.muted, gap: 4 },
  addCategoryText: { fontSize: 12, fontWeight: "700", color: hatchColors.primary.default },

  recurrenceRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  recurrenceChip: { borderRadius: 999, borderWidth: 1, borderColor: hatchColors.border.default, backgroundColor: hatchColors.background.secondary, paddingHorizontal: 10, paddingVertical: 6 },
  recurrenceChipActive: { borderColor: hatchColors.primary.default, backgroundColor: hatchColors.primary.muted },
  recurrenceText: { fontSize: 12, fontWeight: "700", color: hatchColors.text.secondary, textTransform: "capitalize" },
  recurrenceTextActive: { color: hatchColors.primary.default },

  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 10 },
  toggleLabel: { fontSize: 16, fontWeight: "800", color: hatchColors.text.primary },
  allDayHintCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: hatchColors.background.secondary,
    padding: 10,
    marginTop: 2,
  },
  allDayHintText: { fontSize: 12, fontWeight: "600", color: hatchColors.text.secondary },
  costCard: { borderRadius: 14, borderWidth: 2, borderColor: hatchColors.primary.default, backgroundColor: hatchColors.primary.muted, padding: 12 },
  costLabel: { fontSize: 11, fontWeight: "900", color: hatchColors.primary.default, textTransform: "uppercase", marginBottom: 6 },
  budgetInput: { backgroundColor: "#FFFFFF", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, fontSize: 22, fontWeight: "800", color: hatchColors.text.primary },
  costHint: { marginTop: 6, fontSize: 12, color: hatchColors.text.secondary },

  moreOptionsBtn: {
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: hatchColors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  moreOptionsText: { fontSize: 13, fontWeight: "700", color: hatchColors.primary.default },

  saveBtn: { backgroundColor: hatchColors.primary.default, borderRadius: 14, padding: 14, alignItems: "center", marginTop: 20, ...hatchShadows.glow },
  saveBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  deleteBtn: { padding: 14, alignItems: "center", marginTop: 6 },
  deleteBtnText: { color: hatchColors.status.error, fontSize: 14, fontWeight: "700" },

  colorInputRow: {
    marginTop: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: hatchColors.background.secondary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorPreview: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: hatchColors.border.default },
  colorInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: hatchColors.text.primary,
    letterSpacing: 1,
  },
  colorPickerRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
  colorDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: "transparent" },
  colorDotActive: { borderColor: hatchColors.text.primary },

  timePickerCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  timePickerTitle: { fontSize: 16, fontWeight: "800", color: hatchColors.text.primary, marginBottom: 6 },
  timePickerActionRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 6 },
  timePickerGhostBtn: { borderRadius: 10, backgroundColor: hatchColors.background.secondary, paddingHorizontal: 12, paddingVertical: 8 },
  timePickerGhostText: { fontSize: 13, fontWeight: "700", color: hatchColors.text.secondary },
  timePickerSaveBtn: { borderRadius: 10, backgroundColor: hatchColors.primary.default, paddingHorizontal: 12, paddingVertical: 8 },
  timePickerSaveText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
});

