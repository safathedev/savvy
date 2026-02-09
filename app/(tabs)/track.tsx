// Savvy Savings Tracker — Minimalist White Design
import { currencies, formatCurrency } from "@/constants/currencies";
import { hatchColors, hatchShadows } from "@/constants/theme";
import { savingsCategories } from "@/data/categories";
import { SavingsEntry, useApp } from "@/lib/app-context";
import { formatDate } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TrackScreen() {
  const insets = useSafeAreaInsets();
  const {
    userProfile,
    savingsEntries,
    addSavingsEntry,
    getMonthlySavings,
    getTotalSavings,
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal
  } = useApp();

  const [modalVisible, setModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);

  const [amount, setAmount] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [category, setCategory] = useState("groceries");
  const [note, setNote] = useState("");

  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalColor, setGoalColor] = useState(hatchColors.primary.default);

  const currency = userProfile?.currency || "GBP";
  const currencySymbol = currencies[currency]?.symbol || "£";

  const sections = useMemo(() => {
    const grouped: { [key: string]: SavingsEntry[] } = {};
    savingsEntries.forEach((entry) => {
      const dateKey = entry.date.split("T")[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(entry);
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([date, data]) => ({ title: formatDate(date), data }));
  }, [savingsEntries]);

  const handleAddSavings = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // If a goal is selected, update it
    if (selectedGoalId) {
      const goal = savingsGoals.find(g => g.id === selectedGoalId);
      if (goal) {
        await updateSavingsGoal({
          ...goal,
          currentAmount: goal.currentAmount + num
        });
      }
    }

    await addSavingsEntry({ amount: num, category, note: note || (selectedGoalId ? "Goal Contribution" : ""), date: new Date().toISOString() });

    setAmount(""); setCategory("groceries"); setNote(""); setSelectedGoalId(null);
    setModalVisible(false);
  };

  const handleAddGoal = async () => {
    const target = parseFloat(goalTarget);
    if (!goalTitle || isNaN(target)) return;

    await addSavingsGoal({
      title: goalTitle,
      targetAmount: target,
      currentAmount: 0,
      icon: "trophy",
      color: goalColor
    });

    setGoalTitle(""); setGoalTarget(""); setGoalModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const monthlyGoal = 500; // Mock monthly goal for velocity
  const monthlyProgress = Math.min(getMonthlySavings() / monthlyGoal, 1);

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Header */}
        <View style={[s.header, { paddingTop: insets.top + 16 }]}>
          <View>
            <Text style={s.title}>Savings Hub</Text>
            <Text style={s.subtitle}>Building your future</Text>
          </View>
          <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={s.profileTiny}>
            <Ionicons name="stats-chart" size={20} color={hatchColors.primary.default} />
          </Pressable>
        </View>

        {/* Hero Stats */}
        <View style={s.heroContainer}>
          <View style={s.mainStat}>
            <Text style={s.mainStatLabel}>TOTAL BALANCE</Text>
            <Text style={s.mainStatValue}>{formatCurrency(getTotalSavings(), currency)}</Text>
          </View>
          <View style={s.velocityContainer}>
            <View style={s.velocityHeader}>
              <Text style={s.velocityLabel}>MONTHLY PROGRESS</Text>
              <Text style={s.velocityValue}>{Math.round(monthlyProgress * 100)}%</Text>
            </View>
            <View style={s.velocityTrack}>
              <Animated.View
                entering={FadeInDown.delay(300)}
                style={[s.velocityFill, { width: `${monthlyProgress * 100}%` }]}
              />
            </View>
          </View>
        </View>

        {/* Goals Carousel */}
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionTitle}>Savings Goals</Text>
          <Pressable onPress={() => setGoalModalVisible(true)} style={s.addGoalBtn}>
            <Ionicons name="add" size={18} color={hatchColors.primary.default} />
            <Text style={s.addGoalText}>New Goal</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.goalsCarousel}
          snapToInterval={280 + 16}
          decelerationRate="fast"
        >
          {savingsGoals.length === 0 ? (
            <Pressable onPress={() => setGoalModalVisible(true)} style={s.emptyGoalCard}>
              <Ionicons name="flag-outline" size={32} color={hatchColors.text.tertiary} />
              <Text style={s.emptyGoalText}>Set your first goal</Text>
            </Pressable>
          ) : (
            savingsGoals.map(goal => {
              const progress = Math.min(goal.currentAmount / goal.targetAmount, 1);
              return (
                <View key={goal.id} style={s.goalCard}>
                  <View style={[s.goalIcon, { backgroundColor: goal.color + '15' }]}>
                    <Ionicons name={goal.icon as any} size={24} color={goal.color} />
                  </View>
                  <Text style={s.goalTitle} numberOfLines={1}>{goal.title}</Text>
                  <Text style={s.goalMeta}>{formatCurrency(goal.currentAmount, currency)} of {formatCurrency(goal.targetAmount, currency)}</Text>
                  <View style={s.goalProgressTrack}>
                    <View style={[s.goalProgressFill, { width: `${progress * 100}%`, backgroundColor: goal.color }]} />
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Quick Log */}
        <View style={s.quickLogContainer}>
          <Text style={s.sectionTitle}>Quick Save</Text>
          <View style={s.quickLogGrid}>
            {[5, 10, 20, 50].map(val => (
              <Pressable
                key={val}
                onPress={() => {
                  setAmount(val.toString());
                  setModalVisible(true);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
                style={s.quickLogItem}
              >
                <Text style={s.quickLogPrefix}>+</Text>
                <Text style={s.quickLogVal}>{val}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recent History */}
        <Text style={[s.sectionTitle, { marginLeft: 24, marginTop: 32 }]}>History</Text>
        {savingsEntries.length === 0 ? (
          <View style={s.emptyHistory}>
            <Text style={s.emptyHistoryText}>No transactions yet</Text>
          </View>
        ) : (
          <View style={s.historyList}>
            {savingsEntries.slice(0, 10).map(entry => {
              const cat = savingsCategories.find(c => c.id === entry.category);
              return (
                <View key={entry.id} style={s.historyItem}>
                  <View style={s.historyIcon}>
                    <Ionicons name={cat?.icon as any || "cash-outline"} size={20} color={hatchColors.text.primary} />
                  </View>
                  <View style={s.historyInfo}>
                    <Text style={s.historyLabel}>{cat?.name || "Savings"}</Text>
                    <Text style={s.historyDate}>{new Date(entry.date).toLocaleDateString()}</Text>
                  </View>
                  <Text style={s.historyAmount}>+{formatCurrency(entry.amount, currency)}</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* FAB replaced by Quick Log sections but kept for backward compatibility if needed, or removed */}
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setModalVisible(true); }}
        style={[s.fab, { bottom: insets.bottom + 24 }]}
      >
        <View style={s.fabCircle}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </View>
      </Pressable>

      {/* Modal - Add Savings */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.modalOverlay}>
          <View style={s.modalContentMain}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Contribution</Text>
              <Pressable onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color={hatchColors.text.primary} /></Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.inputLabel}>AMOUNT</Text>
              <View style={s.amountInputRow}>
                <Text style={s.amountInputPrefix}>{currencySymbol}</Text>
                <TextInput
                  style={s.amountInputLarge}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  autoFocus
                  placeholder="0.00"
                />
              </View>

              <Text style={s.inputLabel}>LINK TO GOAL (OPTIONAL)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.goalSelectionRow}>
                {savingsGoals.map(g => (
                  <Pressable
                    key={g.id}
                    onPress={() => setSelectedGoalId(selectedGoalId === g.id ? null : g.id)}
                    style={[s.goalPick, selectedGoalId === g.id && { borderColor: g.color, backgroundColor: g.color + '10' }]}
                  >
                    <Ionicons name={g.icon as any} size={18} color={selectedGoalId === g.id ? g.color : hatchColors.text.tertiary} />
                    <Text style={[s.goalPickText, selectedGoalId === g.id && { color: g.color }]}>{g.title}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={s.inputLabel}>CATEGORY</Text>
              <View style={s.categoryGridSub}>
                {savingsCategories.slice(0, 6).map(cat => (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategory(cat.id)}
                    style={[s.catGridItem, category === cat.id && s.catGridItemActive]}
                  >
                    <Ionicons name={cat.icon as any} size={16} color={category === cat.id ? "#FFFFFF" : hatchColors.text.secondary} />
                    <Text style={[s.catGridText, category === cat.id && s.catGridTextActive]}>{cat.name}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable onPress={handleAddSavings} style={s.saveEntryBtn}>
                <Text style={s.saveEntryBtnText}>Record Savings</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal - Add Goal */}
      <Modal visible={goalModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.modalOverlay}>
          <View style={s.modalContentMain}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Set a Goal</Text>
              <Pressable onPress={() => setGoalModalVisible(false)}><Ionicons name="close" size={24} color={hatchColors.text.primary} /></Pressable>
            </View>

            <Text style={s.inputLabel}>GOAL TITLE</Text>
            <TextInput style={s.textInput} value={goalTitle} onChangeText={setGoalTitle} placeholder="e.g. Dream Car, Emergency Fund" />

            <Text style={s.inputLabel}>TARGET AMOUNT</Text>
            <TextInput style={s.textInput} value={goalTarget} onChangeText={setGoalTarget} keyboardType="numeric" placeholder="1000.00" />

            <Text style={s.inputLabel}>THEME COLOR</Text>
            <View style={s.colorSelectRow}>
              {["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"].map(c => (
                <Pressable key={c} onPress={() => setGoalColor(c)} style={[s.colorCircle, { backgroundColor: c }, goalColor === c && s.colorCircleSelected]} />
              ))}
            </View>

            <Pressable onPress={handleAddGoal} style={s.saveEntryBtn}>
              <Text style={s.saveEntryBtnText}>Create Goal</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "800", color: hatchColors.text.primary, letterSpacing: -1 },
  subtitle: { fontSize: 14, fontWeight: "600", color: hatchColors.text.tertiary, marginTop: -2 },
  profileTiny: { width: 40, height: 40, borderRadius: 12, backgroundColor: hatchColors.primary.muted, alignItems: 'center', justifyContent: 'center' },

  heroContainer: { marginHorizontal: 24, padding: 24, borderRadius: 32, backgroundColor: hatchColors.primary.default, ...hatchShadows.glow },
  mainStat: { marginBottom: 24 },
  mainStatLabel: { fontSize: 10, fontWeight: "900", color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
  mainStatValue: { fontSize: 36, fontWeight: "800", color: "#FFFFFF", letterSpacing: -1 },
  velocityContainer: {},
  velocityHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  velocityLabel: { fontSize: 10, fontWeight: "900", color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 },
  velocityValue: { fontSize: 10, fontWeight: "900", color: "#FFFFFF" },
  velocityTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  velocityFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 3 },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginTop: 32, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: hatchColors.text.primary },
  addGoalBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addGoalText: { fontSize: 13, fontWeight: "700", color: hatchColors.primary.default },

  goalsCarousel: { paddingLeft: 24, paddingRight: 8 },
  goalCard: { width: 280, backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, marginRight: 16, borderWidth: 1, borderColor: hatchColors.border.default, ...hatchShadows.sm },
  goalIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  goalTitle: { fontSize: 16, fontWeight: "800", color: hatchColors.text.primary },
  goalMeta: { fontSize: 12, fontWeight: "600", color: hatchColors.text.tertiary, marginTop: 4, marginBottom: 16 },
  goalProgressTrack: { height: 8, backgroundColor: hatchColors.background.secondary, borderRadius: 4, overflow: 'hidden' },
  goalProgressFill: { height: '100%', borderRadius: 4 },
  emptyGoalCard: { width: 280, height: 160, borderRadius: 24, borderStyle: 'dashed', borderWidth: 2, borderColor: hatchColors.border.default, alignItems: 'center', justifyContent: 'center', marginRight: 24 },
  emptyGoalText: { fontSize: 14, fontWeight: "700", color: hatchColors.text.tertiary, marginTop: 12 },

  quickLogContainer: { paddingHorizontal: 24, marginTop: 32 },
  quickLogGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  quickLogItem: { width: '22%', aspectRatio: 1, borderRadius: 20, backgroundColor: hatchColors.background.secondary, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: hatchColors.border.default },
  quickLogPrefix: { fontSize: 12, fontWeight: "900", color: hatchColors.primary.default },
  quickLogVal: { fontSize: 18, fontWeight: "800", color: hatchColors.text.primary },

  historyList: { paddingHorizontal: 24, marginTop: 16 },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: hatchColors.border.light },
  historyIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: hatchColors.background.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  historyInfo: { flex: 1 },
  historyLabel: { fontSize: 15, fontWeight: "700", color: hatchColors.text.primary },
  historyDate: { fontSize: 12, color: hatchColors.text.tertiary, marginTop: 2 },
  historyAmount: { fontSize: 15, fontWeight: "800", color: hatchColors.status.success },
  emptyHistory: { paddingHorizontal: 24, marginTop: 20, opacity: 0.5 },
  emptyHistoryText: { fontSize: 14, fontStyle: 'italic', color: hatchColors.text.tertiary },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modalContentMain: { backgroundColor: '#FFFFFF', borderRadius: 32, padding: 24, maxHeight: '90%', ...hatchShadows.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: "800", color: hatchColors.text.primary },
  inputLabel: { fontSize: 10, fontWeight: "900", color: hatchColors.text.tertiary, letterSpacing: 1, marginTop: 24, marginBottom: 12 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: hatchColors.background.secondary, borderRadius: 20, padding: 16 },
  amountInputPrefix: { fontSize: 24, fontWeight: "800", color: hatchColors.primary.default, marginRight: 10 },
  amountInputLarge: { flex: 1, fontSize: 32, fontWeight: "800", color: hatchColors.text.primary },

  goalSelectionRow: { gap: 8 },
  goalPick: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: hatchColors.border.default, backgroundColor: '#FFFFFF' },
  goalPickText: { fontSize: 13, fontWeight: "700", color: hatchColors.text.secondary },

  categoryGridSub: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catGridItem: { width: '31%', paddingVertical: 12, borderRadius: 12, backgroundColor: hatchColors.background.secondary, alignItems: 'center', gap: 4 },
  catGridItemActive: { backgroundColor: hatchColors.primary.default },
  catGridText: { fontSize: 11, fontWeight: "700", color: hatchColors.text.secondary },
  catGridTextActive: { color: "#FFFFFF" },

  textInput: { backgroundColor: hatchColors.background.secondary, borderRadius: 16, padding: 16, fontSize: 16, fontWeight: "600", color: hatchColors.text.primary },
  colorSelectRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  colorCircle: { width: 36, height: 36, borderRadius: 18 },
  colorCircleSelected: { borderWidth: 3, borderColor: hatchColors.text.primary },

  saveEntryBtn: { backgroundColor: hatchColors.primary.default, borderRadius: 20, padding: 20, alignItems: 'center', marginTop: 32, ...hatchShadows.glow },
  saveEntryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: "800" },

  fab: { position: 'absolute', right: 24 },
  fabCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: hatchColors.primary.default, alignItems: 'center', justifyContent: 'center', ...hatchShadows.md },
});
