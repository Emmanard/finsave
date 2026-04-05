import { format } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CategoryBreakdown } from '../../src/components/insights/CategoryBreakdown';
import { TrendChart } from '../../src/components/insights/TrendChart';
import { Card } from '../../src/components/ui/Card';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ScreenHeader } from '../../src/components/ui/ScreenHeader';
import { useInsights } from '../../src/hooks/useInsights';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { useTransactions } from '../../src/hooks/useTransactions';
import { colors } from '../../src/theme/colors';
import { radius, spacing, TAB_BAR_HEIGHT } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { formatCurrency } from '../../src/utils/formatCurrency';

function truncate8(label: string): string {
  return label.length > 8 ? `${label.slice(0, 8)}…` : label;
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const transactions = useTransactionStore((s) => s.transactions);
  const fetchAll = useTransactionStore((s) => s.fetchAll);
  const {
    topSpendingCategory,
    weeklyComparison,
    monthlyTrend,
    categoryBreakdown,
    insightSentences,
  } = useInsights();
  const { totalExpenses } = useTransactions();

  const monthKey = format(new Date(), 'yyyy-MM');

  useFocusEffect(
    useCallback(() => {
      void fetchAll();
    }, [fetchAll]),
  );

  const trendData = monthlyTrend(6);
  const breakdownRows = categoryBreakdown(monthKey);
  const monthExpenseTotal = totalExpenses(monthKey);
  const sentences = insightSentences(monthKey);
  const topCat = topSpendingCategory(monthKey);
  const weekly = weeklyComparison();

  if (transactions.length === 0) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.headerPad}>
          <ScreenHeader title="Insights" />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              flexGrow: 1,
              paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xl,
            },
          ]}
        >
          <View style={styles.insightsEmptyWrap}>
            <EmptyState
              icon={<Ionicons name="bar-chart-outline" size={48} color={colors.textMuted} />}
              title="No data yet"
              subtitle="Add transactions to see your spending insights — your patterns will appear here once you log some spending"
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  const changePctRounded = Math.round(weekly.changePercent);
  const arrow =
    weekly.direction === 'up' ? '↑' : weekly.direction === 'down' ? '↓' : '→';
  const weekTrendColor =
    weekly.direction === 'up'
      ? colors.danger
      : weekly.direction === 'down'
        ? colors.success
        : colors.textMuted;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.headerPad}>
        <ScreenHeader title="Insights" />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        stickyHeaderIndices={[0, 2, 4, 6]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xl },
        ]}
      >
        <View style={[styles.stickyTitle, styles.stickyTitleFirst]}>
          <Text style={[typography.h3, styles.sectionHeadingText]}>This Month at a Glance</Text>
        </View>

        <View style={styles.glanceRow}>
          <Card style={styles.glanceCard}>
            {topCat ? (
              <>
                <Ionicons
                  name={topCat.category.icon as keyof typeof Ionicons.glyphMap}
                  size={22}
                  color={topCat.category.color}
                />
                <Text style={[typography.small, styles.glanceLabel]} numberOfLines={1}>
                  {truncate8(topCat.category.label)}
                </Text>
                <Text style={[typography.body, styles.glanceAmount]} numberOfLines={1}>
                  {formatCurrency(topCat.total)}
                </Text>
                <Text style={[typography.small, styles.glanceMeta]} numberOfLines={1}>
                  {Math.round(topCat.percentage)}% of spending
                </Text>
              </>
            ) : (
              <Text style={[typography.body, styles.placeholder]}>No expenses yet</Text>
            )}
          </Card>
          <Card style={styles.glanceCard}>
            <Text style={[typography.small, styles.weekLabel]}>This week vs last week</Text>
            <Text style={[typography.body, styles.glanceAmount]} numberOfLines={1}>
              {formatCurrency(weekly.thisWeek)}
            </Text>
            <Text style={[typography.body, { color: weekTrendColor }]} numberOfLines={1}>
              {arrow} {changePctRounded}%
            </Text>
            <Text style={[typography.small, styles.glanceMeta]} numberOfLines={1}>
              {formatCurrency(weekly.lastWeek)} last week
            </Text>
          </Card>
        </View>

        <View style={styles.stickyTitle}>
          <Text style={[typography.h3, styles.sectionHeadingText]}>Income vs Expenses</Text>
        </View>
        <TrendChart data={trendData} maxHeight={220} />

        <View style={styles.stickyTitle}>
          <Text style={[typography.h3, styles.sectionHeadingText]}>Where Your Money Goes</Text>
        </View>
        <CategoryBreakdown rows={breakdownRows} monthTotal={monthExpenseTotal} maxHeight={220} />

        <View style={styles.stickyTitle}>
          <Text style={[typography.h3, styles.sectionHeadingText]}>Insights</Text>
        </View>
        <View style={styles.insightList}>
          {sentences.map((line, i) => (
            <View key={`ins-${i}`} style={styles.insightCard}>
              <Ionicons name="bulb-outline" size={18} color={colors.primary} style={styles.bulb} />
              <Text style={[typography.body, styles.insightText]}>{line}</Text>
            </View>
          ))}
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
  headerPad: {
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  insightsEmptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyTitle: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  stickyTitleFirst: {
    marginTop: 0,
  },
  sectionHeadingText: {
    color: colors.text,
  },
  glanceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    minHeight: 120,
  },
  glanceCard: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  glanceLabel: {
    color: colors.textMuted,
  },
  glanceAmount: {
    color: colors.text,
    fontWeight: '700',
  },
  glanceMeta: {
    color: colors.textMuted,
  },
  weekLabel: {
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  placeholder: {
    color: colors.textMuted,
  },
  insightList: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  bulb: {
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    color: colors.text,
  },
});
