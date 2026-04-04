import { Dimensions, StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { CATEGORIES } from '../../utils/categories';

interface SpendingBar {
  categoryId: string;
  total: number;
}

interface SpendingChartProps {
  data: SpendingBar[];
  maxHeight?: number;
}

export function SpendingChart({ data, maxHeight = 200 }: SpendingChartProps) {
  const width = Dimensions.get('window').width - spacing.md * 2;
  const sorted = [...data].sort((a, b) => b.total - a.total).slice(0, 5);
  if (sorted.length === 0) {
    return <View style={{ height: maxHeight }} />;
  }

  const barData = sorted.map((row) => {
    const cat = CATEGORIES.find((c) => c.id === row.categoryId);
    return {
      value: row.total,
      frontColor: cat?.color ?? colors.primary,
      label: (cat?.label ?? row.categoryId).slice(0, 10),
    };
  });

  const maxValue = Math.max(...barData.map((b) => b.value), 1);

  return (
    <View style={[styles.wrap, { maxHeight }]}>
      <BarChart
        horizontal
        data={barData}
        maxValue={maxValue}
        barWidth={18}
        spacing={14}
        noOfSections={4}
        yAxisLabelWidth={110}
        xAxisThickness={0}
        yAxisThickness={0}
        yAxisTextStyle={{ color: colors.textMuted }}
        xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
        rulesColor={colors.border}
        rulesType="solid"
        width={width}
        height={maxHeight - 20}
        hideYAxisText={false}
        yAxisColor={colors.border}
        xAxisColor={colors.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
});
