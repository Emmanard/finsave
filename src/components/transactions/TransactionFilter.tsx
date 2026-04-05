import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export type FilterKey = 'all' | 'income' | 'expense';

interface TransactionFilterProps {
  active: FilterKey;
  onChange: (key: FilterKey) => void;
}

const OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'income', label: 'Income' },
  { key: 'expense', label: 'Expense' },
];

export function TransactionFilter({ active, onChange }: TransactionFilterProps) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {OPTIONS.map((opt) => {
          const selected = opt.key === active;
          return (
            <Pressable
              key={opt.key}
              accessibilityRole="button"
              onPress={() => {
                onChange(opt.key);
              }}
              style={[styles.chip, selected && styles.chipActive]}
            >
              <Text
                style={[
                  typography.small,
                  styles.chipText,
                  selected && styles.chipTextActive,
                ]}
                numberOfLines={1}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.white,
  },
});
