import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { InputField } from '../../src/components/ui/InputField';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { useGoalStore } from '../../src/stores/goalStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { colors } from '../../src/theme/colors';
import { radius, spacing, TAB_BAR_HEIGHT } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { formatCurrency } from '../../src/utils/formatCurrency';
import { restoreDemoData } from '../../src/utils/seed';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const displayName = useProfileStore((s) => s.displayName);
  const saveProfile = useProfileStore((s) => s.save);
  const clearAllTransactions = useTransactionStore((s) => s.clearAll);
  const fetchTransactions = useTransactionStore((s) => s.fetchAll);
  const fetchGoals = useGoalStore((s) => s.fetchAll);
  const { totalIncome, totalExpenses, balance } = useTransactions();

  const monthKey = format(new Date(), 'yyyy-MM');
  const incomeVal = totalIncome(monthKey);
  const expenseVal = totalExpenses(monthKey);
  const savingsVal = balance(monthKey);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(displayName);
  const commitOnce = useRef(false);

  useEffect(() => {
    if (!editing) {
      setDraft(displayName);
    }
  }, [displayName, editing]);

  const commitName = useCallback(async () => {
    if (commitOnce.current) {
      return;
    }
    commitOnce.current = true;
    try {
      const next = draft.trim().length === 0 ? 'You' : draft.trim();
      await saveProfile(next);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditing(false);
    } finally {
      setTimeout(() => {
        commitOnce.current = false;
      }, 400);
    }
  }, [draft, saveProfile]);

  const savingsColor =
    savingsVal > 0
      ? colors.success
      : savingsVal < 0
        ? colors.danger
        : colors.text;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xl,
        }}
      >
        <ScreenHeader title="Profile" />

        <View style={styles.identityColumn}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {displayName === 'You' ? (
                <Ionicons name="person" size={36} color={colors.white} />
              ) : (
                <Text style={styles.avatarLetter}>
                  {displayName[0]?.toUpperCase() ?? '?'}
                </Text>
              )}
            </View>
          </View>

          {!editing ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setDraft(displayName);
                setEditing(true);
              }}
              style={styles.namePressable}
            >
              <Text style={styles.nameText}>{displayName}</Text>
            </Pressable>
          ) : (
            <InputField
              value={draft}
              onChangeText={setDraft}
              autoFocus
              returnKeyType="done"
              onBlur={() => {
                void commitName();
              }}
              onSubmitEditing={() => {
                void commitName();
              }}
              containerStyle={styles.nameInputContainer}
              style={styles.nameInputText}
            />
          )}
          <Text style={styles.hint}>Tap your name to edit</Text>
        </View>

        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>INCOME</Text>
            <Text style={styles.chipValue}>{formatCurrency(incomeVal)}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>EXPENSES</Text>
            <Text style={styles.chipValue}>{formatCurrency(expenseVal)}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>SAVINGS</Text>
            <Text style={[styles.chipValue, { color: savingsColor }]}>
              {formatCurrency(savingsVal)}
            </Text>
          </View>
        </View>

        <Text style={styles.prefSectionTitle}>Preferences</Text>
        <View style={styles.prefRow}>
          <Text style={styles.prefLeft}>Currency</Text>
          <Text style={styles.prefRight}>₹ Indian Rupee</Text>
        </View>
        <View style={styles.prefRow}>
          <Text style={styles.prefLeft}>Theme</Text>
          <Text style={styles.prefRight}>Dark</Text>
        </View>
        <View style={styles.prefRow}>
          <Text style={styles.prefLeft}>Data</Text>
          <Text style={styles.prefRight}>Local (offline)</Text>
        </View>
        <View style={styles.actionButtonsWrap}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              Alert.alert(
                'Clear all transactions?',
                'This removes every income and expense from this device. Goals are not deleted.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear all',
                    style: 'destructive',
                    onPress: () => {
                      void clearAllTransactions();
                    },
                  },
                ],
              );
            }}
            style={({ pressed }) => [styles.clearRow, pressed && styles.clearRowPressed]}
          >
            <Text style={styles.clearRowText}>Clear all transactions</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              Alert.alert(
                'Load demo data?',
                'For testing and screenshots: this clears all transactions and loads sample income and expenses across the last 3 months, plus a savings goal for each of those months. New users normally start with an empty ledger.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Restore',
                    onPress: () => {
                      void (async () => {
                        try {
                          await restoreDemoData();
                          await fetchTransactions();
                          await fetchGoals();
                          await Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Success,
                          );
                        } catch {
                          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                        }
                      })();
                    },
                  },
                ],
              );
            }}
            style={({ pressed }) => [styles.restoreRow, pressed && styles.restoreRowPressed]}
          >
            <Text style={styles.restoreRowText}>Load demo data</Text>
          </Pressable>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appInfoLine}>Finsave v1.0.0</Text>
          <Text style={[styles.appInfoLine, styles.appInfoGap]}>
            Built with Expo 51 + React Native
          </Text>
          <Text style={[styles.appInfoHeart, styles.appInfoGap]}>Made with ♥</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  identityColumn: {
    width: '100%',
    alignItems: 'center',
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '700',
  },
  namePressable: {
    width: '100%',
    alignItems: 'center',
  },
  nameText: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    width: '100%',
  },
  nameInputContainer: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  nameInputText: {
    textAlign: 'center',
  },
  hint: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
    width: '100%',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  chip: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    minWidth: '28%',
    flexGrow: 1,
  },
  chipLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  chipValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  prefSectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  prefLeft: {
    ...typography.body,
    color: colors.text,
  },
  prefRight: {
    ...typography.body,
    color: colors.textMuted,
  },
  actionButtonsWrap: {
    marginTop: spacing.sm,
    gap: spacing.lg,
  },
  clearRow: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
  },
  clearRowPressed: {
    opacity: 0.85,
  },
  clearRowText: {
    ...typography.body,
    color: colors.danger,
    fontWeight: '600',
  },
  restoreRow: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  restoreRowPressed: {
    opacity: 0.85,
  },
  restoreRowText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  appInfo: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  appInfoLine: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
  },
  appInfoGap: {
    marginTop: spacing.xs,
  },
  appInfoHeart: {
    ...typography.small,
    color: colors.primary,
    textAlign: 'center',
  },
});
