import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TransactionEditor } from '../../src/components/transactions/TransactionEditor';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { colors } from '../../src/theme/colors';
import { CATEGORIES } from '../../src/utils/categories';

const defaultExpenseCategory =
  CATEGORIES.find((c) => c.type === 'expense')?.id ?? 'other';

export default function AddTransactionScreen() {
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const storeError = useTransactionStore((s) => s.error);

  return (
    <TransactionEditor
      title="New Transaction"
      submitLabel="Save"
      initialType="expense"
      initialAmount=""
      initialNotes=""
      initialDate={new Date()}
      initialCategory={defaultExpenseCategory}
      storeError={storeError}
      leading={<View />}
      trailing={
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
      }
      onSubmit={async (payload) => {
        await addTransaction(payload);
        if (!useTransactionStore.getState().error) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.back();
        }
      }}
    />
  );
}
