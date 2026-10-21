import * as Haptics from 'expo-haptics';

/**
 * Apple HIG Semantic Haptics Orchestration
 * Provides physical tactile feedback matched to user actions.
 */
export const AppleHaptic = {
  /** 1. Subtle selection tick on book switch / page change / segment slide */
  bookSwitch: async () => {
    try {
      await Haptics.selectionAsync();
    } catch (_) {}
  },

  /** 2. Light impact on chip tap, filter button, or month navigation */
  chipTap: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
  },

  /** 3. Tactile punch tick when entering digits or quick nominal */
  punchTick: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
  },

  /** 4. Medium impact on primary action / crossing swipe action threshold */
  actionMedium: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_) {}
  },

  /** 5. Success notification pulse on saving transaction or restoring backup (Apple Pay style) */
  successSave: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {}
  },

  /** 6. Warning notification pulse on deleting transaction or full-swipe delete */
  warningDelete: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (_) {}
  },
};
