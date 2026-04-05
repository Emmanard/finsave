import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { CATEGORIES } from '../../utils/categories';
import { formatCurrency } from '../../utils/formatCurrency';

interface SpendingBar {
  categoryId: string;
  total: number;
}

interface SpendingChartProps {
  data: SpendingBar[];
  maxHeight?: number;
}

const LABEL_WIDTH = 100;
const VALUE_WIDTH = 72;
const BAR_HEIGHT = 18;
const BAR_GAP = 20;

export function SpendingChart({ data, maxHeight = 200 }: SpendingChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const barAreaWidth = screenWidth - spacing.md * 4 - LABEL_WIDTH - VALUE_WIDTH - spacing.sm;

  const sorted = [...data].sort((a, b) => b.total - a.total).slice(0, 5);

  if (sorted.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="pie-chart-outline" size={36} color={colors.textMuted} />
        <Text style={[typography.body, styles.emptyTitle]}>
          No spending this month yet
        </Text>
        <Text style={[typography.small, styles.emptySubtitle]}>
          Expense entries will break down by category here.
        </Text>
      </View>
    );
  }

  const maxValue = sorted[0].total;

  return (
    <View style={styles.chartCard}>
      {sorted.map((row, index) => {
        const cat = CATEGORIES.find((c) => c.id === row.categoryId);
        const rawLabel = cat?.label ?? row.categoryId;
        const displayLabel = rawLabel.length > 13 ? `${rawLabel.slice(0, 12)}…` : rawLabel;
        const barColor = cat?.color ?? colors.primary;
        const fillRatio = maxValue > 0 ? row.total / maxValue : 0;
        const barWidth = Math.max(fillRatio * barAreaWidth, 4);

        return (
          <View
            key={row.categoryId}
            style={[styles.row, index < sorted.length - 1 && { marginBottom: BAR_GAP }]}
          >
            <Text numberOfLines={1} style={styles.label}>
              {displayLabel}
            </Text>
            <View style={[styles.barTrack, { width: barAreaWidth }]}>
              <View style={[styles.bar, { width: barWidth, backgroundColor: barColor }]} />
            </View>
            <Text numberOfLines={1} style={styles.value}>
              {formatCurrency(row.total)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    width: LABEL_WIDTH,
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'right',
    paddingRight: spacing.sm,
  },
  barTrack: {
    height: BAR_HEIGHT,
    borderRadius: 4,
    backgroundColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  bar: {
    height: BAR_HEIGHT,
    borderRadius: 4,
  },
  value: {
    width: VALUE_WIDTH,
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'right',
    paddingLeft: spacing.xs,
  },
  emptyWrap: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  emptyTitle: {
    color: colors.textMuted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: 280,
  },
});