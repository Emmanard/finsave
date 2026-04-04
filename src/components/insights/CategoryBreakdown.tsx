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

export function CategoryBreakdown({
  rows,
  monthTotal,
  maxHeight = 220,
}: CategoryBreakdownProps) {
  const width = Dimensions.get('window').width - spacing.md * 2;
  const pieData = rows.map((r) => ({
    value: r.total,
    color: r.category.color,
    text: r.category.label,
  }));

  if (pieData.length === 0) {
    return <View style={{ height: maxHeight }} />;
  }

  return (
    <View style={[styles.wrap, { maxHeight }]}>
      <PieChart
        data={pieData}
        donut
        showText={false}
        radius={Math.min(90, width / 2 - 16)}
        innerRadius={55}
        innerCircleColor={colors.background}
        centerLabelComponent={() => (
          <View style={styles.centerLabel}>
            <Text style={[typography.small, styles.centerMuted]} numberOfLines={1}>
              Total
            </Text>
            <Text style={[typography.h3, styles.centerAmount]} numberOfLines={1}>
              {formatCurrency(monthTotal)}
            </Text>
          </View>
        )}
      />
      <View style={styles.legend}>
        {rows.map((r) => (
          <View key={r.category.id} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: r.category.color }]} />
            <Text style={[typography.small, styles.legendName]} numberOfLines={1}>
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
    gap: spacing.md,
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 120,
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
    gap: spacing.sm,
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
    color: colors.textMuted,
  },
});
