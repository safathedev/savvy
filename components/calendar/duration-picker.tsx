import { DURATIONS } from "@/constants/calendar-types";
import { hatchColors } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface DurationPickerProps {
    selectedDuration: number;
    onSelectDuration: (minutes: number) => void;
}

export function DurationPicker({ selectedDuration, onSelectDuration }: DurationPickerProps) {
    return (
        <View style={s.container}>
            <Text style={s.label}>DURATION</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
                {DURATIONS.map((d) => {
                    const isSelected = selectedDuration === d.minutes;
                    return (
                        <Pressable
                            key={d.minutes}
                            onPress={() => {
                                Haptics.selectionAsync();
                                onSelectDuration(d.minutes);
                            }}
                            style={[s.chip, isSelected && s.chipSelected]}
                        >
                            <Text style={[s.chipText, isSelected && s.chipTextSelected]}>{d.label}</Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { marginTop: 24 },
    label: { fontSize: 11, fontWeight: "900", color: hatchColors.text.tertiary, letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
    scrollContent: { gap: 8, paddingRight: 20 },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: hatchColors.background.secondary,
        borderWidth: 1,
        borderColor: hatchColors.border.default,
    },
    chipSelected: {
        backgroundColor: hatchColors.primary.default,
        borderColor: hatchColors.primary.default,
    },
    chipText: { fontSize: 13, fontWeight: "700", color: hatchColors.text.secondary },
    chipTextSelected: { color: "#FFFFFF" },
});
