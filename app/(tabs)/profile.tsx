// Savvy Settings Screen — Minimalist White Design — Updated


import { currencies, CurrencyCode, formatCurrency } from "@/constants/currencies";
import { hatchColors, hatchShadows } from "@/constants/theme";
import { useStreak } from "@/hooks/use-streak";
import { useApp } from "@/lib/app-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProfile, setUserProfile, appliedTips, completedLessons, isPremium, getTotalSavings } = useApp();
  const streak = useStreak();

  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  const name = userProfile?.name || "User";
  const currency = userProfile?.currency || "GBP";
  const initials = name.substring(0, 2).toUpperCase();

  const handleCurrencyChange = async (newCurrency: CurrencyCode) => {
    if (userProfile) {
      Haptics.selectionAsync();
      await setUserProfile({ ...userProfile, currency: newCurrency });
      setCurrencyModalVisible(false);
    }
  };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={s.header}>
          <Text style={s.title}>Settings</Text>
          <Text style={s.subtitle}>Personalize your experience</Text>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(800)}>
          <View style={s.profileCard}>
            <View style={s.masteryGradient} />
            <View style={s.profileContent}>
              <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
              <View style={s.profileInfoText}>
                <Text style={s.profileName}>{name}</Text>
                <View style={s.badgeContainer}>
                  <Ionicons name={isPremium ? "star" : "person"} size={12} color="#FFFFFF" />
                  <Text style={s.profileBadge}>{isPremium ? "Premium Member" : "Free Account"}</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Upgrade */}
        {!isPremium && (
          <Animated.View entering={FadeInDown.delay(150).duration(600)}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/paywall"); }} style={({ pressed }) => [s.premiumCardContainer, pressed && s.pressed]}>
              <LinearGradient
                colors={['#0F172A', '#334155']} // Dark premium slate
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.premiumCard}
              >
                <View style={s.premiumContent}>
                  <View style={s.premiumIconCircle}>
                    <Ionicons name="diamond" size={22} color="#10B981" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.premiumLabel}>SAVVY PREMIUM</Text>
                    <Text style={s.premiumTitle}>Unlock Unlimited</Text>
                    <Text style={s.premiumSub}>Get full access to all features</Text>
                  </View>
                  <View style={s.premiumBtn}>
                    <Text style={s.premiumBtnText}>UPGRADE</Text>
                  </View>
                </View>
                {/* Decorative elements */}
                <Ionicons name="diamond" size={140} color="rgba(16, 185, 129, 0.03)" style={{ position: 'absolute', right: -40, bottom: -40, transform: [{ rotate: '-15deg' }] }} />
                <View style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, backgroundColor: '#10B981', opacity: 0.1, borderRadius: 50, transform: [{ translateX: 30 }, { translateY: -30 }] }} />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {/* Stats Grid */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Text style={s.sectionTitle}>YOUR PERFORMANCE</Text>
          <View style={s.statsGrid}>
            <StatsMiniCard label="Total Saved" value={formatCurrency(getTotalSavings(), currency)} icon="wallet" />
            <StatsMiniCard label="Academy" value={`${completedLessons.length + appliedTips.length}`} icon="school" />
            <StatsMiniCard label="Streak" value={`${streak.currentStreak} Days`} icon="flash" />
            <StatsMiniCard label="Plan" value={isPremium ? "PRO" : "FREE"} icon="ribbon" />
          </View>
        </Animated.View>

        {/* Settings Groups */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <Text style={s.sectionTitle}>IDENTITY</Text>
          <SettingRow label="Edit Profile" icon="person" onPress={() => { }} />
          <SettingRow label="Privacy & Security" icon="shield" onPress={() => { }} />

          <Text style={s.sectionTitle}>PREFERENCES</Text>
          <SettingRow
            label="Primary Currency"
            value={`${currencies[currency]?.symbol} ${currency}`}
            icon="cash"
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCurrencyModalVisible(true); }}
          />
          <SettingRowToggle
            label="Daily Notifications"
            value={userProfile?.notificationsEnabled ?? true}
            icon="notifications"
            onValueChange={async (value) => { if (userProfile) { Haptics.selectionAsync(); await setUserProfile({ ...userProfile, notificationsEnabled: value }); } }}
          />

          <Text style={s.sectionTitle}>ABOUT</Text>
          <SettingRow label="Rate Savvy" icon="star" onPress={() => { }} />
          <SettingRow label="Send Feedback" icon="chatbubble" onPress={() => { }} />
          <SettingRow label="Version" value="1.2.4 (Elite)" icon="information-circle" />
        </Animated.View>

        <View style={s.footer}>
          <Text style={s.footerText}>Designed for High Performers</Text>
          <Text style={s.footerTag}>Savvy Finance v1.2.4</Text>
        </View>
      </ScrollView>

      {/* Elite Currency Modal */}
      <Modal visible={currencyModalVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.currencySheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Select Currency</Text>
              <Pressable onPress={() => setCurrencyModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={hatchColors.text.tertiary} />
              </Pressable>
            </View>

            <View style={s.searchBar}>
              <Ionicons name="search" size={18} color={hatchColors.text.tertiary} />
              <Text style={s.searchText}>Search currencies...</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {(Object.keys(currencies) as CurrencyCode[]).map((code) => (
                <Pressable key={code} onPress={() => handleCurrencyChange(code)} style={s.curRow}>
                  <View style={s.curCircle}>
                    <Text style={s.curSymbol}>{currencies[code].symbol}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.curCode}>{code}</Text>
                    <Text style={s.curName}>{currencies[code].name}</Text>
                  </View>
                  {currency === code && (
                    <View style={s.activeIndicator}>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StatsMiniCard({ label, value, icon }: { label: string; value: string; icon: any }) {
  return (
    <View style={s.statCardMini}>
      <View style={s.statMiniIcon}>
        <Ionicons name={icon} size={18} color={hatchColors.primary.default} />
      </View>
      <View>
        <Text style={s.statMiniValue}>{value}</Text>
        <Text style={s.statMiniLabel}>{label}</Text>
      </View>
    </View>
  );
}

function SettingRow({ label, value, icon, onPress }: { label: string; value?: string; icon: any; onPress?: () => void }) {
  const content = (
    <View style={s.settingRow}>
      <View style={s.settingIcon}><Ionicons name={icon} size={20} color={hatchColors.primary.default} /></View>
      <Text style={s.settingLabel}>{label}</Text>
      {value && <Text style={s.settingValue}>{value}</Text>}
      {onPress && <Ionicons name="chevron-forward" size={16} color={hatchColors.primary.default} />}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed ? { opacity: 0.7, transform: [{ scale: 0.98 }] } : null}>
        {content}
      </Pressable>
    );
  }

  return content;
}

function SettingRowToggle({ label, value, icon, onValueChange }: { label: string; value: boolean; icon: any; onValueChange: (v: boolean) => void }) {
  return (
    <View style={s.settingRow}>
      <View style={s.settingIcon}><Ionicons name={icon} size={20} color={hatchColors.primary.default} /></View>
      <Text style={s.settingLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: hatchColors.border.default, true: hatchColors.primary.default }} thumbColor="#FFF" />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { paddingHorizontal: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "800", color: hatchColors.text.primary, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: hatchColors.text.secondary, marginTop: 4 },

  profileCard: {
    backgroundColor: hatchColors.primary.default,
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    overflow: "hidden",
    ...hatchShadows.lg,
  },
  masteryGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
    borderBottomRightRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transform: [{ scale: 2 }, { translateX: 50 }, { translateY: 50 }],
  },
  profileContent: { flexDirection: "row", alignItems: "center", zIndex: 1 },
  avatar: { width: 64, height: 64, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginRight: 20 },
  avatarText: { fontSize: 24, fontWeight: "800", color: "#FFFFFF" },
  profileInfoText: { flex: 1 },
  profileName: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", marginBottom: 4 },
  badgeContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.1)", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  profileBadge: { fontSize: 11, fontWeight: "700", color: "#FFFFFF", marginLeft: 6 },

  premiumCardContainer: {
    marginBottom: 32,
    borderRadius: 24,
    ...hatchShadows.lg,
  },
  premiumCard: {
    borderRadius: 24,
    padding: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    zIndex: 1,
  },
  premiumIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)', // Green border
  },
  premiumLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#34D399', // Brand green light
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  premiumTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  premiumSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    fontWeight: '500',
  },
  premiumBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    ...hatchShadows.sm,
  },
  premiumBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
  },

  sectionTitle: { fontSize: 13, fontWeight: "800", color: hatchColors.text.tertiary, letterSpacing: 1, marginBottom: 16, marginLeft: 4, marginTop: 8 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 32 },
  statCardMini: { width: "47.5%", backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: hatchColors.border.default, ...hatchShadows.sm },
  statMiniIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: hatchColors.background.secondary, alignItems: "center", justifyContent: "center", marginRight: 12 },
  statMiniValue: { fontSize: 14, fontWeight: "800", color: hatchColors.text.primary },
  statMiniLabel: { fontSize: 11, fontWeight: "500", color: hatchColors.text.tertiary, marginTop: 1 },

  // listContainer removed - items are now individual cards
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    ...hatchShadows.sm
  },
  settingIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: hatchColors.background.secondary, alignItems: "center", justifyContent: "center", marginRight: 16 },
  settingLabel: { flex: 1, fontSize: 16, fontWeight: "700", color: hatchColors.text.primary },
  settingValue: { fontSize: 14, fontWeight: "600", color: hatchColors.text.secondary, marginRight: 8 },
  settingRowPressed: { transform: [{ scale: 0.98 }], backgroundColor: hatchColors.background.secondary },

  modeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: hatchColors.border.default, marginBottom: 12, ...hatchShadows.sm },

  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  footer: { alignItems: "center", paddingVertical: 48 },
  footerText: { fontSize: 13, fontWeight: "800", color: hatchColors.primary.default, letterSpacing: 1, textTransform: 'uppercase' },
  footerTag: { fontSize: 11, fontWeight: "600", color: hatchColors.text.tertiary, marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  currencySheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: hatchColors.border.default, alignSelf: 'center', marginBottom: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: hatchColors.text.primary },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: hatchColors.background.secondary, padding: 12, borderRadius: 16, marginBottom: 20, gap: 10 },
  searchText: { fontSize: 14, color: hatchColors.text.tertiary, fontWeight: "600" },

  curRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: hatchColors.border.light },
  curCircle: { width: 44, height: 44, borderRadius: 14, backgroundColor: hatchColors.background.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  curSymbol: { fontSize: 18, fontWeight: "800", color: hatchColors.text.primary },
  curCode: { fontSize: 16, fontWeight: "700", color: hatchColors.text.primary },
  curName: { fontSize: 12, color: hatchColors.text.tertiary, marginTop: 1 },
  activeIndicator: { width: 24, height: 24, borderRadius: 12, backgroundColor: hatchColors.primary.default, alignItems: 'center', justifyContent: 'center' },
});
