import { CalendarCategoryConfig } from "@/constants/calendar-types";
import { CurrencyCode, formatCurrency } from "@/constants/currencies";
import { hatchColors, hatchShadows } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface AgendaViewProps {
  events: any[];
  selectedDate: Date;
  onEditEvent: (event: any) => void;
  resolveCategory: (type?: string, color?: string) => CalendarCategoryConfig;
  currencyCode: CurrencyCode;
}

export function AgendaView({
  events,
  onEditEvent,
  resolveCategory,
  currencyCode,
}: AgendaViewProps) {
  const sortedEvents = [...events].sort((a, b) => {
    if (a.allDay && !b.allDay) return -1;
    if (!a.allDay && b.allDay) return 1;
    return (a.time || "00:00").localeCompare(b.time || "00:00");
  });

  if (sortedEvents.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <View style={s.emptyIconBg}>
          <Ionicons name="cafe" size={32} color={hatchColors.primary.default} />
        </View>
        <Text style={s.emptyTitle}>All clear</Text>
        <Text style={s.emptySubtitle}>No events for this day.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {sortedEvents.map((event, index) => {
        const categoryConfig = resolveCategory(event.type, event.color);

        return (
          <Animated.View key={`${event.id}-${index}`} entering={FadeInDown.delay(index * 90).springify()}>
            <Pressable onPress={() => onEditEvent(event)} style={s.card}>
              <View style={[s.timeCol, { borderRightColor: categoryConfig.color }]}>
                <Text style={s.startTime} numberOfLines={1}>{event.allDay ? "ALL DAY" : event.time || "--:--"}</Text>
                <Text style={s.endTime} numberOfLines={1}>{event.allDay ? "Pinned" : event.endTime || "--:--"}</Text>
              </View>

              <View style={s.detailsCol}>
                <View style={s.headerRow}>
                  <Text style={s.title} numberOfLines={1}>{event.title}</Text>
                  {event.recurrence !== "none" && <Ionicons name="repeat" size={12} color={hatchColors.text.tertiary} />}
                </View>

                <View style={s.metaRow}>
                  <View style={[s.categoryTag, { backgroundColor: categoryConfig.colorLight }]}>
                    <Ionicons name={categoryConfig.icon as any} size={10} color={categoryConfig.color} />
                    <Text style={[s.categoryText, { color: categoryConfig.color }]} numberOfLines={1}>{categoryConfig.label}</Text>
                  </View>
                  {event.amount > 0 ? (
                    <Text style={s.amountText}>{formatCurrency(event.amount, currencyCode)}</Text>
                  ) : null}
                </View>
              </View>
            </Pressable>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { padding: 20, gap: 12, paddingBottom: 100 },

  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 100 },
  emptyIconBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: hatchColors.primary.muted, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: hatchColors.text.primary, marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: hatchColors.text.tertiary },

  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    ...hatchShadows.sm,
    borderWidth: 1,
    borderColor: hatchColors.border.light,
  },
  timeCol: {
    width: 92,
    borderRightWidth: 3,
    paddingRight: 12,
    marginRight: 12,
    justifyContent: "center",
  },
  startTime: { fontSize: 15, fontWeight: "800", color: hatchColors.text.primary },
  endTime: { fontSize: 12, fontWeight: "600", color: hatchColors.text.tertiary, marginTop: 2 },

  detailsCol: { flex: 1, justifyContent: "center" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  title: { fontSize: 15, fontWeight: "700", color: hatchColors.text.primary },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  categoryTag: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4, maxWidth: 160 },
  categoryText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  amountText: { fontSize: 12, fontWeight: "700", color: hatchColors.status.success },
});
