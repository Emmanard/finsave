import { parseISO } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TransactionEditor } from '../../src/components/transactions/TransactionEditor';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';

export default function EditTransactionScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const id = Number.parseInt(idParam ?? '', 10);
  const transactions = useTransactionStore((s) => s.transactions);
  const isLoading = useTransactionStore((s) => s.isLoading);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);

  const transaction = useMemo(
    () => (Number.isFinite(id) ? transactions.find((t) => t.id === id) : undefined),
    [transactions, id],
  );

  if (!Number.isFinite(id)) {
    return (
      <View style={styles.centered}>
        <Text style={[typography.body, styles.muted]}>Invalid transaction.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (!transaction) {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }
    return (
      <View style={styles.centered}>
        <Text style={[typography.body, styles.muted]}>Transaction not found.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const initialDate = parseISO(transaction.date);

  return (
    <TransactionEditor
      title="Edit Transaction"
      submitLabel="Save changes"
      initialType={transaction.type}
      initialAmount={String(transaction.amount)}
      initialNotes={transaction.notes}
      initialDate={initialDate}
      initialCategory={transaction.category}
      leading={
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
      }
      trailing={<View />}
      onSubmit={async (payload) => {
        await updateTransaction(transaction.id, payload);
        router.back();
      }}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  muted: {
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  backLink: {
    padding: spacing.sm,
  },
  backLinkText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
