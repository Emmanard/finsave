import { format, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import type { MonthlySummary } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface TrendChartProps {
  data: MonthlySummary[];
  maxHeight?: number;
}

const LEGEND_HEIGHT = 40;

/** Space reserved under bars so gifted-charts does not clip x-axis month labels (default extra height is 0). */
const X_AXIS_LABELS_EXTRA = 32;

const STUB = 0.5;

function monthLabelFromKey(monthYyyyMm: string): string {
  return format(parseISO(`${monthYyyyMm}-01`), 'MMM');
}

export function TrendChart({ data, maxHeight = 220 }: TrendChartProps) {
  const { width: screenWidth } = useWindowDimensions();
  const innerWidth = screenWidth - spacing.md * 2;
  const chartWidth = Math.max(data.length * 56, innerWidth);

  const { stackData, xAxisLabelTexts } = useMemo(() => {
    const labels = data.map((m) => monthLabelFromKey(m.month));
    const stacks = data.map((m, i) => ({
      stacks: [
        {
          value: m.income > 0 ? m.income : STUB,
          color: m.income > 0 ? colors.success : 'transparent',
        },
        {
          value: m.expenses > 0 ? m.expenses : STUB,
          color: m.expenses > 0 ? colors.danger : 'transparent',
        },
      ],
      label: labels[i] ?? monthLabelFromKey(m.month),
    }));
    return { stackData: stacks, xAxisLabelTexts: labels };
  }, [data]);

  const barTotals = stackData.map((s) =>
    s.stacks.reduce((sum, st) => sum + st.value, 0),
  );
  const stackPeak = Math.max(1, ...barTotals);

  const chartInnerHeight = Math.max(120, maxHeight - LEGEND_HEIGHT);
  const wrapMaxHeight = maxHeight + X_AXIS_LABELS_EXTRA;

  return (
    <View style={[styles.wrap, { maxHeight: wrapMaxHeight }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.hScroll}
      >
        <View style={{ width: chartWidth }}>
          <BarChart
            stackData={stackData}
            xAxisLabelTexts={xAxisLabelTexts}
            labelsExtraHeight={X_AXIS_LABELS_EXTRA}
            maxValue={stackPeak}
            barWidth={24}
            spacing={28}
            noOfSections={4}
            xAxisThickness={0}
            yAxisThickness={0}
            hideYAxisText
            xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
            rulesColor={colors.border}
            rulesType="solid"
            width={chartWidth}
            height={chartInnerHeight}
            yAxisColor={colors.border}
            xAxisColor={colors.border}
          />
        </View>
      </ScrollView>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={[typography.small, styles.legendText]}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
          <Text style={[typography.small, styles.legendText]}>Expenses</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  hScroll: {
    paddingBottom: spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    height: LEGEND_HEIGHT,
    paddingTop: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
});
