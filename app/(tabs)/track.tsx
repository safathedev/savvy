import { currencies, formatCurrency } from "@/constants/currencies";
import { hatchColors, hatchShadows } from "@/constants/theme";
import { SavingsEntry, SavingsGoal, useApp } from "@/lib/app-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_AMOUNT = 10000;
const INCOME_CATEGORIES = ["salary", "support", "side", "gift", "other"] as const;
const EXPENSE_CATEGORIES = ["housing", "groceries", "transport", "kids", "health", "other"] as const;

type EntryFilter = "all" | "income" | "expense";

function clampMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(MAX_AMOUNT, value));
}

function parseMoney(text: string): number {
  return clampMoney(Number(text.replace(",", ".")));
}

function normalizeMoneyInput(value: string): string {
  const clean = value.replace(/[^0-9.,]/g, "");
  const parsed = Number(clean.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= MAX_AMOUNT) return clean;
  return String(MAX_AMOUNT);
}

function getGoalProgress(goal: SavingsGoal): number {
  if (!goal.targetAmount || goal.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
}

export default function TrackScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    userProfile,
    savingsEntries,
    addSavingsEntry,
    updateSavingsEntry,
    deleteSavingsEntry,
    getTotalIncome,
    getTotalExpenses,
    getTotalSavings,
    getReservedExpenses,
    getTotalAllocatedToGoals,
    getAvailableAfterReserved,
    getUpcomingCostEvents,
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    isPremium,
  } = useApp();

  const currency = userProfile?.currency || "EUR";
  const currencySymbol = currencies[currency]?.symbol || currencies.EUR.symbol;

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [entryTypeModalVisible, setEntryTypeModalVisible] = useState(false);

  const [entryFilter, setEntryFilter] = useState<EntryFilter>("all");
  const [entryModalVisible, setEntryModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SavingsEntry | null>(null);
  const [entryType, setEntryType] = useState<"income" | "expense">("expense");
  const [entryAmount, setEntryAmount] = useState("");
  const [entryCategory, setEntryCategory] = useState("groceries");
  const [entryNote, setEntryNote] = useState("");

  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("");
  const [goalIsFavorite, setGoalIsFavorite] = useState(false);
  
  const [statsTab, setStatsTab] = useState<"simple" | "advanced">("simple");
  const [recurringModalVisible, setRecurringModalVisible] = useState(false);

  const incomeTotal = getTotalIncome();
  const expenseTotal = getTotalExpenses();
  const netBalance = getTotalSavings();
  const plannedExpenses = getReservedExpenses();
  const allocatedToGoals = getTotalAllocatedToGoals();
  const afterPlanned = getAvailableAfterReserved();
  const upcomingEvents = getUpcomingCostEvents();
  
  const hasRecurringCosts = useMemo(
    () => upcomingEvents.some((event) => event.recurrence && event.recurrence !== "none"),
    [upcomingEvents]
  );

  const entries = useMemo(
    () => [...savingsEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [savingsEntries]
  );

  const filteredEntries = useMemo(() => {
    if (entryFilter === "all") return entries;
    return entries.filter((entry) => entry.type === entryFilter);
  }, [entries, entryFilter]);

  const expenseRatio = incomeTotal > 0 ? Math.min(100, Math.round((expenseTotal / incomeTotal) * 100)) : 0;
  const plannedRatio = incomeTotal > 0 ? Math.min(100, Math.round((plannedExpenses / incomeTotal) * 100)) : 0;
  const savedRatio = incomeTotal > 0 ? Math.max(0, Math.min(100, Math.round((Math.max(0, netBalance) / incomeTotal) * 100))) : 0;
  const goalsSorted = useMemo(
    () => [...savingsGoals].sort((a, b) => a.title.localeCompare(b.title)),
    [savingsGoals]
  );
  const primaryGoal = useMemo(() => {
    return goalsSorted.find((goal) => goal.isFavorite) || null;
  }, [goalsSorted]);
  const primaryGoalProgress = primaryGoal ? getGoalProgress(primaryGoal) : 0;

  const openEntryModal = (type: "income" | "expense", entry?: SavingsEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setEntryType(entry.type);
      setEntryAmount(String(entry.amount));
      setEntryCategory(entry.category);
      setEntryNote(entry.note || "");
    } else {
      setEditingEntry(null);
      setEntryType(type);
      setEntryAmount("");
      setEntryCategory(type === "income" ? "salary" : "groceries");
      setEntryNote("");
    }
    setEntryModalVisible(true);
  };

  const saveEntry = async () => {
    const amount = parseMoney(entryAmount);
    if (!amount) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Amount required", "Please enter an amount greater than 0.");
      return;
    }

    const payload = {
      type: entryType,
      amount,
      category: entryCategory,
      note: entryNote.trim(),
      date: editingEntry ? editingEntry.date : new Date().toISOString(),
    };

    if (editingEntry) await updateSavingsEntry({ ...editingEntry, ...payload });
    else await addSavingsEntry(payload);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEntryModalVisible(false);
  };

  const openGoalModal = (goal?: SavingsGoal) => {
    if (goal) {
      setEditingGoal(goal);
      setGoalTitle(goal.title);
      setGoalTarget(String(goal.targetAmount));
      setGoalCurrent(String(goal.currentAmount));
      setGoalIsFavorite(goal.isFavorite || false);
    } else {
      setEditingGoal(null);
      setGoalTitle("");
      setGoalTarget("");
      setGoalCurrent("0");
      setGoalIsFavorite(false);
    }
    setGoalModalVisible(true);
  };

  const saveGoal = async () => {
    const target = parseMoney(goalTarget);
    const current = parseMoney(goalCurrent);
    if (!goalTitle.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Title required", "Please add a name for your savings goal.");
      return;
    }

    if (!target) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Target required", "Please enter a target amount greater than 0.");
      return;
    }

    // Context handles ensuring only one favorite exists
    if (editingGoal) {
      await updateSavingsGoal({
        ...editingGoal,
        title: goalTitle.trim(),
        targetAmount: target,
        currentAmount: current,
        isFavorite: goalIsFavorite,
      });
    } else {
      await addSavingsGoal({
        title: goalTitle.trim(),
        targetAmount: target,
        currentAmount: current,
        icon: "flag",
        color: hatchColors.primary.default,
        isFavorite: goalIsFavorite,
      });
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setGoalModalVisible(false);
  };

  const confirmDeleteEntry = (entry: SavingsEntry) => {
    Alert.alert("Delete entry?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteSavingsEntry(entry.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setEntryModalVisible(false);
        },
      },
    ]);
  };

  const confirmDeleteGoal = (goal: SavingsGoal) => {
    Alert.alert("Delete goal?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteSavingsGoal(goal.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setGoalModalVisible(false);
        },
      },
    ]);
  };

  return (
    <View style={s.root}>
      <View style={[s.stickyHeader, { paddingTop: insets.top + 14, paddingHorizontal: 20 }]}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>Savings</Text>
            <Text style={s.subtitle}>Clear first. Details only when you need them.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open savings statistics"
            style={s.statsBtn}
            onPress={() => {
              Haptics.selectionAsync();
              setStatsVisible(true);
            }}
          >
            <Ionicons name="stats-chart" size={20} color={hatchColors.primary.default} />
          </Pressable>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 14,
          paddingBottom: insets.bottom + 90,
          paddingHorizontal: 20,
        }}
      >

        <View style={s.heroCard}>
          <View style={s.heroLabelRow}>
            <Text style={s.heroLabel}>AVAILABLE NOW</Text>
            {hasRecurringCosts && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setRecurringModalVisible(true);
                }}
                style={s.recurringBadge}
              >
                <Ionicons name="repeat" size={10} color={hatchColors.text.inverse} />
                <Text style={s.recurringBadgeText}>RECURRING</Text>
              </Pressable>
            )}
          </View>
          <Text style={s.heroValue}>{formatCurrency(afterPlanned, currency)}</Text>

          <View style={s.heroGrid}>
            <MetricCell label="Income" value={`+${formatCurrency(incomeTotal, currency)}`} />
            <MetricCell label="Spent" value={`-${formatCurrency(expenseTotal, currency)}`} />
            <MetricCell label="Reserved" value={`-${formatCurrency(plannedExpenses, currency)}`} />
            <MetricCell label="In goals" value={`-${formatCurrency(allocatedToGoals, currency)}`} />
            <MetricCell label="Net balance" value={formatCurrency(netBalance, currency)} highlight />
          </View>
        </View>

        {primaryGoal && (
          <Pressable
            style={s.goalHeroCard}
            onPress={() => openGoalModal(primaryGoal)}
          >
            <View style={s.goalHeroHeader}>
              <Text style={s.goalHeroLabel}>YOUR FAVORITE SAVING GOAL</Text>
              <Text style={s.goalHeroPercent}>
                {primaryGoalProgress}%
              </Text>
            </View>
            <Text style={s.goalHeroTitle}>{primaryGoal.title}</Text>
            <Text style={s.goalHeroMeta}>
              {formatCurrency(primaryGoal.currentAmount, currency)} of {formatCurrency(primaryGoal.targetAmount, currency)}
            </Text>
            <View style={s.goalHeroTrack}>
              <View
                style={[
                  s.goalHeroFill,
                  { width: `${primaryGoalProgress}%` },
                ]}
              />
            </View>
            <Text style={s.goalHeroHint}>Tap to edit goal</Text>
          </Pressable>
        )}

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Goals</Text>
          <Pressable style={s.goalAddBtn} onPress={() => openGoalModal()}>
            <Ionicons name="add" size={14} color="#FFFFFF" />
            <Text style={s.goalAddBtnText}>Add goal</Text>
          </Pressable>
        </View>

        {goalsSorted.length === 0 ? (
          <Pressable style={s.goalEmptyCard} onPress={() => openGoalModal()}>
            <Text style={s.goalEmptyTitle}>No goals yet</Text>
            <Text style={s.goalEmptyText}>Create your first goal now and track your progress easily.</Text>
          </Pressable>
        ) : (
          <View style={s.goalList}>
            {goalsSorted.map((goal, index) => {
              const progress = getGoalProgress(goal);
              return (
                <Pressable
                  key={`${goal.id}-${index}`}
                  style={s.goalRowCard}
                  onPress={() => openGoalModal(goal)}
                >
                  <View style={s.goalRowHeader}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                      <Text style={s.goalRowTitle} numberOfLines={1}>{goal.title}</Text>
                      {goal.isFavorite && (
                        <Ionicons name="star" size={14} color={hatchColors.primary.default} />
                      )}
                    </View>
                    <Text style={s.goalRowPercent}>{progress}%</Text>
                  </View>
                  <Text style={s.goalRowMeta}>
                    {formatCurrency(goal.currentAmount, currency)} of {formatCurrency(goal.targetAmount, currency)}
                  </Text>
                  <View style={s.goalRowTrack}>
                    <View style={[s.goalRowFill, { width: `${progress}%` }]} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Income and expenses</Text>
          <View style={s.filterRow}>
            {(["all", "income", "expense"] as EntryFilter[]).map((filter) => (
              <Pressable
                key={filter}
                onPress={() => setEntryFilter(filter)}
                style={[s.filterChip, entryFilter === filter && s.filterChipActive]}
              >
                <Text style={[s.filterChipText, entryFilter === filter && s.filterChipTextActive]}>
                  {filter}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {filteredEntries.length === 0 ? (
          <Text style={s.emptyText}>No entries yet.</Text>
        ) : (
          filteredEntries.map((entry, index) => (
            <Pressable key={`${entry.id}-${index}`} onPress={() => openEntryModal(entry.type, entry)} style={s.entryRow}>
              <View style={[s.entryBadge, entry.type === "income" ? s.entryBadgeIncome : s.entryBadgeExpense]}>
                <Text style={[s.entryBadgeText, entry.type === "income" ? s.entryBadgeIncomeText : s.entryBadgeExpenseText]}>
                  {entry.type === "income" ? "IN" : "OUT"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.entryCategory}>{entry.category}</Text>
                <Text style={s.entryMeta}>
                  {entry.note || "No note"} - {new Date(entry.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[s.entryAmount, entry.type === "income" ? s.amountIncome : s.amountExpense]}>
                {entry.type === "income" ? "+" : "-"}
                {formatCurrency(entry.amount, currency)}
              </Text>
            </Pressable>
          ))
        )}

        <Pressable style={s.advancedToggle} onPress={() => setShowAdvanced((value) => !value)}>
          <Text style={s.linkText}>{showAdvanced ? "Hide planning details" : "Show planning details"}</Text>
          <Ionicons
            name={showAdvanced ? "chevron-up" : "chevron-down"}
            size={14}
            color={hatchColors.primary.default}
          />
        </Pressable>

        {showAdvanced && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Planned expenses from calendar</Text>
            </View>
            {upcomingEvents.length === 0 ? (
              <Text style={s.emptyText}>No planned cost events.</Text>
            ) : (
              upcomingEvents.slice(0, 8).map((event, index) => (
                <View key={`${event.id}-${index}`} style={s.detailRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.detailTitle}>{event.title}</Text>
                    <Text style={s.detailMeta}>
                      {new Date(event.date).toLocaleDateString()} {event.time ? `- ${event.time}` : ""}
                    </Text>
                  </View>
                  <Text style={s.amountExpense}>-{formatCurrency(event.amount || 0, currency)}</Text>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add savings entry"
        style={[s.fab, { bottom: insets.bottom + 24 }]}
        onPress={() => setEntryTypeModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Pressable>

      <Modal
        visible={entryTypeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEntryTypeModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.typeModalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>New entry</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close new entry type"
                style={s.modalCloseBtn}
                onPress={() => setEntryTypeModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={hatchColors.text.secondary} />
              </Pressable>
            </View>

            <Pressable
              style={s.typeSelectBtn}
              onPress={() => {
                setEntryTypeModalVisible(false);
                openEntryModal("income");
              }}
            >
              <Ionicons name="add-circle" size={20} color={hatchColors.primary.default} />
              <View style={{ flex: 1 }}>
                <Text style={s.typeSelectTitle}>Add income</Text>
                <Text style={s.typeSelectMeta}>Salary, support, gift, side income</Text>
              </View>
            </Pressable>

            <Pressable
              style={s.typeSelectBtn}
              onPress={() => {
                setEntryTypeModalVisible(false);
                openEntryModal("expense");
              }}
            >
              <Ionicons name="remove-circle" size={20} color={hatchColors.status.error} />
              <View style={{ flex: 1 }}>
                <Text style={s.typeSelectTitle}>Add expense</Text>
                <Text style={s.typeSelectMeta}>Groceries, housing, transport, kids, health</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={entryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEntryModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editingEntry ? "Edit entry" : "New entry"}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close entry editor"
                style={s.modalCloseBtn}
                onPress={() => setEntryModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={hatchColors.text.secondary} />
              </Pressable>
            </View>

            <View style={s.typeRow}>
              {(["income", "expense"] as const).map((type) => (
                <Pressable key={type} onPress={() => setEntryType(type)} style={[s.typeChip, entryType === type && s.typeChipActive]}>
                  <Text style={[s.typeChipText, entryType === type && s.typeChipTextActive]}>{type}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={s.modalLabel}>Amount</Text>
            <View style={s.amountRow}>
              <Text style={s.amountSymbol}>{currencySymbol}</Text>
              <TextInput
                style={s.amountInput}
                value={entryAmount}
                onChangeText={(value) => setEntryAmount(normalizeMoneyInput(value))}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
            </View>

            <Text style={s.modalLabel}>Category</Text>
            <View style={s.categoryWrap}>
              {(entryType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                <Pressable key={cat} onPress={() => setEntryCategory(cat)} style={[s.categoryChip, entryCategory === cat && s.categoryChipActive]}>
                  <Text style={[s.categoryText, entryCategory === cat && s.categoryTextActive]}>{cat}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={s.modalLabel}>Note</Text>
            <TextInput style={[s.input, { height: 70, textAlignVertical: "top" }]} value={entryNote} onChangeText={setEntryNote} placeholder="Optional" multiline />

            <Pressable style={s.saveBtn} onPress={saveEntry}><Text style={s.saveBtnText}>{editingEntry ? "Save" : "Add entry"}</Text></Pressable>
            {editingEntry && (
              <Pressable style={s.deleteBtn} onPress={() => confirmDeleteEntry(editingEntry)}>
                <Text style={s.deleteBtnText}>Delete entry</Text>
              </Pressable>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={goalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editingGoal ? "Edit goal" : "New goal"}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close goal editor"
                style={s.modalCloseBtn}
                onPress={() => setGoalModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={hatchColors.text.secondary} />
              </Pressable>
            </View>
            <Text style={s.modalLabel}>Title</Text>
            <TextInput style={s.input} value={goalTitle} onChangeText={setGoalTitle} placeholder="Emergency fund" />
            <Text style={s.modalLabel}>Target amount</Text>
            <TextInput style={s.input} value={goalTarget} onChangeText={(value) => setGoalTarget(normalizeMoneyInput(value))} keyboardType="decimal-pad" placeholder="0.00" />
            <Text style={s.modalLabel}>Current amount</Text>
            <TextInput style={s.input} value={goalCurrent} onChangeText={(value) => setGoalCurrent(normalizeMoneyInput(value))} keyboardType="decimal-pad" placeholder="0.00" />
            
            <Pressable
              style={s.favoriteToggle}
              onPress={() => {
                Haptics.selectionAsync();
                setGoalIsFavorite(!goalIsFavorite);
              }}
            >
              <View style={s.favoriteToggleContent}>
                <Ionicons name={goalIsFavorite ? "star" : "star-outline"} size={20} color={goalIsFavorite ? hatchColors.primary.default : hatchColors.text.secondary} />
                <Text style={s.favoriteToggleText}>Mark as favorite goal</Text>
              </View>
              <View style={[s.favoriteCheckbox, goalIsFavorite && s.favoriteCheckboxActive]}>
                {goalIsFavorite && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
            </Pressable>

            <Pressable style={s.saveBtn} onPress={saveGoal}><Text style={s.saveBtnText}>Save goal</Text></Pressable>
            {editingGoal && (
              <Pressable style={s.deleteBtn} onPress={() => confirmDeleteGoal(editingGoal)}>
                <Text style={s.deleteBtnText}>Delete goal</Text>
              </Pressable>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={statsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatsVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Statistics</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close statistics"
                style={s.modalCloseBtn}
                onPress={() => {
                  setStatsVisible(false);
                  setStatsTab("simple");
                }}
              >
                <Ionicons name="close" size={22} color={hatchColors.text.secondary} />
              </Pressable>
            </View>

            <View style={s.statsTabs}>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setStatsTab("simple");
                }}
                style={[s.statsTab, statsTab === "simple" && s.statsTabActive]}
              >
                <Text style={[s.statsTabText, statsTab === "simple" && s.statsTabTextActive]}>
                  Simple
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!isPremium) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    Alert.alert(
                      "Premium feature",
                      "Advanced statistics are part of Savvy Premium. Upgrade to unlock detailed insights.",
                      [
                        { text: "Not now", style: "cancel" },
                        { text: "See plans", onPress: () => router.push("/paywall") },
                      ]
                    );
                    return;
                  }
                  Haptics.selectionAsync();
                  setStatsTab("advanced");
                }}
                style={[s.statsTab, statsTab === "advanced" && s.statsTabActive]}
              >
                <Text style={[s.statsTabText, statsTab === "advanced" && s.statsTabTextActive]}>
                  Advanced
                </Text>
                {!isPremium && (
                  <Ionicons name="lock-closed" size={12} color={hatchColors.text.tertiary} style={{ marginLeft: 4 }} />
                )}
              </Pressable>
            </View>

            <ScrollView style={s.statsContent} showsVerticalScrollIndicator={false}>
              {statsTab === "simple" ? (
                <>
                  <StatBar label="Spent from income" value={`${expenseRatio}%`} percent={expenseRatio} />
                  <StatBar label="Reserved from income" value={`${plannedRatio}%`} percent={plannedRatio} />
                  <StatBar label="Current saved ratio" value={`${savedRatio}%`} percent={savedRatio} />
                  <Text style={s.statHint}>These are quick guidance numbers, not strict limits.</Text>
                </>
              ) : (
                <>
                  <Text style={s.advancedStatsTitle}>Detailed breakdown</Text>
                  
                  <View style={s.advancedStatCard}>
                    <Text style={s.advancedStatLabel}>Total income</Text>
                    <Text style={s.advancedStatValue}>{formatCurrency(incomeTotal, currency)}</Text>
                  </View>

                  <View style={s.advancedStatCard}>
                    <Text style={s.advancedStatLabel}>Total expenses</Text>
                    <Text style={s.advancedStatValue}>{formatCurrency(expenseTotal, currency)}</Text>
                    <Text style={s.advancedStatMeta}>{expenseRatio}% of income</Text>
                  </View>

                  <View style={s.advancedStatCard}>
                    <Text style={s.advancedStatLabel}>Reserved for planned events</Text>
                    <Text style={s.advancedStatValue}>{formatCurrency(plannedExpenses, currency)}</Text>
                    <Text style={s.advancedStatMeta}>{plannedRatio}% of income</Text>
                  </View>

                  <View style={s.advancedStatCard}>
                    <Text style={s.advancedStatLabel}>Allocated to goals</Text>
                    <Text style={s.advancedStatValue}>{formatCurrency(allocatedToGoals, currency)}</Text>
                    <Text style={s.advancedStatMeta}>{savingsGoals.length} active {savingsGoals.length === 1 ? 'goal' : 'goals'}</Text>
                  </View>

                  <View style={[s.advancedStatCard, s.advancedStatCardHighlight]}>
                    <Text style={s.advancedStatLabel}>Available now (after all)</Text>
                    <Text style={[s.advancedStatValue, { color: hatchColors.primary.default }]}>
                      {formatCurrency(afterPlanned, currency)}
                    </Text>
                    <Text style={s.advancedStatMeta}>
                      {incomeTotal > 0 ? Math.round((afterPlanned / incomeTotal) * 100) : 0}% remaining
                    </Text>
                  </View>

                  <Text style={s.advancedStatsTitle}>Entry breakdown</Text>
                  
                  <View style={s.advancedStatCard}>
                    <Text style={s.advancedStatLabel}>Total entries</Text>
                    <Text style={s.advancedStatValue}>{savingsEntries.length}</Text>
                    <Text style={s.advancedStatMeta}>
                      {savingsEntries.filter(e => e.type === 'income').length} income · {savingsEntries.filter(e => e.type === 'expense').length} expenses
                    </Text>
                  </View>

                  {incomeTotal > 0 && (
                    <View style={s.advancedStatCard}>
                      <Text style={s.advancedStatLabel}>Savings rate</Text>
                      <Text style={s.advancedStatValue}>{savedRatio}%</Text>
                      <Text style={s.advancedStatMeta}>
                        {savedRatio >= 20 ? 'Excellent progress! 🎉' : savedRatio >= 10 ? 'Good start! Keep going.' : 'Every little bit helps.'}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={recurringModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRecurringModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Recurring costs</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close recurring costs"
                style={s.modalCloseBtn}
                onPress={() => setRecurringModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={hatchColors.text.secondary} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {upcomingEvents
                .filter((event) => event.recurrence && event.recurrence !== "none")
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((event, index) => {
                  const eventDate = new Date(event.date);
                  const dateStr = eventDate.toLocaleDateString("en-US", { 
                    weekday: "short", 
                    month: "short", 
                    day: "numeric" 
                  });
                  
                  return (
                    <View key={`${event.id}-${index}`} style={s.recurringEventCard}>
                      <View style={s.recurringEventHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={s.recurringEventTitle}>{event.title}</Text>
                          <Text style={s.recurringEventDate}>{dateStr}</Text>
                        </View>
                        <View style={s.recurringEventBadge}>
                          <Ionicons name="repeat" size={12} color={hatchColors.primary.default} />
                          <Text style={s.recurringEventBadgeText}>
                            {event.recurrence}
                          </Text>
                        </View>
                      </View>
                      <Text style={s.recurringEventAmount}>
                        {formatCurrency(event.amount || 0, currency)}
                      </Text>
                    </View>
                  );
                })}
              
              {upcomingEvents.filter((event) => event.recurrence && event.recurrence !== "none").length === 0 && (
                <View style={s.recurringEmptyState}>
                  <Text style={s.recurringEmptyText}>No recurring costs found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MetricCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={{ width: "48%", marginBottom: 8 }}>
      <Text style={s.heroMiniLabel}>{label}</Text>
      <Text style={[s.heroMiniValue, highlight && s.heroMiniValueHighlight]}>{value}</Text>
    </View>
  );
}

function StatBar({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={s.statLabel}>{label}</Text>
      <View style={s.statTrack}><View style={[s.statFill, { width: `${percent}%` }]} /></View>
      <Text style={s.statValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: hatchColors.background.primary },
  stickyHeader: { backgroundColor: hatchColors.background.primary, paddingBottom: 14, zIndex: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 30, fontWeight: "800", color: hatchColors.text.primary },
  subtitle: { marginTop: 4, fontSize: 13, color: hatchColors.text.secondary },
  statsBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: hatchColors.primary.muted },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  heroCard: { borderRadius: 20, backgroundColor: hatchColors.primary.default, padding: 16, marginBottom: 12, ...hatchShadows.md },
  heroLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  heroLabel: { fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.75)", letterSpacing: 0.8 },
  recurringBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recurringBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  heroValue: { marginTop: 4, fontSize: 30, fontWeight: "800", color: "#FFFFFF" },
  heroGrid: { marginTop: 12, flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" },
  heroMiniLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.8)" },
  heroMiniValue: { marginTop: 2, fontSize: 14, fontWeight: "800", color: "#FFFFFF" },
  heroMiniValueHighlight: { fontSize: 16, color: "#FFFFFF", fontWeight: "900" },

  goalHeroCard: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: hatchColors.primary.default,
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginBottom: 12,
    ...hatchShadows.sm,
  },
  goalHeroCardEmpty: {
    backgroundColor: "#FFFFFF",
  },
  goalHeroHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  goalHeroLabel: { fontSize: 10, fontWeight: "800", color: hatchColors.primary.default, letterSpacing: 0.7 },
  goalHeroPercent: { fontSize: 16, fontWeight: "800", color: hatchColors.primary.default },
  goalHeroTitle: { marginTop: 5, fontSize: 20, fontWeight: "800", color: hatchColors.primary.default },
  goalHeroMeta: { marginTop: 3, fontSize: 13, color: hatchColors.primary.default },
  goalHeroTrack: { marginTop: 10, height: 8, borderRadius: 999, backgroundColor: hatchColors.primary.muted, overflow: "hidden" },
  goalHeroFill: { height: "100%", borderRadius: 999, backgroundColor: hatchColors.primary.default },
  goalHeroHint: { marginTop: 8, fontSize: 11, fontWeight: "700", color: hatchColors.primary.default },
  goalAddBtn: {
    borderRadius: 999,
    backgroundColor: hatchColors.primary.default,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  goalAddBtnText: { fontSize: 12, fontWeight: "800", color: "#FFFFFF" },
  goalEmptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginBottom: 6,
  },
  goalEmptyTitle: { fontSize: 15, fontWeight: "800", color: hatchColors.text.primary },
  goalEmptyText: { marginTop: 4, fontSize: 12, color: hatchColors.text.secondary, lineHeight: 18 },
  goalList: { marginBottom: 2 },
  goalRowCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: "#FFFFFF",
    padding: 10,
    marginBottom: 8,
  },
  goalRowHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  goalRowTitle: { fontSize: 14, fontWeight: "800", color: hatchColors.text.primary, flexShrink: 1 },
  goalRowPercent: { fontSize: 13, fontWeight: "800", color: hatchColors.primary.default },
  goalRowMeta: { marginTop: 4, fontSize: 12, color: hatchColors.text.secondary },
  goalRowTrack: { marginTop: 8, height: 7, borderRadius: 999, backgroundColor: hatchColors.background.secondary, overflow: "hidden" },
  goalRowFill: { height: "100%", borderRadius: 999, backgroundColor: hatchColors.primary.default },

  sectionHeader: { marginTop: 6, marginBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 12, fontWeight: "800", color: hatchColors.text.tertiary, textTransform: "uppercase" },
  linkText: { fontSize: 13, fontWeight: "800", color: hatchColors.primary.default },
  emptyText: { fontSize: 13, color: hatchColors.text.tertiary, marginBottom: 8 },

  amountRow: { borderRadius: 12, borderWidth: 1, borderColor: hatchColors.border.default, backgroundColor: hatchColors.background.secondary, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 8 },
  amountSymbol: { fontSize: 19, fontWeight: "800", color: hatchColors.primary.default, marginRight: 6 },
  amountInput: { flex: 1, fontSize: 22, fontWeight: "800", color: hatchColors.text.primary },

  filterRow: { flexDirection: "row", gap: 6 },
  filterChip: { borderRadius: 999, borderWidth: 1, borderColor: hatchColors.border.default, paddingHorizontal: 10, paddingVertical: 5 },
  filterChipActive: { borderColor: hatchColors.primary.default, backgroundColor: hatchColors.primary.muted },
  filterChipText: { fontSize: 12, fontWeight: "700", color: hatchColors.text.secondary, textTransform: "capitalize" },
  filterChipTextActive: { color: hatchColors.primary.default },

  entryRow: { borderRadius: 12, borderWidth: 1, borderColor: hatchColors.border.default, backgroundColor: "#FFFFFF", padding: 10, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 8 },
  entryBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  entryBadgeIncome: { backgroundColor: hatchColors.primary.muted },
  entryBadgeExpense: { backgroundColor: "rgba(239,68,68,0.12)" },
  entryBadgeText: { fontSize: 10, fontWeight: "800" },
  entryBadgeIncomeText: { color: hatchColors.primary.default },
  entryBadgeExpenseText: { color: hatchColors.status.error },
  entryCategory: { fontSize: 14, fontWeight: "700", color: hatchColors.text.primary },
  entryMeta: { marginTop: 2, fontSize: 12, color: hatchColors.text.secondary },
  entryAmount: { fontSize: 14, fontWeight: "800" },
  amountIncome: { color: hatchColors.primary.default },
  amountExpense: { color: hatchColors.status.error },

  advancedToggle: {
    marginTop: 8,
    marginBottom: 6,
    borderRadius: 12,
    backgroundColor: hatchColors.background.secondary,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  detailRow: { borderRadius: 12, borderWidth: 1, borderColor: hatchColors.border.default, backgroundColor: "#FFFFFF", padding: 10, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 8 },
  detailTitle: { fontSize: 14, fontWeight: "700", color: hatchColors.text.primary },
  detailMeta: { marginTop: 2, fontSize: 12, color: hatchColors.text.secondary },

  fab: {
    position: "absolute",
    right: 22,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: hatchColors.primary.default,
    alignItems: "center",
    justifyContent: "center",
    ...hatchShadows.glow,
  },

  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", padding: 18, backgroundColor: "rgba(0,0,0,0.35)" },
  modalCard: { width: "100%", maxWidth: 420, borderRadius: 16, backgroundColor: "#FFFFFF", padding: 14 },
  typeModalCard: { width: "100%", maxWidth: 420, borderRadius: 16, backgroundColor: "#FFFFFF", padding: 14 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: hatchColors.text.primary },
  typeSelectBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  typeSelectTitle: { fontSize: 14, fontWeight: "800", color: hatchColors.text.primary },
  typeSelectMeta: { marginTop: 2, fontSize: 12, color: hatchColors.text.secondary },
  modalLabel: { marginTop: 8, marginBottom: 5, fontSize: 11, fontWeight: "800", color: hatchColors.text.tertiary, textTransform: "uppercase" },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  typeChip: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: hatchColors.border.default, alignItems: "center", paddingVertical: 8 },
  typeChipActive: { borderColor: hatchColors.primary.default, backgroundColor: hatchColors.primary.muted },
  typeChipText: { fontSize: 13, fontWeight: "700", color: hatchColors.text.secondary, textTransform: "capitalize" },
  typeChipTextActive: { color: hatchColors.primary.default },
  categoryWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  categoryChip: { borderRadius: 999, borderWidth: 1, borderColor: hatchColors.border.default, paddingHorizontal: 10, paddingVertical: 6 },
  categoryChipActive: { borderColor: hatchColors.primary.default, backgroundColor: hatchColors.primary.muted },
  categoryText: { fontSize: 12, fontWeight: "700", color: hatchColors.text.secondary },
  categoryTextActive: { color: hatchColors.primary.default },
  input: { borderRadius: 10, borderWidth: 1, borderColor: hatchColors.border.default, backgroundColor: hatchColors.background.secondary, paddingHorizontal: 10, paddingVertical: 9, fontSize: 14, color: hatchColors.text.primary },
  saveBtn: { marginTop: 12, borderRadius: 12, alignItems: "center", paddingVertical: 11, backgroundColor: hatchColors.primary.default },
  saveBtnText: { fontSize: 14, fontWeight: "800", color: "#FFFFFF" },
  deleteBtn: { marginTop: 7, borderRadius: 10, alignItems: "center", paddingVertical: 10, backgroundColor: hatchColors.background.secondary },
  deleteBtnText: { fontSize: 13, fontWeight: "800", color: hatchColors.status.error },

  favoriteToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: hatchColors.background.secondary,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
  },
  favoriteToggleContent: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  favoriteToggleText: { fontSize: 14, fontWeight: "600", color: hatchColors.text.primary },
  favoriteCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: hatchColors.border.default,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: hatchColors.background.primary,
  },
  favoriteCheckboxActive: {
    borderColor: hatchColors.primary.default,
    backgroundColor: hatchColors.primary.default,
  },

  statLabel: { fontSize: 12, fontWeight: "700", color: hatchColors.text.secondary },
  statTrack: { marginTop: 5, height: 8, borderRadius: 999, backgroundColor: hatchColors.background.secondary, overflow: "hidden" },
  statFill: { height: "100%", borderRadius: 999, backgroundColor: hatchColors.primary.default },
  statValue: { marginTop: 4, fontSize: 12, color: hatchColors.text.tertiary },
  statHint: { marginTop: 2, fontSize: 12, color: hatchColors.text.secondary },

  statsTabs: {
    flexDirection: "row",
    backgroundColor: hatchColors.background.secondary,
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  statsTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  statsTabActive: {
    backgroundColor: "#FFFFFF",
    ...hatchShadows.sm,
  },
  statsTabText: {
    fontSize: 13,
    fontWeight: "700",
    color: hatchColors.text.secondary,
  },
  statsTabTextActive: {
    color: hatchColors.text.primary,
  },
  statsContent: {
    maxHeight: 400,
  },
  advancedStatsTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: hatchColors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 12,
  },
  advancedStatCard: {
    backgroundColor: hatchColors.background.secondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
  },
  advancedStatCardHighlight: {
    backgroundColor: hatchColors.primary.muted,
    borderColor: hatchColors.primary.default,
    borderWidth: 2,
  },
  advancedStatLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: hatchColors.text.secondary,
    marginBottom: 4,
  },
  advancedStatValue: {
    fontSize: 24,
    fontWeight: "800",
    color: hatchColors.text.primary,
    marginBottom: 2,
  },
  advancedStatMeta: {
    fontSize: 11,
    fontWeight: "500",
    color: hatchColors.text.tertiary,
  },

  recurringEventCard: {
    backgroundColor: hatchColors.background.secondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
  },
  recurringEventHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8,
  },
  recurringEventTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: hatchColors.text.primary,
    marginBottom: 2,
  },
  recurringEventDate: {
    fontSize: 12,
    fontWeight: "500",
    color: hatchColors.text.secondary,
  },
  recurringEventBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: hatchColors.primary.muted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recurringEventBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: hatchColors.primary.default,
    textTransform: "uppercase",
  },
  recurringEventAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: hatchColors.primary.default,
  },
  recurringEmptyState: {
    padding: 24,
    alignItems: "center",
  },
  recurringEmptyText: {
    fontSize: 14,
    color: hatchColors.text.secondary,
  },
});
