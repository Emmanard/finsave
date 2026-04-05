import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import type { Category } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/formatCurrency';

interface Row {
  category: Category;
  total: number;
  percentage: number;
}

interface CategoryBreakdownProps {
  rows: Row[];
  monthTotal: number;
  maxHeight?: number;
}

function formatCenterTotal(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 1000).toFixed(0)}k`;
  }
  if (amount >= 10000) {
    return `₹${Math.round(amount / 1000)}k`;
  }
  return formatCurrency(amount);
}

export function CategoryBreakdown({
  rows,
  monthTotal,
  maxHeight = 220,
}: CategoryBreakdownProps) {
  const fullWidth = Dimensions.get('window').width - spacing.md * 2;
  const radius = Math.min(90, fullWidth / 2 - 24);
  const innerRadius = 55;

  const pieData = rows.map((r) => ({
    value: r.total,
    color: r.category.color,
    text: r.category.label,
  }));

  if (pieData.length === 0) {
    return (
      <View style={[styles.wrap, { maxHeight, height: maxHeight, marginBottom: spacing.xl }]} />
    );
  }

  return (
    <View style={[styles.wrap, { maxHeight, marginBottom: spacing.xl }]}>
      <PieChart
        data={pieData}
        donut
        showText={false}
        radius={radius}
        innerRadius={innerRadius}
        innerCircleColor={colors.background}
        centerLabelComponent={() => (
          <View style={styles.centerLabel}>
            <Text style={[typography.small, styles.centerMuted]} numberOfLines={1}>
              Total
            </Text>
            <Text style={[typography.h3, styles.centerAmount]} numberOfLines={1} adjustsFontSizeToFit>
              {formatCenterTotal(monthTotal)}
            </Text>
          </View>
        )}
      />
      <View style={styles.legend}>
        {rows.map((r) => (
          <View key={r.category.id} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: r.category.color }]} />
            <Text style={[typography.small, styles.legendName]} numberOfLines={2}>
              {r.category.label}
            </Text>
            <Text style={[typography.small, styles.legendAmt]} numberOfLines={1}>
              {formatCurrency(r.total)} · {Math.round(r.percentage)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.sm,
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 160,
    paddingHorizontal: spacing.xs,
  },
  centerMuted: {
    color: colors.textMuted,
  },
  centerAmount: {
    color: colors.text,
    marginTop: 2,
  },
  legend: {
    width: '100%',
    gap: spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    flex: 1,
    color: colors.text,
    minWidth: 0,
  },
  legendAmt: {
    flexShrink: 0,
    color: colors.textMuted,
  },
});
