import { currencies, CurrencyCode, formatCurrency } from "@/constants/currencies";
import { hatchColors, hatchShadows } from "@/constants/theme";
import { useStreak } from "@/hooks/use-streak";
import { useApp } from "@/lib/app-context";
import {
  cancelDailyReminder,
  requestNotificationPermissions,
  scheduleDailyReminder,
} from "@/lib/notifications";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function normalizeReminderTime(value: string): string {
  const digits = value.replace(/[^0-9]/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isValidReminderTime(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function parseReminderTime(value: string): { hour: number; minute: number } | null {
  if (!isValidReminderTime(value)) return null;
  const [hour, minute] = value.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return { hour, minute };
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    userProfile,
    setUserProfile,
    setNotificationSettings,
    completedLessons,
    appliedTips,
    isPremium,
    getTotalSavings,
  } = useApp();
  const streak = useStreak();

  const name = userProfile?.name || "User";
  const initials = name.slice(0, 2).toUpperCase();
  const currency = userProfile?.currency || "EUR";

  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

  const [editName, setEditName] = useState(name);
  const [editReminder, setEditReminder] = useState(userProfile?.reminderTime || "09:00");

  const totalSaved = getTotalSavings();

  const performance = useMemo(
    () => [
      { label: "Net Balance", value: formatCurrency(totalSaved, currency), icon: "wallet" as const },
      { label: "Academy", value: `${completedLessons.length} done`, icon: "school" as const },
      { label: "Tips", value: `${appliedTips.length} applied`, icon: "bulb" as const },
      { label: "Streak", value: `${streak.currentStreak} days`, icon: "flame" as const },
    ],
    [totalSaved, currency, completedLessons.length, appliedTips.length, streak.currentStreak]
  );

  const openEditProfile = () => {
    setEditName(name);
    setProfileModalVisible(true);
  };

  const saveProfile = async () => {
    if (!userProfile) return;

    if (!editName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Name required", "Please enter at least one character for your profile name.");
      return;
    }

    await setUserProfile({
      ...userProfile,
      name: editName.trim(),
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setProfileModalVisible(false);
  };

  const openReminderModal = () => {
    setEditReminder(userProfile?.reminderTime || "09:00");
    setReminderModalVisible(true);
  };

  const saveReminder = async () => {
    if (!userProfile) return;
    const normalized = normalizeReminderTime(editReminder);
    if (!isValidReminderTime(normalized)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Invalid time", "Please use HH:MM in 24-hour format.");
      return;
    }

    const parsed = parseReminderTime(normalized);
    if (!parsed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Invalid time", "Please use HH:MM in 24-hour format.");
      return;
    }

    await setUserProfile({
      ...userProfile,
      reminderTime: normalized,
    });
    await setNotificationSettings({
      enabled: userProfile.notificationsEnabled,
      reminderTime: normalized,
    });

    if (userProfile.notificationsEnabled) {
      const scheduleId = await scheduleDailyReminder(parsed.hour, parsed.minute);
      if (!scheduleId) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert("Reminder update", "The reminder time was saved, but scheduling failed on this device.");
      }
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setReminderModalVisible(false);
  };

  const handleCurrencyChange = async (nextCurrency: CurrencyCode) => {
    if (!userProfile) return;
    await setUserProfile({ ...userProfile, currency: nextCurrency });
    Haptics.selectionAsync();
    setCurrencyModalVisible(false);
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (!userProfile) return;

    if (!value) {
      await cancelDailyReminder();
      await setUserProfile({ ...userProfile, notificationsEnabled: false });
      await setNotificationSettings({
        enabled: false,
        reminderTime: userProfile.reminderTime || "09:00",
      });
      Haptics.selectionAsync();
      return;
    }

    const granted = await requestNotificationPermissions();
    if (!granted) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Notifications disabled",
        "Savvy needs notification permission to send daily reminders."
      );
      await setUserProfile({ ...userProfile, notificationsEnabled: false });
      await setNotificationSettings({
        enabled: false,
        reminderTime: userProfile.reminderTime || "09:00",
      });
      return;
    }

    const reminder = parseReminderTime(userProfile.reminderTime || "09:00");
    if (reminder) {
      const scheduleId = await scheduleDailyReminder(reminder.hour, reminder.minute);
      if (!scheduleId) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          "Reminder setup",
          "Notifications were enabled, but the daily reminder could not be scheduled."
        );
      }
    }

    await setUserProfile({ ...userProfile, notificationsEnabled: true });
    await setNotificationSettings({
      enabled: true,
      reminderTime: userProfile.reminderTime || "09:00",
    });
    Haptics.selectionAsync();
  };

  const handleRate = async () => {
    try {
      await Linking.openURL("https://apps.apple.com");
    } catch {
      Alert.alert("Rating", "The store link could not be opened.");
    }
  };

  const handleFeedback = async () => {
    try {
      await Linking.openURL("mailto:support@savvy.app?subject=Savvy%20Feedback");
    } catch {
      Alert.alert("Feedback", "The mail app could not be opened.");
    }
  };

  return (
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 14,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 20,
        }}
      >
        <Animated.View entering={FadeInDown.duration(300)}>
          <Text style={s.title}>Settings</Text>
          <Text style={s.subtitle}>Everything important in one place.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(40).duration(300)} style={s.profileCard}>
          <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>{name}</Text>
            <Text style={s.profileMeta}>{isPremium ? "Premium" : "Free plan"}</Text>
          </View>
          {!isPremium && (
            <Pressable style={s.upgradeBtn} onPress={() => router.push("/paywall")}> 
              <Text style={s.upgradeBtnText}>Upgrade</Text>
            </Pressable>
          )}
        </Animated.View>

        {!isPremium && (
          <Animated.View entering={FadeInDown.delay(65).duration(300)}>
            <Pressable style={s.premiumCard} onPress={() => router.push("/paywall")}>
              <Text style={s.premiumTag}>PREMIUM PLAN</Text>
              <Text style={s.premiumTitle}>Take control of your life</Text>
              <Text style={s.premiumText}>
                We know how stressful daily life can be. This app is built for brave people doing a lot every day,
                so we keep the premium price intentionally low for a calmer, more organized life.
              </Text>
              <View style={s.premiumCtaRow}>
                <Text style={s.premiumCtaText}>See premium options</Text>
                <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
              </View>
            </Pressable>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(80).duration(300)} style={s.statsGrid}>
          {performance.map((item) => (
            <View key={item.label} style={s.statCard}>
              <Ionicons name={item.icon} size={16} color={hatchColors.primary.default} />
              <Text style={s.statValue}>{item.value}</Text>
              <Text style={s.statLabel}>{item.label}</Text>
            </View>
          ))}
        </Animated.View>

        <Text style={s.sectionTitle}>Account</Text>
        <SettingRow icon="person" label="Edit profile" onPress={openEditProfile} />
        <SettingRow icon="shield" label="Privacy and security" onPress={() => setPrivacyModalVisible(true)} />

        <Text style={s.sectionTitle}>Preferences</Text>
        <SettingRow
          icon="cash"
          label="Primary currency"
          value={`${currencies[currency].symbol} ${currency}`}
          onPress={() => setCurrencyModalVisible(true)}
        />
        <SettingToggle
          icon="notifications"
          label="Daily notifications"
          value={userProfile?.notificationsEnabled ?? true}
          onChange={handleNotificationToggle}
        />
        <SettingRow
          icon="time"
          label="Daily reminder"
          value={userProfile?.reminderTime || "09:00"}
          onPress={openReminderModal}
        />

        <Text style={s.sectionTitle}>Support</Text>
        <SettingRow icon="star" label="Rate Savvy" onPress={handleRate} />
        <SettingRow icon="mail" label="Send feedback" onPress={handleFeedback} />
        <SettingRow icon="information-circle" label="Version" value="1.2.4" />
      </ScrollView>

      <Modal
        visible={profileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Edit profile</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close edit profile"
                style={s.modalCloseBtn}
                onPress={() => setProfileModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={hatchColors.text.secondary} />
              </Pressable>
            </View>

            <Text style={s.modalLabel}>Name</Text>
            <TextInput style={s.input} value={editName} onChangeText={setEditName} maxLength={24} />

            <Pressable style={s.saveBtn} onPress={saveProfile}>
              <Text style={s.saveBtnText}>Save changes</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={reminderModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReminderModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Daily reminder</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close daily reminder"
                style={s.modalCloseBtn}
                onPress={() => setReminderModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={hatchColors.text.secondary} />
              </Pressable>
            </View>

            <Text style={s.modalLabel}>Time (HH:MM)</Text>
            <TextInput
              style={s.input}
              value={editReminder}
              onChangeText={(value) => setEditReminder(normalizeReminderTime(value))}
              maxLength={5}
              keyboardType="number-pad"
              placeholder="09:00"
            />

            <Pressable style={s.saveBtn} onPress={saveReminder}>
              <Text style={s.saveBtnText}>Save reminder</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={currencyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select currency</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close currency selection"
                style={s.modalCloseBtn}
                onPress={() => setCurrencyModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={hatchColors.text.secondary} />
              </Pressable>
            </View>

            {(Object.keys(currencies) as CurrencyCode[]).map((code) => (
              <Pressable key={code} style={s.currencyRow} onPress={() => handleCurrencyChange(code)}>
                <Text style={s.currencyMain}>{currencies[code].symbol} {code}</Text>
                {code === currency && <Ionicons name="checkmark" size={18} color={hatchColors.primary.default} />}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      <Modal
        visible={privacyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Privacy and security</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close privacy and security"
                style={s.modalCloseBtn}
                onPress={() => setPrivacyModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={hatchColors.text.secondary} />
              </Pressable>
            </View>
            <Text style={s.privacyText}>
              Your data stays local on your device and remains editable at any time.
              For support or data questions, contact support directly.
            </Text>
            <Pressable style={s.secondaryBtn} onPress={handleFeedback}>
              <Text style={s.secondaryBtnText}>Contact support</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: any;
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  const content = (
    <View style={s.settingRow}>
      <View style={s.settingIcon}><Ionicons name={icon} size={18} color={hatchColors.primary.default} /></View>
      <Text style={s.settingLabel}>{label}</Text>
      {value ? <Text style={s.settingValue}>{value}</Text> : null}
      {onPress ? <Ionicons name="chevron-forward" size={16} color={hatchColors.text.tertiary} /> : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.8 }]}>
      {content}
    </Pressable>
  );
}

function SettingToggle({
  icon,
  label,
  value,
  onChange,
}: {
  icon: any;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={s.settingRow}>
      <View style={s.settingIcon}><Ionicons name={icon} size={18} color={hatchColors.primary.default} /></View>
      <Text style={s.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: hatchColors.border.default, true: hatchColors.primary.default }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: hatchColors.background.primary },
  title: { fontSize: 30, fontWeight: "800", color: hatchColors.text.primary },
  subtitle: { marginTop: 4, fontSize: 13, color: hatchColors.text.secondary },

  profileCard: {
    marginTop: 12,
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: hatchColors.primary.default,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    ...hatchShadows.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
  profileName: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
  profileMeta: { marginTop: 2, fontSize: 12, color: "rgba(255,255,255,0.82)" },
  upgradeBtn: {
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  upgradeBtnText: { fontSize: 12, fontWeight: "800", color: hatchColors.primary.default },

  premiumCard: {
    borderRadius: 16,
    backgroundColor: hatchColors.primary.default,
    padding: 14,
    marginBottom: 12,
    ...hatchShadows.md,
  },
  premiumTag: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.8,
  },
  premiumTitle: { marginTop: 4, fontSize: 21, fontWeight: "800", color: "#FFFFFF" },
  premiumText: { marginTop: 6, fontSize: 13, lineHeight: 19, color: "rgba(255,255,255,0.9)" },
  premiumCtaRow: {
    marginTop: 10,
    borderRadius: 999,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  premiumCtaText: { fontSize: 12, fontWeight: "800", color: "#FFFFFF" },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    width: "48.8%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: "#FFFFFF",
    padding: 10,
  },
  statValue: { marginTop: 6, fontSize: 14, fontWeight: "800", color: hatchColors.text.primary },
  statLabel: { marginTop: 2, fontSize: 11, color: hatchColors.text.tertiary },

  sectionTitle: {
    marginTop: 8,
    marginBottom: 7,
    fontSize: 12,
    fontWeight: "800",
    color: hatchColors.text.tertiary,
    textTransform: "uppercase",
  },
  settingRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 7,
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: hatchColors.primary.muted,
    marginRight: 10,
  },
  settingLabel: { flex: 1, fontSize: 14, fontWeight: "700", color: hatchColors.text.primary },
  settingValue: { fontSize: 13, color: hatchColors.text.secondary, marginRight: 8 },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 14,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: hatchColors.text.primary },
  modalLabel: {
    marginTop: 7,
    marginBottom: 5,
    fontSize: 11,
    fontWeight: "800",
    color: hatchColors.text.tertiary,
    textTransform: "uppercase",
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: hatchColors.background.secondary,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
    color: hatchColors.text.primary,
  },
  saveBtn: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: hatchColors.primary.default,
    alignItems: "center",
    paddingVertical: 11,
  },
  saveBtnText: { fontSize: 14, fontWeight: "800", color: "#FFFFFF" },
  currencyRow: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 7,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currencyMain: { fontSize: 14, fontWeight: "700", color: hatchColors.text.primary },
  privacyText: {
    fontSize: 14,
    lineHeight: 20,
    color: hatchColors.text.secondary,
    marginBottom: 10,
  },
  secondaryBtn: {
    borderRadius: 10,
    backgroundColor: hatchColors.background.secondary,
    alignItems: "center",
    paddingVertical: 10,
  },
  secondaryBtnText: { fontSize: 13, fontWeight: "800", color: hatchColors.primary.default },
});
