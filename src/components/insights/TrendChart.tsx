import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import type { MonthlySummary } from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface TrendChartProps {
  data: MonthlySummary[];
  maxHeight?: number;
}

export function TrendChart({ data, maxHeight = 220 }: TrendChartProps) {
  const width = Math.max(Dimensions.get('window').width - spacing.md * 2, 200);
  const chartWidth = Math.max(data.length * 56, width);

  const incomeBars = data.map((m) => {
    const label = m.month.slice(5, 7);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const idx = Number.parseInt(label, 10) - 1;
    const short = monthNames[idx] ?? label;
    return {
      value: m.income,
      frontColor: colors.success,
      label: short,
    };
  });

  const expenseBars = data.map((m) => {
    const label = m.month.slice(5, 7);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const idx = Number.parseInt(label, 10) - 1;
    const short = monthNames[idx] ?? label;
    return {
      value: m.expenses,
      frontColor: colors.danger,
      label: short,
    };
  });

  const maxVal = Math.max(
    1,
    ...data.map((d) => Math.max(d.income, d.expenses)),
  );

  return (
    <View style={[styles.wrap, { maxHeight }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={{ width: chartWidth }}>
          <BarChart
            stackData={data.map((_, i) => ({
              stacks: [
                { value: incomeBars[i]?.value ?? 0, color: colors.success },
                { value: expenseBars[i]?.value ?? 0, color: colors.danger },
              ],
              label: incomeBars[i]?.label ?? '',
            }))}
            maxValue={maxVal}
            barWidth={24}
            spacing={28}
            noOfSections={4}
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisTextStyle={{ color: colors.textMuted }}
            xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
            rulesColor={colors.border}
            rulesType="solid"
            width={chartWidth}
            height={maxHeight - 40}
            hideYAxisText={false}
            yAxisColor={colors.border}
            xAxisColor={colors.border}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  scroll: {
    paddingBottom: spacing.sm,
  },
});
