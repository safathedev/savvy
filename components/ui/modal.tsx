// Hatch-Inspired Modal Component for Savvy
// Based on Hatch Sleep iOS: centered alert-style modals with dark backgrounds

import { hatchColors, hatchRadius, hatchSpacing, hatchTypography } from "@/constants/theme";
import { useHaptics } from "@/hooks/use-haptics";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Modal as RNModal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  const haptics = useHaptics();

  const handleClose = () => {
    haptics.light();
    onClose();
  };

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
              <View style={styles.modal}>
                {title && <Text style={styles.title}>{title}</Text>}
                <View style={styles.content}>{children}</View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

// Alert Modal - Hatch-style centered alert with actions
interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  primaryAction: { label: string; onPress: () => void };
  secondaryAction?: { label: string; onPress: () => void };
  destructive?: boolean;
}

export function AlertModal({ visible, title, message, primaryAction, secondaryAction, destructive = false }: AlertModalProps) {
  const haptics = useHaptics();

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={secondaryAction?.onPress}>
      <View style={styles.overlay}>
        <View style={styles.alertModal}>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <View style={styles.alertActions}>
            {secondaryAction && (
              <TouchableOpacity style={styles.alertSecondaryButton} onPress={() => { haptics.light(); secondaryAction.onPress(); }}>
                <Text style={styles.alertSecondaryText}>{secondaryAction.label}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.alertPrimaryButton, destructive && styles.alertDestructiveButton]}
              onPress={() => { haptics.medium(); primaryAction.onPress(); }}
            >
              <Text style={[styles.alertPrimaryText, destructive && styles.alertDestructiveText]}>{primaryAction.label}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
}

// Success Modal - Hatch-style success confirmation
interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
}

export function SuccessModal({ visible, title, message, onDismiss }: SuccessModalProps) {
  const haptics = useHaptics();

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.alertModal}>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <TouchableOpacity style={styles.alertPrimaryButton} onPress={() => { haptics.light(); onDismiss(); }}>
            <Text style={styles.alertPrimaryText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: hatchColors.overlay.dark,
    justifyContent: "center",
    alignItems: "center",
    padding: hatchSpacing.screenPadding,
  },
  modal: {
    backgroundColor: hatchColors.background.secondary,
    borderRadius: hatchRadius["2xl"],
    padding: hatchSpacing[6],
    width: "100%",
    maxWidth: 340,
  },
  title: {
    fontSize: hatchTypography.fontSize.xl,
    fontWeight: hatchTypography.fontWeight.bold,
    color: hatchColors.text.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  content: {},

  // Alert Modal
  alertModal: {
    backgroundColor: hatchColors.background.secondary,
    borderRadius: hatchRadius["2xl"],
    padding: hatchSpacing[6],
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  alertTitle: {
    fontSize: hatchTypography.fontSize.xl,
    fontWeight: hatchTypography.fontWeight.bold,
    color: hatchColors.text.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: hatchTypography.fontSize.base,
    color: hatchColors.text.secondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  alertActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  alertSecondaryButton: {
    flex: 1,
    backgroundColor: hatchColors.background.card,
    borderRadius: hatchRadius["3xl"],
    paddingVertical: 14,
    alignItems: "center",
  },
  alertSecondaryText: {
    fontSize: hatchTypography.fontSize.md,
    fontWeight: hatchTypography.fontWeight.semibold,
    color: hatchColors.text.primary,
  },
  alertPrimaryButton: {
    flex: 1,
    backgroundColor: hatchColors.primary.default,
    borderRadius: hatchRadius["3xl"],
    paddingVertical: 14,
    alignItems: "center",
  },
  alertPrimaryText: {
    fontSize: hatchTypography.fontSize.md,
    fontWeight: hatchTypography.fontWeight.semibold,
    color: hatchColors.text.inverse,
  },
  alertDestructiveButton: {
    backgroundColor: "transparent",
  },
  alertDestructiveText: {
    color: hatchColors.accent.coral,
  },
});
