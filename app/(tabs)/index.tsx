import { format } from 'date-fns';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GoalProgressMini, GoalPromptCard } from '../../src/components/dashboard/GoalProgressMini';
import { SpendingChart } from '../../src/components/dashboard/SpendingChart';
import { SummaryCard } from '../../src/components/dashboard/SummaryCard';
import { TransactionItem } from '../../src/components/transactions/TransactionItem';
import { useGoalStore } from '../../src/stores/goalStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { colors } from '../../src/theme/colors';
import { spacing, TAB_BAR_HEIGHT } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { useGoals } from '../../src/hooks/useGoals';
import { useTransactions } from '../../src/hooks/useTransactions';
import { formatCurrency } from '../../src/utils/formatCurrency';

function periodForHour(h: number): string {
  if (h < 12) {
    return 'morning';
  }
  if (h < 17) {
    return 'afternoon';
  }
  return 'evening';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const displayName = useProfileStore((s) => s.displayName);
  const goals = useGoalStore((s) => s.goals);
  const { currentMonthGoal, goalProgress } = useGoals();
  const { totalIncome, totalExpenses, balance, byCategory, recentFive, weeklySpendingComparison } =
    useTransactions();

  const weekComparison = weeklySpendingComparison();

  const monthKey = format(new Date(), 'yyyy-MM');

  const expenseByCat = useMemo(
    () =>
      byCategory('expense', monthKey).map((r) => ({
        categoryId: r.category,
        total: r.total,
      })),
    [byCategory, monthKey],
  );

  const recentThree = useMemo(() => recentFive().slice(0, 3), [recentFive]);

  const recentTightLayout = recentThree.length < 3;

  const goal = currentMonthGoal(goals);
  const progress = goal ? goalProgress(goal) : null;

  const hour = new Date().getHours();
  const period = periodForHour(hour);

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
        <View style={styles.headerRow}>
          <Text style={styles.logo}>
            <Text style={styles.logoFin}>Fin</Text>
            <Text style={styles.logoSave}>save</Text>
          </Text>
          <Text style={[typography.body, styles.greeting]} numberOfLines={2}>
            Good {period}, {displayName} 👋{'\n'}
            <Text style={styles.monthLine}>{format(new Date(), 'MMMM yyyy')}</Text>
          </Text>
        </View>

        <View style={styles.row3}>
          <SummaryCard
            label="Balance"
            amount={formatCurrency(balance(monthKey))}
            amountColor={colors.text}
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

        <View
          style={[styles.spendingSection, recentTightLayout && styles.spendingSectionTight]}
        >
          <Text style={[typography.h3, styles.spendingHeading]}>This month&apos;s spending</Text>
          <SpendingChart data={expenseByCat} maxHeight={200} />
          {weekComparison ? (
            <Text style={[typography.small, styles.weekComparison]}>
              {weekComparison}
            </Text>
          ) : null}
          {recentThree.length === 0 ? (
            <View style={styles.recentEmpty}>
              <Ionicons name="receipt-outline" size={28} color={colors.textMuted} />
              <Text style={[typography.small, styles.recentEmptyText]}>
                No recent transactions. Tap + to add one.
              </Text>
            </View>
          ) : (
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
          )}
        </View>
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
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  greeting: {
    flex: 1,
    color: colors.text,
    textAlign: 'right',
  },
  monthLine: {
    color: colors.textMuted,
    ...typography.small,
  },
  row3: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    minWidth: 0,
  },
  section: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionTight: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  spendingSection: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  spendingSectionTight: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  spendingHeading: {
    color: colors.text,
  },
  weekComparison: {
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  recent: {
    gap: spacing.xs,
  },
  recentEmpty: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  recentEmptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
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
});
