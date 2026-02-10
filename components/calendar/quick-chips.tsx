import { QUICK_TEMPLATES } from "@/constants/calendar-types";
import { hatchColors, hatchShadows } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface QuickChipsProps {
    onSelectTemplate: (template: (typeof QUICK_TEMPLATES)[number]) => void;
}

export function QuickChips({ onSelectTemplate }: QuickChipsProps) {
    return (
        <View style={s.container}>
            <Text style={s.label}>QUICK TEMPLATES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
                {QUICK_TEMPLATES.map((template, index) => (
                    <Pressable
                        key={index}
                        onPress={() => {
                            Haptics.selectionAsync();
                            onSelectTemplate(template);
                        }}
                        style={s.chip}
                    >
                        <Text style={s.chipText}>{template.title}</Text>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { marginTop: 24 },
    label: { fontSize: 11, fontWeight: "900", color: hatchColors.text.tertiary, letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
    scrollContent: { gap: 8, paddingRight: 20 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: hatchColors.border.default,
        ...hatchShadows.sm,
    },
    chipText: { fontSize: 13, fontWeight: "700", color: hatchColors.text.primary },
});
