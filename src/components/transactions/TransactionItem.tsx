import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Transaction } from '../../types';
import { CATEGORIES } from '../../utils/categories';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDisplayDate } from '../../utils/formatDate';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface TransactionItemProps {
  transaction: Transaction;
  onPress: () => void;
  onLongPress: () => void;
}

export function TransactionItem({ transaction, onPress, onLongPress }: TransactionItemProps) {
  const cat = CATEGORIES.find((c) => c.id === transaction.category);
  const iconName = (cat?.icon ?? 'ellipse-outline') as keyof typeof Ionicons.glyphMap;
  const label = cat?.label ?? transaction.category;
  const amountColor = transaction.type === 'income' ? colors.success : colors.danger;
  const notes =
    transaction.notes.trim().length > 0 ? transaction.notes : '—';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${cat?.color ?? colors.textMuted}33` }]}>
        <Ionicons name={iconName} size={18} color={cat?.color ?? colors.textMuted} />
      </View>
      <View style={styles.mid}>
        <Text style={[typography.body, styles.label]} numberOfLines={1} ellipsizeMode="tail">
          {label}
        </Text>
        <Text style={[typography.small, styles.notes]} numberOfLines={1} ellipsizeMode="tail">
          {notes}
        </Text>
        <Text style={[typography.small, styles.date]} numberOfLines={1}>
          {formatDisplayDate(transaction.date)}
        </Text>
      </View>
      <Text style={[typography.body, styles.amount, { color: amountColor }]} numberOfLines={1}>
        {transaction.type === 'expense' ? '−' : '+'}
        {formatCurrency(transaction.amount)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mid: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
  },
  notes: {
    color: colors.textMuted,
    marginTop: 2,
  },
  date: {
    color: colors.textDisabled,
    marginTop: 2,
  },
  amount: {
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
});
