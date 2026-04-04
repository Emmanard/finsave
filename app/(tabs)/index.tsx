import { format } from 'date-fns';
import { router } from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GoalProgressMini, GoalPromptCard } from '../../src/components/dashboard/GoalProgressMini';
import { SpendingChart } from '../../src/components/dashboard/SpendingChart';
import { SummaryCard } from '../../src/components/dashboard/SummaryCard';
import { TransactionItem } from '../../src/components/transactions/TransactionItem';
import { useGoalStore } from '../../src/stores/goalStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { colors } from '../../src/theme/colors';
import { spacing, TAB_BAR_HEIGHT } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { useGoals } from '../../src/hooks/useGoals';
import { useTransactions } from '../../src/hooks/useTransactions';
import { formatCurrency } from '../../src/utils/formatCurrency';

function greetingForHour(h: number): string {
  if (h < 12) {
    return 'Good morning';
  }
  if (h < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const displayName = useProfileStore((s) => s.displayName);
  const goals = useGoalStore((s) => s.goals);
  const txLoading = useTransactionStore((s) => s.isLoading);
  const txError = useTransactionStore((s) => s.error);
  const { currentMonthGoal, goalProgress } = useGoals();
  const { totalIncome, totalExpenses, balance, byCategory, recentFive } = useTransactions();

  const monthKey = format(new Date(), 'yyyy-MM');
  const monthLabel = format(new Date(), 'MMMM yyyy');

  const expenseByCat = useMemo(
    () =>
      byCategory('expense', monthKey).map((r) => ({
        categoryId: r.category,
        total: r.total,
      })),
    [byCategory, monthKey],
  );

  const recentThree = useMemo(() => recentFive().slice(0, 3), [recentFive]);

  const goal = currentMonthGoal(goals);
  const progress = goal ? goalProgress(goal) : null;

  const greeting = greetingForHour(new Date().getHours());
  const namePart = displayName === 'You' ? 'You' : displayName;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom,
        }}
      >
        <View style={styles.headerRow}>
          <Text style={styles.logo}>
            <Text style={styles.logoFin}>Fin</Text>
            <Text style={styles.logoSave}>save</Text>
          </Text>
          <Text style={[typography.body, styles.greeting]} numberOfLines={2}>
            {greeting}, {namePart} 👋{'\n'}
            <Text style={styles.subMuted}>{monthLabel}</Text>
          </Text>
        </View>

        {txError ? (
          <Text style={styles.inlineError}>{txError}</Text>
        ) : null}

        <View style={styles.row3}>
          <SummaryCard
            label="Balance"
            amount={formatCurrency(balance(monthKey))}
            amountColor={colors.white}
          />
          <SummaryCard
            label="Income"
            amount={formatCurrency(totalIncome(monthKey))}
            amountColor={colors.success}
            onPress={() => router.push('/(tabs)/transactions?type=income')}
          />
          <SummaryCard
            label="Expenses"
            amount={formatCurrency(totalExpenses(monthKey))}
            amountColor={colors.danger}
            onPress={() => router.push('/(tabs)/transactions?type=expense')}
          />
        </View>

        <View style={styles.section}>
          {goal && progress ? (
            <GoalProgressMini title={goal.title} target={goal.target} progress={progress} />
          ) : (
            <GoalPromptCard />
          )}
        </View>

        <View style={styles.section}>
          <Text style={[typography.h3, styles.sectionTitle]}>This month&apos;s spending</Text>
          <SpendingChart data={expenseByCat} maxHeight={200} />
          <View style={styles.recent}>
            {recentThree.map((t) => (
              <TransactionItem
                key={t.id}
                transaction={t}
                onPress={() => router.push(`/transaction/${t.id}`)}
                onLongPress={() => {}}
              />
            ))}
          </View>
        </View>

        {txLoading ? (
          <Text style={styles.mutedSmall}>Refreshing…</Text>
        ) : null}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/transaction/add')}
        style={({ pressed }) => [
          styles.fab,
          { bottom: TAB_BAR_HEIGHT + insets.bottom + spacing.md },
          pressed && { opacity: 0.9 },
        ]}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
  },
  logoFin: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  logoSave: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  greeting: {
    flex: 1,
    color: colors.text,
    textAlign: 'right',
  },
  subMuted: {
    color: colors.textMuted,
    ...typography.small,
  },
  row3: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    marginBottom: spacing.sm,
  },
  recent: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  inlineError: {
    ...typography.small,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  mutedSmall: {
    ...typography.small,
    color: colors.textMuted,
  },
});
